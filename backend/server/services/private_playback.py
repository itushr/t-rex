from datetime import datetime
import json
from typing import Any, Dict, List, Optional
from fastapi import HTTPException
import joblib
from ml.registry import get_game_adapter, get_model_adapter
from server.services.user_storage import safe_user_file, sanitize_name


def save_user_playback(
    user_id: str,
    model_name: str,
    steps: List[Dict[str, Any]],
    playback_name: Optional[str] = None,
) -> Dict[str, Any]:
    cmodel = sanitize_name(model_name)
    mpath = safe_user_file(user_id, "models", f"{cmodel}.pkl")
    if not mpath.exists():
        raise HTTPException(status_code=404, detail="Model bundle not found")

    bundle = joblib.load(mpath)
    model, features, actions = bundle["model"], bundle["features"], bundle["actions"]
    ga = get_game_adapter("dino")
    ma = get_model_adapter(bundle.get("model_type", "decision_tree"))

    records = []
    for idx, s in enumerate(steps):
        state = {
            "speed": s.get("speed", 6.0), "jumping": s.get("jumping", False), "ducking": s.get("ducking", False),
            "obstacles": [s.get("obs1", {"x": -1, "y": -1, "type": "none", "size": 0}),
                          s.get("obs2", {"x": -1, "y": -1, "type": "none", "size": 0})],
        }
        frame, _ = ga.prepare_inference_frame(state, features)
        path_info = ma.trace_path(model, frame, features, actions)
        act = s.get("action") or path_info.get("action") or "none"
        records.append({
            "step": idx + 1, "time": round(float(s.get("time", idx * 0.05)), 2),
            "speed": round(float(s.get("speed", 6.0)), 2),
            "time_to_impact": round(float(s.get("time_to_impact", -1)), 2),
            "jumping": bool(s.get("jumping", False)), "ducking": bool(s.get("ducking", False)),
            "obs1": s.get("obs1", {"type": "none", "x": -1, "y": -1, "size": 0}),
            "obs2": s.get("obs2", {"type": "none", "x": -1, "y": -1, "size": 0}),
            "action": act, "model_type": bundle.get("model_type"),
            "votes": path_info.get("votes", {act: 1}), "trees": path_info.get("trees", []),
            "path": path_info.get("node_ids", []), "leaf_id": path_info.get("leaf_id", 0),
            "steps": path_info.get("steps", []),
        })

    duration = records[-1]["time"] if records else 0.0
    crashed = any(bool(s.get("crashed")) for s in steps)
    graph = ma.extract_graph(model, features, actions)
    raw_pname = playback_name or f"playback_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    cpname = sanitize_name(raw_pname)

    now_ts = datetime.now().timestamp()
    playback = {
        "model_name": cmodel, "model_type": bundle.get("model_type"), "n_estimators": 1,
        "recorded_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "timestamp": now_ts, "created_at": now_ts,
        "duration": duration, "total_steps": len(records), "crashed": crashed,
        "forest": graph, "records": records,
    }
    with open(safe_user_file(user_id, "playback", f"{cpname}.json"), "w") as f:
        json.dump(playback, f)

    return {"ok": True, "name": cpname, "total_steps": len(records), "duration": duration}
