from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from ml.models.tree_extractor import resolve_class_names


def trace_single_tree_path(
    model: Any,
    frame: pd.DataFrame,
    feature_names: List[str],
    class_names: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Traces decision path through a DecisionTreeClassifier for a single frame."""
    model_classes = resolve_class_names(model, class_names)
    all_actions = ["jump", "duck", "none"]
    tree = model.tree_

    eval_frame = frame if hasattr(model, "feature_names_in_") else (frame.values if hasattr(frame, "values") else frame)
    indicator = model.decision_path(eval_frame)
    node_indices = indicator.indices.tolist()

    steps = []
    row_dict = frame.iloc[0].to_dict()

    for idx, node_id in enumerate(node_indices):
        left = int(tree.children_left[node_id])
        right = int(tree.children_right[node_id])
        is_leaf = left == -1 and right == -1

        raw_values = tree.value[node_id][0]
        total_val = float(np.sum(raw_values)) if np.sum(raw_values) > 0 else 1.0
        distribution = {act: 0.0 for act in all_actions}
        for i in range(min(len(raw_values), len(model_classes))):
            distribution[model_classes[i]] = round(float(raw_values[i]) / total_val * 100, 1)

        pred_idx = int(np.argmax(raw_values))
        pred_class = model_classes[pred_idx] if pred_idx < len(model_classes) else "none"

        step: Dict[str, Any] = {
            "node_id": node_id,
            "is_leaf": is_leaf,
            "samples": int(tree.n_node_samples[node_id]),
            "prediction": pred_class,
            "distribution": distribution,
        }

        if not is_leaf:
            feat_idx = int(tree.feature[node_id])
            feat_name = feature_names[feat_idx]
            threshold = float(tree.threshold[node_id])
            actual_val = float(row_dict.get(feat_name, 0.0))
            is_satisfied = actual_val <= threshold
            step.update({
                "feature": feat_name,
                "threshold": round(threshold, 2),
                "actual_value": round(actual_val, 2),
                "condition": f"{feat_name} <= {threshold:.2f}",
                "branch_taken": "<=" if is_satisfied else ">",
                "is_satisfied": bool(is_satisfied),
            })
        else:
            step.update({"condition": f"Action: {pred_class.upper()}"})

        steps.append(step)

    return {
        "node_ids": node_indices,
        "leaf_id": node_indices[-1],
        "predicted_action": steps[-1]["prediction"],
        "steps": steps,
    }
