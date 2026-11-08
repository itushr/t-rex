# Architecture Overview

Dino ML is structured into modular layers to separate local bot automation, machine learning logic, server orchestration, and browser visualization.

## Directory Structure

```text
dino-ml/
├── ml/             # Feature transforms, model training, tree extraction
├── server/         # FastAPI / WebSocket orchestrator
├── frontend/       # React visualizer & copied dino game, inbrowser model autoplay
├── driver/         # Python bot that records & plays real chrome-dino game
├── data/           # (.gitignored) collected data (gameplay, playback, models)
└── docs/           # Architecture and technical documentation
```

## Two-Part System

1. **Local Chrome Bot (Not Hosted)**:
   - Uses local Chrome remote debugging (`--remote-debugging-port=9222`).
   - Python CDP driver injects non-invasive observation/actuation bridges.
   - Collects gameplay samples, executes trained models, and records playback traces.

2. **Web Visualizer & Orchestrator (Hosted / Reusable)**:
   - FastAPI server provides REST APIs and WebSocket telemetry streaming.
   - React visualizer built with Tailwind CSS v4 renders decision trees, forest estimators, and step-by-step decision paths.
   - The same visualizer layer works for local sessions and remote server data.
