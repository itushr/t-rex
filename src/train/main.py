from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

BASE_DIR = Path(__file__).resolve().parent.parent.parent

NUMERIC_FEATURES = [
    "obstacle1_x",
    "obstacle1_y",
    "obstacle1_size",
    "obstacle2_x",
    "obstacle2_y",
    "obstacle2_size",
    "speed",
    "jumping",
    "ducking",
]
TYPE_FEATURES = ["obstacle1_type", "obstacle2_type"]
FEATURES = NUMERIC_FEATURES + TYPE_FEATURES
TARGET = "action"
VALID_ACTIONS = {"none", "jump", "duck"}
OBSTACLE_TYPES = {"none", "cactusSmall", "cactusLarge", "pterodactyl", "collectable"}

def create_model():
    return DecisionTreeClassifier(
        max_depth=12,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=42,
    )


def train(gameplay):
    DATA_PATH = BASE_DIR / "gameplay" / f"{gameplay}.csv"
    MODEL_PATH = BASE_DIR / "models" / f"{gameplay}.pkl"
    
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Training data not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    missing = set(FEATURES + [TARGET]) - set(df.columns)
    if missing:
        raise ValueError(
            f"Dataset is missing columns: {sorted(missing)}. "
        )

    for column in NUMERIC_FEATURES:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    df[TARGET] = df[TARGET].astype(str).str.strip().str.lower()
    df = df.dropna(subset=NUMERIC_FEATURES + [TARGET]).copy()
    df = df[df[TARGET].isin(VALID_ACTIONS)].copy()

    for column in TYPE_FEATURES:
        df[column] = df[column].astype(str).str.strip()
        df.loc[~df[column].isin(OBSTACLE_TYPES), column] = "none"

    if df.empty:
        raise ValueError("No valid training samples found.")

    present_actions = sorted(df[TARGET].unique())
    if len(present_actions) < 2:
        raise ValueError(
            f"Need at least two action classes to train; found {present_actions}"
        )

    categories = {column: sorted(OBSTACLE_TYPES) for column in TYPE_FEATURES}
    X = pd.get_dummies(df[FEATURES], columns=TYPE_FEATURES, dtype=int)
    encoded_columns = NUMERIC_FEATURES + [
        f"{column}_{category}"
        for column in TYPE_FEATURES
        for category in categories[column]
    ]
    X = X.reindex(columns=encoded_columns, fill_value=0)
    y = df[TARGET]

    print(f">>> [TRAIN] total samples: {len(df)}")
    print("\n>>> [TRAIN] action distribution:")
    print("   ", y.value_counts().to_string())

    # Random split keeps every action eligible for the evaluation split.
    # Frames from one gameplay are correlated, so this score is only a rough check.
    can_stratify = y.value_counts().min() >= 2
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y if can_stratify else None,
    )

    evaluation_model = create_model()
    evaluation_model.fit(X_train, y_train)
    predictions = evaluation_model.predict(X_test)

    print("\n>>> [TRAIN] held-out evaluation:")
    print(f"    Accuracy: {accuracy_score(y_test, predictions):.4f}")
    print("\n    Classification report:")
    print(classification_report(y_test, predictions, zero_division=0))
    labels = sorted(set(y_test) | set(predictions))
    print("    Confusion matrix (actual rows, predicted columns):")
    print(f"    Labels: {labels}")
    print("   ", confusion_matrix(y_test, predictions, labels=labels))

    model = create_model()
    model.fit(X, y)
    joblib.dump(
        {
            "model": model,
            "features": list(X.columns),
            "numeric_features": NUMERIC_FEATURES,
            "type_features": TYPE_FEATURES,
            "categories": categories,
            "target": TARGET,
            "actions": sorted(VALID_ACTIONS),
        },
        MODEL_PATH,
    )
    print(f"\n>>> [TRAIN] model saved: {MODEL_PATH}")
    print(f">>> [TRAIN] input features: {X.shape[1]}")
    print(">>> [TRAIN] training complete")


if __name__ == "__main__":
    train()
