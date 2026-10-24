import csv
import json
from pathlib import Path

from instance import get_debug_tabs, get_dino_tabs
from browser_gateway import connect, disconnect, command, listen
from subscription_script import script


CSV_PATH = Path(__file__).resolve().with_name("dino_data.csv")

FIELDS = [
    "action",
    "obstacle1_x",
    "obstacle2_x",
    "speed",
    "success",
]

# Zero-based data-row indices for the current run.
current_run_rows = []


def initialize_csv():
    """Create the CSV with a header if it doesn't exist."""
    if not CSV_PATH.exists() or CSV_PATH.stat().st_size == 0:
        with CSV_PATH.open("w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=FIELDS)
            writer.writeheader()


def read_rows():
    """Read all existing data rows, excluding the header."""
    with CSV_PATH.open("r", newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def save_action(data):
    """Save an action with the first two obstacle positions."""
    action = data.get("action")

    if action not in {"jump", "duck", "unduck"}:
        return

    obstacle_x = data.get("obstacle_x", [])
    speed = data.get("speed", 0)

    if not isinstance(obstacle_x, list):
        obstacle_x = []

    # Use -1 when an obstacle is unavailable.
    obstacle1_x = obstacle_x[0] if len(obstacle_x) > 0 else -1
    obstacle2_x = obstacle_x[1] if len(obstacle_x) > 1 else -1

    rows = read_rows()

    row = {
        "action": action,
        "obstacle1_x": obstacle1_x,
        "obstacle2_x": obstacle2_x,
        "speed": speed,
        "success": "true",
    }

    with CSV_PATH.open("a", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writerow(row)

    current_run_rows.append(len(rows))

    print(
        f"DINO >> saved {action}: "
        f"obstacle1={obstacle1_x}, "
        f"obstacle2={obstacle2_x}, "
        f"speed={speed}"
    )


def mark_last_action_failed():
    """Mark only the current run's final action as unsuccessful."""
    if not current_run_rows:
        print("DINO >> game over; no action to label")
        return

    target_index = current_run_rows[-1]
    rows = read_rows()

    if target_index >= len(rows):
        print("DINO >> warning: could not find final action row")
        return

    rows[target_index]["success"] = "false"

    with CSV_PATH.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)

    print("DINO >> final action marked success=false")


def handle_event(event):
    """Handle events emitted through window.pythonSend."""
    global current_run_rows

    if not isinstance(event, dict):
        return

    event_type = event.get("type")
    data = event.get("data", {})

    if event_type == "action":
        save_action(data)

    elif event_type == "run_started":
        current_run_rows = []
        print("DINO >> new run started")

    elif event_type == "game_over":
        mark_last_action_failed()


def on_message(message):
    """Handle CDP binding events or already-decoded events."""
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

            if not isinstance(payload, str):
                return

            handle_event(json.loads(payload))
            return

        # Support gateways that extract the binding payload themselves.
        if message.get("type") in {
            "action",
            "run_started",
            "game_over",
        }:
            handle_event(message)

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

        command(
            connection,
            3,
            "Runtime.evaluate",
            {
                "expression": script,
                "returnByValue": True,
            },
        )

        print("DINO >> subscription installed")
        print(f"DINO >> dataset: {CSV_PATH}")
        print("DINO >> waiting for jump and duck events")
        print("DINO >> press Ctrl+C to stop")

        listen(connection, on_message)

    except KeyboardInterrupt:
        print("\nDINO >> stopping collector")

    finally:
        disconnect(connection)
        print("DINO >> disconnected")


if __name__ == "__main__":
    main()