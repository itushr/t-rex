from abc import ABC, abstractmethod
from typing import Any, Dict, List
import pandas as pd


class BaseModelAdapter(ABC):
    """
    Abstract contract for machine learning model architectures.
    Provides uniform training, prediction, tree extraction, and path tracing.
    """

    @property
    @abstractmethod
    def model_type(self) -> str:
        """Unique model identifier (e.g. 'decision_tree', 'random_forest')."""
        pass

    @abstractmethod
    def create_instance(self, **kwargs: Any) -> Any:
        """Instantiates a new untrained model instance."""
        pass

    @abstractmethod
    def fit(self, model: Any, X: pd.DataFrame, y: pd.Series) -> Any:
        """Fits the model on training data."""
        pass

    @abstractmethod
    def predict(self, model: Any, X: pd.DataFrame) -> List[str]:
        """Runs predictions on input features."""
        pass

    @abstractmethod
    def extract_graph(
        self,
        model: Any,
        feature_names: List[str],
        class_names: List[str]
    ) -> Dict[str, Any]:
        """Extracts tree/ensemble hierarchy for visualizer consumption."""
        pass

    @abstractmethod
    def trace_path(
        self,
        model: Any,
        frame: pd.DataFrame,
        feature_names: List[str],
        class_names: List[str]
    ) -> Dict[str, Any]:
        """Computes traversal paths and rules taken for a single frame."""
        pass
