import json
from typing import Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["websocket"])

_ACTIVE_CONNECTIONS: Set[WebSocket] = set()


@router.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """WebSocket connection for real-time live playback and bot telemetry."""
    await websocket.accept()
    _ACTIVE_CONNECTIONS.add(websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            data = json.loads(raw)
            if data.get("type") == "broadcast":
                await broadcast_step(data.get("payload", {}))
    except WebSocketDisconnect:
        _ACTIVE_CONNECTIONS.discard(websocket)
    except Exception:
        _ACTIVE_CONNECTIONS.discard(websocket)


async def broadcast_step(payload: dict) -> None:
    """Broadcasts a live telemetry frame to all connected visualizer clients."""
    if not _ACTIVE_CONNECTIONS:
        return
    message = json.dumps({"type": "step", "data": payload})
    dead = set()
    for ws in _ACTIVE_CONNECTIONS:
        try:
            await ws.send_text(message)
        except Exception:
            dead.add(ws)
    _ACTIVE_CONNECTIONS.difference_update(dead)
