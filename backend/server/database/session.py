import logging
import os
import time
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.config import DATA_DIR

logger = logging.getLogger("server.db")
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("SUPABASE_CONNECTION_STRING", "").strip()
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = "postgresql+psycopg2://" + DATABASE_URL[len("postgresql://"):]

sqlite_path = DATA_DIR / "app.db"
sqlite_engine = create_engine(
    f"sqlite:///{sqlite_path}",
    connect_args={"check_same_thread": False},
)
SqliteSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sqlite_engine)

pg_engine = None
PgSessionLocal = None
if DATABASE_URL:
    try:
        pg_engine = create_engine(
            DATABASE_URL,
            pool_size=10,
            max_overflow=20,
            pool_recycle=300,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3},
        )
        PgSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=pg_engine)
    except Exception as err:
        logger.warning("Could not initialize PostgreSQL engine: %s", err)

engine = pg_engine if pg_engine is not None else sqlite_engine
SessionLocal = PgSessionLocal if PgSessionLocal is not None else SqliteSessionLocal

_pg_failed_until = 0.0


def get_db():
    global _pg_failed_until
    now = time.time()
    db = None
    if PgSessionLocal is not None and now > _pg_failed_until:
        try:
            cand = PgSessionLocal()
            cand.connection()
            db = cand
        except Exception as err:
            _pg_failed_until = now + 30.0
            logger.warning("Primary DB connection error (%s); falling back to SQLite.", err)
            if cand:
                cand.close()
    if db is None:
        db = SqliteSessionLocal()
    try:
        yield db
    finally:
        db.close()
