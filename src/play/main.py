import json
import time
from datetime import datetime
from pathlib import Path

import joblib
import pandas as pd

from src.browser_instance import open_dino_debug_tab
from src.browser_gateway import connect, disconnect, CDP
from src.play.script import SCRIPT

from src.logger import Logger


BASE_DIR = Path(__file__).resolve().parent.parent.parent

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
    Logger.log(
        indent=0,
        message="Opening Game Window..."
    )
    
    try:
        saved = load_model(model)
    except Exception as error:
        Logger.error(
            indent=1,
            message=error
        )
        return

    dino_debug_tab = open_dino_debug_tab()

    connection = connect(dino_debug_tab)

    if not connection:
        Logger.error(
            indent=1,
            message="Websocket connection failed"
        )
        return

    time.sleep(2)

    cdp = CDP(connection)

    last_jump_at = 0.0
    restart_at = None
    jump_latched = False

    try:
        cdp.evaluate("void 0")

        bridge = cdp.evaluate(SCRIPT)

        if not isinstance(bridge, dict) or not bridge.get("ok"):
            Logger.error(
                indent=1,
                message="Could not embed controller in browser"
            )
            return
        
        Logger.log(
            indent=1,
            message=f"Waiting for you to start the Game"
        )
        
        Logger.log(
            indent=1,
            message=f"System Playing (Ctrl+C to exit)"
        )
        
        Logger.log(
            indent=1,
            message=""
        )

        while True:
            now = time.monotonic()

            state = cdp.evaluate(
                "window.__pythonDino.getState()"
            )

            if not isinstance(state, dict) or state.get("error"):
                time.sleep(POLL_INTERVAL)
                continue

            if state.get("crashed"):
                if restart_at is None:
                    Logger.log(
                        indent=1,
                        label="STATUS",
                        message="Game Over"
                    )
                    return

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

            if predicted_action != "jump":
                jump_latched = False

            if predicted_action == "jump":
                if jump_latched or currently_jumping:
                    action_to_execute = "none"

                elif now - last_jump_at < JUMP_COOLDOWN:
                    action_to_execute = "none"

            result = cdp.evaluate(
                "window.__pythonDino.act("
                + json.dumps(action_to_execute)
                + ")"
            )

            if not isinstance(result, dict) or not result.get("ok"):
                Logger.log(
                    indent=1,
                    label="WARN",
                    message=f"Action failed: {result}"
                )

            elif action_to_execute == "jump":
                jump_latched = True
                last_jump_at = now

                Logger.log(
                    indent=1,
                    label="ACTION",
                    message=f"JUMP, obstacle @{current_x:.1f}"
                )

            elif (
                action_to_execute == "duck"
                and not state.get("ducking")
            ):
                Logger.log(
                    indent=1,
                    label="ACTION",
                    message=f"DUCK, obstacle @{current_x:.1f}"
                )

            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        Logger.log(
            indent=1,
            message="Autoplay Stopped! Hope you like"
        )

    except Exception as error:
        Logger.error(
            indent=1,
            message=f"{error}"
        )

    finally:
        disconnect(connection)
        

if __name__ == "__main__":
    play()