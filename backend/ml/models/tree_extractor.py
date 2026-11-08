from typing import Any, Dict, List, Optional
import numpy as np


def resolve_class_names(model: Any, class_names: Optional[List[str]] = None) -> List[str]:
    """Safely extracts string class names from a scikit-learn estimator."""
    if hasattr(model, "classes_"):
        raw = model.classes_
        if len(raw) > 0 and isinstance(raw[0], (int, float, np.integer, np.floating)) and class_names:
            return [str(class_names[int(c)]) if int(c) < len(class_names) else str(c) for c in raw]
        return [str(c) for c in raw]
    if class_names is not None:
        return [str(c) for c in class_names]
    return ["none", "jump", "duck"]


def extract_tree_data(model: Any, feature_names: List[str], class_names: Optional[List[str]] = None) -> Dict[str, Any]:
    """Extracts a DecisionTreeClassifier tree structure into a dictionary."""
    tree = model.tree_
    model_classes = resolve_class_names(model, class_names)
    all_actions = ["jump", "duck", "none"]

    def build_node(node_id: int, depth: int = 0) -> Dict[str, Any]:
        left = int(tree.children_left[node_id])
        right = int(tree.children_right[node_id])
        is_leaf = left == -1 and right == -1

        raw_values = tree.value[node_id][0]
        total_samples = int(tree.n_node_samples[node_id])
        total_val = float(np.sum(raw_values)) if np.sum(raw_values) > 0 else 1.0

        distribution = {act: 0.0 for act in all_actions}
        counts = {act: 0 for act in all_actions}
        for i in range(min(len(raw_values), len(model_classes))):
            cls_name = model_classes[i]
            distribution[cls_name] = round(float(raw_values[i]) / total_val * 100, 1)
            counts[cls_name] = int(raw_values[i])

        pred_idx = int(np.argmax(raw_values))
        pred_class = model_classes[pred_idx] if pred_idx < len(model_classes) else "none"

        node: Dict[str, Any] = {
            "id": int(node_id),
            "depth": int(depth),
            "is_leaf": bool(is_leaf),
            "samples": total_samples,
            "impurity": round(float(tree.impurity[node_id]), 3),
            "prediction": pred_class,
            "distribution": distribution,
            "counts": counts,
        }

        if is_leaf:
            node["condition"] = f"Action: {pred_class.upper()}"
        else:
            feat_idx = int(tree.feature[node_id])
            feat = feature_names[feat_idx] if feat_idx < len(feature_names) else f"f_{feat_idx}"
            thresh = float(tree.threshold[node_id])
            node["feature"] = feat
            node["threshold"] = round(thresh, 2)
            node["condition"] = f"{feat} <= {thresh:.2f}"
            node["left"] = build_node(left, depth + 1)
            node["right"] = build_node(right, depth + 1)

        return node

    return build_node(0, 0)
