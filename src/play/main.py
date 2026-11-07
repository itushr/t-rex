import json
import time
from pathlib import Path

import joblib
import pandas as pd

from src.browser_instance import open_dino_debug_tab
from src.browser_gateway import connect, disconnect, CDP
from src.play.script import SCRIPT

from src.logger import Logger
from src.playback import PlaybackRecorder


BASE_DIR = Path(__file__).resolve().parent.parent.parent

POLL_INTERVAL = 0.01
VALID_ACTIONS = {"none", "jump", "duck"}


def load_model(model):
    MODEL_PATH = BASE_DIR / "models" / f"{model}.pkl"

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}. Run train.py first."
        )

    saved = joblib.load(MODEL_PATH)

    if not isinstance(saved, dict) or "model" not in saved:
        raise ValueError("Invalid model file. Run the updated train.py.")

    required = {"features", "numeric_features", "type_features", "actions"}
    missing = required - set(saved)

    if missing:
        raise ValueError(
            f"Model metadata missing: {sorted(missing)}. "
            "Run the updated train.py."
        )

    if saved.get("target") != "action":
        raise ValueError("Expected a classifier trained to predict action.")

    if not hasattr(saved["model"], "predict"):
        raise ValueError("Loaded model does not support prediction.")

    return saved


def predict_action_full(saved, state):
    # The browser already returns exactly two normalized obstacles.
    first, second = state["obstacles"][:2]

    raw_features = {
        "obstacle1_x": float(first["x"]),
        "obstacle1_y": float(first["y"]),
        "obstacle1_type": first["type"],
        "obstacle1_size": int(first["size"]),

        "obstacle2_x": float(second["x"]),
        "obstacle2_y": float(second["y"]),
        "obstacle2_type": second["type"],
        "obstacle2_size": int(second["size"]),

        "speed": float(state.get("speed", 0)),
        "jumping": int(bool(state.get("jumping", False))),
        "ducking": int(bool(state.get("ducking", False))),
    }

    frame = pd.get_dummies(
        pd.DataFrame([raw_features]),
        columns=saved["type_features"],
        dtype=int,
    )
    frame = frame.reindex(columns=saved["features"], fill_value=0)

    action = str(saved["model"].predict(frame)[0]).lower()
    valid_action = action if action in VALID_ACTIONS else "none"

    return valid_action, first, raw_features, frame


def predict_action(saved, state):
    action, first, _, _ = predict_action_full(saved, state)
    return action, first


def play(model):
    Logger.log(indent=0, message="Opening Game Window...")

    try:
        saved = load_model(model)
    except Exception as error:
        Logger.error(indent=1, message=error)
        return

    dino_debug_tab = open_dino_debug_tab()
    connection = connect(dino_debug_tab)

    if not connection:
        Logger.error(indent=1, message="Websocket connection failed")
        return

    time.sleep(2)
    cdp = CDP(connection)

    try:
        cdp.evaluate("void 0")
        bridge = cdp.evaluate(SCRIPT)

        if not isinstance(bridge, dict) or not bridge.get("ok"):
            Logger.error(
                indent=1,
                message="Could not embed controller in browser"
            )
            return

        Logger.log(indent=1, message="Waiting for you to start the Game")
        Logger.log(indent=1, message="System Playing (Ctrl+C to exit)")
        Logger.log(indent=1, message="")

        recorder = PlaybackRecorder(model, saved)

        while True:
            state = cdp.evaluate("window.__pythonDino.getState()")

            if not isinstance(state, dict) or state.get("error"):
                time.sleep(POLL_INTERVAL)
                continue

            if state.get("crashed"):
                Logger.log(indent=1, label="STATUS", message="Game Over (Crash Detected)")
                recorder.mark_crashed(state)
                recorder.save()
                return

            if not state.get("ready"):
                time.sleep(POLL_INTERVAL)
                continue

            action, first, raw_features, frame = predict_action_full(saved, state)

            result = cdp.evaluate(
                "window.__pythonDino.act(" + json.dumps(action) + ")"
            )

            recorder.record_step(state, raw_features, frame, action, result)

            if not isinstance(result, dict) or not result.get("ok"):
                Logger.log(
                    indent=1,
                    label="WARN",
                    message=f"Action failed: {result}"
                )

            elif result.get("executed") in ("jump", "duck") and result.get("started"):
                Logger.log(
                    indent=1,
                    label="ACTION",
                    message=(
                        f"{result['executed'].upper()}, "
                        f"obstacle @{first['x']:.1f}"
                    )
                )

            time.sleep(POLL_INTERVAL)

    except KeyboardInterrupt:
        recorder.save()
        Logger.log(indent=1, message="Autoplay Stopped! Hope you like")

    except Exception as error:
        Logger.error(indent=1, message=f"{error}")

    finally:
        disconnect(connection)


if __name__ == "__main__":
    pass