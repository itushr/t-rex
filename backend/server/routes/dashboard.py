import time
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from server.database.crud import list_gameplays, list_models, list_playbacks
from server.database.models import User
from server.database.session import get_db, get_local_db
from server.services.auth import create_guest_token, get_current_user_id

router = APIRouter(prefix="/api", tags=["dashboard"])


def _format_dashboard(models, gameplays, playbacks):
    return {
        "models": [{
            "sr_no": m.sr_no or 1,
            "name": str(m.sr_no or m.name),
            "display_name": m.display_name or (f"Model #{m.sr_no}" if m.sr_no else m.name),
            "game_id": m.game_id, "model_type": m.model_type, "accuracy": m.accuracy,
            "features": m.features, "actions": m.actions, "created_at": m.created_at, "timestamp": m.created_at,
        } for m in models],
        "gameplays": [{
            "sr_no": g.sr_no or 1,
            "name": str(g.sr_no or g.name),
            "display_name": g.display_name or (f"Gameplay #{g.sr_no}" if g.sr_no else g.name),
            "game_id": g.game_id, "samples_count": g.samples_count, "created_at": g.created_at, "timestamp": g.created_at,
        } for g in gameplays],
        "playbacks": [{
            "sr_no": p.sr_no or 1,
            "name": str(p.sr_no or p.name),
            "display_name": p.display_name or (f"Autoplay #{p.sr_no}" if p.sr_no else p.name),
            "game_id": p.game_id, "model_name": p.model_name, "model_type": p.model_type,
            "total_steps": p.total_steps, "duration": p.duration, "created_at": p.created_at, "timestamp": p.created_at,
        } for p in playbacks],
    }


@router.get("/private/dashboard")
def get_private_dashboard(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    new_token = create_guest_token(user_id)
    u = db.query(User).filter(User.id == user_id).first()
    if u:
        u.last_active = time.time()
        try: db.commit()
        except Exception: db.rollback()
    res = _format_dashboard(list_models(db, user_id), list_gameplays(db, user_id), list_playbacks(db, user_id))
    res["token"] = new_token
    res["user_id"] = user_id
    return res


@router.get("/dashboard")
def get_local_dashboard(db: Session = Depends(get_local_db)):
    return _format_dashboard(list_models(db, "local"), list_gameplays(db, "local"), list_playbacks(db, "local"))
