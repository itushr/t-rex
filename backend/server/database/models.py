from sqlalchemy import Column, Float, ForeignKey, Index, Integer, JSON, String
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    id = Column(String(64), primary_key=True, index=True)
    created_at = Column(Float, nullable=False)
    last_active = Column(Float, nullable=False)


class GameplayRecord(Base):
    __tablename__ = "gameplays"
    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sr_no = Column(Integer, default=1, index=True)
    display_name = Column(String(128), nullable=True)
    game_id = Column(String(32), default="dino", nullable=False)
    name = Column(String(128), nullable=False)
    filename = Column(String(128), nullable=False)
    r2_key = Column(String(256), nullable=False)
    size_bytes = Column(Integer, default=0)
    samples_count = Column(Integer, default=0)
    created_at = Column(Float, nullable=False, index=True)

    __table_args__ = (Index("idx_gameplay_user_time", "user_id", "created_at"),)


class ModelRecord(Base):
    __tablename__ = "models"
    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sr_no = Column(Integer, default=1, index=True)
    display_name = Column(String(128), nullable=True)
    game_id = Column(String(32), default="dino", nullable=False)
    name = Column(String(128), nullable=False)
    filename = Column(String(128), nullable=False)
    model_type = Column(String(64), nullable=False)
    r2_bundle_key = Column(String(256), nullable=False)
    r2_onnx_key = Column(String(256), nullable=False)
    r2_meta_key = Column(String(256), nullable=True)
    accuracy = Column(Float, default=0.0)
    features = Column(JSON, default=list)
    actions = Column(JSON, default=list)
    created_at = Column(Float, nullable=False, index=True)

    __table_args__ = (Index("idx_model_user_time", "user_id", "created_at"),)


class PlaybackRecord(Base):
    __tablename__ = "playbacks"
    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sr_no = Column(Integer, default=1, index=True)
    display_name = Column(String(128), nullable=True)
    game_id = Column(String(32), default="dino", nullable=False)
    name = Column(String(128), nullable=False)
    filename = Column(String(128), nullable=False)
    model_name = Column(String(128), nullable=True)
    model_type = Column(String(64), nullable=True)
    r2_key = Column(String(256), nullable=False)
    total_steps = Column(Integer, default=0)
    duration = Column(Float, default=0.0)
    created_at = Column(Float, nullable=False, index=True)

    __table_args__ = (Index("idx_playback_user_time", "user_id", "created_at"),)
