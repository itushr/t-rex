from server.database.models import Base
from server.database.session import engine


def init_database() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_database()
    print("Database tables initialized successfully.")
