import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from server.config import ONNX_DIR

router = APIRouter(prefix="/api/onnx/models", tags=["onnx"])


@router.get("")
def list_onnx_models():
    """Lists available ONNX models with their metadata."""
    models = []
    for onnx_path in sorted(ONNX_DIR.glob("*.onnx"), key=lambda p: p.stat().st_mtime, reverse=True):
        stem = onnx_path.stem
        json_path = ONNX_DIR / f"{stem}.json"
        meta = {}
        if json_path.exists():
            try:
                meta = json.loads(json_path.read_text(encoding="utf-8"))
            except Exception:
                pass

        models.append({
            "name": stem,
            "filename": onnx_path.name,
            "size_bytes": onnx_path.stat().st_size,
            "modified": onnx_path.stat().st_mtime,
            "game_id": meta.get("game_id", "dino"),
            "model_type": meta.get("model_type", "unknown"),
            "features": meta.get("features", []),
            "actions": meta.get("actions", []),
            "categories": meta.get("categories", {}),
        })
    return models


@router.get("/{model_name}/meta")
def get_onnx_meta(model_name: str):
    """Returns the metadata JSON for a specific ONNX model."""
    stem = Path(model_name).stem
    json_path = ONNX_DIR / f"{stem}.json"
    if not json_path.exists():
        raise HTTPException(status_code=404, detail="Model metadata not found")
    return json.loads(json_path.read_text(encoding="utf-8"))


@router.get("/{model_name}")
def download_onnx_model(model_name: str):
    """Serves the raw ONNX binary file."""
    stem = Path(model_name).stem
    onnx_path = ONNX_DIR / f"{stem}.onnx"
    if not onnx_path.exists():
        raise HTTPException(status_code=404, detail=f"ONNX model '{model_name}' not found")
    return FileResponse(
        path=onnx_path,
        media_type="application/octet-stream",
        filename=f"{stem}.onnx",
    )
