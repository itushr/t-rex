from fastapi import APIRouter, HTTPException
from server.services.model_service import (
    list_models,
    get_model_summary,
    get_model_single_tree,
    get_model_graph,
)

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("")
def get_models():
    """Returns list of all trained models and their metadata."""
    return list_models()


@router.get("/{model_name}/info")
def get_info(model_name: str):
    """Returns lightweight model metadata without trees."""
    try:
        return get_model_summary(model_name)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model artifact not found")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{model_name}/tree/{tree_idx}")
def get_single_tree(model_name: str, tree_idx: int):
    """Returns a single tree structure for the specified model and index."""
    try:
        return get_model_single_tree(model_name, tree_idx)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model artifact not found")
    except IndexError:
        raise HTTPException(status_code=404, detail="Tree index out of range")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/{model_name}/graph")
def get_graph(model_name: str):
    """Returns tree/forest structure and splits for the specified model."""
    try:
        return get_model_graph(model_name)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model artifact not found")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
