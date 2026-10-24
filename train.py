import joblib
import pandas as pd

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, accuracy_score


BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = BASE_DIR / "dino_training_data.csv"
MODEL_PATH = BASE_DIR / "dino_model.pkl"

FEATURES = [
    "obstacle1_x",
    "obstacle2_x",
    "speed",
]

TARGET = "action"

VALID_ACTIONS = {"none", "jump", "duck"}


def create_model():
    return DecisionTreeClassifier(
        max_depth=6,
        min_samples_leaf=5,
        class_weight="balanced",
        random_state=42,
    )


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Training data not found: {DATA_PATH}\n"
            "Run collect_training_data.py first."
        )

    df = pd.read_csv(DATA_PATH)

    required = FEATURES + [TARGET]
    missing = set(required) - set(df.columns)

    if missing:
        raise ValueError(
            f"Dataset is missing columns: {sorted(missing)}"
        )

    df = df.dropna(subset=required).copy()

    for column in FEATURES:
        df[column] = pd.to_numeric(
            df[column],
            errors="coerce",
        )

    df = df.dropna(subset=FEATURES)

    df[TARGET] = df[TARGET].astype(str).str.strip().str.lower()
    df = df[df[TARGET].isin(VALID_ACTIONS)]

    if df.empty:
        raise ValueError("No valid training samples found.")

    X = df[FEATURES]
    y = df[TARGET]

    print(f"DINO >> total samples: {len(df)}")
    print("\nDINO >> action distribution:")
    print(y.value_counts().to_string())

    if y.nunique() < 2:
        raise ValueError(
            "The dataset contains only one action class. "
            "Collect samples for multiple actions."
        )

    # Evaluate on held-out samples if each class has enough examples.
    counts = y.value_counts()

    if len(df) >= 30 and counts.min() >= 2:
        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42,
            stratify=y,
        )

        evaluation_model = create_model()
        evaluation_model.fit(X_train, y_train)

        predictions = evaluation_model.predict(X_test)

        print("\nDINO >> held-out accuracy:")
        print(f"{accuracy_score(y_test, predictions):.2%}")

        print("\nDINO >> classification report:")
        print(
            classification_report(
                y_test,
                predictions,
                zero_division=0,
            )
        )
    else:
        print(
            "\nDINO >> warning: not enough samples per class "
            "for a reliable held-out evaluation."
        )

    # Train the final model on all available samples.
    model = create_model()
    model.fit(X, y)

    joblib.dump(model, MODEL_PATH)

    print(f"\nDINO >> model saved: {MODEL_PATH}")
    print(f"DINO >> model classes: {list(model.classes_)}")
    print("DINO >> training complete")


if __name__ == "__main__":
    main()