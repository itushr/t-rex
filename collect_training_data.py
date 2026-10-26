import csv
import json
from pathlib import Path

from instance import get_debug_tabs, get_dino_tabs
from browser_gateway import connect, disconnect, command, listen

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "dino_training_data.csv"

FIELDS = [
    "obstacle1_x", "obstacle1_y", "obstacle1_type", "obstacle1_size",
    "obstacle2_x", "obstacle2_y", "obstacle2_type", "obstacle2_size",
    "speed", "action",
]
VALID_ACTIONS = {"none", "jump"}

SCRIPT = r"""
(() => {
    if (window.__dinoCollectorInstalled) return "Collector already installed";

    const runner = Runner.getInstance();
    if (!runner || !runner.horizon || !runner.tRex) return "Dino runner not ready";

    function getState() {
        const obstacles = [...(runner.horizon?.obstacles ?? [])]
            .filter(o => Number.isFinite(o.xPos))
            .sort((a, b) => a.xPos - b.xPos);

        function obstacleAt(index) {
            const o = obstacles[index];
            if (!o) return { x: -1, y: -1, type: "none", size: 0 };
            return {
                x: Number(o.xPos),
                y: Number(o.yPos),
                type: o.typeConfig?.type ?? "unknown",
                size: Number(o.size) || 1
            };
        }

        const a = obstacleAt(0);
        const b = obstacleAt(1);
        return {
            obstacle1_x: a.x, obstacle1_y: a.y,
            obstacle1_type: a.type, obstacle1_size: a.size,
            obstacle2_x: b.x, obstacle2_y: b.y,
            obstacle2_type: b.type, obstacle2_size: b.size,
            speed: Number(runner.currentSpeed) || 0
        };
    }

    function emitSample(action) {
        if (!runner.activated || runner.crashed || runner.paused) return;
        window.pythonSend(JSON.stringify({
            type: "sample",
            data: { ...getState(), action }
        }));
    }

    function onKeyDown(event) {
        if (event.repeat) return;
        if (event.code === "ArrowUp" || event.code === "Space") {
            emitSample("jump");
        }
    }

    document.addEventListener("keydown", onKeyDown, true);
    const timer = setInterval(() => emitSample("none"), 100);

    const originalGameOver = runner.gameOver;
    if (typeof originalGameOver === "function") {
        runner.gameOver = function (...args) {
            window.pythonSend(JSON.stringify({ type: "game_over" }));
            return originalGameOver.apply(this, args);
        };
    }

    window.__dinoCollectorInstalled = true;
    window.__stopDinoCollector = () => {
        clearInterval(timer);
        document.removeEventListener("keydown", onKeyDown, true);
        if (typeof originalGameOver === "function") runner.gameOver = originalGameOver;
        delete window.__dinoCollectorInstalled;
        delete window.__stopDinoCollector;
    };

    return "Dino collector installed";
})()
"""


def initialize_csv():
    if not CSV_PATH.exists() or CSV_PATH.stat().st_size == 0:
        with CSV_PATH.open("w", newline="", encoding="utf-8") as file:
            csv.DictWriter(file, fieldnames=FIELDS).writeheader()


def delete_last_rows(count=3):
    try:
        with CSV_PATH.open("r", newline="", encoding="utf-8") as file:
            rows = list(csv.reader(file))
        if len(rows) <= 1:
            print("DINO >> no samples to remove")
            return
        data_rows = rows[1:]
        removed = min(count, len(data_rows))
        data_rows = data_rows[:-removed] if removed else data_rows
        with CSV_PATH.open("w", newline="", encoding="utf-8") as file:
            writer = csv.writer(file)
            writer.writerow(rows[0])
            writer.writerows(data_rows)
        print(f"DINO >> game over: removed last {removed} samples")
    except OSError as error:
        print(f"DINO >> CSV cleanup failed: {error}")


def save_sample(data):
    try:
        row = {
            "obstacle1_x": float(data.get("obstacle1_x", -1)),
            "obstacle1_y": float(data.get("obstacle1_y", -1)),
            "obstacle1_type": str(data.get("obstacle1_type", "none")),
            "obstacle1_size": int(data.get("obstacle1_size", 0)),
            "obstacle2_x": float(data.get("obstacle2_x", -1)),
            "obstacle2_y": float(data.get("obstacle2_y", -1)),
            "obstacle2_type": str(data.get("obstacle2_type", "none")),
            "obstacle2_size": int(data.get("obstacle2_size", 0)),
            "speed": float(data.get("speed", 0)),
            "action": str(data.get("action", "none")).lower(),
        }
        if row["action"] not in VALID_ACTIONS:
            return
        with CSV_PATH.open("a", newline="", encoding="utf-8") as file:
            csv.DictWriter(file, fieldnames=FIELDS).writerow(row)
        print(
            f"DINO >> {row['action']:4} | "
            f"{row['obstacle1_type']}@{row['obstacle1_x']:.1f}"
        )
    except (TypeError, ValueError) as error:
        print(f"DINO >> invalid sample: {error}")


def on_message(message):
    try:
        if isinstance(message, str):
            message = json.loads(message)
        if not isinstance(message, dict):
            return

        if message.get("method") == "Runtime.bindingCalled":
            params = message.get("params", {})
            if params.get("name") != "pythonSend":
                return
            event = json.loads(params.get("payload", "{}"))
        elif message.get("type") in {"sample", "game_over"}:
            event = message
        else:
            return

        if event.get("type") == "sample":
            save_sample(event.get("data", {}))
        elif event.get("type") == "game_over":
            delete_last_rows(3)
    except (json.JSONDecodeError, TypeError, ValueError) as error:
        print(f"DINO >> invalid event: {error}")


def main():
    initialize_csv()
    tabs = get_debug_tabs()
    if not tabs:
        print("DINO >> error: Chrome debug tabs not detected")
        return

    dino_tabs = get_dino_tabs(tabs)
    if len(dino_tabs) != 1:
        print(f"DINO >> error: expected one Dino tab, found {len(dino_tabs)}")
        return

    connection = connect(dino_tabs[0])
    if not connection:
        print("DINO >> error: WebSocket connection failed")
        return

    try:
        command(connection, 1, "Runtime.enable", {})
        command(connection, 2, "Runtime.addBinding", {"name": "pythonSend"})
        result = command(
            connection, 3, "Runtime.evaluate",
            {"expression": SCRIPT, "returnByValue": True},
        )
        print(f"DINO >> {result}")
        print(f"DINO >> dataset: {CSV_PATH}")
        print("DINO >> play manually: Space/Up = jump")
        print("DINO >> game over removes the last 3 samples; Ctrl+C stops collection")
        listen(connection, on_message)
    except KeyboardInterrupt:
        print("\nDINO >> stopping collection")
    finally:
        try:
            command(
                connection, 4, "Runtime.evaluate",
                {"expression": "window.__stopDinoCollector?.()"},
            )
        except Exception:
            pass
        disconnect(connection)
        print("DINO >> disconnected")


if __name__ == "__main__":
    main()
