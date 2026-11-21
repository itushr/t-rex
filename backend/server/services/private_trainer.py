import io
import json
import time
import uuid
from typing import Any, Dict, List, Optional
import joblib
import pandas as pd
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from sklearn.metrics import accuracy_score
from sqlalchemy.orm import Session
from ml.games.filtered_adapter import FilteredGameAdapter
from ml.registry import get_game_adapter, get_model_adapter
from ml.trainer import prepare_training_data
from server.database.crud import create_model
from server.services.local_trainer import _ensure_diversity
from server.services.storage import get_storage, make_r2_key
from server.services.user_storage import sanitize_name


def train_user_model(
    db: Session,
    user_id: str,
    samples: List[Dict[str, Any]],
    model_name: Optional[str] = None,
    model_type: str = "decision_tree",
    selected_features: Optional[List[str]] = None,
    game_id: str = "dino",
) -> Dict[str, Any]:
    if not samples:
        raise ValueError("Cannot train with 0 samples")
    raw_name = model_name or f"model_{time.strftime('%Y%m%d_%H%M%S')}_{model_type}"
    cname = sanitize_name(raw_name)
    gid = game_id or "dino"

    df = _ensure_diversity(pd.DataFrame(samples))
    ga = FilteredGameAdapter(get_game_adapter(gid), selected_features)
    ma = get_model_adapter(model_type)

    X, y, categories, features = prepare_training_data(df, ga)
    model = ma.create_instance()
    ma.fit(model, X, y)
    acc = float(accuracy_score(y, ma.predict(model, X)))

    initial_types = [("float_input", FloatTensorType([None, len(features)]))]
    onx = convert_sklearn(model, initial_types=initial_types, options={id(model): {"zipmap": False}})
    actions = sorted(y.unique().tolist())
    now_ts = time.time()

    bundle = {
        "model": model, "model_type": model_type, "game_id": gid,
        "features": features, "numeric_features": ga.numeric_features,
        "categorical_features": ga.categorical_features, "categories": categories, "actions": actions,
        "created_at": now_ts, "timestamp": now_ts,
    }
    onnx_meta = {
        "name": cname, "model_type": model_type, "game_id": gid,
        "features": features, "numeric_features": ga.numeric_features,
        "type_features": ga.categorical_features, "categories": categories, "actions": actions,
        "created_at": now_ts, "timestamp": now_ts,
    }

    buf = io.BytesIO()
    joblib.dump(bundle, buf)
    pkl_bytes = buf.getvalue()
    onnx_bytes = onx.SerializeToString()
    meta_bytes = json.dumps(onnx_meta, indent=2).encode("utf-8")

    storage = get_storage()
    pkl_key = make_r2_key(user_id, gid, "models", f"{cname}.pkl")
    onnx_key = make_r2_key(user_id, gid, "models", f"{cname}.onnx")
    meta_key = make_r2_key(user_id, gid, "models", f"{cname}_meta.json")

    storage.put_bytes(pkl_key, pkl_bytes, "application/octet-stream")
    storage.put_bytes(onnx_key, onnx_bytes, "application/octet-stream")
    storage.put_bytes(meta_key, meta_bytes, "application/json")

    create_model(
        db,
        id=f"mod_{uuid.uuid4().hex[:12]}",
        user_id=user_id,
        game_id=gid,
        name=cname,
        filename=f"{cname}.pkl",
        model_type=model_type,
        r2_bundle_key=pkl_key,
        r2_onnx_key=onnx_key,
        r2_meta_key=meta_key,
        accuracy=round(acc * 100, 2),
        features=features,
        actions=actions,
        created_at=now_ts,
    )

    return {
        "ok": True, "model_name": cname, "accuracy": round(acc * 100, 2),
        "samples": len(df), "features": features, "actions": actions, "model_type": model_type,
    }
