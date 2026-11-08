import csv
from datetime import datetime
from pathlib import Path
import time
from driver.browser import open_dino_tab
from driver.cdp import CDPClient

BASE_DIR = Path(__file__).resolve().parent
COLUMNS = [
    "obstacle1_x", "obstacle1_y", "obstacle1_type", "obstacle1_size",
    "obstacle2_x", "obstacle2_y", "obstacle2_type", "obstacle2_size",
    "speed", "jumping", "ducking", "time_to_impact", "action"
]


def record_gameplay(output_file: Path = None) -> Path:
    """Connects to Dino debug tab and records human gameplay until Ctrl+C."""
    if output_file is None:
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = BASE_DIR / "data" / "gameplay" / f"gameplay_{ts}.csv"
    output_file.parent.mkdir(parents=True, exist_ok=True)

    ws_url = open_dino_tab()
    cdp = CDPClient(ws_url)
    script_path = Path(__file__).parent / "scripts" / "watch_script.js"
    cdp.evaluate(script_path.read_text(encoding="utf-8"))

    count = 0
    with output_file.open("w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        print(f"Recording to {output_file.name}. Play the game in Chrome (Ctrl+C to stop)...")
        try:
            while True:
                sample = cdp.evaluate("window.__dinoRecorder ? window.__dinoRecorder.nextSample() : null")
                if sample and sample.get("action"):
                    writer.writerow({col: sample.get(col) for col in COLUMNS})
                    f.flush()
                    count += 1
                time.sleep(0.01)
        except KeyboardInterrupt:
            pass
        finally:
            cdp.close()

    if count == 0:
        if output_file.exists():
            output_file.unlink()
        print("\nNo gameplay samples captured. Discarded empty file.")
        return None

    print(f"\nRecording saved to {output_file.name} ({count} samples)")
    return output_file
