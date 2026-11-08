from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from driver.ml.trainer import train_model
from server.config import GAMEPLAY_DIR, MODELS_DIR

router = APIRouter(prefix="/api", tags=["training"])


class TrainRequest(BaseModel):
    gameplay_name: str
    game_id: str = "dino"
    model_type: str = "decision_tree"


@router.get("/gameplays")
def list_gameplays():
    """Returns available human gameplay CSV files for training."""
    files = []
    for f in sorted(GAMEPLAY_DIR.glob("*.csv"), key=lambda p: p.stat().st_mtime, reverse=True):
        files.append({
            "name": f.stem,
            "filename": f.name,
            "size_bytes": f.stat().st_size,
            "modified": f.stat().st_mtime,
        })
    return files


@router.post("/train")
def trigger_training(req: TrainRequest):
    """Triggers ML training on the specified gameplay dataset."""
    csv_path = GAMEPLAY_DIR / f"{req.gameplay_name}.csv"
    if not csv_path.exists():
        csv_path = GAMEPLAY_DIR / req.gameplay_name
    if not csv_path.exists():
        raise HTTPException(status_code=404, detail="Gameplay CSV not found")

    out_name = f"{req.gameplay_name}_{req.model_type}.pkl"
    out_path = MODELS_DIR / out_name

    try:
        result = train_model(
            data_path=csv_path,
            output_path=out_path,
            game_id=req.game_id,
            model_type=req.model_type,
        )
        return {"ok": True, "result": result}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
