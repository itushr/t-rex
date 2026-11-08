from typing import Any, Dict, List
from ml.registry import get_model_adapter
from ml.serialization import load_trained_model
from server.config import MODELS_DIR


def list_models() -> List[Dict[str, Any]]:
    """Lists available trained models with metadata."""
    results = []
    for file in sorted(MODELS_DIR.glob("*.pkl"), key=lambda p: p.stat().st_mtime, reverse=True):
        try:
            bundle = load_trained_model(file)
            results.append({
                "name": file.stem,
                "filename": file.name,
                "game_id": bundle.get("game_id", "dino"),
                "model_type": bundle.get("model_type", "unknown"),
                "features_count": len(bundle.get("features", [])),
                "actions": bundle.get("actions", []),
                "size_bytes": file.stat().st_size,
                "modified": file.stat().st_mtime,
            })
        except Exception:
            results.append({"name": file.stem, "filename": file.name, "error": "corrupt_artifact"})
    return results


def get_model_graph(model_name: str) -> Dict[str, Any]:
    """Loads a model and extracts its decision tree or ensemble hierarchy."""
    path = MODELS_DIR / f"{model_name}.pkl"
    if not path.exists():
        path = MODELS_DIR / model_name
    bundle = load_trained_model(path)
    adapter = get_model_adapter(bundle.get("model_type", "decision_tree"))
    graph = adapter.extract_graph(bundle["model"], bundle["features"], bundle["actions"])
    return {
        "model_name": model_name,
        "model_type": bundle.get("model_type"),
        "game_id": bundle.get("game_id", "dino"),
        "features": bundle.get("features", []),
        "actions": bundle.get("actions", []),
        "graph": graph,
    }
