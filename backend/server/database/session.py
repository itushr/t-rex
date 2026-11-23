import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger("server.db")
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

DATA_DIR = Path(__file__).resolve().parents[2] / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
SQLITE_URL = f"sqlite:///{DATA_DIR / 'local.db'}"
local_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
SessionSqlite = sessionmaker(autocommit=False, autoflush=False, bind=local_engine)

DATABASE_URL = os.getenv("SUPABASE_CONNECTION_STRING", "").strip()
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgresql://"):]

if DATABASE_URL:
    engine = create_engine(
        DATABASE_URL, pool_size=10, max_overflow=20, pool_recycle=300, pool_pre_ping=True,
        connect_args={"connect_timeout": 5, "keepalives": 1, "keepalives_idle": 30, "keepalives_interval": 10, "keepalives_count": 5},
    )
else:
    engine = local_engine

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_local_db():
    db = SessionSqlite()
    try:
        yield db
    finally:
        db.close()
