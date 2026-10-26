import joblib
import pandas as pd
from pathlib import Path

base = Path.cwd()

df = pd.read_csv(base / "gameplay.csv")
saved = joblib.load(base / "model.pkl")
model = saved["model"]

# Keep the original action labels.
actual = df["action"].astype(str).str.strip().str.lower()

# Separate raw input features from the target.
X = df[
    saved["numeric_features"] + saved["type_features"]
].copy()

# Normalize categorical values.
for column in saved["type_features"]:
    X[column] = X[column].astype(str).str.strip()

# Convert numeric columns.
for column in saved["numeric_features"]:
    X[column] = pd.to_numeric(X[column], errors="coerce")

# Encode categorical columns into one-hot features.
X = pd.get_dummies(
    X,
    columns=saved["type_features"],
    dtype=int
)

# Match the exact feature columns used during training.
X = X.reindex(columns=saved["features"], fill_value=0)

# Remove invalid numeric rows.
valid = X[saved["numeric_features"]].notna().all(axis=1)
X = X.loc[valid]
actual = actual.loc[valid]

# Predict.
predicted = pd.Series(
    model.predict(X),
    index=X.index,
    name="Predicted"
)

print("ACTUAL ACTION COUNTS:")
print(actual.value_counts().to_string())

print("\nPREDICTED ACTION COUNTS:")
print(predicted.value_counts().to_string())

print("\nACTUAL vs PREDICTED:")
print(
    pd.crosstab(
        actual.loc[predicted.index],
        predicted,
        rownames=["Actual"],
        colnames=["Predicted"],
    )
)

print("\nJUMP SAMPLES:")
jump_indices = actual[actual == "jump"].index

for index in jump_indices:
    print(
        f"Row {index}: "
        f"actual={actual.loc[index]}, "
        f"predicted={predicted.loc[index]}, "
        f"obstacle_x={X.loc[index, 'obstacle1_x']}, "
        f"speed={X.loc[index, 'speed']}"
    )