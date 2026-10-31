from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

from src.logger import Logger

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
    Logger.log(
        blanckline=True,
        indent=0,
        message=f"Starting Training..."
    )
    
    DATA_PATH = BASE_DIR / "gameplay" / f"{gameplay}.csv"
    MODEL_PATH = BASE_DIR / "models" / f"{gameplay}.pkl"
    
    if not DATA_PATH.exists():
        Logger.error(
            indent=1,
            message=f"Training data not found: {DATA_PATH}",
        )
        return

    df = pd.read_csv(DATA_PATH)
    missing = set(FEATURES + [TARGET]) - set(df.columns)
    if missing:
        Logger.error(
            indent=1,
            message=f"Dataset is missing columns: {sorted(missing)}",
        )
        return

    for column in NUMERIC_FEATURES:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    df[TARGET] = df[TARGET].astype(str).str.strip().str.lower()
    df = df.dropna(subset=NUMERIC_FEATURES + [TARGET]).copy()
    df = df[df[TARGET].isin(VALID_ACTIONS)].copy()

    for column in TYPE_FEATURES:
        df[column] = df[column].astype(str).str.strip()
        df.loc[~df[column].isin(OBSTACLE_TYPES), column] = "none"

    if df.empty:
        Logger.error(
            indent=1,
            message=f"No valid training samples found",
        )
        return

    present_actions = sorted(df[TARGET].unique())
    if len(present_actions) < 2:
        Logger.error(
            indent=1,
            message=f"Need at least two action classes to train; found {present_actions}"
        )
        return

    categories = {column: sorted(OBSTACLE_TYPES) for column in TYPE_FEATURES}
    X = pd.get_dummies(df[FEATURES], columns=TYPE_FEATURES, dtype=int)
    encoded_columns = NUMERIC_FEATURES + [
        f"{column}_{category}"
        for column in TYPE_FEATURES
        for category in categories[column]
    ]
    X = X.reindex(columns=encoded_columns, fill_value=0)
    y = df[TARGET]

    Logger.log(
        indent=1,
        message=f"Total Samples: {len(df)}"
    )

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

    Logger.log(
        indent=1, 
        message=f"Accuracy: {(accuracy_score(y_test, predictions)*100):.2f}%"
    )

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
    
    Logger.log(
        indent=1,
        message=f"Model Saved: {MODEL_PATH}"
    )
    Logger.log(
        indent=1,
        message=f"Training Complete"
    )

if __name__ == "__main__":
    train()
