from typing import Dict
from driver.ml.base.game_adapter import BaseGameAdapter
from driver.ml.base.model_adapter import BaseModelAdapter
from driver.ml.games.dino_adapter import DinoGameAdapter
from driver.ml.models.decision_tree_adapter import DecisionTreeAdapter
from driver.ml.models.random_forest_adapter import RandomForestAdapter

_GAMES: Dict[str, BaseGameAdapter] = {}
_MODELS: Dict[str, BaseModelAdapter] = {}


def register_game(adapter: BaseGameAdapter) -> None:
    """Registers a game adapter in the global registry."""
    _GAMES[adapter.game_id] = adapter


def register_model(adapter: BaseModelAdapter) -> None:
    """Registers a model adapter in the global registry."""
    _MODELS[adapter.model_type] = adapter


def get_game_adapter(game_id: str = "dino") -> BaseGameAdapter:
    """Retrieves a registered game adapter by ID."""
    if game_id not in _GAMES:
        raise ValueError(f"Unknown game ID: {game_id}. Available: {list(_GAMES.keys())}")
    return _GAMES[game_id]


def get_model_adapter(model_type: str = "decision_tree") -> BaseModelAdapter:
    """Retrieves a registered model adapter by type."""
    if model_type not in _MODELS:
        raise ValueError(f"Unknown model type: {model_type}. Available: {list(_MODELS.keys())}")
    return _MODELS[model_type]


# Register standard implementations
register_game(DinoGameAdapter())
register_model(DecisionTreeAdapter())
register_model(RandomForestAdapter())
