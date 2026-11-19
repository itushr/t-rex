import time
from typing import List, Optional
from sqlalchemy.orm import Session
from server.database.models import GameplayRecord, ModelRecord, PlaybackRecord, User


def _save(db: Session, rec):
    try:
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return rec
    except Exception:
        db.rollback()
        raise


def ensure_user(db: Session, user_id: str) -> User:
    try:
        u = db.query(User).filter(User.id == user_id).first()
        now = time.time()
        if not u:
            u = User(id=user_id, created_at=now, last_active=now)
            db.add(u)
        else:
            u.last_active = now
        db.commit()
        db.refresh(u)
        return u
    except Exception:
        db.rollback()
        raise


def create_gameplay(db: Session, **kwargs) -> GameplayRecord:
    ensure_user(db, kwargs["user_id"])
    return _save(db, GameplayRecord(**kwargs))


def list_gameplays(db: Session, user_id: str, game_id: str = "dino") -> List[GameplayRecord]:
    q = db.query(GameplayRecord).filter(GameplayRecord.user_id == user_id, GameplayRecord.game_id == game_id)
    return q.order_by(GameplayRecord.created_at.desc()).all()


def get_gameplay(db: Session, user_id: str, name: str, game_id: str = "dino") -> Optional[GameplayRecord]:
    return db.query(GameplayRecord).filter(
        GameplayRecord.user_id == user_id, GameplayRecord.name == name, GameplayRecord.game_id == game_id
    ).first()


def create_model(db: Session, **kwargs) -> ModelRecord:
    ensure_user(db, kwargs["user_id"])
    return _save(db, ModelRecord(**kwargs))


def list_models(db: Session, user_id: str, game_id: str = "dino") -> List[ModelRecord]:
    q = db.query(ModelRecord).filter(ModelRecord.user_id == user_id, ModelRecord.game_id == game_id)
    return q.order_by(ModelRecord.created_at.desc()).all()


def get_model(db: Session, user_id: str, name: str, game_id: str = "dino") -> Optional[ModelRecord]:
    return db.query(ModelRecord).filter(
        ModelRecord.user_id == user_id, ModelRecord.name == name, ModelRecord.game_id == game_id
    ).first()


def create_playback(db: Session, **kwargs) -> PlaybackRecord:
    ensure_user(db, kwargs["user_id"])
    return _save(db, PlaybackRecord(**kwargs))


def list_playbacks(db: Session, user_id: str, game_id: str = "dino") -> List[PlaybackRecord]:
    q = db.query(PlaybackRecord).filter(PlaybackRecord.user_id == user_id, PlaybackRecord.game_id == game_id)
    return q.order_by(PlaybackRecord.created_at.desc()).all()


def get_playback(db: Session, user_id: str, name: str, game_id: str = "dino") -> Optional[PlaybackRecord]:
    return db.query(PlaybackRecord).filter(
        PlaybackRecord.user_id == user_id, PlaybackRecord.name == name, PlaybackRecord.game_id == game_id
    ).first()
