import json
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from server.database.crud import get_playback, list_playbacks
from server.database.session import get_db
from server.services.auth import get_current_user_id
from server.services.private_playback import save_user_playback
from server.services.storage import get_storage
from server.services.user_storage import sanitize_name

router = APIRouter(prefix="/api/private/playbacks", tags=["private-playbacks"])


class SavePlaybackRequest(BaseModel):
    model_name: str
    playback_name: Optional[str] = None
    steps: List[Dict[str, Any]]


def _load_p(db: Session, user_id: str, name: str) -> Dict[str, Any]:
    cname = sanitize_name(name.replace(".json", ""))
    rec = get_playback(db, user_id, cname)
    if not rec or not rec.r2_key:
        raise HTTPException(status_code=404, detail="Playback not found")
    data = get_storage().get_bytes(rec.r2_key)
    return json.loads(data.decode("utf-8"))


@router.get("")
def list_user_playbacks(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    records = list_playbacks(db, user_id)
    return [
        {
            "name": r.name, "filename": r.filename, "model_name": r.model_name,
            "model_type": r.model_type, "total_steps": r.total_steps, "duration": r.duration,
            "modified": r.created_at, "timestamp": r.created_at, "created_at": r.created_at,
        }
        for r in records
    ]


@router.post("")
def record_user_playback(
    req: SavePlaybackRequest,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    return save_user_playback(db, user_id, req.model_name, req.steps, req.playback_name)


@router.get("/{name}/meta")
def get_user_playback_meta(name: str, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    data = _load_p(db, user_id, name)
    cname = sanitize_name(name.replace(".json", ""))
    steps = [
        {"step": r["step"], "obstacle1": f"{r['obs1']['type']} ({r['obs1']['x']}px)",
         "speed": r["speed"], "action": r["action"]}
        for r in data.get("records", [])
    ]
    return {
        "filename": f"{cname}.json", "model_name": data.get("model_name"),
        "model_type": data.get("model_type"), "n_estimators": data.get("n_estimators", 1),
        "total_steps": data.get("total_steps", len(steps)), "steps": steps,
    }


@router.get("/{name}/step/{step_no}")
def get_user_playback_step(
    name: str, step_no: int, user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)
):
    data = _load_p(db, user_id, name)
    recs = data.get("records", [])
    if step_no < 1 or step_no > len(recs):
        raise HTTPException(status_code=404, detail="Step out of range")
    rec = recs[step_no - 1]
    is_rf = data.get("model_type") == "random_forest"
    tree = data.get("forest", {}).get("trees", [None])[0] if not is_rf else None
    return {
        "step": rec["step"], "action": rec["action"], "model_type": data.get("model_type"),
        "path": rec.get("path", []), "leaf_id": rec.get("leaf_id", 0), "tree": tree,
        "trees": rec.get("trees", []), "votes": rec.get("votes", {}),
    }
