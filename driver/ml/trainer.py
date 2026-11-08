from pathlib import Path
from typing import Any, Dict, Tuple
import pandas as pd
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

from driver.ml.registry import get_game_adapter, get_model_adapter
from driver.ml.serialization import save_trained_model


def prepare_training_data(
    df: pd.DataFrame, game_adapter: Any
) -> Tuple[pd.DataFrame, pd.Series, Dict[str, list], list]:
    """Cleans, transforms, and one-hot encodes dataset for training."""
    if df is None or len(df) == 0:
        raise ValueError("Dataset is empty. Cannot train on 0 samples.")

    clean = game_adapter.transform_dataset(df)
    target = game_adapter.target_column
    if target not in clean.columns:
        raise ValueError(f"Target column '{target}' not found in dataset.")

    for col in game_adapter.numeric_features:
        if col not in clean.columns:
            clean[col] = -1.0
        clean[col] = pd.to_numeric(clean[col], errors="coerce").fillna(0.0)

    clean[target] = clean[target].astype(str).str.strip().str.lower()
    clean = clean[clean[target].isin(game_adapter.valid_actions)].copy()
    if len(clean) < 10:
        raise ValueError(f"Insufficient samples ({len(clean)}). Need at least 10 valid samples.")

    categories = {}
    for col in game_adapter.categorical_features:
        if col not in clean.columns:
            clean[col] = "none"
        clean[col] = clean[col].astype(str).str.strip()
        categories[col] = sorted(clean[col].unique().tolist())

    cat_cols = game_adapter.categorical_features
    X = pd.get_dummies(clean[game_adapter.numeric_features + cat_cols], columns=cat_cols, dtype=int)
    encoded = game_adapter.numeric_features + [f"{c}_{v}" for c in cat_cols for v in categories[c]]
    return X.reindex(columns=encoded, fill_value=0), clean[target], categories, encoded


def train_model(
    data_path: Path, output_path: Path, game_id: str = "dino", model_type: str = "decision_tree"
) -> Dict[str, Any]:
    """Trains a model on dataset, evaluates performance, and persists artifact."""
    game_adapter = get_game_adapter(game_id)
    model_adapter = get_model_adapter(model_type)

    df = pd.read_csv(data_path)
    X, y, categories, encoded_cols = prepare_training_data(df, game_adapter)
    if y.nunique() < 2:
        raise ValueError(f"Dataset has only 1 action ({list(y.unique())}). At least 2 actions needed.")

    can_stratify = y.value_counts().min() >= 2
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y if can_stratify else None
    )

    eval_model = model_adapter.create_instance()
    model_adapter.fit(eval_model, X_train, y_train)
    accuracy = float(accuracy_score(y_test, model_adapter.predict(eval_model, X_test)))

    final_model = model_adapter.create_instance()
    model_adapter.fit(final_model, X, y)

    save_trained_model(
        model=final_model,
        path=output_path,
        game_id=game_id,
        model_type=model_type,
        features=encoded_cols,
        numeric_features=game_adapter.numeric_features,
        categorical_features=game_adapter.categorical_features,
        categories=categories,
        actions=sorted(y.unique().tolist()),
    )
    return {
        "accuracy": round(accuracy * 100, 2),
        "samples": len(X),
        "model_path": str(output_path),
        "features": encoded_cols,
    }
