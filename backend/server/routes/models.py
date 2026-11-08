from fastapi import APIRouter, HTTPException
from server.services.model_service import list_models, get_model_graph

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("")
def get_models():
    """Returns list of all trained models and their metadata."""
    return list_models()


@router.get("/{model_name}/graph")
def get_graph(model_name: str):
    """Returns tree/forest structure and splits for the specified model."""
    try:
        return get_model_graph(model_name)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model artifact not found")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
