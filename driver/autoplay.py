from pathlib import Path
import time
from typing import Any, Dict
from driver.browser import open_dino_tab
from driver.cdp import CDPClient
from driver.playback_recorder import PlaybackRecorder
from driver.ml.registry import get_game_adapter, get_model_adapter


def run_autoplay(model_path: Path, model_bundle: Dict[str, Any], output_dir: Path) -> Path:
    """Controls Chrome Dino game using the trained model and records autoplay."""
    game_adapter = get_game_adapter(model_bundle.get("game_id", "dino"))
    model_adapter = get_model_adapter(model_bundle["model_type"])

    ws_url = open_dino_tab()
    cdp = CDPClient(ws_url)
    script_path = Path(__file__).parent / "scripts" / "play_script.js"
    cdp.evaluate(script_path.read_text(encoding="utf-8"))

    model = model_bundle["model"]
    features = model_bundle["features"]
    actions = model_bundle["actions"]
    model_name = model_path.stem

    recorder = PlaybackRecorder(model_name, model_bundle, output_dir)
    print(f"Autoplay active with {model_name}. Press Ctrl+C or let game conclude...")

    try:
        while True:
            state = cdp.evaluate("window.__dinoBot ? window.__dinoBot.getState() : null")
            if not state or state.get("error"):
                time.sleep(0.01)
                continue
            if state.get("crashed"):
                print("Game crashed.")
                recorder.mark_crashed()
                break
            if not state.get("ready"):
                time.sleep(0.01)
                continue

            frame, raw = game_adapter.prepare_inference_frame(state, features)
            action = model_adapter.predict(model, frame)[0]
            path_info = model_adapter.trace_path(model, frame, features, actions)

            cdp.evaluate(f"window.__dinoBot.act('{action}')")
            recorder.record_step(raw, action, path_info)
            time.sleep(0.01)
    except KeyboardInterrupt:
        print("\nAutoplay stopped by user.")
    finally:
        cdp.close()

    forest_data = model_adapter.extract_graph(model, features, actions)
    saved_path = recorder.save(forest_data)
    print(f"Autoplay session saved to {saved_path}")
    return saved_path
