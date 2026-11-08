"""Machine learning engine: game adapters, model adapters, and trainer."""

from driver.ml.registry import get_game_adapter, get_model_adapter, register_game, register_model
from driver.ml.trainer import train_model

__all__ = [
    "get_game_adapter",
    "get_model_adapter",
    "register_game",
    "register_model",
    "train_model",
]
