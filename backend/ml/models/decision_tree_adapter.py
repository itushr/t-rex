from typing import Any, Dict, List
import pandas as pd
from sklearn.tree import DecisionTreeClassifier

from ml.base.model_adapter import BaseModelAdapter
from ml.models.tree_extractor import extract_tree_data
from ml.models.path_tracer import trace_single_tree_path


class DecisionTreeAdapter(BaseModelAdapter):
    """Adapter for standard scikit-learn DecisionTreeClassifier."""

    @property
    def model_type(self) -> str:
        return "decision_tree"

    def create_instance(self, **kwargs: Any) -> DecisionTreeClassifier:
        return DecisionTreeClassifier(
            max_depth=kwargs.get("max_depth", 12),
            min_samples_leaf=kwargs.get("min_samples_leaf", 5),
            class_weight=kwargs.get("class_weight", "balanced"),
            random_state=kwargs.get("random_state", 42),
        )

    def fit(self, model: DecisionTreeClassifier, X: pd.DataFrame, y: pd.Series) -> DecisionTreeClassifier:
        return model.fit(X, y)

    def predict(self, model: DecisionTreeClassifier, X: pd.DataFrame) -> List[str]:
        preds = model.predict(X)
        return [str(p).lower() for p in preds]

    def extract_graph(
        self,
        model: DecisionTreeClassifier,
        feature_names: List[str],
        class_names: List[str]
    ) -> Dict[str, Any]:
        tree = extract_tree_data(model, feature_names, class_names)
        return {
            "model_type": self.model_type,
            "n_estimators": 1,
            "trees": [tree],
        }

    def trace_path(
        self,
        model: DecisionTreeClassifier,
        frame: pd.DataFrame,
        feature_names: List[str],
        class_names: List[str]
    ) -> Dict[str, Any]:
        path = trace_single_tree_path(model, frame, feature_names, class_names)
        return {
            "model_type": self.model_type,
            "predicted_action": path["predicted_action"],
            "votes": {path["predicted_action"]: 1},
            "trees": [{
                "tree_index": 0,
                "predicted_action": path["predicted_action"],
                "node_ids": path["node_ids"],
                "leaf_id": path["leaf_id"],
                "steps": path["steps"],
            }],
            "node_ids": path["node_ids"],
            "leaf_id": path["leaf_id"],
            "steps": path["steps"],
        }
