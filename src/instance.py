import requests
import subprocess
import time

DEBUG_URL = "http://localhost:9222"


def open_debug_tab():
    try:
        subprocess.Popen(
            [
                "google-chrome",
                "--remote-debugging-port=9222",
                "--user-data-dir=/tmp/dino-ai-chrome",
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        return [True]
    except Exception as error:
        return [False, error]


def get_debug_tabs():
    try:
        response = requests.get(f"{DEBUG_URL}/json", timeout=2)
        response.raise_for_status()

        return [
            target for target in response.json()
            if target.get("type") == "page"
        ]
    except requests.RequestException:
        return None


def get_dino_tab(tabs):
    for tab in tabs:
        if "chrome://dino" in tab.get("url", ""):
            return tab

    try:
        response = requests.put(
            f"{DEBUG_URL}/json/new?chrome://dino",
            timeout=2
        )
        response.raise_for_status()
        return response.json()

    except requests.RequestException:
        return None


def open_dino_debug_tab():
    tabs = get_debug_tabs()

    if tabs is None:
        result = open_debug_tab()

        if not result[0]:
            return None

        # Wait for Chrome to initialize
        for _ in range(20):
            time.sleep(0.5)
            tabs = get_debug_tabs()

            if tabs is not None:
                break

    if tabs is None:
        return None

    return get_dino_tab(tabs)


if __name__ == "__main__":
    dino_debug_tab = open_dino_debug_tab()

    if dino_debug_tab is None:
        print(">>> [ERROR] Failed to open Dino debug")