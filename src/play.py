import json
import time
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd

from src.instance import get_debug_tabs, get_dino_tabs
from src.browser_gateway import connect, disconnect


BASE_DIR = Path(__file__).resolve().parent.parent

POLL_INTERVAL = 0.01
LOG_INTERVAL = 0.5
RESTART_DELAY = 1.0
JUMP_COOLDOWN = 0.25

VALID_ACTIONS = {"none", "jump", "duck"}
OBSTACLE_TYPES = {
    "none",
    "cactusSmall",
    "cactusLarge",
    "pterodactyl",
    "collectable",
}


def log(level, message):
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{timestamp}] [{level}] {message}", flush=True)


class CDP:
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

            if message.get("id") != command_id:
                continue

            if "error" in message:
                raise RuntimeError(
                    f"CDP error: {message['error']}"
                )

            result = message.get("result", {})

            if result.get("exceptionDetails"):
                raise RuntimeError(
                    f"JavaScript exception: "
                    f"{result['exceptionDetails']}"
                )

            remote = result.get("result", {})

            if "value" in remote:
                return remote["value"]

            if remote.get("subtype") == "error":
                raise RuntimeError(
                    remote.get("description", "JavaScript error")
                )

            return None


BRIDGE_SCRIPT = r"""
(() => {
    const runner = Runner.getInstance();

    if (!runner || !runner.tRex || !runner.horizon) {
        throw new Error("Dino game is not ready");
    }

    window.__pythonDino = {
        getState() {
            const r = Runner.getInstance();

            if (!r) {
                return { error: "Runner unavailable" };
            }

            const obstacles = [
                ...(r.horizon?.obstacles ?? [])
            ]
                .map(o => ({
                    x: Number(o.xPos),
                    y: Number(o.yPos),
                    type: o.typeConfig?.type ?? "none",
                    size: Number(o.size) || 1
                }))
                .filter(o => Number.isFinite(o.x))
                .sort((a, b) => a.x - b.x);

            return {
                activated: Boolean(r.activated),
                crashed: Boolean(r.crashed),
                paused: Boolean(r.paused),
                speed: Number(r.currentSpeed) || 0,
                jumping: Boolean(r.tRex.jumping),
                ducking: Boolean(r.tRex.ducking),
                obstacles: obstacles.slice(0, 2)
            };
        },

        act(action) {
            const r = Runner.getInstance();

            if (!r || !r.tRex) {
                return {
                    ok: false,
                    error: "T-Rex unavailable"
                };
            }

            if (r.crashed || r.paused) {
                return {
                    ok: false,
                    error: r.crashed ? "game over" : "paused"
                };
            }

            try {
                // Release ducking before every non-duck action.
                if (action !== "duck" && r.tRex.ducking) {
                    if (typeof r.tRex.setDuck !== "function") {
                        return {
                            ok: false,
                            error: "T-Rex setDuck() unavailable"
                        };
                    }

                    r.tRex.setDuck(false);
                }

                if (action === "duck") {
                    if (!r.tRex.ducking) {
                        if (typeof r.tRex.setDuck !== "function") {
                            return {
                                ok: false,
                                error: "T-Rex setDuck() unavailable"
                            };
                        }

                        r.tRex.setDuck(true);
                    }

                    return {
                        ok: true,
                        action: "duck",
                        ducking: Boolean(r.tRex.ducking)
                    };
                }

                if (action === "jump") {
                    if (r.tRex.jumping) {
                        return {
                            ok: true,
                            action: "jump",
                            skipped: "already jumping",
                            jumping: true
                        };
                    }

                    if (typeof r.tRex.startJump !== "function") {
                        return {
                            ok: false,
                            error: "T-Rex startJump() unavailable"
                        };
                    }

                    r.tRex.startJump(r.currentSpeed);

                    // Release the jump after a short hold.
                    setTimeout(() => {
                        try {
                            r.tRex.endJump();
                        } catch (_) {}
                    }, 100);

                    return {
                        ok: true,
                        action: "jump",
                        jumping: Boolean(r.tRex.jumping)
                    };
                }

                if (action === "none") {
                    return {
                        ok: true,
                        action: "none"
                    };
                }

                return {
                    ok: false,
                    error: "Unknown action: " + action
                };

            } catch (error) {
                return {
                    ok: false,
                    error: String(error)
                };
            }
        },

        restart() {
            const r = Runner.getInstance();

            if (!r) {
                return {
                    ok: false,
                    error: "Runner unavailable"
                };
            }

            try {
                if (r.crashed) {
                    r.restart();

                    return {
                        ok: true,
                        action: "restart"
                    };
                }

                return {
                    ok: true,
                    action: "already-running"
                };

            } catch (error) {
                return {
                    ok: false,
                    error: String(error)
                };
            }
        }
    };

    return {
        ok: true,
        message: "Dino classifier control bridge installed"
    };
})()
"""


def load_model(model):
    MODEL_PATH = BASE_DIR / "models" / f"{model}.pkl"
    
    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}. Run train.py first."
        )

    saved = joblib.load(MODEL_PATH)

    if not isinstance(saved, dict) or "model" not in saved:
        raise ValueError(
            "Invalid model file. Run the updated train.py."
        )

    required = {
        "features",
        "numeric_features",
        "type_features",
        "actions",
    }

    missing = required - set(saved)

    if missing:
        raise ValueError(
            f"Model metadata missing: {sorted(missing)}. "
            "Run the updated train.py."
        )

    if saved.get("target") != "action":
        raise ValueError(
            "Expected a classifier trained to predict action."
        )

    if not hasattr(saved["model"], "predict"):
        raise ValueError(
            "Loaded model does not support prediction."
        )

    log("INFO", f"Loaded classifier: {MODEL_PATH.name}")
    log("INFO", f"Input features: {len(saved['features'])}")
    log("INFO", f"Actions: {saved['actions']}")

    return saved


def predict_action(saved, state):
    obstacles = state.get("obstacles") or []

    def get_obstacle(index):
        if index >= len(obstacles):
            return {
                "x": -1.0,
                "y": -1.0,
                "type": "none",
                "size": 0,
            }

        item = obstacles[index]

        kind = item.get("type", "none")

        if kind not in OBSTACLE_TYPES:
            kind = "none"

        return {
            "x": float(item.get("x", -1)),
            "y": float(item.get("y", -1)),
            "type": kind,
            "size": int(item.get("size", 0)),
        }

    first = get_obstacle(0)
    second = get_obstacle(1)

    raw_features = {
        "obstacle1_x": first["x"],
        "obstacle1_y": first["y"],
        "obstacle1_type": first["type"],
        "obstacle1_size": first["size"],

        "obstacle2_x": second["x"],
        "obstacle2_y": second["y"],
        "obstacle2_type": second["type"],
        "obstacle2_size": second["size"],

        "speed": float(state.get("speed", 0)),
        "jumping": int(bool(state.get("jumping", False))),
        "ducking": int(bool(state.get("ducking", False))),
    }

    frame = pd.DataFrame([raw_features])

    frame = pd.get_dummies(
        frame,
        columns=saved["type_features"],
        dtype=int,
    )

    frame = frame.reindex(
        columns=saved["features"],
        fill_value=0,
    )

    prediction = saved["model"].predict(frame)[0]
    action = str(prediction).lower()

    if action not in VALID_ACTIONS:
        action = "none"

    return action, first, second


def play(model):
    try:
        saved = load_model(model)

    except Exception as error:
        log("ERROR", str(error))
        return

    tabs = get_debug_tabs()

    if not tabs:
        log("ERROR", "Chrome debug tabs not detected")
        return

    dino_tabs = get_dino_tabs(tabs)

    if len(dino_tabs) != 1:
        log(
            "ERROR",
            f"Expected one Dino tab, found {len(dino_tabs)}",
        )
        return

    connection = connect(dino_tabs[0])

    if not connection:
        log("ERROR", "WebSocket connection failed")
        return

    cdp = CDP(connection)

    last_jump_at = 0.0
    last_log = 0.0
    restart_at = None

    # Prevent repeated jumps while the classifier continuously
    # predicts jump for the same stretch of frames.
    jump_latched = False

    try:
        cdp.evaluate("void 0")

        bridge = cdp.evaluate(BRIDGE_SCRIPT)

        if not isinstance(bridge, dict) or not bridge.get("ok"):
            raise RuntimeError(
                f"Bridge installation failed: {bridge!r}"
            )

        log("INFO", bridge["message"])
        log("INFO", "Waiting for Dino to start.")
        log("INFO", "Press Ctrl+C to stop autoplay.")

        while True:
            now = time.monotonic()

            state = cdp.evaluate(
                "window.__pythonDino.getState()"
            )

            if not isinstance(state, dict) or state.get("error"):
                time.sleep(POLL_INTERVAL)
                continue

            # Automatically restart after a collision.
            if state.get("crashed"):
                if restart_at is None:
                    log("WARN", "Game over")
                    restart_at = now + RESTART_DELAY

                elif now >= restart_at:
                    result = cdp.evaluate(
                        "window.__pythonDino.restart()"
                    )

                    log("INFO", f"Restart: {result}")

                    restart_at = None
                    last_jump_at = 0.0
                    jump_latched = False

                time.sleep(POLL_INTERVAL)
                continue

            if restart_at is not None:
                restart_at = None
                jump_latched = False

            if state.get("paused") or not state.get("activated"):
                time.sleep(POLL_INTERVAL)
                continue

            predicted_action, first, second = predict_action(
                saved,
                state,
            )

            current_x = first["x"]
            speed = float(state.get("speed", 0))
            currently_jumping = bool(state.get("jumping"))

            action_to_execute = predicted_action

            # Re-arm when the model stops requesting a jump.
            if predicted_action != "jump":
                jump_latched = False

            # Execute a jump only once during a continuous run
            # of jump predictions. Do not require an obstacle
            # distance threshold to permit the first jump.
            if predicted_action == "jump":
                if jump_latched or currently_jumping:
                    action_to_execute = "none"

                elif now - last_jump_at < JUMP_COOLDOWN:
                    # Do not latch here. If the model continues
                    # predicting jump, retry after the cooldown.
                    action_to_execute = "none"

            result = cdp.evaluate(
                "window.__pythonDino.act("
                + json.dumps(action_to_execute)
                + ")"
            )

            if not isinstance(result, dict) or not result.get("ok"):
                log("WARN", f"Action failed: {result}")

            elif action_to_execute == "jump":
                jump_latched = True
                last_jump_at = now

                log(
                    "ACTION",
                    f"JUMP requested | "
                    f"x={current_x:.1f} speed={speed:.2f} "
                    f"bridge={result}",
                )

            elif (
                action_to_execute == "duck"
                and not state.get("ducking")
            ):
                log(
                    "ACTION",
                    f"DUCK | x={current_x:.1f} speed={speed:.2f}",
                )

            # Print regular state diagnostics.
            if now - last_log >= LOG_INTERVAL:
                obstacle_text = (
                    f"{first['type']}"
                    f"(x={first['x']:.0f},y={first['y']:.0f})"
                )

                if second["x"] >= 0:
                    obstacle_text += (
                        f", {second['type']}"
                        f"(x={second['x']:.0f},"
                        f"y={second['y']:.0f})"
                    )

                log(
                    "STATE",
                    f"predicted={predicted_action} "
                    f"executed={action_to_execute} "
                    f"speed={speed:.2f} "
                    f"obstacles=[{obstacle_text}] "
                    f"jump_latched={jump_latched} "
                    f"jumping={state.get('jumping')} "
                    f"ducking={state.get('ducking')}",
                )

                last_log = now

            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        log("INFO", "Stopping autoplay")

    except Exception as error:
        log("ERROR", f"Autoplay stopped: {error}")

    finally:
        disconnect(connection)
        log("INFO", "Disconnected from Dino tab")


if __name__ == "__main__":
    play()