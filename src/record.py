import csv
import json
import shutil
import time
from datetime import datetime
from pathlib import Path

from instance import get_debug_tabs, get_dino_tabs
from browser_gateway import connect, disconnect


BASE_DIR = Path(__file__).resolve().parent.parent
CSV_PATH = BASE_DIR / "gameplay.csv"

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


def log(level, message):
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{level}] {message}", flush=True)


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


RECORDER_SCRIPT = r"""
(() => {
    const runner = Runner.getInstance();

    if (!runner || !runner.tRex || !runner.horizon) {
        throw new Error("Dino game is not ready");
    }

    if (window.__pythonDinoRecorder) {
        return {
            ok: true,
            message: "Recorder already installed"
        };
    }

    const queue = [];

    function snapshot(action) {
        const r = Runner.getInstance();

        if (!r || !r.tRex || !r.horizon) {
            return null;
        }

        const obstacles = [...(r.horizon.obstacles || [])]
            .map(o => ({
                x: Number(o.xPos),
                y: Number(o.yPos),
                type: o.typeConfig?.type ?? "none",
                size: Number(o.size) || 1
            }))
            .filter(o => Number.isFinite(o.x))
            .sort((a, b) => a.x - b.x);

        function getObstacle(index) {
            if (index >= obstacles.length) {
                return {
                    x: -1,
                    y: -1,
                    type: "none",
                    size: 0
                };
            }

            return obstacles[index];
        }

        const first = getObstacle(0);
        const second = getObstacle(1);

        return {
            obstacle1_x: first.x,
            obstacle1_y: first.y,
            obstacle1_type: first.type,
            obstacle1_size: first.size,

            obstacle2_x: second.x,
            obstacle2_y: second.y,
            obstacle2_type: second.type,
            obstacle2_size: second.size,

            speed: Number(r.currentSpeed) || 0,

            // Capture the state BEFORE the game's key handler
            // processes the keydown event.
            jumping: Number(Boolean(r.tRex.jumping)),
            ducking: Number(Boolean(r.tRex.ducking)),

            action: action
        };
    }

    function onKeyDown(event) {
        if (event.repeat) {
            return;
        }

        if (
            event.code !== "ArrowUp" &&
            event.code !== "Space"
        ) {
            return;
        }

        const r = Runner.getInstance();

        if (!r || !r.tRex || !r.horizon) {
            return;
        }

        if (!r.activated || r.crashed || r.paused) {
            return;
        }

        // Do not label a held/in-progress jump as a new jump.
        if (r.tRex.jumping) {
            return;
        }

        // Window capture runs before the usual game key handler.
        const row = snapshot("jump");

        if (row && row.jumping === 0) {
            queue.push(row);
        }
    }

    // Capture phase: record the pre-jump state.
    window.addEventListener("keydown", onKeyDown, true);

    window.__pythonDinoRecorder = {
        nextSample() {
            // Preserve the exact state associated with a jump keydown.
            if (queue.length > 0) {
                return queue.shift();
            }

            const r = Runner.getInstance();

            if (
                !r ||
                !r.tRex ||
                r.crashed ||
                r.paused ||
                !r.activated
            ) {
                return null;
            }

            // No new command was issued during this sample.
            return snapshot("none");
        },

        getQueueLength() {
            return queue.length;
        }
    };

    return {
        ok: true,
        message: "Recorder installed: pre-jump state capture enabled"
    };
})()
"""


def prepare_csv():
    BASE_DIR.mkdir(parents=True, exist_ok=True)

    if CSV_PATH.exists():
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = BASE_DIR / f"gameplay_old_{timestamp}.csv"

        shutil.move(str(CSV_PATH), str(backup_path))

        log("INFO", f"Previous dataset backed up to {backup_path}")

    with CSV_PATH.open("w", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=COLUMNS)
        writer.writeheader()


def main():
    tabs = get_debug_tabs()

    if not tabs:
        log("ERROR", "Chrome debug tabs not detected")
        return

    dino_tabs = get_dino_tabs(tabs)

    if len(dino_tabs) != 1:
        log(
            "ERROR",
            f"Expected one Dino tab, found {len(dino_tabs)}",
        )
        return

    connection = connect(dino_tabs[0])

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
    main()