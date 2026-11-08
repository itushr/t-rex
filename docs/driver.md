# Chrome Bot Driver Guide

The `backend/driver` project connects directly to an active Google Chrome instance via the Chrome DevTools Protocol (CDP) WebSocket without requiring Selenium or WebDriver binaries.

## 1. Requirements & Dependencies

The driver is a separate Python project with its own dependencies in `backend/driver/requirements.txt`:

```bash
cd backend/driver
pip install -r requirements.txt
```

## 2. Launching Chrome with Remote Debugging

The driver can automatically launch Chrome or connect to an existing instance:

```bash
google-chrome --remote-debugging-port=9222 --remote-allow-origins=* --user-data-dir=/tmp/dino-ai-chrome
```

## 3. Recording Gameplay (Watch Mode)

Run `python main.py` inside `backend/driver/` and choose option `[1]`:

```bash
cd backend/driver
python main.py
```

- When the game starts, the recorder captures:
  - Nearest two obstacles (`x`, `y`, `type`, `size`).
  - Speed, jumping, and ducking states.
  - Engineered `time_to_impact = obstacle1_x / speed`.
  - Actions (`jump`, `duck`, `none`).
- Saved into `backend/data/gameplay/gameplay_<timestamp>.csv`.

## 4. Autoplay with Trained Models

Run option `[3]` in `backend/driver/main.py`:
- Loads the selected model bundle from `backend/data/models/*.pkl`.
- Feeds live game states into the model at 100Hz.
- Issues jump / duck / none commands via `Runner.getInstance().tRex`.
- Records every decision path and saves a replay to `backend/data/playback/*.json`.
