# Architecture Overview

Dino ML is structured into modular layers separating local bot automation, machine learning logic, server orchestration, and browser visualization.

## Directory Structure

```text
dino-ml/
├── backend/
│   ├── driver/     # Python bot that records & plays real chrome-dino game via CDP
│   ├── server/     # FastAPI / WebSocket orchestrator API
│   ├── ml/         # Feature transforms, model training, tree/forest extraction
│   └── data/       # (.gitignored) collected data (gameplay, playback, models)
├── frontend/       # React visualizer & copied dino game, in-browser model autoplay
└── docs/           # Architecture and technical documentation
```

## Modular Backend Design

1. **`backend/driver`**:
   - Standalone Python project with its own `requirements.txt`.
   - Connects to local Chrome via DevTools Protocol (`--remote-debugging-port=9222`).
   - Handles gameplay recording (`watch_script.js`), model autoplay (`play_script.js`), and playback generation.

2. **`backend/server`**:
   - Standalone Python project with its own `requirements.txt`.
   - FastAPI server with REST endpoints (`/api/models`, `/api/playbacks`, `/api/train`) and WebSocket telemetry streaming (`/ws/stream`).
   - Serves the compiled React frontend from `frontend/dist`.

3. **`backend/ml`**:
   - Decoupled ML engine shared by driver and server.
   - Provides adapters for games (`DinoGameAdapter`) and models (`DecisionTreeAdapter`, `RandomForestAdapter`).

4. **`backend/data`**:
   - Central storage directory for raw gameplay CSVs, trained `.pkl` models, and JSON playback sessions.
