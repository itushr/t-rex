from pathlib import Path
import subprocess
import time
from typing import Any, Dict, List, Optional
import requests

DEBUG_URL = "http://localhost:9222"
USER_DATA_DIR = "/tmp/dino-ai-chrome"


def launch_chrome_process() -> bool:
    """Spawns a Chrome browser instance with remote debugging enabled."""
    commands = ["google-chrome", "chromium-browser", "chromium"]
    for cmd in commands:
        try:
            subprocess.Popen(
                [
                    cmd,
                    "--remote-debugging-port=9222",
                    "--remote-allow-origins=*",
                    f"--user-data-dir={USER_DATA_DIR}",
                ],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                start_new_session=True,
            )
            return True
        except FileNotFoundError:
            continue
        except Exception:
            break
    return False


def get_debug_tabs() -> Optional[List[Dict[str, Any]]]:
    """Fetches list of active debug tabs from Chrome."""
    try:
        resp = requests.get(f"{DEBUG_URL}/json", timeout=2)
        if resp.status_code == 200:
            return [t for t in resp.json() if t.get("type") == "page"]
    except requests.RequestException:
        pass
    return None


def get_or_create_dino_tab(tabs: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Finds an existing dino tab or opens a new chrome://dino page."""
    for tab in tabs:
        if "chrome://dino" in tab.get("url", ""):
            return tab
    try:
        resp = requests.put(f"{DEBUG_URL}/json/new?chrome://dino", timeout=2)
        if resp.status_code == 200:
            return resp.json()
    except requests.RequestException:
        pass
    return None


def open_dino_tab() -> str:
    """Ensures Chrome is running, opens chrome://dino, and returns WebSocket URL."""
    tabs = get_debug_tabs()
    if tabs is None:
        if not launch_chrome_process():
            raise RuntimeError("Failed to launch Chrome with remote debugging.")
        for _ in range(20):
            time.sleep(0.5)
            tabs = get_debug_tabs()
            if tabs is not None:
                break

    if tabs is None:
        raise RuntimeError("Could not connect to Chrome debugging port 9222.")

    tab = get_or_create_dino_tab(tabs)
    if not tab or "webSocketDebuggerUrl" not in tab:
        raise RuntimeError("Failed to obtain WebSocket debugger URL for chrome://dino.")

    return tab["webSocketDebuggerUrl"]
