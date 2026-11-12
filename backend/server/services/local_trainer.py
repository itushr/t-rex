from typing import Any, Dict, List
import pandas as pd
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.metrics import accuracy_score
from ml.registry import get_game_adapter, get_model_adapter
from ml.trainer import prepare_training_data
from server.services.local_store import set_local_model


def _ensure_diversity(df: pd.DataFrame) -> pd.DataFrame:
    clean = df.copy()
    if "action" not in clean.columns:
        clean["action"] = "none"
    actions = clean["action"].unique().tolist()
    if "jump" not in actions:
        jump_row = clean.iloc[0].to_dict()
        jump_row["action"] = "jump"
        jump_row["obstacle1_x"] = 80.0
        jump_row["time_to_impact"] = 12.0
        clean = pd.concat([clean, pd.DataFrame([jump_row] * 5)], ignore_index=True)
    if "none" not in actions:
        none_row = clean.iloc[0].to_dict()
        none_row["action"] = "none"
        none_row["obstacle1_x"] = -1.0
        none_row["time_to_impact"] = -1.0
        clean = pd.concat([clean, pd.DataFrame([none_row] * 5)], ignore_index=True)
    while len(clean) < 15:
        clean = pd.concat([clean, clean], ignore_index=True)
    return clean


def train_local_model(samples: List[Dict[str, Any]], model_type: str = "decision_tree") -> Dict[str, Any]:
    if not samples:
        raise ValueError("Cannot train with 0 samples")
    df = _ensure_diversity(pd.DataFrame(samples))
    ga = get_game_adapter("dino")
    ma = get_model_adapter(model_type)

    X, y, categories, features = prepare_training_data(df, ga)
    model = ma.create_instance()
    ma.fit(model, X, y)
    preds = ma.predict(model, X)
    acc = float(accuracy_score(y, preds))

    initial_types = [("float_input", FloatTensorType([None, len(features)]))]
    onx = convert_sklearn(model, initial_types=initial_types, options={id(model): {"zipmap": False}})
    onnx_bytes = onx.SerializeToString()

    actions = sorted(y.unique().tolist())
    graph = ma.extract_graph(model, features, actions)

    bundle = {
        "model": model,
        "model_type": model_type,
        "game_id": "dino",
        "features": features,
        "numeric_features": ga.numeric_features,
        "categorical_features": ga.categorical_features,
        "categories": categories,
        "actions": actions,
    }
    graph_response = {
        "model_name": "local",
        "model_type": model_type,
        "game_id": "dino",
        "features": features,
        "actions": actions,
        "graph": graph,
    }
    onnx_meta = {
        "name": "local",
        "model_type": model_type,
        "game_id": "dino",
        "features": features,
        "numeric_features": ga.numeric_features,
        "type_features": ga.categorical_features,
        "categories": categories,
        "actions": actions,
    }
    set_local_model(bundle, graph_response, onnx_bytes, onnx_meta)
    return {
        "ok": True,
        "model_name": "local",
        "accuracy": round(acc * 100, 2),
        "samples": len(df),
        "features": features,
        "actions": actions,
        "onnx_meta": onnx_meta,
    }
