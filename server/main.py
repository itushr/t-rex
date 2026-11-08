from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from server.routes.models import router as models_router
from server.routes.playbacks import router as playbacks_router
from server.routes.train import router as train_router
from server.routes.ws import router as ws_router

app = FastAPI(title="Dino ML Orchestrator API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(models_router)
app.include_router(playbacks_router)
app.include_router(train_router)
app.include_router(ws_router)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "dino-ml-server"}


# Optional static mounting for compiled frontend dist
frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    from server.config import HOST, PORT
    uvicorn.run("server.main:app", host=HOST, port=PORT, reload=True)
