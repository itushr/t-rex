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
    dino_debug_tab = open_dino_debug_tab()

    connection = connect(dino_debug_tab)

    if not connection:
        log("ERROR", "WebSocket connection failed")
        return

    cdp = CDP(connection)

    try:
        cdp.evaluate("void 0")

        result = cdp.evaluate(RECORDER_SCRIPT)

        if not isinstance(result, dict) or not result.get("ok"):
            raise RuntimeError(
                f"Recorder installation failed: {result!r}"
            )

        prepare_csv()

        log("INFO", result["message"])
        log("INFO", f"Saving data to {CSV_PATH}")
        log("INFO", f"Sampling interval: {SAMPLE_INTERVAL * 1000:.0f} ms")
        log("INFO", "Start the game and play normally.")
        log("INFO", "Press Ctrl+C when finished.")

        total_rows = 0
        jump_rows = 0
        last_report = time.monotonic()

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

                    # Critical safety check: a jump row must represent
                    # the state before the jump starts.
                    if (
                        row["action"] == "jump"
                        and int(row["jumping"]) != 0
                    ):
                        log(
                            "WARN",
                            "Discarded invalid jump row: "
                            "jumping was already true",
                        )
                    else:
                        writer.writerow({
                            column: row.get(column)
                            for column in COLUMNS
                        })

                        file.flush()
                        total_rows += 1

                        if row["action"] == "jump":
                            jump_rows += 1

                            log(
                                "JUMP",
                                f"Recorded pre-jump state | "
                                f"x={row['obstacle1_x']:.1f} "
                                f"speed={row['speed']:.2f} "
                                f"jumping={row['jumping']}",
                            )

                now = time.monotonic()

                if now - last_report >= 2:
                    log(
                        "DATA",
                        f"rows={total_rows} "
                        f"jump_samples={jump_rows}",
                    )
                    last_report = now

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