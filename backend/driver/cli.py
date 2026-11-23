from pathlib import Path
import time
import uuid
from driver.autoplay import run_autoplay
from driver.recorder import record_gameplay
from ml.serialization import load_trained_model
from ml.trainer import train_model
from server.database.crud import create_model
from server.database.session import SessionSqlite

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR.parent / "data"


def list_files(folder: Path, pattern: str) -> list:
    return sorted(list(folder.glob(pattern)))


def handle_record() -> None:
    record_gameplay()


def handle_train() -> None:
    csvs = [c for c in list_files(DATA_DIR / "gameplay", "*.csv") if c.stat().st_size > 200]
    if not csvs:
        print("No valid gameplay CSVs found in data/gameplay/")
        return
    csvs.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    print("\nSelect gameplay recording:")
    for idx, c in enumerate(csvs, 1):
        print(f"  [{idx}] {c.stem}")
    sel_input = input(f"Choice (1-{len(csvs)}, default 1): ").strip()
    sel = int(sel_input) - 1 if sel_input.isdigit() else 0
    selected_csv = csvs[sel if 0 <= sel < len(csvs) else 0]

    print("\nSelect model architecture:\n  [1] Decision tree\n  [2] Random forest")
    m_choice = input("Choice (1-2, default 1): ").strip()
    m_type = "random_forest" if m_choice == "2" else "decision_tree"
    out_file = DATA_DIR / "models" / f"{selected_csv.stem}_{m_type}.pkl"
    try:
        res = train_model(selected_csv, out_file, game_id="dino", model_type=m_type)
        try:
            db = SessionSqlite()
            create_model(
                db, id=f"mod_{uuid.uuid4().hex[:12]}", user_id="local", game_id="dino",
                name=out_file.stem, filename=out_file.name, model_type=m_type,
                r2_bundle_key=str(out_file), r2_onnx_key="", r2_meta_key="",
                accuracy=res.get("accuracy", 0.0), features=res.get("features", []),
                actions=[], created_at=time.time(),
            )
            db.close()
        except Exception:
            pass
        print(f"\nTraining complete! Accuracy: {res['accuracy']}%. Saved: {out_file.name}")
    except ValueError as exc:
        print(f"\nTraining error: {exc}")


def handle_play() -> None:
    models = list_files(DATA_DIR / "models", "*.pkl")
    if not models:
        print("No trained models found in data/models/")
        return
    models.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    print("\nSelect trained model:")
    for idx, m in enumerate(models, 1):
        print(f"  [{idx}] {m.stem}")
    sel_input = input(f"Choice (1-{len(models)}, default 1): ").strip()
    sel = int(sel_input) - 1 if sel_input.isdigit() else 0
    selected_model = models[sel if 0 <= sel < len(models) else 0]
    bundle = load_trained_model(selected_model)
    run_autoplay(selected_model, bundle, DATA_DIR / "playback")


def main_menu() -> None:
    while True:
        print("\n=== Chrome Dino ML Bot ===\n [1] Record human gameplay (local CDP)\n [2] Train ML model\n [3] Run bot autoplay (local CDP)\n [4] Exit")
        c = input("Select [1-4]: ").strip()
        if c == "1": handle_record()
        elif c == "2": handle_train()
        elif c == "3": handle_play()
        elif c == "4": break


if __name__ == "__main__":
    main_menu()
