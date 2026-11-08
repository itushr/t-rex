from pathlib import Path
from typing import Any, Dict
import joblib


def save_trained_model(
    model: Any,
    path: Path,
    game_id: str,
    model_type: str,
    features: list,
    numeric_features: list,
    categorical_features: list,
    categories: Dict[str, list],
    actions: list,
) -> Path:
    """Saves model and associated metadata to a joblib file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "model": model,
        "game_id": game_id,
        "model_type": model_type,
        "features": list(features),
        "numeric_features": list(numeric_features),
        "type_features": list(categorical_features),
        "categories": categories,
        "target": "action",
        "actions": list(actions),
    }
    joblib.dump(payload, path)
    return path


def load_trained_model(path: Path) -> Dict[str, Any]:
    """Loads and validates a trained model bundle."""
    if not path.exists():
        raise FileNotFoundError(f"Model file does not exist: {path}")
    saved = joblib.load(path)
    if not isinstance(saved, dict) or "model" not in saved:
        raise ValueError(f"Invalid model artifact at {path}")
    return saved
