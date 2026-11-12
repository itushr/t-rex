from typing import Any, Dict, List
from ml.models.tree_extractor import extract_tree_data
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


def get_model_summary(model_name: str) -> Dict[str, Any]:
    """Returns lightweight model metadata without extracting tree graphs."""
    path = MODELS_DIR / f"{model_name}.pkl"
    if not path.exists():
        path = MODELS_DIR / model_name
    bundle = load_trained_model(path)
    model = bundle["model"]
    n_est = len(model.estimators_) if hasattr(model, "estimators_") else 1
    return {
        "model_name": model_name,
        "model_type": bundle.get("model_type", "unknown"),
        "game_id": bundle.get("game_id", "dino"),
        "n_estimators": n_est,
        "features": bundle.get("features", []),
        "actions": bundle.get("actions", []),
    }


def get_model_single_tree(model_name: str, tree_index: int = 0) -> Dict[str, Any]:
    """Extracts a single tree from a model bundle by index."""
    path = MODELS_DIR / f"{model_name}.pkl"
    if not path.exists():
        path = MODELS_DIR / model_name
    bundle = load_trained_model(path)
    model = bundle["model"]
    mtype = bundle.get("model_type", "unknown")
    features = bundle.get("features", [])
    actions = bundle.get("actions", [])
    if hasattr(model, "estimators_"):
        if tree_index < 0 or tree_index >= len(model.estimators_):
            raise IndexError("Tree index out of range")
        est = model.estimators_[tree_index]
        n_est = len(model.estimators_)
    else:
        est = model
        n_est = 1
    tree = extract_tree_data(est, features, actions)
    return {
        "model_name": model_name,
        "model_type": mtype,
        "tree_index": tree_index,
        "n_estimators": n_est,
        "tree": tree,
    }


def get_model_graph(model_name: str) -> Dict[str, Any]:
    """Loads a model and extracts its complete decision tree or ensemble hierarchy."""
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
