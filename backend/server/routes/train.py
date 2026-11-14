from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ml.games.dino_constants import NUMERIC_FEATURES, CATEGORICAL_FEATURES
from ml.trainer import train_model
from server.config import GAMEPLAY_DIR, MODELS_DIR
from server.services.local_trainer import train_local_model

router = APIRouter(prefix="/api", tags=["training"])


class TrainRequest(BaseModel):
    gameplay_name: Optional[str] = None
    game_id: str = "dino"
    model_type: str = "decision_tree"
    samples: Optional[List[Dict[str, Any]]] = None
    selected_features: Optional[List[str]] = None


@router.get("/features")
def get_available_features():
    return {
        "numeric_features": list(NUMERIC_FEATURES),
        "categorical_features": list(CATEGORICAL_FEATURES),
    }


@router.get("/gameplays")
def list_gameplays():
    files = []
    for f in sorted(GAMEPLAY_DIR.glob("*.csv"), key=lambda p: p.stat().st_mtime, reverse=True):
        files.append({
            "name": f.stem, "filename": f.name,
            "size_bytes": f.stat().st_size, "modified": f.stat().st_mtime,
        })
    return files


@router.post("/train/local")
@router.post("/train")
def trigger_training(req: TrainRequest):
    if req.samples:
        try:
            return train_local_model(req.samples, req.model_type, req.selected_features)
        except Exception as exc:
            raise HTTPException(status_code=400, detail=str(exc))

    if not req.gameplay_name:
        raise HTTPException(status_code=400, detail="gameplay_name or samples required")

    csv_path = GAMEPLAY_DIR / f"{req.gameplay_name}.csv"
    if not csv_path.exists():
        csv_path = GAMEPLAY_DIR / req.gameplay_name
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="Gameplay CSV not found")

    out_name = f"{req.gameplay_name}_{req.model_type}.pkl"
    out_path = MODELS_DIR / out_name
    try:
        res = train_model(data_path=csv_path, output_path=out_path, game_id=req.game_id, model_type=req.model_type)
        return {"ok": True, "result": res}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
