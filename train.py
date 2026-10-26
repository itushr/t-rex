from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "dino_training_data.csv"
MODEL_PATH = BASE_DIR / "dino_model.pkl"

NUMERIC_FEATURES = [
    "obstacle1_x", "obstacle1_y", "obstacle1_size",
    "obstacle2_x", "obstacle2_y", "obstacle2_size", "speed",
]
TYPE_FEATURES = ["obstacle1_type", "obstacle2_type"]
FEATURES = NUMERIC_FEATURES + TYPE_FEATURES
TARGET = "action"
VALID_ACTIONS = {"none", "jump"}
OBSTACLE_TYPES = {"none", "cactusSmall", "cactusLarge", "pterodactyl", "collectable"}


def create_model():
    return DecisionTreeClassifier(
        max_depth=8,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=42,
    )


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Training data not found: {DATA_PATH}. Run collect_training_data.py first."
        )

    df = pd.read_csv(DATA_PATH)
    missing = set(FEATURES + [TARGET]) - set(df.columns)
    if missing:
        raise ValueError(f"Dataset is missing columns: {sorted(missing)}")

    for column in NUMERIC_FEATURES:
        df[column] = pd.to_numeric(df[column], errors="coerce")
    df = df.dropna(subset=NUMERIC_FEATURES).copy()

    for column in TYPE_FEATURES:
        df[column] = df[column].astype(str).str.strip()
        df.loc[~df[column].isin(OBSTACLE_TYPES), column] = "none"

    df[TARGET] = df[TARGET].astype(str).str.strip().str.lower()
    df = df[df[TARGET].isin(VALID_ACTIONS)].copy()
    if df.empty:
        raise ValueError("No valid training samples found.")

    categories = {
        "obstacle1_type": sorted(OBSTACLE_TYPES),
        "obstacle2_type": sorted(OBSTACLE_TYPES),
    }
    X = pd.get_dummies(df[FEATURES], columns=TYPE_FEATURES, dtype=int)
    encoded_columns = NUMERIC_FEATURES + [
        f"{column}_{category}"
        for column in TYPE_FEATURES
        for category in categories[column]
    ]
    X = X.reindex(columns=encoded_columns, fill_value=0)
    y = df[TARGET]

    print(f"DINO >> total samples: {len(df)}")
    print("\nDINO >> action distribution:")
    print(y.value_counts().to_string())
    if y.nunique() < 2:
        raise ValueError("Dataset needs examples of both 'none' and 'jump'.")

    if len(df) >= 30 and y.value_counts().min() >= 2:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        evaluation_model = create_model()
        evaluation_model.fit(X_train, y_train)
        predictions = evaluation_model.predict(X_test)
        print(f"\nDINO >> held-out accuracy: {accuracy_score(y_test, predictions):.2%}")
        print("\nDINO >> classification report:")
        print(classification_report(y_test, predictions, zero_division=0))
    else:
        print("DINO >> warning: insufficient samples for reliable held-out evaluation.")

    model = create_model()
    model.fit(X, y)
    joblib.dump(
        {
            "model": model,
            "features": list(X.columns),
            "numeric_features": NUMERIC_FEATURES,
            "type_features": TYPE_FEATURES,
            "categories": categories,
        },
        MODEL_PATH,
    )
    print(f"\nDINO >> model saved: {MODEL_PATH}")
    print(f"DINO >> classes: {list(model.classes_)}")
    print(f"DINO >> input features: {X.shape[1]}")
    print("DINO >> training complete")


if __name__ == "__main__":
    main()
