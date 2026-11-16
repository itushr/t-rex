import io
import time
import uuid
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
from pydantic import BaseModel
from sqlalchemy.orm import Session
from server.database.crud import create_gameplay, get_gameplay, list_gameplays
from server.database.session import get_db
from server.services.auth import get_current_user_id
from server.services.storage import get_storage, make_r2_key
from server.services.user_storage import sanitize_name

router = APIRouter(prefix="/api/private/gameplays", tags=["private-gameplays"])


class SaveGameplayRequest(BaseModel):
    name: Optional[str] = None
    samples: List[Dict[str, Any]]


@router.get("")
def list_user_gameplays(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    records = list_gameplays(db, user_id)
    return [
        {
            "name": r.name, "filename": r.filename, "size_bytes": r.size_bytes,
            "samples_count": r.samples_count, "modified": r.created_at,
            "timestamp": r.created_at, "created_at": r.created_at,
        }
        for r in records
    ]


@router.post("")
def save_user_gameplay(
    req: SaveGameplayRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not req.samples:
        raise HTTPException(status_code=400, detail="Cannot save empty gameplay")
    raw_name = req.name or f"gameplay_{time.strftime('%Y%m%d_%H%M%S')}"
    clean_name = sanitize_name(raw_name)
    fname = f"{clean_name}.csv"
    r2_key = make_r2_key(user_id, "dino", "gameplays", fname)

    df = pd.DataFrame(req.samples)
    buf = io.BytesIO()
    df.to_csv(buf, index=False)
    csv_bytes = buf.getvalue()

    storage = get_storage()
    storage.put_bytes(r2_key, csv_bytes, "text/csv")

    now = time.time()
    create_gameplay(
        db,
        id=f"gp_{uuid.uuid4().hex[:12]}",
        user_id=user_id,
        game_id="dino",
        name=clean_name,
        filename=fname,
        r2_key=r2_key,
        size_bytes=len(csv_bytes),
        samples_count=len(req.samples),
        created_at=now,
    )
    return {"ok": True, "name": clean_name, "samples_count": len(req.samples)}


@router.get("/{name}")
def get_user_gameplay(
    name: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    clean_name = sanitize_name(name)
    rec = get_gameplay(db, user_id, clean_name)
    if not rec:
        raise HTTPException(status_code=404, detail="Gameplay not found")
    storage = get_storage()
    csv_bytes = storage.get_bytes(rec.r2_key)
    df = pd.read_csv(io.BytesIO(csv_bytes))
    return {"name": clean_name, "samples": df.to_dict(orient="records")}
