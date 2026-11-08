# API and WebSocket Documentation

The FastAPI orchestrator provides endpoints for model retrieval, decision graph hierarchy, playback inspection, and real-time streaming.

## REST Endpoints

### Models

- `GET /api/models`
  - Returns list of all trained models with metadata.
- `GET /api/models/{model_name}/graph`
  - Returns the full tree hierarchy, thresholds, impurity values, and leaf distributions.

### Playbacks

- `GET /api/playbacks`
  - Returns list of recorded autoplay sessions with duration, steps count, and crash status.
- `GET /api/playbacks/{filename}`
  - Returns full session records, step-by-step inputs, and tree traversal paths.

### Training

- `GET /api/gameplays`
  - Returns available human gameplay CSV datasets.
- `POST /api/train`
  - Request body:
    ```json
    {
      "gameplay_name": "gameplay_20261108_025308",
      "game_id": "dino",
      "model_type": "decision_tree"
    }
    ```
  - Trains model, evaluates accuracy, and returns model path.

## WebSocket Streaming

- `WS /ws/stream`
  - Client connection for live step telemetry.
  - Broadcast payload:
    ```json
    {
      "type": "step",
      "data": {
        "step": 42,
        "speed": 8.5,
        "time_to_impact": 15.3,
        "action": "jump",
        "obs1": { "type": "cactusLarge", "x": 130.0 }
      }
    }
    ```
