import logging
from server.database.models import Base
from server.database.session import engine, local_engine

logger = logging.getLogger("server.init_db")


def init_database() -> None:
    try:
        Base.metadata.create_all(bind=local_engine)
    except Exception as err:
        logger.warning("Could not initialize local SQLite tables: %s", err)
    if engine != local_engine:
        try:
            Base.metadata.create_all(bind=engine)
        except Exception as err:
            logger.warning("Could not initialize database tables: %s", err)


if __name__ == "__main__":
    init_database()
    print("Database tables initialized successfully.")
