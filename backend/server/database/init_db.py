import logging
from server.database.models import Base
from server.database.session import engine, sqlite_engine

logger = logging.getLogger("server.init_db")


def init_database() -> None:
    try:
        Base.metadata.create_all(bind=sqlite_engine)
    except Exception as err:
        logger.warning("Failed to initialize SQLite fallback tables: %s", err)
    if engine is not None and engine != sqlite_engine:
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as err:
            logger.warning("Failed to initialize primary database tables: %s", err)


if __name__ == "__main__":
    init_database()
    print("Database tables initialized successfully.")
