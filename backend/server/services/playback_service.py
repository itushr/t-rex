import json
from typing import Any, Dict, List
from server.config import PLAYBACK_DIR
from server.services.local_store import get_local_playback

_CACHE: Dict[str, Dict[str, Any]] = {}


def _load_raw(fn: str) -> Dict[str, Any]:
    if fn in ("local", "local.json") or fn.startswith("playback_local"):
        p = get_local_playback()
        if p: return p
    name = fn if fn.endswith(".json") else f"{fn}.json"
    if name in _CACHE: return _CACHE[name]
    file = PLAYBACK_DIR / name
    if not file.exists(): raise FileNotFoundError(f"Playback not found: {fn}")
    with file.open("r", encoding="utf-8") as f: data = json.load(f)
    if len(_CACHE) > 5: _CACHE.clear()
    _CACHE[name] = data
    return data


def list_playbacks() -> List[Dict[str, Any]]:
    results = []
    for f in sorted(PLAYBACK_DIR.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
        try:
            d = _load_raw(f.name)
            results.append({
                "filename": f.name, "model_name": d.get("model_name", "unknown"),
                "model_type": d.get("model_type", "unknown"), "n_estimators": d.get("n_estimators", 1),
                "recorded_at": d.get("recorded_at"), "duration": d.get("duration", 0),
                "total_steps": d.get("total_steps", len(d.get("records", []))),
                "size_bytes": f.stat().st_size,
            })
        except Exception: results.append({"filename": f.name, "error": "corrupt_payload"})
    return results


def _obs_str(obs: Dict[str, Any]) -> str:
    ot, ox = obs.get("type", "none"), obs.get("x", -1)
    return f"{ot} ({int(ox)}px)" if ot != "none" and ox >= 0 else ot


def get_playback_meta(fn: str) -> Dict[str, Any]:
    d = _load_raw(fn)
    mtype, n_est = d.get("model_type", "unknown"), d.get("n_estimators", 1)
    steps = []
    for r in d.get("records", []):
        it = {"step": r.get("step", len(steps) + 1), "obstacle1": _obs_str(r.get("obs1", {})), "speed": round(r.get("speed", 0.0), 1), "action": r.get("action", "none")}
        if mtype == "random_forest":
            v = r.get("votes", {})
            tot = n_est or max(sum(v.values()), 1)
            it["p_jump"], it["p_duck"], it["p_none"] = round(v.get("jump", 0)/tot, 2), round(v.get("duck", 0)/tot, 2), round(v.get("none", 0)/tot, 2)
        steps.append(it)
    return {"filename": fn if fn.endswith(".json") else f"{fn}.json", "model_name": d.get("model_name", "unknown"), "model_type": mtype, "n_estimators": n_est, "total_steps": len(steps), "steps": steps}


def get_playback_step(fn: str, step_no: int) -> Dict[str, Any]:
    d = _load_raw(fn)
    recs = d.get("records", [])
    if step_no < 1 or step_no > len(recs): raise IndexError("Step number out of range")
    r = recs[step_no - 1]
    mtype, obs_s, spd = d.get("model_type", "unknown"), _obs_str(r.get("obs1", {})), round(r.get("speed", 0.0), 1)
    if mtype == "decision_tree":
        tree = d.get("tree") or d.get("forest", {}).get("trees", [None])[0]
        return {"step": step_no, "model_type": mtype, "tree": tree, "path": r.get("path", []), "action": r.get("action", "none")}
    trees = [{"sr": t.get("tree_index", 0) + 1, "obstacle1": obs_s, "speed": spd, "action": t.get("predicted_action", "none")} for t in r.get("trees", [])]
    return {"step": step_no, "model_type": mtype, "n_estimators": len(trees), "obstacle1": obs_s, "speed": spd, "action": r.get("action", "none"), "trees": trees}


def get_playback_step_tree(fn: str, step_no: int, tree_no: int) -> Dict[str, Any]:
    d = _load_raw(fn)
    recs = d.get("records", [])
    if step_no < 1 or step_no > len(recs): raise IndexError("Step number out of range")
    r, t_idx, forest = recs[step_no - 1], tree_no - 1, d.get("forest", {}).get("trees", [])
    if t_idx < 0 or t_idx >= len(forest): raise IndexError("Tree number out of range")
    t_path = next((t for t in r.get("trees", []) if t.get("tree_index") == t_idx), {})
    return {"step": step_no, "tree_no": tree_no, "tree": forest[t_idx], "path": t_path.get("node_ids", []), "action": t_path.get("predicted_action", "none")}


def get_playback_payload(filename: str) -> Dict[str, Any]:
    return _load_raw(filename)
