"""Chrome bot driver: CDP websocket bridge, recording, and autoplay."""

from driver.autoplay import run_autoplay
from driver.browser import open_dino_tab
from driver.cdp import CDPClient
from driver.recorder import record_gameplay

__all__ = ["CDPClient", "open_dino_tab", "record_gameplay", "run_autoplay"]
