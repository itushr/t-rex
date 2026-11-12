import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse
from server.config import ONNX_DIR
from server.services.local_store import get_local_onnx_bytes, get_local_onnx_meta

router = APIRouter(prefix="/api/onnx/models", tags=["onnx"])


@router.get("")
def list_onnx_models():
    models = []
    local_meta = get_local_onnx_meta()
    if local_meta:
        models.append({
            "name": "local", "filename": "local.onnx", "size_bytes": len(get_local_onnx_bytes() or b""),
            "modified": 0, "game_id": "dino", "model_type": local_meta.get("model_type", "decision_tree"),
            "features": local_meta.get("features", []), "actions": local_meta.get("actions", []),
            "categories": local_meta.get("categories", {}),
        })
    for onnx_path in sorted(ONNX_DIR.glob("*.onnx"), key=lambda p: p.stat().st_mtime, reverse=True):
        stem = onnx_path.stem
        json_path = ONNX_DIR / f"{stem}.json"
        meta = json.loads(json_path.read_text(encoding="utf-8")) if json_path.exists() else {}
        models.append({
            "name": stem, "filename": onnx_path.name, "size_bytes": onnx_path.stat().st_size,
            "modified": onnx_path.stat().st_mtime, "game_id": meta.get("game_id", "dino"),
            "model_type": meta.get("model_type", "unknown"), "features": meta.get("features", []),
            "actions": meta.get("actions", []), "categories": meta.get("categories", {}),
        })
    return models


@router.get("/{model_name}/meta")
def get_onnx_meta(model_name: str):
    stem = Path(model_name).stem
    if stem == "local":
        meta = get_local_onnx_meta()
        if meta: return meta
    json_path = ONNX_DIR / f"{stem}.json"
    if not json_path.exists(): raise HTTPException(status_code=404, detail="Model metadata not found")
    return json.loads(json_path.read_text(encoding="utf-8"))


@router.get("/{model_name}")
def download_onnx_model(model_name: str):
    stem = Path(model_name).stem
    if stem == "local":
        data = get_local_onnx_bytes()
        if data:
            return Response(content=data, media_type="application/octet-stream", headers={"Content-Disposition": 'attachment; filename="local.onnx"'})
    onnx_path = ONNX_DIR / f"{stem}.onnx"
    if not onnx_path.exists(): raise HTTPException(status_code=404, detail=f"ONNX model '{model_name}' not found")
    return FileResponse(path=onnx_path, media_type="application/octet-stream", filename=f"{stem}.onnx")
