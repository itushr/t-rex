import json
import time
import joblib
import pandas as pd
import websocket

from pathlib import Path
from datetime import datetime

from instance import get_debug_tabs, get_dino_tabs
from browser_gateway import connect, disconnect


MODEL_PATH = Path(__file__).resolve().with_name("dino_model.pkl")

POLL_INTERVAL = 0.03
LOG_INTERVAL = 0.5
RESTART_DELAY = 1.0

FEATURES = ["obstacle1_x", "obstacle2_x", "speed"]
VALID_ACTIONS = {"none", "jump", "duck", "unduck"}


def log(level, message):
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{timestamp}] [{level}] {message}", flush=True)


class CDP:
    """Synchronous Chrome DevTools Protocol request/response client."""

    def __init__(self, connection):
        self.connection = connection
        self.command_id = 0

    def evaluate(self, expression):
        self.command_id += 1
        command_id = self.command_id

        self.connection.send(json.dumps({
            "id": command_id,
            "method": "Runtime.evaluate",
            "params": {
                "expression": expression,
                "returnByValue": True,
                "awaitPromise": True,
            },
        }))

        while True:
            message = json.loads(self.connection.recv())

            # Ignore events and responses to other commands.
            if message.get("id") != command_id:
                continue

            if "error" in message:
                raise RuntimeError(f"CDP error: {message['error']}")

            result = message.get("result", {})

            if result.get("exceptionDetails"):
                raise RuntimeError(
                    f"JavaScript exception: {result['exceptionDetails']}"
                )

            remote_object = result.get("result", {})
            if "value" in remote_object:
                return remote_object["value"]

            if remote_object.get("subtype") == "error":
                raise RuntimeError(remote_object.get("description", "JavaScript error"))

            return None


BRIDGE_SCRIPT = r"""
(() => {
    const runner = Runner.getInstance();

    if (!runner || !runner.tRex || !runner.horizon) {
        throw new Error("Dino game is not ready");
    }

    window.__pythonDino = {
        getState() {
            const runner = Runner.getInstance();

            if (!runner) {
                return { error: "Runner instance unavailable" };
            }

            const obstacles = (runner.horizon?.obstacles ?? [])
                .map(obstacle => ({
                    x: Number(obstacle.xPos),
                    width: Number(obstacle.width) || 0,
                    type: obstacle.typeConfig?.type ?? "unknown"
                }))
                .filter(obstacle => Number.isFinite(obstacle.x))
                .sort((a, b) => a.x - b.x);

            return {
                activated: Boolean(runner.activated),
                crashed: Boolean(runner.crashed),
                paused: Boolean(runner.paused),
                speed: Number(runner.currentSpeed) || 0,
                obstacles: obstacles.slice(0, 2)
            };
        },

        act(action) {
            const runner = Runner.getInstance();

            if (!runner || !runner.tRex) {
                return { ok: false, error: "T-Rex unavailable" };
            }

            const trex = runner.tRex;

            if (runner.crashed || runner.paused) {
                return {
                    ok: false,
                    error: runner.crashed ? "game over" : "game paused"
                };
            }

            try {
                if (action === "jump") {
                    if (!trex.jumping) {
                        trex.startJump(runner.currentSpeed);
                    }

                    setTimeout(() => {
                        try {
                            trex.endJump();
                        } catch (_) {}
                    }, 100);

                    return { ok: true, action };
                }

                if (action === "duck") {
                    trex.setDuck(true);
                    return { ok: true, action };
                }

                if (action === "none" || action === "unduck") {
                    trex.setDuck(false);
                    return { ok: true, action: "unduck" };
                }

                return { ok: false, error: "Unknown action: " + action };
            } catch (error) {
                return { ok: false, error: String(error) };
            }
        },

        restart() {
            const runner = Runner.getInstance();

            if (!runner) {
                return { ok: false, error: "Runner unavailable" };
            }

            try {
                if (runner.crashed) {
                    runner.restart();
                    return { ok: true, action: "restart" };
                }

                return { ok: true, action: "already-running" };
            } catch (error) {
                return { ok: false, error: String(error) };
            }
        }
    };

    return { ok: true, message: "Dino control bridge installed" };
})()
"""


def load_model():
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}")

    model = joblib.load(MODEL_PATH)
    classes = {str(label) for label in model.classes_}

    log("INFO", f"Model loaded: {MODEL_PATH.name}")
    log("INFO", f"Model classes: {sorted(classes)}")

    unsupported = classes - VALID_ACTIONS
    if unsupported:
        raise ValueError(f"Unsupported model classes: {sorted(unsupported)}")

    if "jump" not in classes or "none" not in classes:
        raise ValueError("Model must include 'jump' and 'none' classes")

    return model


def predict_action(model, state):
    obstacles = state.get("obstacles") or []

    features = {
        "obstacle1_x": float(obstacles[0]["x"]) if len(obstacles) > 0 else -1,
        "obstacle2_x": float(obstacles[1]["x"]) if len(obstacles) > 1 else -1,
        "speed": float(state.get("speed", 0)),
    }

    frame = pd.DataFrame([features], columns=FEATURES)
    action = str(model.predict(frame)[0])

    probabilities = {}
    if hasattr(model, "predict_proba"):
        try:
            values = model.predict_proba(frame)[0]
            probabilities = {
                str(label): float(probability)
                for label, probability in zip(model.classes_, values)
            }
        except Exception:
            pass

    return action, features, probabilities


def main():
    try:
        model = load_model()
    except Exception as error:
        log("ERROR", str(error))
        return

    tabs = get_debug_tabs()
    if not tabs:
        log("ERROR", "Chrome debug tabs not detected")
        return

    dino_tabs = get_dino_tabs(tabs)
    if len(dino_tabs) != 1:
        log("ERROR", f"Expected one Dino tab, found {len(dino_tabs)}")
        return

    connection = connect(dino_tabs[0])
    if not connection:
        log("ERROR", "WebSocket connection failed")
        return

    try:
        cdp = CDP(connection)

        cdp.evaluate("void 0")  # Verify CDP request/response works.
        bridge = cdp.evaluate(BRIDGE_SCRIPT)

        if not isinstance(bridge, dict) or not bridge.get("ok"):
            raise RuntimeError(f"Bridge installation failed: {bridge!r}")

        log("INFO", bridge["message"])
        log("INFO", f"Model input features: {FEATURES}")
        log("INFO", "Waiting for the game to start. Press Ctrl+C to stop.")

        last_action = None
        last_log = 0.0
        restart_at = None
        last_error_log = 0.0

        while True:
            now = time.monotonic()

            try:
                state = cdp.evaluate("window.__pythonDino.getState()")
                if not isinstance(state, dict) or state.get("error"):
                    raise RuntimeError(f"Invalid game state: {state!r}")
            except Exception as error:
                if now - last_error_log >= 1:
                    log("WARN", f"Could not read game state: {error}")
                    last_error_log = now
                time.sleep(POLL_INTERVAL)
                continue

            if state.get("crashed"):
                if restart_at is None:
                    log("WARN", "Game over")
                    restart_at = now + RESTART_DELAY

                elif now >= restart_at:
                    result = cdp.evaluate("window.__pythonDino.restart()")
                    log("INFO", f"Restart: {result}")
                    restart_at = None
                    last_action = None

                time.sleep(POLL_INTERVAL)
                continue

            if restart_at is not None:
                restart_at = None
                last_action = None

            if state.get("paused") or not state.get("activated"):
                if now - last_log >= LOG_INTERVAL:
                    status = "paused" if state.get("paused") else "not started"
                    log("INFO", f"Game {status}")
                    last_log = now

                time.sleep(POLL_INTERVAL)
                continue

            try:
                prediction, features, probabilities = predict_action(model, state)
            except Exception as error:
                log("ERROR", f"Prediction failed: {error}")
                time.sleep(POLL_INTERVAL)
                continue

            action = "none" if prediction == "unduck" else prediction

            if action == "jump" and last_action != "jump":
                result = cdp.evaluate("window.__pythonDino.act('jump')")
                log("ACTION", f"JUMP | {result}")

            elif action == "duck" and last_action != "duck":
                result = cdp.evaluate("window.__pythonDino.act('duck')")
                log("ACTION", f"DUCK | {result}")

            elif action == "none" and last_action == "duck":
                result = cdp.evaluate("window.__pythonDino.act('none')")
                log("ACTION", f"RELEASE DUCK | {result}")

            if now - last_log >= LOG_INTERVAL:
                obstacles = state.get("obstacles") or []
                obstacle_text = ", ".join(
                    f"{o.get('type', 'unknown')}@{o['x']:.1f}"
                    for o in obstacles
                ) or "none"

                probability_text = ", ".join(
                    f"{label}={value:.2f}"
                    for label, value in sorted(probabilities.items())
                ) or "unavailable"

                log(
                    "STATE",
                    f"speed={state.get('speed', 0):.2f} | "
                    f"obstacles=[{obstacle_text}] | "
                    f"input={features} | prediction={prediction} | "
                    f"probabilities=[{probability_text}]",
                )

                last_log = now

            last_action = action
            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        log("INFO", "Stopping autoplay")

    except Exception as error:
        log("ERROR", f"Autoplay stopped: {error}")

    finally:
        try:
            if connection.connected:
                # Best-effort release if the game is still running.
                CDP(connection).evaluate(
                    "window.__pythonDino && window.__pythonDino.act('none')"
                )
        except Exception:
            pass

        disconnect(connection)
        log("INFO", "Disconnected from Dino tab")


if __name__ == "__main__":
    main()