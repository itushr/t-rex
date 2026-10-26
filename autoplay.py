import json
import time
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd

from instance import get_debug_tabs, get_dino_tabs
from browser_gateway import connect, disconnect

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "dino_model.pkl"
POLL_INTERVAL = 0.03
LOG_INTERVAL = 0.5
RESTART_DELAY = 1.0
JUMP_COOLDOWN = 0.18

VALID_ACTIONS = {"none", "jump"}
OBSTACLE_TYPES = {"none", "cactusSmall", "cactusLarge", "pterodactyl", "collectable"}


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
                raise RuntimeError(f"CDP error: {message['error']}")
            result = message.get("result", {})
            if result.get("exceptionDetails"):
                raise RuntimeError(f"JavaScript exception: {result['exceptionDetails']}")
            remote = result.get("result", {})
            if "value" in remote:
                return remote["value"]
            if remote.get("subtype") == "error":
                raise RuntimeError(remote.get("description", "JavaScript error"))
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
            if (!r) return { error: "Runner unavailable" };
            const obstacles = [...(r.horizon?.obstacles ?? [])]
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
                obstacles: obstacles.slice(0, 2)
            };
        },

        act(action) {
            const r = Runner.getInstance();
            if (!r || !r.tRex) return { ok: false, error: "T-Rex unavailable" };
            if (r.crashed || r.paused) {
                return { ok: false, error: r.crashed ? "game over" : "paused" };
            }

            try {
                if (action === "jump") {
                    if (!r.tRex.jumping) {
                        r.tRex.startJump(r.currentSpeed);
                        setTimeout(() => {
                            try { r.tRex.endJump(); } catch (_) {}
                        }, 100);
                    }
                    return { ok: true, action: "jump" };
                }
                if (action === "none") return { ok: true, action: "none" };
                return { ok: false, error: "Unknown action: " + action };
            } catch (error) {
                return { ok: false, error: String(error) };
            }
        },

        restart() {
            const r = Runner.getInstance();
            if (!r) return { ok: false, error: "Runner unavailable" };
            try {
                if (r.crashed) {
                    r.restart();
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
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}. Run train.py first.")
    saved = joblib.load(MODEL_PATH)
    if not isinstance(saved, dict) or "model" not in saved or "features" not in saved:
        raise ValueError("Incompatible model file. Run the updated train.py.")
    unsupported = set(saved["model"].classes_) - VALID_ACTIONS
    if unsupported:
        raise ValueError(f"Unsupported model classes: {sorted(unsupported)}")
    log("INFO", f"Loaded model: {MODEL_PATH.name}")
    log("INFO", f"Model classes: {list(saved['model'].classes_)}")
    return saved


def predict_action(saved, state):
    obstacles = state.get("obstacles") or []

    def get_obstacle(index):
        if index >= len(obstacles):
            return {"x": -1, "y": -1, "type": "none", "size": 0}
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
    }
    frame = pd.DataFrame([raw_features])
    frame = pd.get_dummies(
        frame, columns=["obstacle1_type", "obstacle2_type"], dtype=int
    )
    frame = frame.reindex(columns=saved["features"], fill_value=0)

    model = saved["model"]
    action = str(model.predict(frame)[0])
    probabilities = {}
    if hasattr(model, "predict_proba"):
        try:
            probabilities = {
                str(label): float(value)
                for label, value in zip(model.classes_, model.predict_proba(frame)[0])
            }
        except Exception:
            pass
    return action, raw_features, probabilities


def main():
    try:
        saved = load_model()
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

    cdp = CDP(connection)
    last_action = None
    last_jump_at = 0.0
    last_log = 0.0
    restart_at = None

    try:
        cdp.evaluate("void 0")
        bridge = cdp.evaluate(BRIDGE_SCRIPT)
        if not isinstance(bridge, dict) or not bridge.get("ok"):
            raise RuntimeError(f"Bridge installation failed: {bridge!r}")

        log("INFO", bridge["message"])
        log("INFO", "Waiting for Dino to start. Ctrl+C stops autoplay.")

        while True:
            now = time.monotonic()
            state = cdp.evaluate("window.__pythonDino.getState()")
            if not isinstance(state, dict) or state.get("error"):
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
                time.sleep(POLL_INTERVAL)
                continue

            prediction, raw_features, probabilities = predict_action(saved, state)
            action = prediction if prediction in VALID_ACTIONS else "none"

            if action == "jump" and last_action != "jump":
                if now - last_jump_at >= JUMP_COOLDOWN:
                    result = cdp.evaluate("window.__pythonDino.act('jump')")
                    log("ACTION", f"JUMP | {result}")
                    last_jump_at = now

            if now - last_log >= LOG_INTERVAL:
                obstacles = state.get("obstacles") or []
                obstacle_text = ", ".join(
                    f"{item.get('type', '?')}(x={float(item.get('x', -1)):.0f},"
                    f"y={float(item.get('y', -1)):.0f})"
                    for item in obstacles
                ) or "none"
                probability_text = ", ".join(
                    f"{label}={value:.2f}"
                    for label, value in sorted(probabilities.items())
                )
                log(
                    "STATE",
                    f"speed={state.get('speed', 0):.1f} "
                    f"obstacles=[{obstacle_text}] "
                    f"prediction={action} [{probability_text}]",
                )
                last_log = now

            last_action = action
            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        log("INFO", "Stopping autoplay")
    except Exception as error:
        log("ERROR", f"Autoplay stopped: {error}")
    finally:
        disconnect(connection)
        log("INFO", "Disconnected from Dino tab")


if __name__ == "__main__":
    main()
