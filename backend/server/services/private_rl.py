import json, time, uuid
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from server.database.crud import create_model
from server.services.storage import get_storage, make_r2_key
from server.services.user_storage import sanitize_name


def save_user_qtable(
    db: Session,
    user_id: str,
    q_table: Dict[str, Dict[str, float]],
    model_name: Optional[str] = None,
    game_id: str = "dino",
    actions: Optional[List[str]] = None,
    features: Optional[List[str]] = None,
    tries: int = 1,
) -> Dict[str, Any]:
    raw_name = model_name or f"q_table_{time.strftime('%Y%m%d_%H%M%S')}"
    cname = sanitize_name(raw_name)
    gid = game_id or "dino"
    now_ts = time.time()
    acts = actions or ["jump", "duck", "none"]
    feats = features or ["is_obst_close", "obst_type", "obst_y"]

    meta = {
        "name": cname, "model_type": "q_table", "game_id": gid,
        "features": feats, "actions": acts, "q_table": q_table,
        "tries": tries, "created_at": now_ts, "timestamp": now_ts,
    }
    meta_bytes = json.dumps(meta, indent=2).encode("utf-8")
    storage = get_storage()
    meta_key = make_r2_key(user_id, gid, "models", f"{cname}_meta.json")
    bundle_key = make_r2_key(user_id, gid, "models", f"{cname}.json")

    storage.put_bytes(meta_key, meta_bytes, "application/json")
    storage.put_bytes(bundle_key, meta_bytes, "application/json")

    create_model(
        db,
        id=f"mod_{uuid.uuid4().hex[:12]}",
        user_id=user_id,
        game_id=gid,
        name=cname,
        filename=f"{cname}.json",
        model_type="q_table",
        r2_bundle_key=bundle_key,
        r2_onnx_key=meta_key,
        r2_meta_key=meta_key,
        accuracy=float(tries),
        features=feats,
        actions=acts,
        created_at=now_ts,
    )
    return {"ok": True, "model_name": cname, "model_type": "q_table", "tries": tries}
