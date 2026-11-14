from fastapi import APIRouter, Depends
from pydantic import BaseModel
from server.services.auth import create_guest_token, get_current_user_id
from server.services.user_storage import get_user_dir

router = APIRouter(prefix="/api/auth", tags=["auth"])


class AuthResponse(BaseModel):
    token: str
    user_id: str


@router.post("/guest", response_model=AuthResponse)
def create_guest():
    token = create_guest_token()
    user_id = get_current_user_id(None, token=token)
    get_user_dir(user_id)
    return {"token": token, "user_id": user_id}


@router.get("/me")
def get_me(user_id: str = Depends(get_current_user_id)):
    return {"user_id": user_id, "ok": True}
