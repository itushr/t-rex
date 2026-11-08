from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "driver" / "data"
GAMEPLAY_DIR = DATA_DIR / "gameplay"
PLAYBACK_DIR = DATA_DIR / "playback"
MODELS_DIR = DATA_DIR / "models"

for folder in [GAMEPLAY_DIR, PLAYBACK_DIR, MODELS_DIR]:
    folder.mkdir(parents=True, exist_ok=True)

HOST = "0.0.0.0"
PORT = 8000
