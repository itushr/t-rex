# Chrome Bot Driver Guide

The `driver/` package connects directly to an active Google Chrome instance via the Chrome DevTools Protocol (CDP) WebSocket without requiring Selenium or WebDriver binaries.

## 1. Launching Chrome with Remote Debugging

Launch Chrome with the remote debugging port enabled:

```bash
google-chrome --remote-debugging-port=9222 chrome://dino
```

Or on Linux / macOS:

```bash
chromium-browser --remote-debugging-port=9222 chrome://dino
```

## 2. Recording Gameplay

Run option `[1]` in `main.py` or invoke the driver directly:

```bash
python -m driver.cli
```

- When the game starts, the recorder captures:
  - Nearest two obstacles (`x`, `y`, `type`, `size`).
  - Speed, jumping, and ducking states.
  - Engineered `time_to_impact = obstacle1_x / speed`.
  - Actions (`jump`, `duck`, `none`).
- Saved into `data/gameplay/gameplay_<timestamp>.csv`.

## 3. Autoplay with Trained Models

Run option `[3]` in `main.py`:

- Loads the selected model bundle from `data/models/*.pkl`.
- Feeds live game states into the model at 100Hz.
- Issues jump / duck / none commands via `Runner.instance_.tRex`.
- Records every decision path and saves a replay to `data/playback/*.json`.
