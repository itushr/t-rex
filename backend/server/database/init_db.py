import logging
from sqlalchemy import text
from server.database.models import Base
from server.database.session import engine, local_engine

logger = logging.getLogger("server.init_db")

MIGRATIONS = [
    "ALTER TABLE gameplays ADD COLUMN IF NOT EXISTS sr_no INTEGER;",
    "ALTER TABLE gameplays ADD COLUMN IF NOT EXISTS display_name VARCHAR(128);",
    "ALTER TABLE models ADD COLUMN IF NOT EXISTS sr_no INTEGER;",
    "ALTER TABLE models ADD COLUMN IF NOT EXISTS display_name VARCHAR(128);",
    "ALTER TABLE playbacks ADD COLUMN IF NOT EXISTS sr_no INTEGER;",
    "ALTER TABLE playbacks ADD COLUMN IF NOT EXISTS display_name VARCHAR(128);",
]


def _migrate_columns(target_engine):
    with target_engine.connect() as conn:
        for stmt in MIGRATIONS:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass


def init_database() -> None:
    try:
        Base.metadata.create_all(bind=local_engine)
        _migrate_columns(local_engine)
    except Exception as err:
        logger.warning("Could not initialize local SQLite tables: %s", err)
    if engine != local_engine:
        try:
            Base.metadata.create_all(bind=engine)
            _migrate_columns(engine)
        except Exception as err:
            logger.warning("Could not initialize database tables: %s", err)


if __name__ == "__main__":
    init_database()
    print("Database tables initialized successfully.")
