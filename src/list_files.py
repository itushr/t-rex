from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GAMEPLAY_DIR = PROJECT_ROOT / "gameplay"
MODELS_DIR = PROJECT_ROOT / "models"
PLAYBACK_DIR = PROJECT_ROOT / "playback"


def list_gameplays():
    return sorted(
        file.name
        for file in GAMEPLAY_DIR.iterdir()
        if file.is_file() and file.suffix == ".csv"
    )
    
def list_models():
    return sorted(
            file.name
            for file in MODELS_DIR.iterdir()
            if file.is_file() and file.suffix == ".pkl"
        )

def list_playbacks():
    if not PLAYBACK_DIR.exists():
        return []
    return sorted(
        file.name
        for file in PLAYBACK_DIR.iterdir()
        if file.is_file() and file.suffix == ".html"
    )