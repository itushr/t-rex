from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
import joblib, pandas as pd
from pydantic import BaseModel
from ml.models.tree_extractor import extract_tree_data
from ml.registry import get_model_adapter
from server.services.auth import get_current_user_id
from server.services.private_trainer import train_user_model
from server.services.user_storage import get_user_sub_dir, safe_user_file, sanitize_name

router = APIRouter(prefix="/api/private/models", tags=["private-models"])


class TrainModelRequest(BaseModel):
    gameplay_name: Optional[str] = None
    model_name: Optional[str] = None
    model_type: str = "decision_tree"
    samples: Optional[List[Dict[str, Any]]] = None
    selected_features: Optional[List[str]] = None


def _load_bundle(user_id: str, name: str) -> Dict[str, Any]:
    target = safe_user_file(user_id, "models", f"{sanitize_name(name)}.pkl")
    if not target.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    return joblib.load(target)


@router.get("")
def list_user_models(user_id: str = Depends(get_current_user_id)):
    mdir = get_user_sub_dir(user_id, "models")
    res = []
    for f in sorted(mdir.glob("*.pkl"), key=lambda p: p.stat().st_mtime, reverse=True):
        try:
            b = joblib.load(f)
            ts = float(b.get("created_at") or b.get("timestamp") or f.stat().st_mtime)
            res.append({
                "name": f.stem, "filename": f.name, "game_id": b.get("game_id", "dino"),
                "model_type": b.get("model_type", "unknown"), "features_count": len(b.get("features", [])),
                "features": b.get("features", []), "actions": b.get("actions", []),
                "size_bytes": f.stat().st_size, "modified": ts, "timestamp": ts, "created_at": ts,
            })
        except Exception:
            res.append({"name": f.stem, "filename": f.name, "error": "corrupt"})
    return res


@router.post("/train")
def train_private(req: TrainModelRequest, user_id: str = Depends(get_current_user_id)):
    samples = req.samples
    if not samples and req.gameplay_name:
        csv_f = safe_user_file(user_id, "gameplay", f"{sanitize_name(req.gameplay_name)}.csv")
        if not csv_f.exists():
            raise HTTPException(status_code=404, detail="Gameplay CSV not found")
        samples = pd.read_csv(csv_f).to_dict(orient="records")
    if not samples:
        raise HTTPException(status_code=400, detail="Samples or gameplay_name required")
    return train_user_model(user_id, samples, req.model_name, req.model_type, req.selected_features)


@router.get("/{name}/info")
def get_user_model_info(name: str, user_id: str = Depends(get_current_user_id)):
    b = _load_bundle(user_id, name)
    m = b["model"]
    return {
        "model_name": name, "model_type": b.get("model_type", "unknown"), "game_id": b.get("game_id", "dino"),
        "n_estimators": len(m.estimators_) if hasattr(m, "estimators_") else 1,
        "features": b.get("features", []), "actions": b.get("actions", []),
    }


@router.get("/{name}/tree/{idx}")
def get_user_model_tree(name: str, idx: int, user_id: str = Depends(get_current_user_id)):
    b = _load_bundle(user_id, name)
    m, feats, acts = b["model"], b.get("features", []), b.get("actions", [])
    est = m.estimators_[idx] if hasattr(m, "estimators_") else m
    n_est = len(m.estimators_) if hasattr(m, "estimators_") else 1
    return {
        "model_name": name, "model_type": b.get("model_type"), "tree_index": idx,
        "n_estimators": n_est, "tree": extract_tree_data(est, feats, acts),
    }


@router.get("/{name}/graph")
def get_user_model_graph(name: str, user_id: str = Depends(get_current_user_id)):
    b = _load_bundle(user_id, name)
    ma = get_model_adapter(b.get("model_type", "decision_tree"))
    return {
        "model_name": name, "model_type": b.get("model_type"), "game_id": b.get("game_id", "dino"),
        "features": b.get("features", []), "actions": b.get("actions", []),
        "graph": ma.extract_graph(b["model"], b["features"], b["actions"]),
    }
