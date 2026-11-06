import json
import time
from datetime import datetime
from pathlib import Path
import pandas as pd

from src.decision_graph import extract_tree_data, trace_decision_path, open_in_browser
from src.logger import Logger

BASE_DIR = Path(__file__).resolve().parent.parent
PLAYBACK_DIR = BASE_DIR / "playback"


class PlaybackRecorder:
    """
    Records every prediction during autoplay and exports a comprehensive
    playback dashboard HTML file to @/playback.
    """

    def __init__(self, model_name, saved_model):
        self.model_name = model_name
        self.saved = saved_model
        self.model = saved_model["model"]
        self.features = saved_model["features"]
        self.type_features = saved_model["type_features"]
        self.actions = saved_model.get("actions", list(self.model.classes_))
        
        self.records = []
        self.start_wall_time = datetime.now()
        self.start_perf_time = time.time()
        self.crashed = False
        self.crash_state = None
        self.crash_step_index = None

        PLAYBACK_DIR.mkdir(parents=True, exist_ok=True)

    def record_step(self, state, raw_features, frame, action, result):
        """
        Records a single decision step made during autoplay.
        """
        elapsed = round(time.time() - self.start_perf_time, 2)
        step_num = len(self.records) + 1

        # Trace the decision tree path for this frame
        path_info = trace_decision_path(
            self.model,
            frame,
            self.features,
            self.actions,
        )

        obs1 = {
            "type": raw_features.get("obstacle1_type", "none"),
            "x": round(float(raw_features.get("obstacle1_x", -1)), 1),
            "y": round(float(raw_features.get("obstacle1_y", -1)), 1),
            "size": int(raw_features.get("obstacle1_size", 0)),
        }
        obs2 = {
            "type": raw_features.get("obstacle2_type", "none"),
            "x": round(float(raw_features.get("obstacle2_x", -1)), 1),
            "y": round(float(raw_features.get("obstacle2_y", -1)), 1),
            "size": int(raw_features.get("obstacle2_size", 0)),
        }

        executed_action = result.get("executed", action) if isinstance(result, dict) else action

        # Compact steps representation for client-side inspector
        compact_steps = []
        for s in path_info["steps"]:
            if not s["is_leaf"]:
                compact_steps.append({
                    "node_id": s["node_id"],
                    "feature": s["feature"],
                    "thresh": s["threshold"],
                    "actual": s["actual_value"],
                    "branch": s["branch_taken"],
                    "ok": s["is_satisfied"],
                    "samples": s["samples"],
                    "pred": s["prediction"],
                })
            else:
                compact_steps.append({
                    "node_id": s["node_id"],
                    "is_leaf": True,
                    "pred": s["prediction"],
                    "dist": s["distribution"],
                    "samples": s["samples"],
                })

        entry = {
            "step": step_num,
            "time": elapsed,
            "speed": round(float(raw_features.get("speed", 0)), 2),
            "jumping": bool(raw_features.get("jumping", 0)),
            "ducking": bool(raw_features.get("ducking", 0)),
            "obs1": obs1,
            "obs2": obs2,
            "action": action,
            "executed": executed_action,
            "path": path_info["node_ids"],
            "leaf_id": path_info["leaf_id"],
            "steps": compact_steps,
            "crashed": False,
        }

        self.records.append(entry)

    def mark_crashed(self, crash_state):
        """
        Marks that the autoplay session concluded with a crash.
        """
        self.crashed = True
        self.crash_state = crash_state
        if self.records:
            self.records[-1]["crashed"] = True
            self.crash_step_index = len(self.records)

    def save(self):
        """
        Builds and saves the interactive playback HTML and JSON file to @/playback,
        then launches the webpage in the browser.
        """
        if not self.records:
            return None

        timestamp = self.start_wall_time.strftime("%Y%m%d_%H%M%S")
        duration = round(time.time() - self.start_perf_time, 2)
        total_steps = len(self.records)

        # Extract complete decision tree hierarchy once
        tree_data = extract_tree_data(self.model, self.features, self.actions)

        playback_payload = {
            "model_name": self.model_name,
            "recorded_at": self.start_wall_time.strftime("%Y-%m-%d %H:%M:%S"),
            "duration": duration,
            "total_steps": total_steps,
            "crashed": self.crashed,
            "crash_step": self.crash_step_index,
            "tree": tree_data,
            "records": self.records,
        }

        html_filename = f"playback_{self.model_name}_{timestamp}.html"
        json_filename = f"playback_{self.model_name}_{timestamp}.json"

        html_path = PLAYBACK_DIR / html_filename
        json_path = PLAYBACK_DIR / json_filename
        latest_html_path = PLAYBACK_DIR / "latest.html"

        # Save JSON
        with json_path.open("w", encoding="utf-8") as f:
            json.dump(playback_payload, f)

        # Generate HTML
        html_content = generate_playback_html(playback_payload)
        with html_path.open("w", encoding="utf-8") as f:
            f.write(html_content)

        # Update latest.html for quick access
        with latest_html_path.open("w", encoding="utf-8") as f:
            f.write(html_content)

        Logger.log(
            indent=1,
            label="PLAYBACK",
            message=f"Recorded {total_steps} predictions ({duration}s)"
        )
        Logger.log(
            indent=1,
            label="PLAYBACK",
            message=f"Saved dashboard: {html_path}"
        )

        opened = open_in_browser(html_path)
        if opened:
            Logger.log(
                indent=1,
                label="PLAYBACK",
                message="Playback dashboard opened in browser"
            )

        return html_path


def generate_playback_html(payload):
    """
    Renders a complete, standalone, interactive playback viewer HTML document.
    Features:
    - Side-by-side or tabbed view of predictions table and interactive decision tree.
    - Each row has an 'Inspect' button.
    - Clicking 'Inspect' highlights the full decision tree path for that row,
      with actual feature values, threshold tests, and leaf action distribution.
    - Filtering by action ('jump', 'duck', 'none'), obstacles near, or search.
    - Previous/Next step navigation and auto-scrubber playback.
    """
    data_json = json.dumps(payload)

    model_name = payload["model_name"]
    duration = payload["duration"]
    total_steps = payload["total_steps"]
    crashed = payload["crashed"]
    crash_step = payload.get("crash_step")

    status_badge = (
        '<span class="badge badge-crash">Crashed</span>'
        if crashed
        else '<span class="badge badge-ok">Completed / Stopped</span>'
    )

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Autoplay Playback // {model_name}</title>
<style>
  :root {{
    --bg: #090d16;
    --panel-bg: #111827;
    --panel-border: #1f293d;
    --card-bg: #172033;
    --card-border: #23314d;
    --text: #f1f5f9;
    --text-dim: #94a3b8;
    --text-muted: #64748b;
    --accent: #38bdf8;
    --accent-glow: rgba(56, 189, 248, 0.4);
    --jump: #10b981;
    --duck: #f59e0b;
    --none: #6366f1;
    --crash: #ef4444;
  }}
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }}

  /* Top Navigation Bar */
  header {{
    background: #0d1322;
    border-bottom: 1px solid var(--panel-border);
    padding: 10px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    z-index: 30;
  }}
  .brand-group {{
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .logo {{
    font-weight: 800;
    font-size: 16px;
    letter-spacing: 0.8px;
    color: var(--accent);
    display: flex;
    align-items: center;
    gap: 6px;
  }}
  .badge {{
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 9999px;
    font-weight: 600;
    text-transform: uppercase;
  }}
  .badge-model {{
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.3);
  }}
  .badge-crash {{
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.4);
  }}
  .badge-ok {{
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.4);
  }}
  .meta-stats {{
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 12px;
    color: var(--text-dim);
  }}
  .meta-stats strong {{ color: var(--text); }}

  .header-actions {{
    display: flex;
    align-items: center;
    gap: 8px;
  }}
  .btn {{
    background: #1e293b;
    border: 1px solid #334155;
    color: var(--text);
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }}
  .btn:hover {{
    background: #334155;
    border-color: #475569;
  }}
  .btn-primary {{
    background: #0284c7;
    border-color: #0369a1;
  }}
  .btn-primary:hover {{ background: #0369a1; }}
  .btn-crash {{
    background: rgba(220, 38, 38, 0.3);
    color: #fca5a5;
    border: 1px solid #ef4444;
  }}
  .btn-crash:hover {{ background: #dc2626; color: #fff; }}

  /* Main Workspace Split Layout */
  #workspace {{
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }}

  /* Left Panel: Table of Predictions */
  #table-panel {{
    width: 48%;
    min-width: 420px;
    max-width: 650px;
    background: var(--panel-bg);
    border-right: 1px solid var(--panel-border);
    display: flex;
    flex-direction: column;
    z-index: 10;
  }}
  .table-toolbar {{
    padding: 10px 14px;
    background: #0d1322;
    border-bottom: 1px solid var(--panel-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }}
  .filter-select, .search-box {{
    background: #172033;
    border: 1px solid #23314d;
    color: var(--text);
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 12px;
    outline: none;
  }}
  .search-box {{
    width: 140px;
  }}
  .search-box:focus, .filter-select:focus {{
    border-color: var(--accent);
  }}

  .table-scroll-container {{
    flex: 1;
    overflow-y: auto;
    position: relative;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }}
  thead {{
    position: sticky;
    top: 0;
    background: #131b2e;
    z-index: 5;
    box-shadow: 0 1px 0 var(--panel-border);
  }}
  th {{
    text-align: left;
    padding: 8px 10px;
    color: var(--text-dim);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  td {{
    padding: 7px 10px;
    border-bottom: 1px solid rgba(31, 41, 61, 0.6);
    vertical-align: middle;
  }}
  tbody tr {{
    cursor: pointer;
    transition: background 0.1s;
  }}
  tbody tr:hover {{
    background: rgba(30, 41, 59, 0.6);
  }}
  tbody tr.selected {{
    background: rgba(56, 189, 248, 0.12) !important;
    border-left: 3px solid var(--accent);
  }}
  tbody tr.tr-crash {{
    background: rgba(239, 68, 68, 0.15) !important;
    border-left: 3px solid var(--crash);
  }}

  .action-badge {{
    display: inline-block;
    padding: 2px 7px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    text-align: center;
  }}
  .action-jump {{
    background: rgba(16, 185, 129, 0.2);
    color: var(--jump);
    border: 1px solid rgba(16, 185, 129, 0.4);
  }}
  .action-duck {{
    background: rgba(245, 158, 11, 0.2);
    color: var(--duck);
    border: 1px solid rgba(245, 158, 11, 0.4);
  }}
  .action-none {{
    background: rgba(99, 102, 241, 0.2);
    color: var(--none);
    border: 1px solid rgba(99, 102, 241, 0.4);
  }}

  .btn-inspect {{
    background: #1e293b;
    border: 1px solid #334155;
    color: #38bdf8;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }}
  .btn-inspect:hover, tbody tr.selected .btn-inspect {{
    background: #0284c7;
    border-color: #38bdf8;
    color: #fff;
    box-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
  }}

  /* Right Panel: Decision Tree Graph & Inspector */
  #inspector-panel {{
    flex: 1;
    display: flex;
    flex-direction: column;
    background: radial-gradient(circle at center, #111a2e 0%, #070a12 100%);
    position: relative;
    overflow: hidden;
  }}

  /* Inspector HUD Header */
  #inspector-hud {{
    background: #0d1322;
    border-bottom: 1px solid var(--panel-border);
    padding: 10px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 15;
  }}
  .hud-top {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }}
  .hud-title-group {{
    display: flex;
    align-items: center;
    gap: 10px;
  }}
  .hud-step-title {{
    font-size: 14px;
    font-weight: 700;
    color: var(--accent);
  }}
  .hud-metrics {{
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
  }}
  .hud-metric-pill {{
    background: #172033;
    border: 1px solid #23314d;
    padding: 2px 8px;
    border-radius: 4px;
  }}
  .hud-metric-pill span {{ color: var(--text-dim); }}
  .hud-metric-pill strong {{ color: var(--text); }}

  .hud-nav-buttons {{
    display: flex;
    align-items: center;
    gap: 5px;
  }}

  /* Traversal Breadcrumbs */
  #traversal-bar {{
    display: flex;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
    padding-bottom: 2px;
    font-size: 11px;
  }}
  .traversal-step {{
    background: #172033;
    border: 1px solid #2b3b5c;
    padding: 3px 8px;
    border-radius: 4px;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 4px;
  }}
  .traversal-step.step-leaf {{
    border-color: var(--accent);
    background: rgba(56, 189, 248, 0.15);
    font-weight: 700;
  }}
  .traversal-step.step-leaf-jump {{ border-color: var(--jump); color: var(--jump); }}
  .traversal-step.step-leaf-duck {{ border-color: var(--duck); color: var(--duck); }}
  .traversal-step.step-leaf-none {{ border-color: var(--none); color: var(--none); }}
  .traversal-arrow {{
    color: #475569;
    font-size: 9px;
  }}

  /* SVG Canvas */
  #tree-container {{
    flex: 1;
    position: relative;
    overflow: hidden;
    cursor: grab;
  }}
  #tree-container:active {{
    cursor: grabbing;
  }}
  svg {{
    width: 100%;
    height: 100%;
  }}
  .link {{
    fill: none;
    stroke: #25334e;
    stroke-width: 1.5px;
    transition: stroke 0.2s, stroke-width 0.2s;
  }}
  .link-highlight {{
    stroke: var(--accent) !important;
    stroke-width: 3.5px !important;
    stroke-dasharray: 6 3;
    animation: dash 1s linear infinite;
  }}
  .link-crash {{
    stroke: var(--crash) !important;
    stroke-width: 3.5px !important;
    stroke-dasharray: 6 3;
    animation: dash 1s linear infinite;
  }}
  @keyframes dash {{
    to {{ stroke-dashoffset: -18; }}
  }}
  .link-label {{
    font-size: 10px;
    fill: #64748b;
    font-weight: 600;
    text-anchor: middle;
  }}
  .link-label-active {{
    fill: #bae6fd !important;
    font-weight: 700 !important;
    font-size: 11px !important;
  }}

  .node-group {{
    cursor: pointer;
  }}
  .node-box {{
    rx: 8px;
    ry: 8px;
    fill: #141c2e;
    stroke: #243452;
    stroke-width: 1.5px;
    transition: all 0.2s;
  }}
  .node-group:hover .node-box {{
    stroke: var(--accent);
    filter: drop-shadow(0 0 6px var(--accent-glow));
  }}
  .node-active .node-box {{
    stroke: var(--accent) !important;
    stroke-width: 2.5px !important;
    filter: drop-shadow(0 0 10px var(--accent-glow));
  }}
  .node-crash-active .node-box {{
    stroke: var(--crash) !important;
    stroke-width: 3px !important;
    filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.7));
  }}

  .node-id {{
    font-size: 10px;
    fill: #64748b;
    font-family: monospace;
  }}
  .node-condition {{
    font-size: 12px;
    font-weight: 600;
    fill: #f8fafc;
  }}
  .node-val-badge {{
    font-size: 10px;
    font-weight: 700;
    fill: #7dd3fc;
  }}
  .node-samples {{
    font-size: 10px;
    fill: #94a3b8;
  }}

  .node-action-pill {{
    rx: 4px;
    ry: 4px;
  }}
  .node-action-pill-jump {{ fill: rgba(16, 185, 129, 0.25); stroke: var(--jump); }}
  .node-action-pill-duck {{ fill: rgba(245, 158, 11, 0.25); stroke: var(--duck); }}
  .node-action-pill-none {{ fill: rgba(99, 102, 241, 0.25); stroke: var(--none); }}
  .node-action-text {{
    font-size: 10px;
    font-weight: 700;
    text-anchor: middle;
  }}
  .action-text-jump {{ fill: var(--jump); }}
  .action-text-duck {{ fill: var(--duck); }}
  .action-text-none {{ fill: var(--none); }}

  /* Node Details Drawer */
  #details-drawer {{
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 310px;
    max-height: calc(100% - 130px);
    overflow-y: auto;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 14px;
    display: none;
    flex-direction: column;
    gap: 10px;
    z-index: 25;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  }}
  .drawer-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #334155;
    padding-bottom: 6px;
  }}
  .drawer-title {{
    font-size: 13px;
    font-weight: 700;
    color: var(--accent);
  }}
  .drawer-close {{
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    font-size: 16px;
  }}
  .drawer-row {{
    display: flex;
    justify-content: space-between;
    font-size: 12px;
  }}
  .drawer-row span {{ color: #94a3b8; }}
  .drawer-row strong {{ color: #f8fafc; }}

  .dist-bar {{
    height: 6px;
    border-radius: 3px;
    display: flex;
    overflow: hidden;
    background: #334155;
    margin-top: 4px;
  }}
  .dist-segment {{ height: 100%; }}
</style>
</head>
<body>

<header>
  <div class="brand-group">
    <div class="logo">🦖 T-REX // AUTOPLAY PLAYBACK & INSPECTOR</div>
    <span class="badge badge-model">{model_name}</span>
    {status_badge}
  </div>

  <div class="meta-stats">
    <div>Steps: <strong>{total_steps}</strong></div>
    <div>Duration: <strong>{duration}s</strong></div>
  </div>

  <div class="header-actions">
    {f'<button class="btn btn-crash" onclick="jumpToCrash()">💥 Go to Crash (Step #{crash_step})</button>' if crashed and crash_step else ''}
    <button class="btn" id="btn-scrub" onclick="toggleAutoScrub()">▶ Auto Scrub</button>
    <button class="btn" onclick="focusCurrentPath()">🎯 Focus Path</button>
    <button class="btn" onclick="resetZoom()">Fit Tree</button>
  </div>
</header>

<div id="workspace">
  <!-- Left Panel: Predictions Table -->
  <div id="table-panel">
    <div class="table-toolbar">
      <div style="display:flex; align-items:center; gap:8px;">
        <label style="font-size:11px; color:var(--text-dim);">Filter:</label>
        <select class="filter-select" id="action-filter" onchange="applyFilters()">
          <option value="all">All Actions</option>
          <option value="jump">Jumps Only</option>
          <option value="duck">Ducks Only</option>
          <option value="none">None Only</option>
          <option value="obstacle">Obstacle &lt; 160px</option>
        </select>
      </div>

      <input type="text" class="search-box" id="search-input" placeholder="Search..." oninput="applyFilters()">
      <span id="filtered-count" style="font-size:11px; color:var(--text-muted);"></span>
    </div>

    <div class="table-scroll-container" id="table-container">
      <table>
        <thead>
          <tr>
            <th style="width:45px;">#</th>
            <th style="width:55px;">Time</th>
            <th style="width:70px;">Action</th>
            <th>Obstacle 1</th>
            <th style="width:50px;">Speed</th>
            <th style="width:65px;">State</th>
            <th style="width:75px; text-align:center;">Decision</th>
          </tr>
        </thead>
        <tbody id="predictions-tbody"></tbody>
      </table>
    </div>
  </div>

  <!-- Right Panel: Decision Tree Graph & Inspector -->
  <div id="inspector-panel">
    <div id="inspector-hud">
      <div class="hud-top">
        <div class="hud-title-group">
          <div class="hud-step-title" id="hud-step-text">Step #1 Inspection</div>
          <span class="action-badge" id="hud-action-badge">NONE</span>
        </div>

        <div class="hud-metrics">
          <div class="hud-metric-pill"><span>Obs:</span> <strong id="hud-obs-text">—</strong></div>
          <div class="hud-metric-pill"><span>Speed:</span> <strong id="hud-speed-text">0.0</strong></div>
          <div class="hud-metric-pill"><span>Dino:</span> <strong id="hud-dino-text">Ground</strong></div>
        </div>

        <div class="hud-nav-buttons">
          <button class="btn" onclick="prevStep()">◀ Prev</button>
          <button class="btn" onclick="nextStep()">Next ▶</button>
          <button class="btn" onclick="zoomIn()">+</button>
          <button class="btn" onclick="zoomOut()">-</button>
        </div>
      </div>

      <!-- Decision Traversal Path Bar -->
      <div id="traversal-bar"></div>
    </div>

    <!-- Tree SVG Container -->
    <div id="tree-container">
      <svg id="tree-svg">
        <g id="viewport">
          <g id="links-layer"></g>
          <g id="nodes-layer"></g>
        </g>
      </svg>

      <div id="details-drawer">
        <div class="drawer-header">
          <div class="drawer-title" id="drawer-node-title">Node Details</div>
          <button class="drawer-close" onclick="closeDrawer()">&times;</button>
        </div>
        <div id="drawer-content"></div>
      </div>
    </div>
  </div>
</div>

<script>
const payload = {data_json};
const records = payload.records;
const rawTree = payload.tree;

let currentStepIndex = 0;
let filteredIndices = records.map((_, i) => i);
let isScrubbing = false;
let scrubTimer = null;

// Node dimension constants
const NODE_W = 180;
const NODE_H = 75;
const LEVEL_H = 130;
const SIBLING_GAP = 30;

// Hierarchical layout
function layoutTree(root) {{
  let nextX = 40;
  function assignX(node) {{
    if (!node) return;
    if (node.is_leaf || (!node.left && !node.right)) {{
      node.x = nextX;
      nextX += NODE_W + SIBLING_GAP;
    }} else {{
      if (node.left) assignX(node.left);
      if (node.right) assignX(node.right);
      const l = node.left ? node.left.x : node.right.x;
      const r = node.right ? node.right.x : node.left.x;
      node.x = (l + r) / 2;
    }}
    node.y = 50 + node.depth * LEVEL_H;
  }}
  assignX(root);
}}
layoutTree(rawTree);

// SVG Pan & Zoom
let scale = 0.85;
let tx = 80;
let ty = 30;
let isPanning = false;
let startX = 0;
let startY = 0;

const svg = document.getElementById("tree-svg");
const viewport = document.getElementById("viewport");
const linksLayer = document.getElementById("links-layer");
const nodesLayer = document.getElementById("nodes-layer");
const treeContainer = document.getElementById("tree-container");

function updateTransform() {{
  viewport.setAttribute("transform", `translate(${{tx}}, ${{ty}}) scale(${{scale}})`);
}}

treeContainer.addEventListener("mousedown", (e) => {{
  if (e.target.closest(".node-group")) return;
  isPanning = true;
  startX = e.clientX - tx;
  startY = e.clientY - ty;
}});

window.addEventListener("mousemove", (e) => {{
  if (!isPanning) return;
  tx = e.clientX - startX;
  ty = e.clientY - startY;
  updateTransform();
}});

window.addEventListener("mouseup", () => {{
  isPanning = false;
}});

treeContainer.addEventListener("wheel", (e) => {{
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  const mouseX = e.clientX - treeContainer.getBoundingClientRect().left;
  const mouseY = e.clientY - treeContainer.getBoundingClientRect().top;
  tx = mouseX - (mouseX - tx) * zoomFactor;
  ty = mouseY - (mouseY - ty) * zoomFactor;
  scale *= zoomFactor;
  updateTransform();
}}, {{ passive: false }});

function zoomIn() {{ scale *= 1.25; updateTransform(); }}
function zoomOut() {{ scale *= 0.8; updateTransform(); }}
function resetZoom() {{ scale = 0.8; tx = 60; ty = 30; updateTransform(); }}

// Store map of SVG node elements & links for quick styling updates
const nodeElements = {{}};
const linkElements = {{}};

function buildTreeDOM(node) {{
  if (!node) return;

  if (node.left) {{
    buildLinkDOM(node, node.left, true);
    buildTreeDOM(node.left);
  }}
  if (node.right) {{
    buildLinkDOM(node, node.right, false);
    buildTreeDOM(node.right);
  }}

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", `node-group node-leaf-${{node.prediction}}`);
  g.setAttribute("transform", `translate(${{node.x}}, ${{node.y}})`);
  g.onclick = () => selectNodeDetails(node);

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("class", "node-box");
  rect.setAttribute("width", NODE_W);
  rect.setAttribute("height", NODE_H);
  g.appendChild(rect);

  const textId = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textId.setAttribute("class", "node-id");
  textId.setAttribute("x", 10);
  textId.setAttribute("y", 18);
  textId.textContent = `#${{node.id}} ${{node.is_leaf ? "LEAF" : ""}}`;
  g.appendChild(textId);

  const textCond = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textCond.setAttribute("class", "node-condition");
  textCond.setAttribute("x", 10);
  textCond.setAttribute("y", 36);
  textCond.textContent = node.is_leaf ? `Action: ${{node.prediction.toUpperCase()}}` : node.condition;
  g.appendChild(textCond);

  const textVal = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textVal.setAttribute("class", "node-val-badge");
  textVal.setAttribute("x", 10);
  textVal.setAttribute("y", 52);
  g.appendChild(textVal);

  const pillW = 46;
  const pillH = 18;
  const pillRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  pillRect.setAttribute("class", `node-action-pill node-action-pill-${{node.prediction}}`);
  pillRect.setAttribute("x", NODE_W - pillW - 8);
  pillRect.setAttribute("y", 8);
  pillRect.setAttribute("width", pillW);
  pillRect.setAttribute("height", pillH);
  g.appendChild(pillRect);

  const pillText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  pillText.setAttribute("class", `node-action-text action-text-${{node.prediction}}`);
  pillText.setAttribute("x", NODE_W - pillW/2 - 8);
  pillText.setAttribute("y", 20);
  pillText.textContent = node.prediction.toUpperCase();
  g.appendChild(pillText);

  nodesLayer.appendChild(g);

  nodeElements[node.id] = {{ g, rect, textVal, textCond, data: node }};
}}

function buildLinkDOM(parent, child, isLeft) {{
  const x1 = parent.x + NODE_W / 2;
  const y1 = parent.y + NODE_H;
  const x2 = child.x + NODE_W / 2;
  const y2 = child.y;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const cy = (y1 + y2) / 2;
  path.setAttribute("d", `M ${{x1}} ${{y1}} C ${{x1}} ${{cy}}, ${{x2}} ${{cy}}, ${{x2}} ${{y2}}`);
  path.setAttribute("class", "link");
  linksLayer.appendChild(path);

  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("class", "link-label");
  label.setAttribute("x", (x1 + x2) / 2 + (isLeft ? -12 : 12));
  label.setAttribute("y", cy - 4);
  label.textContent = isLeft ? "<=" : ">";
  linksLayer.appendChild(label);

  const key = `${{parent.id}}->${{child.id}}`;
  linkElements[key] = {{ path, label }};
}}

buildTreeDOM(rawTree);
updateTransform();

// Render Predictions Table
const tbody = document.getElementById("predictions-tbody");

function renderTableRows() {{
  tbody.innerHTML = "";
  const frag = document.createDocumentFragment();

  filteredIndices.forEach((recIdx) => {{
    const r = records[recIdx];
    const tr = document.createElement("tr");
    tr.id = `row-${{recIdx}}`;
    if (recIdx === currentStepIndex) tr.classList.add("selected");
    if (r.crashed) tr.classList.add("tr-crash");

    tr.onclick = (e) => {{
      inspectRecord(recIdx);
    }};

    let obsStr = "—";
    if (r.obs1 && r.obs1.type !== "none") {{
      obsStr = `${{r.obs1.type}} (${{r.obs1.x.toFixed(1)}}px)`;
    }}

    let stateStr = "Ground";
    if (r.jumping) stateStr = "Jumping";
    else if (r.ducking) stateStr = "Ducking";

    tr.innerHTML = `
      <td style="color:var(--text-muted); font-family:monospace;">${{r.step}}</td>
      <td>${{r.time.toFixed(2)}}s</td>
      <td><span class="action-badge action-${{r.action}}">${{r.action.toUpperCase()}}</span></td>
      <td>${{obsStr}}</td>
      <td>${{r.speed.toFixed(1)}}</td>
      <td style="color:var(--text-dim);">${{stateStr}}</td>
      <td style="text-align:center;">
        <button class="btn-inspect" onclick="event.stopPropagation(); inspectRecord(${{recIdx}})">Inspect</button>
      </td>
    `;

    frag.appendChild(tr);
  }});

  tbody.appendChild(frag);
  document.getElementById("filtered-count").textContent = `${{filteredIndices.length}} of ${{records.length}} rows`;
}}

// Filter and Search logic
function applyFilters() {{
  const actionVal = document.getElementById("action-filter").value;
  const searchVal = document.getElementById("search-input").value.trim().toLowerCase();

  filteredIndices = [];
  for (let i = 0; i < records.length; i++) {{
    const r = records[i];
    let matchAction = true;
    if (actionVal === "jump") matchAction = r.action === "jump";
    else if (actionVal === "duck") matchAction = r.action === "duck";
    else if (actionVal === "none") matchAction = r.action === "none";
    else if (actionVal === "obstacle") matchAction = (r.obs1 && r.obs1.type !== "none" && r.obs1.x <= 160 && r.obs1.x >= 0);

    let matchSearch = true;
    if (searchVal) {{
      const obsType = (r.obs1 && r.obs1.type) || "";
      matchSearch = String(r.step).includes(searchVal) ||
                    r.action.includes(searchVal) ||
                    obsType.toLowerCase().includes(searchVal);
    }}

    if (matchAction && matchSearch) {{
      filteredIndices.push(i);
    }}
  }}

  renderTableRows();
}}

// Inspect specific record & update Decision Tree highlight
function inspectRecord(recIdx, scrollTable = true) {{
  if (recIdx < 0 || recIdx >= records.length) return;

  // Update table row styling
  const oldRow = document.getElementById(`row-${{currentStepIndex}}`);
  if (oldRow) oldRow.classList.remove("selected");

  currentStepIndex = recIdx;
  const newRow = document.getElementById(`row-${{currentStepIndex}}`);
  if (newRow) {{
    newRow.classList.add("selected");
    if (scrollTable) {{
      newRow.scrollIntoView({{ block: "nearest", behavior: "smooth" }});
    }}
  }}

  const rec = records[recIdx];
  const isCrashStep = rec.crashed;

  // Update HUD
  document.getElementById("hud-step-text").textContent = `Step #${{rec.step}} @ ${{rec.time.toFixed(2)}}s`;
  const badge = document.getElementById("hud-action-badge");
  badge.className = `action-badge action-${{rec.action}}`;
  badge.textContent = rec.action.toUpperCase();

  let obsText = "None";
  if (rec.obs1 && rec.obs1.type !== "none") {{
    obsText = `${{rec.obs1.type}} @ ${{rec.obs1.x.toFixed(1)}}px`;
  }}
  document.getElementById("hud-obs-text").textContent = obsText;
  document.getElementById("hud-speed-text").textContent = rec.speed.toFixed(1);
  document.getElementById("hud-dino-text").textContent = rec.jumping ? "Jumping" : (rec.ducking ? "Ducking" : "Ground");

  // Build Traversal Steps Map & Bar
  const stepMap = {{}};
  const traversalBar = document.getElementById("traversal-bar");
  traversalBar.innerHTML = "";

  rec.steps.forEach((s, idx) => {{
    stepMap[s.node_id] = s;

    const div = document.createElement("div");
    if (s.is_leaf) {{
      div.className = `traversal-step step-leaf step-leaf-${{s.pred}}`;
      div.textContent = `Leaf #${{s.node_id}}: ${{s.pred.toUpperCase()}}`;
    }} else {{
      div.className = "traversal-step";
      div.innerHTML = `<strong>#${{s.node_id}}</strong> ${{s.feature}} = <em>${{s.actual}}</em> <span style="color:#38bdf8;">${{s.branch}}</span>`;
    }}
    traversalBar.appendChild(div);

    if (idx < rec.steps.length - 1) {{
      const arr = document.createElement("span");
      arr.className = "traversal-arrow";
      arr.textContent = "➔";
      traversalBar.appendChild(arr);
    }}
  }});

  // Update Tree SVG highlighting
  const activeNodeIds = new Set(rec.path);

  Object.keys(nodeElements).forEach(idStr => {{
    const id = Number(idStr);
    const elem = nodeElements[id];
    const inPath = activeNodeIds.has(id);
    const stepData = stepMap[id];

    elem.g.classList.remove("node-active", "node-crash-active");

    if (inPath) {{
      elem.g.classList.add(isCrashStep ? "node-crash-active" : "node-active");
      if (stepData) {{
        if (!stepData.is_leaf) {{
          elem.textVal.textContent = `Actual: ${{stepData.actual}} (${{stepData.branch}})`;
        }} else {{
          elem.textVal.textContent = `PREDICTED: ${{stepData.pred.toUpperCase()}}`;
        }}
      }}
    }} else {{
      elem.textVal.textContent = `samples: ${{elem.data.samples}}`;
    }}
  }});

  // Update Links highlighting
  Object.keys(linkElements).forEach(key => {{
    const [pStr, cStr] = key.split("->");
    const p = Number(pStr);
    const c = Number(cStr);
    const link = linkElements[key];

    const inPath = activeNodeIds.has(p) && activeNodeIds.has(c);
    link.path.classList.remove("link-highlight", "link-crash");
    link.label.classList.remove("link-label-active");

    if (inPath) {{
      link.path.classList.add(isCrashStep ? "link-crash" : "link-highlight");
      link.label.classList.add("link-label-active");
    }}
  }});
}}

function focusCurrentPath() {{
  const rec = records[currentStepIndex];
  if (!rec) return;
  const leafElem = nodeElements[rec.leaf_id];
  if (leafElem) {{
    const rect = treeContainer.getBoundingClientRect();
    scale = 1.0;
    tx = rect.width / 2 - leafElem.data.x - NODE_W / 2;
    ty = rect.height / 2 - leafElem.data.y - NODE_H / 2;
    updateTransform();
  }}
}}

function prevStep() {{
  const curPos = filteredIndices.indexOf(currentStepIndex);
  if (curPos > 0) {{
    inspectRecord(filteredIndices[curPos - 1]);
  }}
}}

function nextStep() {{
  const curPos = filteredIndices.indexOf(currentStepIndex);
  if (curPos !== -1 && curPos < filteredIndices.length - 1) {{
    inspectRecord(filteredIndices[curPos + 1]);
  }}
}}

function jumpToCrash() {{
  const crashIdx = records.findIndex(r => r.crashed);
  if (crashIdx !== -1) {{
    inspectRecord(crashIdx);
    focusCurrentPath();
  }}
}}

function toggleAutoScrub() {{
  const btn = document.getElementById("btn-scrub");
  if (isScrubbing) {{
    clearInterval(scrubTimer);
    isScrubbing = false;
    btn.textContent = "▶ Auto Scrub";
  }} else {{
    isScrubbing = true;
    btn.textContent = "⏸ Pause Scrub";
    scrubTimer = setInterval(() => {{
      const curPos = filteredIndices.indexOf(currentStepIndex);
      if (curPos !== -1 && curPos < filteredIndices.length - 1) {{
        inspectRecord(filteredIndices[curPos + 1]);
      }} else {{
        toggleAutoScrub();
      }}
    }}, 120);
  }}
}}

// Keyboard Navigation
window.addEventListener("keydown", (e) => {{
  if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
  if (e.key === "ArrowDown" || e.key === "ArrowRight") {{
    e.preventDefault();
    nextStep();
  }} else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {{
    e.preventDefault();
    prevStep();
  }} else if (e.key === " ") {{
    e.preventDefault();
    toggleAutoScrub();
  }}
}});

// Node Details Drawer
function selectNodeDetails(node) {{
  const drawer = document.getElementById("details-drawer");
  const title = document.getElementById("drawer-node-title");
  const content = document.getElementById("drawer-content");

  title.textContent = `Node #${{node.id}} (${{node.is_leaf ? "Leaf" : "Decision"}})`;

  const distJump = node.distribution.jump || 0;
  const distDuck = node.distribution.duck || 0;
  const distNone = node.distribution.none || 0;

  content.innerHTML = `
    <div class="drawer-row"><span>Type:</span><strong>${{node.is_leaf ? "Leaf Node" : "Split Node"}}</strong></div>
    <div class="drawer-row"><span>Condition:</span><strong>${{node.condition}}</strong></div>
    <div class="drawer-row"><span>Samples in Train:</span><strong>${{node.samples}}</strong></div>
    <div class="drawer-row"><span>Gini Impurity:</span><strong>${{node.impurity}}</strong></div>
    <div class="drawer-row"><span>Majority Class:</span><strong style="color:var(--${{node.prediction}})">${{node.prediction.toUpperCase()}}</strong></div>
    
    <div style="margin-top:10px;">
      <div style="font-size:12px; color:#94a3b8; margin-bottom:4px;">Training Action Distribution:</div>
      <div class="dist-bar">
        <div class="dist-segment" style="width:${{distJump}}%; background:var(--jump)"></div>
        <div class="dist-segment" style="width:${{distDuck}}%; background:var(--duck)"></div>
        <div class="dist-segment" style="width:${{distNone}}%; background:var(--none)"></div>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:11px; margin-top:4px;">
        <span style="color:var(--jump)">Jump: ${{distJump}}%</span>
        <span style="color:var(--duck)">Duck: ${{distDuck}}%</span>
        <span style="color:var(--none)">None: ${{distNone}}%</span>
      </div>
    </div>
  `;

  drawer.style.display = "flex";
}}

function closeDrawer() {{
  document.getElementById("details-drawer").style.display = "none";
}}

// Initialize
renderTableRows();
if (records.length > 0) {{
  const initialIdx = payload.crashed && payload.crash_step ? payload.crash_step - 1 : 0;
  inspectRecord(initialIdx);
  setTimeout(focusCurrentPath, 350);
}}
</script>
</body>
</html>
"""
    return html
