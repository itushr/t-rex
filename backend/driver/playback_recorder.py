from datetime import datetime
import json
from pathlib import Path
import time
from typing import Any, Dict, List


class PlaybackRecorder:
    """Records each decision step during autoplay and exports to JSON."""

    def __init__(self, model_name: str, model_bundle: Dict[str, Any], output_dir: Path):
        self.model_name = model_name
        self.bundle = model_bundle
        self.output_dir = output_dir
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.records: List[Dict[str, Any]] = []
        self.start_wall_time = datetime.now()
        self.start_perf_time = time.time()
        self.crashed = False

    def record_step(self, raw_features: Dict[str, Any], action: str, path_info: Dict[str, Any]) -> None:
        elapsed = round(time.time() - self.start_perf_time, 2)
        step_num = len(self.records) + 1
        obs1 = {
            "type": raw_features.get("obstacle1_type", "none"),
            "x": round(float(raw_features.get("obstacle1_x", -1)), 1),
            "y": round(float(raw_features.get("obstacle1_y", -1)), 1),
            "size": int(raw_features.get("obstacle1_size", 0)),
        }
        obs2 = {
            "type": raw_features.get("obstacle2_type", "none"),
            "x": round(float(raw_features.get("obstacle2_x", -1)), 1),
            "y": round(float(raw_features.get("obstacle2_y", -1)), 1),
            "size": int(raw_features.get("obstacle2_size", 0)),
        }
        entry = {
            "step": step_num,
            "time": elapsed,
            "speed": round(float(raw_features.get("speed", 0)), 2),
            "time_to_impact": round(float(raw_features.get("time_to_impact", -1)), 2),
            "jumping": bool(raw_features.get("jumping", 0)),
            "ducking": bool(raw_features.get("ducking", 0)),
            "obs1": obs1,
            "obs2": obs2,
            "action": action,
            "model_type": path_info.get("model_type", "decision_tree"),
            "votes": path_info.get("votes", {}),
            "trees": path_info.get("trees", []),
            "path": path_info.get("node_ids", []),
            "leaf_id": path_info.get("leaf_id", 0),
            "steps": path_info.get("steps", []),
        }
        self.records.append(entry)

    def mark_crashed(self) -> None:
        self.crashed = True

    def save(self, forest_data: Dict[str, Any]) -> Path:
        ts = self.start_wall_time.strftime("%Y%m%d_%H%M%S")
        duration = round(time.time() - self.start_perf_time, 2)
        payload = {
            "model_name": self.model_name,
            "model_type": forest_data.get("model_type", "decision_tree"),
            "n_estimators": forest_data.get("n_estimators", 1),
            "recorded_at": self.start_wall_time.strftime("%Y-%m-%d %H:%M:%S"),
            "duration": duration,
            "total_steps": len(self.records),
            "crashed": self.crashed,
            "forest": forest_data,
            "tree": forest_data["trees"][0] if forest_data.get("trees") else None,
            "records": self.records,
        }
        path = self.output_dir / f"playback_{self.model_name}_{ts}.json"
        path.write_text(json.dumps(payload), encoding="utf-8")
        return path
