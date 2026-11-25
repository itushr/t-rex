from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database.dashboard_queries import execute_dashboard_query
from server.database.session import get_db, get_local_db
from server.services.auth import create_guest_token, get_current_user_id

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/private/dashboard")
def get_private_dashboard(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    res = execute_dashboard_query(db, user_id, update_active=True)
    res["token"] = create_guest_token(user_id)
    res["user_id"] = user_id
    return res


@router.get("/dashboard")
def get_local_dashboard(db: Session = Depends(get_local_db)):
    return execute_dashboard_query(db, "local", update_active=False)
