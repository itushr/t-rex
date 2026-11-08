from fastapi import APIRouter, HTTPException
from server.services.playback_service import list_playbacks, get_playback_payload

router = APIRouter(prefix="/api/playbacks", tags=["playbacks"])


@router.get("")
def get_playbacks():
    """Returns list of recorded autoplay sessions."""
    return list_playbacks()


@router.get("/{filename}")
def get_playback(filename: str):
    """Returns complete prediction records and decision trees for a session."""
    try:
        return get_playback_payload(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Playback file not found")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
