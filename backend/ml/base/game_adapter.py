from abc import ABC, abstractmethod
from typing import Any, Dict, List, Tuple
import pandas as pd


class BaseGameAdapter(ABC):
    """
    Abstract contract for any game to integrate with the ML engine.
    Defines feature names, categorical columns, actions, and transformations.
    """

    @property
    @abstractmethod
    def game_id(self) -> str:
        """Unique identifier for the game."""
        pass

    @property
    @abstractmethod
    def numeric_features(self) -> List[str]:
        """List of continuous numeric feature column names."""
        pass

    @property
    @abstractmethod
    def categorical_features(self) -> List[str]:
        """List of categorical feature column names."""
        pass

    @property
    @abstractmethod
    def valid_actions(self) -> List[str]:
        """List of valid action labels."""
        pass

    @property
    @abstractmethod
    def target_column(self) -> str:
        """Target label column name in the dataset."""
        pass

    @abstractmethod
    def transform_dataset(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Applies game-specific feature engineering (e.g. time_to_impact)
        to raw dataset rows before encoding and training.
        """
        pass

    @abstractmethod
    def prepare_inference_frame(
        self,
        raw_state: Dict[str, Any],
        expected_features: List[str]
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """
        Transforms live game state into an aligned single-row DataFrame.
        Returns (frame, engineered_raw_features).
        """
        pass
