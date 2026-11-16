import json
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from server.database.crud import get_model
from server.database.session import get_db
from server.services.auth import get_current_user_id
from server.services.storage import get_storage
from server.services.user_storage import sanitize_name

router = APIRouter(prefix="/api/private/onnx/models", tags=["private-onnx"])


@router.get("/{name}")
def get_user_onnx_model(
    name: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    cname = sanitize_name(name)
    rec = get_model(db, user_id, cname)
    if not rec or not rec.r2_onnx_key:
        raise HTTPException(status_code=404, detail="ONNX model not found")
    data = get_storage().get_bytes(rec.r2_onnx_key)
    return Response(
        content=data,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{cname}.onnx"'},
    )


@router.get("/{name}/meta")
def get_user_onnx_meta(
    name: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    cname = sanitize_name(name)
    rec = get_model(db, user_id, cname)
    if not rec:
        raise HTTPException(status_code=404, detail="ONNX metadata not found")
    if rec.r2_meta_key:
        data = get_storage().get_bytes(rec.r2_meta_key)
        return json.loads(data.decode("utf-8"))
    return {
        "name": rec.name, "model_type": rec.model_type, "game_id": rec.game_id,
        "features": rec.features or [], "actions": rec.actions or [],
        "created_at": rec.created_at, "timestamp": rec.created_at,
    }
