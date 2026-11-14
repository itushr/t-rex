from datetime import datetime
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
import pandas as pd
from pydantic import BaseModel
from server.services.auth import get_current_user_id
from server.services.user_storage import get_user_sub_dir, safe_user_file, sanitize_name

router = APIRouter(prefix="/api/private/gameplays", tags=["private-gameplays"])


class SaveGameplayRequest(BaseModel):
    name: Optional[str] = None
    samples: List[Dict[str, Any]]


@router.get("")
def list_user_gameplays(user_id: str = Depends(get_current_user_id)):
    gdir = get_user_sub_dir(user_id, "gameplay")
    files = []
    for f in sorted(gdir.glob("*.csv"), key=lambda p: p.stat().st_mtime, reverse=True):
        ts = f.stat().st_mtime
        files.append({
            "name": f.stem, "filename": f.name, "size_bytes": f.stat().st_size,
            "modified": ts, "timestamp": ts, "created_at": ts,
        })
    return files


@router.post("")
def save_user_gameplay(req: SaveGameplayRequest, user_id: str = Depends(get_current_user_id)):
    if not req.samples:
        raise HTTPException(status_code=400, detail="Cannot save empty gameplay")
    raw_name = req.name or f"gameplay_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    clean_name = sanitize_name(raw_name)
    target = safe_user_file(user_id, "gameplay", f"{clean_name}.csv")
    df = pd.DataFrame(req.samples)
    df.to_csv(target, index=False)
    return {"ok": True, "name": clean_name, "samples_count": len(req.samples)}


@router.get("/{name}")
def get_user_gameplay(name: str, user_id: str = Depends(get_current_user_id)):
    clean_name = sanitize_name(name)
    target = safe_user_file(user_id, "gameplay", f"{clean_name}.csv")
    if not target.exists():
        raise HTTPException(status_code=404, detail="Gameplay not found")
    df = pd.read_csv(target)
    return {"name": clean_name, "samples": df.to_dict(orient="records")}
