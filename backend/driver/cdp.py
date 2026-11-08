import json
from typing import Any
import websocket


class CDPClient:
    """Chrome DevTools Protocol websocket client."""

    def __init__(self, ws_url: str):
        self.ws = websocket.create_connection(ws_url, suppress_origin=True)
        self.message_id = 0

    def evaluate(self, expression: str) -> Any:
        self.message_id += 1
        msg = {
            "id": self.message_id,
            "method": "Runtime.evaluate",
            "params": {
                "expression": expression,
                "returnByValue": True,
            },
        }
        self.ws.send(json.dumps(msg))
        while True:
            raw = self.ws.recv()
            data = json.loads(raw)
            if data.get("id") == self.message_id:
                res = data.get("result", {}).get("result", {})
                return res.get("value")

    def close(self) -> None:
        try:
            self.ws.close()
        except Exception:
            pass
