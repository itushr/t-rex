import os
import uuid
from typing import Optional
from fastapi import Header, HTTPException, Query, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt

SECRET = os.environ.get("DINO_JWT_SECRET", "dino-guest-secret-key-2026-secure-32b")
ALGO = "HS256"
security = HTTPBearer(auto_error=False)


def create_guest_token(user_id: Optional[str] = None) -> str:
    uid = user_id or f"gst_{uuid.uuid4().hex[:10]}"
    payload = {"sub": uid}
    return jwt.encode(payload, SECRET, algorithm=ALGO)


def decode_guest_token(token: str) -> str:
    try:
        data = jwt.decode(token, SECRET, algorithms=[ALGO])
        uid = data.get("sub")
        if not uid or not isinstance(uid, str):
            raise HTTPException(status_code=401, detail="Invalid token subject")
        return uid
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired guest token")


def get_current_user_id(
    cred: Optional[HTTPAuthorizationCredentials] = Security(security),
    token: Optional[str] = Query(None),
) -> str:
    raw = cred.credentials if cred else token
    if not raw:
        raise HTTPException(status_code=401, detail="Guest token required. Pass Authorization header or ?token=")
    return decode_guest_token(raw)
