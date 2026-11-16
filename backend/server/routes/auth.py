from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from server.database.crud import ensure_user
from server.database.session import get_db
from server.services.auth import create_guest_token, get_current_user_id

router = APIRouter(prefix="/api/auth", tags=["auth"])


class AuthResponse(BaseModel):
    token: str
    user_id: str


@router.post("/guest", response_model=AuthResponse)
def create_guest(db: Session = Depends(get_db)):
    token = create_guest_token()
    user_id = get_current_user_id(None, token=token)
    ensure_user(db, user_id)
    return {"token": token, "user_id": user_id}


@router.get("/me")
def get_me(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    ensure_user(db, user_id)
    return {"user_id": user_id, "ok": True}
