from typing import Any, Dict, List
import pandas as pd
from sklearn.ensemble import RandomForestClassifier

from ml.base.model_adapter import BaseModelAdapter
from ml.models.tree_extractor import extract_tree_data
from ml.models.path_tracer import trace_single_tree_path


class RandomForestAdapter(BaseModelAdapter):
    """Adapter for ensemble RandomForestClassifier."""

    @property
    def model_type(self) -> str:
        return "random_forest"

    def create_instance(self, **kwargs: Any) -> RandomForestClassifier:
        return RandomForestClassifier(
            n_estimators=kwargs.get("n_estimators", 10),
            max_depth=kwargs.get("max_depth", 12),
            min_samples_leaf=kwargs.get("min_samples_leaf", 5),
            class_weight=kwargs.get("class_weight", "balanced"),
            random_state=kwargs.get("random_state", 42),
        )

    def fit(self, model: RandomForestClassifier, X: pd.DataFrame, y: pd.Series) -> RandomForestClassifier:
        return model.fit(X, y)

    def predict(self, model: RandomForestClassifier, X: pd.DataFrame) -> List[str]:
        preds = model.predict(X)
        return [str(p).lower() for p in preds]

    def extract_graph(
        self,
        model: RandomForestClassifier,
        feature_names: List[str],
        class_names: List[str]
    ) -> Dict[str, Any]:
        target_classes = list(model.classes_) if hasattr(model, "classes_") else class_names
        trees = [extract_tree_data(est, feature_names, target_classes) for est in model.estimators_]
        return {
            "model_type": self.model_type,
            "n_estimators": len(trees),
            "trees": trees,
        }

    def trace_path(
        self,
        model: RandomForestClassifier,
        frame: pd.DataFrame,
        feature_names: List[str],
        class_names: List[str]
    ) -> Dict[str, Any]:
        target_classes = list(model.classes_) if hasattr(model, "classes_") else class_names
        forest_paths = []
        votes: Dict[str, int] = {}
        for i, est in enumerate(model.estimators_):
            t_path = trace_single_tree_path(est, frame, feature_names, target_classes)
            pred = t_path["predicted_action"]
            forest_paths.append({
                "tree_index": i,
                "predicted_action": pred,
                "node_ids": t_path["node_ids"],
                "leaf_id": t_path["leaf_id"],
                "steps": t_path["steps"],
            })
            votes[pred] = votes.get(pred, 0) + 1

        ensemble_pred = str(model.predict(frame)[0]).lower()
        return {
            "model_type": self.model_type,
            "predicted_action": ensemble_pred,
            "votes": votes,
            "trees": forest_paths,
            "node_ids": forest_paths[0]["node_ids"],
            "leaf_id": forest_paths[0]["leaf_id"],
            "steps": forest_paths[0]["steps"],
        }
