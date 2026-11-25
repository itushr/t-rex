import json
import time
from typing import Any, Dict
from sqlalchemy import text
from sqlalchemy.orm import Session


def _parse_json(val: Any) -> Any:
    if val is None:
        return []
    if isinstance(val, (list, dict)):
        return val
    try:
        return json.loads(val)
    except Exception:
        return []


def _format_item(r: Dict[str, Any]) -> tuple:
    kind = r["kind"]
    sr = r["sr_no"] or 1
    name = str(r["sr_no"] or r["name"])
    ts = r["created_at"]
    if kind == "model":
        return ("model", {
            "sr_no": sr, "name": name,
            "display_name": r["display_name"] or (f"Model #{sr}" if r["sr_no"] else r["name"]),
            "game_id": r["game_id"], "model_type": r["model_type"], "accuracy": r["accuracy"],
            "features": _parse_json(r["features"]), "actions": _parse_json(r["actions"]),
            "created_at": ts, "timestamp": ts,
        })
    if kind == "gameplay":
        return ("gameplay", {
            "sr_no": sr, "name": name,
            "display_name": r["display_name"] or (f"Gameplay #{sr}" if r["sr_no"] else r["name"]),
            "game_id": r["game_id"], "samples_count": r["samples_count"],
            "created_at": ts, "timestamp": ts,
        })
    return ("playback", {
        "sr_no": sr, "name": name,
        "display_name": r["display_name"] or (f"Autoplay #{sr}" if r["sr_no"] else r["name"]),
        "game_id": r["game_id"], "model_name": r["model_name"], "model_type": r["model_type"],
        "total_steps": r["total_steps"], "duration": r["duration"],
        "created_at": ts, "timestamp": ts,
    })


def execute_dashboard_query(db: Session, user_id: str, update_active: bool = False) -> Dict[str, list]:
    dialect = db.bind.dialect.name if db.bind else "sqlite"
    now = time.time()
    cte = "WITH upd AS (UPDATE users SET last_active = :now WHERE id = :user_id RETURNING id)\n" if (update_active and dialect == "postgresql") else ""

    sql = f"""{cte}SELECT 
    'model' AS kind, id, user_id, sr_no, display_name, game_id, name, filename,
    model_type, accuracy, CAST(features AS text) AS features, CAST(actions AS text) AS actions,
    CAST(NULL AS integer) AS samples_count, CAST(NULL AS integer) AS total_steps,
    CAST(NULL AS real) AS duration, CAST(NULL AS text) AS model_name, created_at
FROM models WHERE user_id = :user_id
UNION ALL
SELECT 
    'gameplay' AS kind, id, user_id, sr_no, display_name, game_id, name, filename,
    CAST(NULL AS text) AS model_type, CAST(NULL AS real) AS accuracy,
    CAST(NULL AS text) AS features, CAST(NULL AS text) AS actions,
    samples_count, CAST(NULL AS integer) AS total_steps,
    CAST(NULL AS real) AS duration, CAST(NULL AS text) AS model_name, created_at
FROM gameplays WHERE user_id = :user_id
UNION ALL
SELECT 
    'playback' AS kind, id, user_id, sr_no, display_name, game_id, name, filename,
    model_type, CAST(NULL AS real) AS accuracy,
    CAST(NULL AS text) AS features, CAST(NULL AS text) AS actions,
    CAST(NULL AS integer) AS samples_count, total_steps,
    duration, model_name, created_at
FROM playbacks WHERE user_id = :user_id
ORDER BY created_at DESC"""

    rows = db.execute(text(sql), {"user_id": user_id, "now": now}).mappings().all()
    if update_active and dialect == "postgresql":
        try: db.commit()
        except Exception: db.rollback()

    res: Dict[str, list] = {"models": [], "gameplays": [], "playbacks": []}
    for r in rows:
        bucket, item = _format_item(r)
        res[f"{bucket}s"].append(item)
    return res
