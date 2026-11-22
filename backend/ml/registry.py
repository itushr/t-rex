from typing import Dict, List
from ml.base.game_adapter import BaseGameAdapter
from ml.base.model_adapter import BaseModelAdapter
from ml.games.dino_adapter import DinoGameAdapter
from ml.games.flappy_bird_adapter import FlappyBirdGameAdapter
from ml.models.decision_tree_adapter import DecisionTreeAdapter
from ml.models.random_forest_adapter import RandomForestAdapter

_GAMES: Dict[str, BaseGameAdapter] = {}
_MODELS: Dict[str, BaseModelAdapter] = {}


def register_game(adapter: BaseGameAdapter) -> None:
    _GAMES[adapter.game_id] = adapter


def register_model(adapter: BaseModelAdapter) -> None:
    _MODELS[adapter.model_type] = adapter


def get_game_adapter(game_id: str = "dino") -> BaseGameAdapter:
    if not game_id:
        game_id = "dino"
    norm = game_id.lower().replace("_", "-")
    if norm in ("t-rex", "trex", "dino"):
        return _GAMES.get("dino") or _GAMES.get("trex") or _GAMES["t-rex"]
    if norm in ("flappy-bird", "flappybird", "flappy"):
        return _GAMES.get("flappy-bird") or _GAMES.get("flappybird")
    if norm in _GAMES:
        return _GAMES[norm]
    if game_id in _GAMES:
        return _GAMES[game_id]
    raise ValueError(f"Unknown game ID: {game_id}. Available: {list(_GAMES.keys())}")


def get_model_adapter(model_type: str = "decision_tree") -> BaseModelAdapter:
    if model_type not in _MODELS:
        raise ValueError(f"Unknown model type: {model_type}. Available: {list(_MODELS.keys())}")
    return _MODELS[model_type]


def list_games() -> List[str]:
    return list(_GAMES.keys())


def list_models() -> List[str]:
    return list(_MODELS.keys())


dino = DinoGameAdapter()
register_game(dino)
_GAMES["trex"] = dino
_GAMES["t-rex"] = dino
flappy = FlappyBirdGameAdapter()
register_game(flappy)
_GAMES["flappybird"] = flappy
_GAMES["flappy-bird"] = flappy
register_model(DecisionTreeAdapter())
register_model(RandomForestAdapter())
