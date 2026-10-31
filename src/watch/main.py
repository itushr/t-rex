import csv
import json
import time
from datetime import datetime
from pathlib import Path

from src.instance import open_dino_debug_tab
from src.browser_gateway import connect, disconnect
from src.watch.script import RECORDER_SCRIPT

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


def log(lebel, message):
    print(f"    [{lebel}] {message}", flush=True)


class CDP:
    def __init__(self, connection):
        self.connection = connection
        self.command_id = 0

    def evaluate(self, expression):
        self.command_id += 1
        command_id = self.command_id

        self.connection.send(json.dumps({
            "id": command_id,
            "method": "Runtime.evaluate",
            "params": {
                "expression": expression,
                "returnByValue": True,
            },
        }))

        while True:
            message = json.loads(self.connection.recv())

            if message.get("id") != command_id:
                continue

            if "error" in message:
                raise RuntimeError(str(message["error"]))

            result = message.get("result", {})

            if result.get("exceptionDetails"):
                raise RuntimeError(
                    str(result["exceptionDetails"])
                )

            remote = result.get("result", {})

            if "value" in remote:
                return remote["value"]

            if remote.get("subtype") == "error":
                raise RuntimeError(
                    remote.get("description", "JavaScript error")
                )

            return None


def prepare_csv():
    with CSV_PATH.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=COLUMNS)
        writer.writeheader()


def watch():
    print(">>> MODE: WATCH")
    
    try:
        dino_debug_tab = open_dino_debug_tab()
    except Exception as err:
        log("ERROR", err)
        
    if(not dino_debug_tab):
        log("ERROR", "Could not open game")
        
    
    connection = connect(dino_debug_tab)

    if not connection:
        log("ERROR", "WebSocket connection failed")
        return

    time.sleep(2)
    
    cdp = CDP(connection)

    try:
        cdp.evaluate("void 0")

        result = cdp.evaluate(RECORDER_SCRIPT)

        if not isinstance(result, dict) or not result.get("ok"):
            raise RuntimeError(
                f"Recorder installation failed: {result!r}"
            )

        prepare_csv()

        print(f"    Saving data to {CSV_PATH}")
        print(f"    Sampling interval: {SAMPLE_INTERVAL * 1000:.0f} ms")
        print(f"    Press Ctrl+C when finished.")
        
        print()

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
                        log(
                            "WARN",
                            "Discarded: Jump while jumping"
                        )
                    else:
                        writer.writerow({
                            column: row.get(column)
                            for column in COLUMNS
                        })

                        file.flush()

                        if row["action"] == "jump":
                            log(
                                "ACTION",
                                f"JUMP, nearest obstacle @{row['obstacle1_x']}"
                            )
                        if row["action"] == "duck":
                            log(
                                "ACTION",
                                f"DUCK, nearest obstacle @{row['obstacle1_x']}"
                            )

                time.sleep(SAMPLE_INTERVAL)

    except KeyboardInterrupt:
        log("INFO", "Recording stopped")

    except Exception as error:
        log("ERROR", f"Recording failed: {error}")

    finally:
        disconnect(connection)
        log("INFO", "Disconnected from Dino tab")


if __name__ == "__main__":
    watch()