from fastapi import APIRouter, HTTPException
from server.services.playback_service import (
    list_playbacks,
    get_playback_meta,
    get_playback_step,
    get_playback_step_tree,
    get_playback_payload,
)

router = APIRouter(prefix="/api/playbacks", tags=["playbacks"])


@router.get("")
def get_playbacks():
    """Returns list of recorded autoplay sessions."""
    return list_playbacks()


@router.get("/{filename}/meta")
def get_meta(filename: str):
    """Returns lightweight playback metadata and summary steps for left sidebar."""
    try:
        return get_playback_meta(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Playback file not found")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{filename}/step/{step_no}")
def get_step(filename: str, step_no: int):
    """Returns data for a specific prediction step."""
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
    """Returns tree visual and active path for a specific step and tree."""
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
    """Returns full raw playback payload."""
    try:
        return get_playback_payload(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Playback file not found")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
