import json
from typing import Any, Dict, List
from server.config import PLAYBACK_DIR


def list_playbacks() -> List[Dict[str, Any]]:
    """Lists available playback sessions with summary headers."""
    results = []
    for file in sorted(PLAYBACK_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
        try:
            with file.open("r", encoding="utf-8") as f:
                data = json.load(f)
            results.append({
                "filename": file.name,
                "model_name": data.get("model_name", "unknown"),
                "model_type": data.get("model_type", "unknown"),
                "n_estimators": data.get("n_estimators", 1),
                "recorded_at": data.get("recorded_at"),
                "duration": data.get("duration", 0),
                "total_steps": data.get("total_steps", len(data.get("records", []))),
                "crashed": data.get("crashed", False),
                "size_bytes": file.stat().st_size,
            })
        except Exception:
            results.append({"filename": file.name, "error": "corrupt_payload"})
    return results


def get_playback_payload(filename: str) -> Dict[str, Any]:
    """Reads complete session playback data for inspection."""
    file = PLAYBACK_DIR / filename
    if not file.exists():
        if not filename.endswith(".json"):
            file = PLAYBACK_DIR / f"{filename}.json"
    if not file.exists():
        raise FileNotFoundError(f"Playback session not found: {filename}")
    with file.open("r", encoding="utf-8") as f:
        return json.load(f)
