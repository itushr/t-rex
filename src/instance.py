import requests

CHROME_URL = "http://127.0.0.1:9222"

def get_debug_tabs():
    try:
        response = requests.get(f"{CHROME_URL}/json", timeout=2)
        response.raise_for_status()
        return [
            target
            for target in response.json()
            if target.get("type") == "page"
        ]
    except requests.RequestException:
        return None
    
def get_dino_tabs(tabs):
    return [
        tab for tab in tabs
        if "chrome://dino" in tab.get("url", "")
    ]