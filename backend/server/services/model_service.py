from typing import Any, Dict, List
from ml.models.tree_extractor import extract_tree_data
from ml.registry import get_model_adapter
from ml.serialization import load_trained_model
from server.config import MODELS_DIR
from server.services.local_store import get_local_bundle, get_local_graph


def _resolve_bundle(model_name: str) -> Dict[str, Any]:
    if model_name == "local":
        b = get_local_bundle()
        if b:
            return b
    path = MODELS_DIR / f"{model_name}.pkl"
    if not path.exists():
        path = MODELS_DIR / model_name
    return load_trained_model(path)


def list_models() -> List[Dict[str, Any]]:
    results = []
    for f in sorted(MODELS_DIR.glob("*.pkl"), key=lambda p: p.stat().st_mtime, reverse=True):
        try:
            bundle = load_trained_model(f)
            results.append({
                "name": f.stem, "filename": f.name,
                "game_id": bundle.get("game_id", "dino"),
                "model_type": bundle.get("model_type", "unknown"),
                "features_count": len(bundle.get("features", [])),
                "actions": bundle.get("actions", []),
                "size_bytes": f.stat().st_size, "modified": f.stat().st_mtime,
            })
        except Exception:
            results.append({"name": f.stem, "filename": f.name, "error": "corrupt_artifact"})
    return results


def get_model_summary(model_name: str) -> Dict[str, Any]:
    bundle = _resolve_bundle(model_name)
    m = bundle["model"]
    return {
        "model_name": model_name, "model_type": bundle.get("model_type", "unknown"),
        "game_id": bundle.get("game_id", "dino"),
        "n_estimators": len(m.estimators_) if hasattr(m, "estimators_") else 1,
        "features": bundle.get("features", []), "actions": bundle.get("actions", []),
    }


def get_model_single_tree(model_name: str, tree_index: int = 0) -> Dict[str, Any]:
    bundle = _resolve_bundle(model_name)
    m = bundle["model"]
    feats, acts = bundle.get("features", []), bundle.get("actions", [])
    if hasattr(m, "estimators_"):
        if tree_index < 0 or tree_index >= len(m.estimators_):
            raise IndexError("Tree index out of range")
        est, n_est = m.estimators_[tree_index], len(m.estimators_)
    else:
        est, n_est = m, 1
    return {
        "model_name": model_name, "model_type": bundle.get("model_type", "unknown"),
        "tree_index": tree_index, "n_estimators": n_est,
        "tree": extract_tree_data(est, feats, acts),
    }


def get_model_graph(model_name: str) -> Dict[str, Any]:
    if model_name == "local":
        g = get_local_graph()
        if g:
            return g
    bundle = _resolve_bundle(model_name)
    adapter = get_model_adapter(bundle.get("model_type", "decision_tree"))
    return {
        "model_name": model_name, "model_type": bundle.get("model_type"),
        "game_id": bundle.get("game_id", "dino"),
        "features": bundle.get("features", []), "actions": bundle.get("actions", []),
        "graph": adapter.extract_graph(bundle["model"], bundle["features"], bundle["actions"]),
    }
