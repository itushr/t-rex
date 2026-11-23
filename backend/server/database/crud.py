import time
from typing import List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from server.database.models import GameplayRecord, ModelRecord, PlaybackRecord, User


def _save(db: Session, rec):
    try:
        db.add(rec); db.commit(); db.refresh(rec); return rec
    except Exception:
        db.rollback(); raise


def get_next_sr_no(db: Session, model_cls, user_id: str) -> int:
    val = db.query(func.max(model_cls.sr_no)).filter(model_cls.user_id == user_id).scalar()
    return (val or 0) + 1


def ensure_user(db: Session, user_id: str) -> User:
    try:
        u = db.query(User).filter(User.id == user_id).first()
        now = time.time()
        if not u:
            u = User(id=user_id, created_at=now, last_active=now); db.add(u)
        else:
            u.last_active = now
        db.commit(); db.refresh(u); return u
    except Exception:
        db.rollback(); raise


def create_gameplay(db: Session, **kwargs) -> GameplayRecord:
    ensure_user(db, kwargs.get("user_id", "local"))
    kwargs.setdefault("sr_no", get_next_sr_no(db, GameplayRecord, kwargs.get("user_id", "local")))
    kwargs.setdefault("display_name", f"Gameplay #{kwargs['sr_no']}")
    return _save(db, GameplayRecord(**kwargs))


def list_gameplays(db: Session, user_id: str, game_id: Optional[str] = None) -> List[GameplayRecord]:
    q = db.query(GameplayRecord).filter(GameplayRecord.user_id == user_id)
    if game_id: q = q.filter(GameplayRecord.game_id == game_id)
    return q.order_by(GameplayRecord.created_at.desc()).all()


def get_gameplay(db: Session, user_id: str, ident: str, game_id: Optional[str] = None) -> Optional[GameplayRecord]:
    q = db.query(GameplayRecord).filter(GameplayRecord.user_id == user_id)
    if game_id: q = q.filter(GameplayRecord.game_id == game_id)
    if str(ident).isdigit():
        r = q.filter(GameplayRecord.sr_no == int(ident)).first()
        if r: return r
    return q.filter((GameplayRecord.name == ident) | (GameplayRecord.display_name == ident)).first()


def create_model(db: Session, **kwargs) -> ModelRecord:
    ensure_user(db, kwargs.get("user_id", "local"))
    kwargs.setdefault("sr_no", get_next_sr_no(db, ModelRecord, kwargs.get("user_id", "local")))
    kwargs.setdefault("display_name", f"Model #{kwargs['sr_no']}")
    return _save(db, ModelRecord(**kwargs))


def list_models(db: Session, user_id: str, game_id: Optional[str] = None) -> List[ModelRecord]:
    q = db.query(ModelRecord).filter(ModelRecord.user_id == user_id)
    if game_id: q = q.filter(ModelRecord.game_id == game_id)
    return q.order_by(ModelRecord.created_at.desc()).all()


def get_model(db: Session, user_id: str, ident: str, game_id: Optional[str] = None) -> Optional[ModelRecord]:
    q = db.query(ModelRecord).filter(ModelRecord.user_id == user_id)
    if game_id: q = q.filter(ModelRecord.game_id == game_id)
    if str(ident).isdigit():
        r = q.filter(ModelRecord.sr_no == int(ident)).first()
        if r: return r
    return q.filter((ModelRecord.name == ident) | (ModelRecord.display_name == ident)).first()


def create_playback(db: Session, **kwargs) -> PlaybackRecord:
    ensure_user(db, kwargs.get("user_id", "local"))
    kwargs.setdefault("sr_no", get_next_sr_no(db, PlaybackRecord, kwargs.get("user_id", "local")))
    kwargs.setdefault("display_name", f"Autoplay #{kwargs['sr_no']}")
    return _save(db, PlaybackRecord(**kwargs))


def list_playbacks(db: Session, user_id: str, game_id: Optional[str] = None) -> List[PlaybackRecord]:
    q = db.query(PlaybackRecord).filter(PlaybackRecord.user_id == user_id)
    if game_id: q = q.filter(PlaybackRecord.game_id == game_id)
    return q.order_by(PlaybackRecord.created_at.desc()).all()


def get_playback(db: Session, user_id: str, ident: str, game_id: Optional[str] = None) -> Optional[PlaybackRecord]:
    q = db.query(PlaybackRecord).filter(PlaybackRecord.user_id == user_id)
    if game_id: q = q.filter(PlaybackRecord.game_id == game_id)
    if str(ident).isdigit():
        r = q.filter(PlaybackRecord.sr_no == int(ident)).first()
        if r: return r
    return q.filter((PlaybackRecord.name == ident) | (PlaybackRecord.display_name == ident)).first()
