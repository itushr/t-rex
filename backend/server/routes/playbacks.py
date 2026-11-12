from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from server.services.local_playback import create_local_playback
from server.services.playback_service import (
    list_playbacks,
    get_playback_meta,
    get_playback_step,
    get_playback_step_tree,
    get_playback_payload,
)

router = APIRouter(prefix="/api/playbacks", tags=["playbacks"])


class PlaybackStepsRequest(BaseModel):
    steps: List[Dict[str, Any]]


@router.post("/local")
def save_local_playback(req: PlaybackStepsRequest):
    try:
        return create_local_playback(req.steps)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("")
def get_playbacks():
    return list_playbacks()


@router.get("/{filename}/meta")
def get_meta(filename: str):
    try:
        return get_playback_meta(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Playback file not found")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{filename}/step/{step_no}")
def get_step(filename: str, step_no: int):
    try:
        return get_playback_step(filename, step_no)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Playback file not found")
    except IndexError:
        raise HTTPException(status_code=404, detail="Step out of range")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{filename}/step/{step_no}/tree/{tree_no}")
def get_step_tree(filename: str, step_no: int, tree_no: int):
    try:
        return get_playback_step_tree(filename, step_no, tree_no)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Playback file not found")
    except IndexError:
        raise HTTPException(status_code=404, detail="Step or tree out of range")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{filename}")
def get_playback(filename: str):
    try:
        return get_playback_payload(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Playback file not found")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
