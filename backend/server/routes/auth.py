import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from server.database.crud import ensure_user
from server.database.session import get_db
from server.services.auth import create_guest_token, get_current_user_id

logger = logging.getLogger("server.auth")
router = APIRouter(prefix="/api/auth", tags=["auth"])


class AuthResponse(BaseModel):
    token: str
    user_id: str


@router.post("/guest", response_model=AuthResponse)
def create_guest(db: Session = Depends(get_db)):
    token = create_guest_token()
    user_id = get_current_user_id(None, token=token)
    try:
        ensure_user(db, user_id)
    except Exception as err:
        logger.warning("create_guest ensure_user non-fatal error: %s", err)
    return {"token": token, "user_id": user_id}


@router.get("/me")
def get_me(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    try:
        ensure_user(db, user_id)
    except Exception as err:
        logger.warning("get_me ensure_user non-fatal error: %s", err)
    return {"user_id": user_id, "ok": True}
