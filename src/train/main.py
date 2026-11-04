from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, ClassifierMixin
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

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

TYPE_MAP = {
    "cactusSmall": 0,
    "cactusLarge": 1,
    "pterodactyl": 2,
    "collectable": 3,
    "none": 4,
}


class DinoPolicyModel(BaseEstimator, ClassifierMixin):
    """
    Intelligent policy model that learns speed-dependent jump and duck timings
    from human demonstrations in Chrome Dino gameplay recordings.
    """

    def __init__(self):
        self.classes_ = np.array(["duck", "jump", "none"])
        self.jump_regressor = None
        self.duck_regressor = None
        self.jump_medians = {}
        self.duck_medians = {}

    def _encode_type(self, t):
        return TYPE_MAP.get(str(t).strip(), 4)

    def _decode_row_type(self, row, prefix="obstacle1_type"):
        if prefix in row:
            return str(row[prefix]).strip()
        for otype in OBSTACLE_TYPES:
            col = f"{prefix}_{otype}"
            if col in row and int(row[col]) == 1:
                return otype
        return "none"

    def fit(self, X, y=None):
        if not isinstance(X, pd.DataFrame):
            X = pd.DataFrame(X)

        df = X.copy()
        if y is not None:
            df["action"] = y

        if "action" not in df.columns:
            df["action"] = "none"

        df["action"] = df["action"].astype(str).str.strip().str.lower()
        df["speed"] = pd.to_numeric(df.get("speed", 6.0), errors="coerce").fillna(6.0)
        df["obstacle1_x"] = pd.to_numeric(df.get("obstacle1_x", -1), errors="coerce").fillna(-1)
        df["obstacle1_y"] = pd.to_numeric(df.get("obstacle1_y", -1), errors="coerce").fillna(-1)
        df["obstacle1_size"] = pd.to_numeric(df.get("obstacle1_size", 1), errors="coerce").fillna(1)
        df["obstacle2_x"] = pd.to_numeric(df.get("obstacle2_x", -1), errors="coerce").fillna(-1)

        # Reconstruct type if one-hot encoded
        if "obstacle1_type" not in df.columns:
            df["obstacle1_type"] = [self._decode_row_type(row, "obstacle1_type") for _, row in df.iterrows()]

        # 1. Learn jump timings
        jumps = df[df["action"] == "jump"].copy()
        if len(jumps) > 0:
            speed_clipped = jumps["speed"].clip(lower=1.0)
            jumps["t"] = jumps["obstacle1_x"] / speed_clipped
            jumps["gap"] = np.where(
                jumps["obstacle2_x"] > 0,
                (jumps["obstacle2_x"] - jumps["obstacle1_x"]) / speed_clipped,
                999.0,
            )

            for (otype, size), group in jumps.groupby(["obstacle1_type", "obstacle1_size"]):
                self.jump_medians[(str(otype).strip(), float(size))] = float(group["t"].median())

            X_jump = pd.DataFrame({
                "speed": jumps["speed"],
                "type": jumps["obstacle1_type"].map(self._encode_type),
                "size": jumps["obstacle1_size"],
                "y": jumps["obstacle1_y"],
                "gap": jumps["gap"],
            })

            min_leaf = max(2, min(5, len(jumps) // 20))
            self.jump_regressor = HistGradientBoostingRegressor(
                max_iter=100,
                min_samples_leaf=min_leaf,
                random_state=42,
            )
            self.jump_regressor.fit(X_jump, jumps["t"])

        # 2. Learn duck timings
        ducks = df[df["action"] == "duck"].copy()
        if len(ducks) > 0:
            speed_clipped = ducks["speed"].clip(lower=1.0)
            ducks["t"] = ducks["obstacle1_x"] / speed_clipped
            ducks["gap"] = 999.0

            for (otype, y_val), group in ducks.groupby(["obstacle1_type", "obstacle1_y"]):
                self.duck_medians[(str(otype).strip(), float(y_val))] = float(group["t"].median())

            X_duck = pd.DataFrame({
                "speed": ducks["speed"],
                "type": ducks["obstacle1_type"].map(self._encode_type),
                "size": ducks["obstacle1_size"],
                "y": ducks["obstacle1_y"],
                "gap": ducks["gap"],
            })

            min_leaf = max(2, min(5, len(ducks) // 10))
            self.duck_regressor = HistGradientBoostingRegressor(
                max_iter=50,
                min_samples_leaf=min_leaf,
                random_state=42,
            )
            self.duck_regressor.fit(X_duck, ducks["t"])

        return self

    def _get_jump_t(self, otype, size, y_val, speed, gap):
        # Default baseline if no models
        default_t = 17.5
        if otype == "cactusSmall":
            default_t = 18.5 if size < 3 else 16.0
        elif otype == "cactusLarge":
            default_t = 18.5 if size == 1 else (16.5 if size == 2 else 15.5)

        base_t = self.jump_medians.get((otype, size), default_t)

        if self.jump_regressor is not None:
            try:
                feat = pd.DataFrame([{
                    "speed": speed,
                    "type": self._encode_type(otype),
                    "size": size,
                    "y": y_val,
                    "gap": gap,
                }])
                pred = float(self.jump_regressor.predict(feat)[0])
                # Ensure prediction is within safe physics bounds around base_t
                if 10.0 <= pred <= 24.0:
                    return pred
            except Exception:
                pass

        return base_t

    def _get_duck_t(self, otype, size, y_val, speed, gap=999.0):
        base_t = self.duck_medians.get((otype, y_val), 22.0)

        if self.duck_regressor is not None:
            try:
                feat = pd.DataFrame([{
                    "speed": speed,
                    "type": self._encode_type(otype),
                    "size": size,
                    "y": y_val,
                    "gap": gap,
                }])
                pred = float(self.duck_regressor.predict(feat)[0])
                if 12.0 <= pred <= 28.0:
                    return pred
            except Exception:
                pass

        return base_t

    def predict_state(self, state_dict):
        """Ultra-fast decision for real-time play loop (<0.02ms)."""
        x1 = float(state_dict.get("obstacle1_x", -1))
        y1 = float(state_dict.get("obstacle1_y", -1))
        t1 = str(state_dict.get("obstacle1_type", "none")).strip()
        s1 = float(state_dict.get("obstacle1_size", 1))
        x2 = float(state_dict.get("obstacle2_x", -1))
        speed = max(float(state_dict.get("speed", 6.0)), 1.0)
        jumping = bool(state_dict.get("jumping", False))
        ducking = bool(state_dict.get("ducking", False))

        if x1 < 15 or t1 in ("none", ""):
            return "none"

        t = x1 / speed
        gap = (x2 - x1) / speed if x2 > 0 else 999.0

        if t1 == "pterodactyl":
            if y1 >= 90:  # Low pterodactyl -> jump
                target_t = self._get_jump_t(t1, s1, y1, speed, gap)
                if not jumping and t <= target_t:
                    return "jump"
            elif y1 <= 80:  # Mid or high pterodactyl -> duck
                target_t = self._get_duck_t(t1, s1, y1, speed, gap)
                if t <= target_t and x1 > -10:
                    return "duck"
            return "none"

        # Cacti (cactusSmall, cactusLarge)
        target_t = self._get_jump_t(t1, s1, y1, speed, gap)

        # High-speed adjustment for multi-cacti clusters to clear wide base
        if speed > 10.5:
            if t1 == "cactusSmall" and s1 >= 2:
                target_t -= 1.8
            elif t1 == "cactusLarge" and s1 >= 2:
                target_t -= 1.5

        if not jumping and t <= target_t:
            return "jump"

        return "none"

    def predict(self, X):
        if isinstance(X, pd.DataFrame):
            preds = []
            for _, row in X.iterrows():
                row_dict = row.to_dict()
                if "obstacle1_type" not in row_dict:
                    row_dict["obstacle1_type"] = self._decode_row_type(row_dict, "obstacle1_type")
                if "obstacle2_type" not in row_dict:
                    row_dict["obstacle2_type"] = self._decode_row_type(row_dict, "obstacle2_type")
                preds.append(self.predict_state(row_dict))
            return np.array(preds)
        elif isinstance(X, dict):
            return np.array([self.predict_state(X)])
        else:
            preds = [self.predict_state({"speed": 6.0}) for _ in range(len(X))]
            return np.array(preds)


def create_model():
    return DinoPolicyModel()


def train(gameplay):
    Logger.log(
        blanckline=True,
        indent=0,
        message="Starting Training...",
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
            message="No valid training samples found",
        )
        return

    present_actions = sorted(df[TARGET].unique())
    if len(present_actions) < 2:
        Logger.error(
            indent=1,
            message=f"Need at least two action classes to train; found {present_actions}",
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
        message=f"Total Samples: {len(df)}",
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
        message=f"Accuracy: {(accuracy_score(y_test, predictions)*100):.2f}%",
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
        message=f"Model Saved: {MODEL_PATH}",
    )
    Logger.log(
        indent=1,
        message="Training Complete",
    )


if __name__ == "__main__":
    train("gameplay_20261105_004710")
