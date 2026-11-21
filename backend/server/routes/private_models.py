import io, json
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
import joblib, pandas as pd
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ml.models.tree_extractor import extract_tree_data
from ml.registry import get_model_adapter
from server.database.crud import get_gameplay, get_model, list_models
from server.database.session import get_db
from server.services.auth import get_current_user_id
from server.services.private_rl import save_user_qtable
from server.services.private_trainer import train_user_model
from server.services.storage import get_storage
from server.services.user_storage import sanitize_name

router = APIRouter(prefix="/api/private/models", tags=["private-models"])


class TrainModelRequest(BaseModel):
    gameplay_name: Optional[str] = None
    model_name: Optional[str] = None
    model_type: str = "decision_tree"
    game_id: Optional[str] = "dino"
    samples: Optional[List[Dict[str, Any]]] = None
    selected_features: Optional[List[str]] = None


class SaveQTableRequest(BaseModel):
    model_name: Optional[str] = None
    game_id: Optional[str] = "dino"
    q_table: Dict[str, Dict[str, float]]
    actions: Optional[List[str]] = None
    features: Optional[List[str]] = None
    tries: Optional[int] = 1


def _load_bundle(db: Session, user_id: str, name: str) -> Dict[str, Any]:
    rec = get_model(db, user_id, sanitize_name(name))
    if not rec:
        raise HTTPException(status_code=404, detail="Model not found")
    data = get_storage().get_bytes(rec.r2_bundle_key)
    return json.loads(data.decode("utf-8")) if rec.model_type == "q_table" else joblib.load(io.BytesIO(data))


@router.get("")
def list_user_models(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return [{
        "name": r.name, "filename": r.filename, "game_id": r.game_id, "model_type": r.model_type,
        "features_count": len(r.features or []), "features": r.features, "actions": r.actions,
        "accuracy": r.accuracy, "size_bytes": 0, "modified": r.created_at, "timestamp": r.created_at, "created_at": r.created_at,
    } for r in list_models(db, user_id)]


@router.post("/train")
def train_private(req: TrainModelRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    samples = req.samples
    if not samples and req.gameplay_name:
        rec = get_gameplay(db, user_id, sanitize_name(req.gameplay_name))
        if not rec:
            raise HTTPException(status_code=404, detail="Gameplay not found")
        samples = pd.read_csv(io.BytesIO(get_storage().get_bytes(rec.r2_key))).to_dict(orient="records")
    if not samples:
        raise HTTPException(status_code=400, detail="Samples or gameplay_name required")
    gid = req.game_id or ("flappy-bird" if samples and "bird_y" in samples[0] else "dino")
    return train_user_model(db, user_id, samples, req.model_name, req.model_type, req.selected_features, gid)


@router.post("/save-qtable")
def save_qtable(req: SaveQTableRequest, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    return save_user_qtable(db, user_id, req.q_table, req.model_name, req.game_id, req.actions, req.features, req.tries or 1)


@router.get("/{name}/info")
def get_user_model_info(name: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    b = _load_bundle(db, user_id, name)
    m = b.get("model")
    n_est = len(m.estimators_) if m and hasattr(m, "estimators_") else 1
    return {"model_name": name, "model_type": b.get("model_type", "unknown"), "game_id": b.get("game_id", "dino"), "n_estimators": n_est, "features": b.get("features", []), "actions": b.get("actions", [])}


@router.get("/{name}/tree/{idx}")
def get_user_model_tree(name: str, idx: int, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    b = _load_bundle(db, user_id, name)
    m, feats, acts = b["model"], b.get("features", []), b.get("actions", [])
    est = m.estimators_[idx] if hasattr(m, "estimators_") else m
    return {"model_name": name, "model_type": b.get("model_type"), "tree_index": idx, "n_estimators": len(m.estimators_) if hasattr(m, "estimators_") else 1, "tree": extract_tree_data(est, feats, acts)}


@router.get("/{name}/graph")
def get_user_model_graph(name: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    b = _load_bundle(db, user_id, name)
    ma = get_model_adapter(b.get("model_type", "decision_tree"))
    return {"model_name": name, "model_type": b.get("model_type"), "game_id": b.get("game_id", "dino"), "features": b.get("features", []), "actions": b.get("actions", []), "graph": ma.extract_graph(b["model"], b["features"], b["actions"])}
