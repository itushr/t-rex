import joblib
import pandas as pd

from pathlib import Path


MODEL_PATH = Path(__file__).resolve().parent / "dino_model.pkl"

model = joblib.load(MODEL_PATH)

state = pd.DataFrame([
    {
        "action": "jump",
        "obstacle1_x": 100,
        "obstacle2_x": 250,
        "speed": 6.0,
    }
])

prediction = model.predict(state)[0]
probabilities = model.predict_proba(state)[0]

print("Predicted success:", bool(prediction))
print(
    "Class probabilities:",
    dict(zip(model.classes_, probabilities.round(3))),
)