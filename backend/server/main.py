import logging
import sys
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import DBAPIError, OperationalError, SQLAlchemyError

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from server.database.init_db import init_database
from server.routes.auth import router as auth_router
from server.routes.models import router as models_router
from server.routes.onnx_models import router as onnx_router
from server.routes.playbacks import router as playbacks_router
from server.routes.private_gameplays import router as p_gameplays_router
from server.routes.private_models import router as p_models_router
from server.routes.private_onnx import router as p_onnx_router
from server.routes.private_playbacks import router as p_playbacks_router
from server.routes.train import router as train_router
from server.routes.ws import router as ws_router
from server.routes.games import router as games_router
from server.routes.dashboard import router as dashboard_router

logger = logging.getLogger("server.main")
app = FastAPI(title="Dino ML Orchestrator API", version="2.0.0")


@app.on_event("startup")
def on_startup():
    init_database()


@app.exception_handler(OperationalError)
@app.exception_handler(DBAPIError)
async def handle_db_connectivity(request: Request, exc: Exception):
    logger.error("Database connectivity error on %s: %s", request.url.path, exc)
    return JSONResponse(status_code=503, content={"detail": "Database temporarily unreachable."})


@app.exception_handler(SQLAlchemyError)
async def handle_db_error(request: Request, exc: Exception):
    logger.error("Database error on %s: %s", request.url.path, exc)
    return JSONResponse(status_code=500, content={"detail": "Database error occurred."})


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in [
    auth_router, models_router, onnx_router, playbacks_router,
    p_gameplays_router, p_models_router, p_onnx_router, p_playbacks_router,
    train_router, ws_router, games_router, dashboard_router,
]:
    app.include_router(r)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "dino-ml-server"}


ort_dist = Path(__file__).resolve().parents[2] / "frontend" / "node_modules" / "onnxruntime-web" / "dist"
if ort_dist.exists():
    app.mount("/ort", StaticFiles(directory=str(ort_dist)), name="ort")

frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    from server.config import HOST, PORT
    uvicorn.run("server.main:app", host=HOST, port=PORT, reload=True)
