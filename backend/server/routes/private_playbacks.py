import json
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from server.services.auth import get_current_user_id
from server.services.private_playback import save_user_playback
from server.services.user_storage import get_user_sub_dir, safe_user_file, sanitize_name

router = APIRouter(prefix="/api/private/playbacks", tags=["private-playbacks"])


class SavePlaybackRequest(BaseModel):
    model_name: str
    playback_name: Optional[str] = None
    steps: List[Dict[str, Any]]


def _load_p(user_id: str, name: str) -> Dict[str, Any]:
    cname = sanitize_name(name.replace(".json", ""))
    target = safe_user_file(user_id, "playback", f"{cname}.json")
    if not target.exists():
        raise HTTPException(status_code=404, detail="Playback not found")
    with open(target, "r") as f:
        return json.load(f)


@router.get("")
def list_user_playbacks(user_id: str = Depends(get_current_user_id)):
    pdir = get_user_sub_dir(user_id, "playback")
    res = []
    for f in sorted(pdir.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
        try:
            with open(f, "r") as fh:
                d = json.load(fh)
            ts = float(d.get("timestamp") or d.get("created_at") or f.stat().st_mtime)
            res.append({
                "name": f.stem, "filename": f.name, "model_name": d.get("model_name"),
                "model_type": d.get("model_type"), "total_steps": d.get("total_steps", 0),
                "duration": d.get("duration", 0.0), "modified": ts,
                "timestamp": ts, "created_at": ts,
            })
        except Exception:
            res.append({"name": f.stem, "filename": f.name, "error": "corrupt"})
    return res


@router.post("")
def record_user_playback(req: SavePlaybackRequest, user_id: str = Depends(get_current_user_id)):
    return save_user_playback(user_id, req.model_name, req.steps, req.playback_name)


@router.get("/{name}/meta")
def get_user_playback_meta(name: str, user_id: str = Depends(get_current_user_id)):
    data = _load_p(user_id, name)
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
def get_user_playback_step(name: str, step_no: int, user_id: str = Depends(get_current_user_id)):
    data = _load_p(user_id, name)
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
