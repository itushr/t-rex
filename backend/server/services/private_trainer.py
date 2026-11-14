import json
from datetime import datetime
from typing import Any, Dict, List, Optional
import joblib
import pandas as pd
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.metrics import accuracy_score
from ml.games.filtered_adapter import FilteredGameAdapter
from ml.registry import get_game_adapter, get_model_adapter
from ml.trainer import prepare_training_data
from server.services.local_trainer import _ensure_diversity
from server.services.user_storage import safe_user_file, sanitize_name


def train_user_model(
    user_id: str,
    samples: List[Dict[str, Any]],
    model_name: Optional[str] = None,
    model_type: str = "decision_tree",
    selected_features: Optional[List[str]] = None,
) -> Dict[str, Any]:
    if not samples:
        raise ValueError("Cannot train with 0 samples")
    raw_name = model_name or f"model_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{model_type}"
    cname = sanitize_name(raw_name)

    df = _ensure_diversity(pd.DataFrame(samples))
    ga = FilteredGameAdapter(get_game_adapter("dino"), selected_features)
    ma = get_model_adapter(model_type)

    X, y, categories, features = prepare_training_data(df, ga)
    model = ma.create_instance()
    ma.fit(model, X, y)
    acc = float(accuracy_score(y, ma.predict(model, X)))

    initial_types = [("float_input", FloatTensorType([None, len(features)]))]
    onx = convert_sklearn(model, initial_types=initial_types, options={id(model): {"zipmap": False}})
    actions = sorted(y.unique().tolist())
    graph = ma.extract_graph(model, features, actions)

    bundle = {
        "model": model, "model_type": model_type, "game_id": "dino",
        "features": features, "numeric_features": ga.numeric_features,
        "categorical_features": ga.categorical_features, "categories": categories, "actions": actions,
    }
    onnx_meta = {
        "name": cname, "model_type": model_type, "game_id": "dino",
        "features": features, "numeric_features": ga.numeric_features,
        "type_features": ga.categorical_features, "categories": categories, "actions": actions,
    }

    joblib.dump(bundle, safe_user_file(user_id, "models", f"{cname}.pkl"))
    with open(safe_user_file(user_id, "onnxs", f"{cname}.onnx"), "wb") as f:
        f.write(onx.SerializeToString())
    with open(safe_user_file(user_id, "onnxs", f"{cname}_meta.json"), "w") as f:
        json.dump(onnx_meta, f, indent=2)

    return {
        "ok": True, "model_name": cname, "accuracy": round(acc * 100, 2),
        "samples": len(df), "features": features, "actions": actions, "model_type": model_type,
    }
