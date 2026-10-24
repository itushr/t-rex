import csv
import json
from pathlib import Path

from instance import get_debug_tabs, get_dino_tabs
from browser_gateway import connect, disconnect, command, listen


CSV_PATH = Path(__file__).resolve().with_name("dino_training_data.csv")

FIELDS = [
    "obstacle1_x",
    "obstacle2_x",
    "speed",
    "action",
]


script = r"""
(() => {
    if (window.__dinoCollectorInstalled) {
        return "Collector already installed";
    }

    const runner = Runner.getInstance();

    function getState() {
        const obstacles = runner.horizon?.obstacles ?? [];

        const positions = obstacles
            .map(obstacle => obstacle.xPos)
            .filter(Number.isFinite)
            .sort((a, b) => a - b);

        return {
            obstacle1_x: positions[0] ?? -1,
            obstacle2_x: positions[1] ?? -1,
            speed: Number(runner.currentSpeed) || 0
        };
    }

    function emitSample(action) {
        if (!runner.activated || runner.crashed || runner.paused) {
            return;
        }

        window.pythonSend(JSON.stringify({
            type: "sample",
            data: {
                ...getState(),
                action
            }
        }));
    }

    function onKeyDown(event) {
        if (event.repeat) return;

        let action = null;

        if (
            event.code === "ArrowUp" ||
            event.code === "Space"
        ) {
            action = "jump";
        } else if (event.code === "ArrowDown") {
            action = "duck";
        }

        if (action) {
            emitSample(action);
        }
    }

    // Capture key presses before the game's normal event handlers.
    document.addEventListener("keydown", onKeyDown, true);

    // Record decisions where the player does not press an action key.
    const timer = setInterval(() => {
        emitSample("none");
    }, 100);

    window.__dinoCollectorInstalled = true;

    window.__stopDinoCollector = () => {
        clearInterval(timer);
        document.removeEventListener("keydown", onKeyDown, true);
        delete window.__dinoCollectorInstalled;
    };

    return "Dino data collector installed";
})();
"""


def initialize_csv():
    if not CSV_PATH.exists() or CSV_PATH.stat().st_size == 0:
        with CSV_PATH.open("w", newline="", encoding="utf-8") as file:
            csv.DictWriter(file, fieldnames=FIELDS).writeheader()


def save_sample(data):
    try:
        row = {
            "obstacle1_x": float(data.get("obstacle1_x", -1)),
            "obstacle2_x": float(data.get("obstacle2_x", -1)),
            "speed": float(data.get("speed", 0)),
            "action": data.get("action", "none"),
        }

        if row["action"] not in {"none", "jump", "duck"}:
            return

        with CSV_PATH.open("a", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=FIELDS)
            writer.writerow(row)

        print(
            f"DINO >> {row['action']:4} | "
            f"obstacles=({row['obstacle1_x']:.1f}, "
            f"{row['obstacle2_x']:.1f}) | "
            f"speed={row['speed']:.2f}"
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

            payload = params.get("payload")

            if isinstance(payload, str):
                event = json.loads(payload)

                if event.get("type") == "sample":
                    save_sample(event.get("data", {}))

        elif message.get("type") == "sample":
            save_sample(message.get("data", {}))

    except (json.JSONDecodeError, TypeError, ValueError) as error:
        print(f"DINO >> invalid event: {error}")


def main():
    initialize_csv()

    debug_tabs = get_debug_tabs()

    if not debug_tabs:
        print("DINO >> error: Chrome debug tabs not detected")
        return

    dino_tabs = get_dino_tabs(debug_tabs)

    if len(dino_tabs) != 1:
        print(
            f"DINO >> error: expected one Dino tab, "
            f"found {len(dino_tabs)}"
        )
        return

    connection = connect(dino_tabs[0])

    if not connection:
        print("DINO >> error: WebSocket connection failed")
        return

    try:
        command(connection, 1, "Runtime.enable", {})
        command(
            connection,
            2,
            "Runtime.addBinding",
            {"name": "pythonSend"},
        )

        result = command(
            connection,
            3,
            "Runtime.evaluate",
            {
                "expression": script,
                "returnByValue": True,
            },
        )

        print("DINO >> collector installed")
        print(f"DINO >> dataset: {CSV_PATH}")
        print("DINO >> play manually to collect examples")
        print("DINO >> Up/Space = jump | Down = duck")
        print("DINO >> Ctrl+C to stop collection")

        listen(connection, on_message)

    except KeyboardInterrupt:
        print("\nDINO >> stopping collection")

    finally:
        try:
            command(
                connection,
                4,
                "Runtime.evaluate",
                {
                    "expression": (
                        "window.__stopDinoCollector?.()"
                    )
                },
            )
        except Exception:
            pass

        disconnect(connection)
        print("DINO >> disconnected")


if __name__ == "__main__":
    main()