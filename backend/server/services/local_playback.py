from datetime import datetime
from typing import Any, Dict, List
import pandas as pd
from ml.registry import get_game_adapter, get_model_adapter
from server.services.local_store import get_local_bundle, get_local_graph, set_local_playback


def create_local_playback(steps: List[Dict[str, Any]]) -> Dict[str, Any]:
    bundle = get_local_bundle()
    graph = get_local_graph()
    if not bundle or not graph:
        raise ValueError("No local model found. Train model first.")

    model = bundle["model"]
    features = bundle["features"]
    actions = bundle["actions"]
    ga = get_game_adapter("dino")
    ma = get_model_adapter(bundle.get("model_type", "decision_tree"))

    records = []
    for idx, s in enumerate(steps):
        state = {
            "speed": s.get("speed", 6.0),
            "jumping": s.get("jumping", False),
            "ducking": s.get("ducking", False),
            "obstacles": [
                s.get("obs1", {"x": -1, "y": -1, "type": "none", "size": 0}),
                s.get("obs2", {"x": -1, "y": -1, "type": "none", "size": 0}),
            ],
        }
        frame, _ = ga.prepare_inference_frame(state, features)
        path_info = ma.trace_path(model, frame, features, actions)
        act = s.get("action") or path_info.get("action") or "none"
        records.append({
            "step": idx + 1,
            "time": round(float(s.get("time", idx * 0.05)), 2),
            "speed": round(float(s.get("speed", 6.0)), 2),
            "time_to_impact": round(float(s.get("time_to_impact", -1)), 2),
            "jumping": bool(s.get("jumping", False)),
            "ducking": bool(s.get("ducking", False)),
            "obs1": s.get("obs1", {"type": "none", "x": -1, "y": -1, "size": 0}),
            "obs2": s.get("obs2", {"type": "none", "x": -1, "y": -1, "size": 0}),
            "action": act,
            "model_type": bundle.get("model_type", "decision_tree"),
            "votes": path_info.get("votes", {act: 1}),
            "trees": path_info.get("trees", []),
            "path": path_info.get("node_ids", []),
            "leaf_id": path_info.get("leaf_id", 0),
            "steps": path_info.get("steps", []),
        })

    duration = records[-1]["time"] if records else 0.0
    crashed = any(bool(s.get("crashed")) for s in steps)
    playback = {
        "model_name": "local",
        "model_type": bundle.get("model_type", "decision_tree"),
        "n_estimators": 1,
        "recorded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "duration": duration,
        "total_steps": len(records),
        "crashed": crashed,
        "forest": graph["graph"],
        "records": records,
    }
    set_local_playback(playback)
    return {"ok": True, "total_steps": len(records), "duration": duration}
