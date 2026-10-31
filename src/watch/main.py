import csv
import json
import time
from datetime import datetime
from pathlib import Path

from src.browser_instance import open_dino_debug_tab
from src.browser_gateway import connect, disconnect, CDP
from src.watch.script import SCRIPT

from src.logger import Logger

timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
BASE_DIR = Path(__file__).resolve().parent.parent.parent / "gameplay"
CSV_PATH = BASE_DIR / f"gameplay_{timestamp}.csv"

SAMPLE_INTERVAL = 0.01

COLUMNS = [
    "obstacle1_x",
    "obstacle1_y",
    "obstacle1_type",
    "obstacle1_size",
    "obstacle2_x",
    "obstacle2_y",
    "obstacle2_type",
    "obstacle2_size",
    "speed",
    "jumping",
    "ducking",
    "action",
]

def prepare_csv():
    with CSV_PATH.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=COLUMNS)
        writer.writeheader()


def watch():
    Logger.log(
        blanckline=True,
        indent=0,
        message="Opening Game Window..."
    )
    
    try:
        dino_debug_tab = int("fdj")
    except Exception as error:
        Logger.error(
            indent=1,
            message=error
        )
        return
    try:
        connection = connect(dino_debug_tab)
    except Exception as error:
        Logger.log(
            indent=1,
            message=error
        )
        return
        
    if not connection:
        Logger.error(
            indent=1,
            message="Websocket connection failed"
        )
        return

    time.sleep(2) #waiting to establish connection
    
    cdp = CDP(connection)

    try:
        cdp.evaluate("void 0")

        result = cdp.evaluate(SCRIPT)

        if not isinstance(result, dict) or not result.get("ok"):
            Logger.error(
                indent=1,
                message="Could not embed tracker in browser"
            )
            return

        prepare_csv()

        Logger.log(
            indent=1,
            message=f"Savig data to {CSV_PATH}"
        )
        
        Logger.log(
            indent=1,
            message=f"Start playing, System Watching (Ctrl+C to exit)"
        )
        
        Logger.log(
            indent=1,
            message=""
        )

        with CSV_PATH.open("a", newline="") as file:
            writer = csv.DictWriter(file, fieldnames=COLUMNS)

            while True:
                row = cdp.evaluate(
                    "window.__pythonDinoRecorder.nextSample()"
                )

                if row is not None:
                    if row.get("action") not in {"none", "jump"}:
                        time.sleep(SAMPLE_INTERVAL)
                        continue

                    if (
                        row["action"] == "jump"
                        and int(row["jumping"]) != 0
                    ):
                        Logger.log(
                            indent=1,
                            label="WARN",
                            message="Action Discarded: Jump while jumping"
                        )
                    else:
                        writer.writerow({
                            column: row.get(column)
                            for column in COLUMNS
                        })

                        file.flush()

                        if row["action"] == "jump":
                            Logger.log(
                                indent=1,
                                label="ACTION",
                                message=f"JUMP, nearest obstacle @{row['obstacle1_x']}"
                            )
                        if row["action"] == "duck":
                            Logger.log(
                                indent=1,
                                label="ACTION",
                                message=f"DUCK, nearest obstacle @{row['obstacle1_x']}"
                            )

                time.sleep(SAMPLE_INTERVAL)

    except KeyboardInterrupt:
        Logger.log(
            indent=1,
            message="Saved your gameplay, train model with [2] in main menu"
        )

    except Exception as error:
        Logger.error(
            indent=1,
            message=f"{error}"
        )

    finally:
        disconnect(connection)


if __name__ == "__main__":
    watch()