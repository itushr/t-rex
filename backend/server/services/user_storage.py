import re
from pathlib import Path
from fastapi import HTTPException
from server.config import DATA_DIR

USERS_DIR = DATA_DIR / "users"
SAFE_PATTERN = re.compile(r"^[a-zA-Z0-9_\-]+$")


def sanitize_name(name: str) -> str:
    clean = name.strip().replace(" ", "_")
    if not SAFE_PATTERN.match(clean):
        raise HTTPException(status_code=400, detail="Invalid resource name. Use alphanumeric, dashes, underscores.")
    return clean


def get_user_dir(user_id: str) -> Path:
    safe_uid = sanitize_name(user_id)
    udir = USERS_DIR / safe_uid
    for sub in ["gameplay", "models", "onnxs", "playback"]:
        (udir / sub).mkdir(parents=True, exist_ok=True)
    return udir


def get_user_sub_dir(user_id: str, sub: str) -> Path:
    udir = get_user_dir(user_id)
    target = udir / sub
    target.mkdir(parents=True, exist_ok=True)
    return target


def safe_user_file(user_id: str, sub: str, filename: str) -> Path:
    base = get_user_sub_dir(user_id, sub)
    resolved = (base / filename).resolve()
    if not str(resolved).startswith(str(base.resolve())):
        raise HTTPException(status_code=403, detail="Access denied")
    return resolved
