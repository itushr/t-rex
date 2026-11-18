from fastapi import APIRouter, HTTPException
from ml.registry import get_game_adapter, list_games, list_models

router = APIRouter(prefix="/api/games", tags=["games"])


@router.get("")
def get_games():
    games = []
    seen = set()
    for gid in list_games():
        ga = get_game_adapter(gid)
        if ga.game_id in seen:
            continue
        seen.add(ga.game_id)
        games.append({
            "id": gid,
            "name": getattr(ga, "name", "Chrome Dino T-Rex" if gid in ("dino", "trex") else gid.capitalize()),
            "supported_models": list_models(),
            "numeric_features": ga.numeric_features,
            "categorical_features": ga.categorical_features,
            "valid_actions": ga.valid_actions,
        })
    return {"games": games}


@router.get("/{game_id}")
def get_game_metadata(game_id: str):
    try:
        ga = get_game_adapter(game_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    return {
        "id": game_id,
        "name": getattr(ga, "name", "Chrome Dino T-Rex" if game_id in ("dino", "trex") else game_id.capitalize()),
        "supported_models": list_models(),
        "numeric_features": ga.numeric_features,
        "categorical_features": ga.categorical_features,
        "valid_actions": ga.valid_actions,
    }
