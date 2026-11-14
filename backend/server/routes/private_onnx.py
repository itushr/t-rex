import json
from fastapi import APIRouter, Depends, HTTPException, Response
from server.services.auth import get_current_user_id
from server.services.user_storage import safe_user_file, sanitize_name

router = APIRouter(prefix="/api/private/onnx/models", tags=["private-onnx"])


@router.get("/{name}")
def get_user_onnx_model(name: str, user_id: str = Depends(get_current_user_id)):
    cname = sanitize_name(name)
    target = safe_user_file(user_id, "onnxs", f"{cname}.onnx")
    if not target.exists():
        raise HTTPException(status_code=404, detail="ONNX model file not found")
    with open(target, "rb") as f:
        data = f.read()
    return Response(
        content=data,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f'attachment; filename="{cname}.onnx"'},
    )


@router.get("/{name}/meta")
def get_user_onnx_meta(name: str, user_id: str = Depends(get_current_user_id)):
    cname = sanitize_name(name)
    target = safe_user_file(user_id, "onnxs", f"{cname}_meta.json")
    if not target.exists():
        raise HTTPException(status_code=404, detail="ONNX metadata not found")
    with open(target, "r") as f:
        return json.load(f)
