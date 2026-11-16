import io
import os
from abc import ABC, abstractmethod
from pathlib import Path
import boto3
from botocore.config import Config
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)


class BaseStorageService(ABC):
    @abstractmethod
    def put_bytes(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        pass

    @abstractmethod
    def get_bytes(self, key: str) -> bytes:
        pass

    @abstractmethod
    def exists(self, key: str) -> bool:
        pass


class R2StorageService(BaseStorageService):
    def __init__(self):
        acc = os.getenv("R2_ACCOUNT_ID", "")
        self.bucket = os.getenv("R2_PRIVATE_BUCKET_NAME", "trexprivate")
        endpoint = f"https://{acc}.r2.cloudflarestorage.com"
        cfg = Config(signature_version="s3v4")
        self.client = boto3.client(
            "s3",
            endpoint_url=endpoint,
            aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID", ""),
            aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY", ""),
            region_name="auto",
            config=cfg,
        )

    def put_bytes(self, key: str, data: bytes, content_type: str = "application/octet-stream") -> str:
        clean_key = key.lstrip("/")
        self.client.put_object(
            Bucket=self.bucket,
            Key=clean_key,
            Body=data,
            ContentType=content_type,
        )
        return clean_key

    def get_bytes(self, key: str) -> bytes:
        clean_key = key.lstrip("/")
        resp = self.client.get_object(Bucket=self.bucket, Key=clean_key)
        return resp["Body"].read()

    def exists(self, key: str) -> bool:
        clean_key = key.lstrip("/")
        try:
            self.client.head_object(Bucket=self.bucket, Key=clean_key)
            return True
        except Exception:
            return False


_storage_instance: BaseStorageService | None = None


def get_storage() -> BaseStorageService:
    global _storage_instance
    if _storage_instance is None:
        _storage_instance = R2StorageService()
    return _storage_instance


def make_r2_key(user_id: str, game_id: str, category: str, filename: str) -> str:
    return f"{user_id}/{game_id}/{category}/{filename}"
