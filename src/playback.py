import json
import time
from datetime import datetime
from pathlib import Path

from src.decision_graph import extract_forest_data, trace_decision_path, open_in_browser
from src.logger import Logger

BASE_DIR = Path(__file__).resolve().parent.parent
PLAYBACK_DIR = BASE_DIR / "playback"


class PlaybackRecorder:
    """
    Records predictions during autoplay and exports data to playback directory.
    Supports both DecisionTreeClassifier and RandomForestClassifier models.
    """

    def __init__(self, model_name, saved_model):
        self.model_name = model_name
        self.saved = saved_model
        self.model = saved_model["model"]
        self.features = saved_model["features"]
        self.type_features = saved_model["type_features"]
        self.actions = saved_model.get("actions", list(self.model.classes_))
        self.model_type = saved_model.get("model_type") or (
            "random_forest" if hasattr(self.model, "estimators_") else "decision_tree"
        )

        self.records = []
        self.start_wall_time = datetime.now()
        self.start_perf_time = time.time()
        self.crashed = False

        PLAYBACK_DIR.mkdir(parents=True, exist_ok=True)

    def record_step(self, state, raw_features, frame, action, result):
        """
        Records a single decision step made during autoplay.
        """
        elapsed = round(time.time() - self.start_perf_time, 2)
        step_num = len(self.records) + 1

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

        compact_trees = []
        for t in path_info.get("trees", []):
            compact_steps = []
            for s in t.get("steps", []):
                if not s.get("is_leaf"):
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
            compact_trees.append({
                "tree_index": t["tree_index"],
                "predicted_action": t["predicted_action"],
                "node_ids": t["node_ids"],
                "leaf_id": t["leaf_id"],
                "steps": compact_steps,
            })

        speed_val = round(float(raw_features.get("speed", 0)), 2)
        tti_val = raw_features.get("time_to_impact")
        if tti_val is None or float(tti_val) <= 0:
            if obs1["x"] > 0 and speed_val > 0:
                tti_val = round(obs1["x"] / speed_val, 2)
            else:
                tti_val = -1.0
        else:
            tti_val = round(float(tti_val), 2)

        entry = {
            "step": step_num,
            "time": elapsed,
            "speed": speed_val,
            "time_to_impact": tti_val,
            "jumping": bool(raw_features.get("jumping", 0)),
            "ducking": bool(raw_features.get("ducking", 0)),
            "obs1": obs1,
            "obs2": obs2,
            "action": action,
            "executed": executed_action,
            "model_type": path_info.get("model_type", self.model_type),
            "votes": path_info.get("votes", {}),
            "trees": compact_trees,
            "path": path_info.get("node_ids", []),
            "leaf_id": path_info.get("leaf_id", 0),
            "steps": compact_trees[0]["steps"] if compact_trees else [],
        }

        self.records.append(entry)

    def mark_crashed(self, crash_state):
        """
        Marks that the session concluded with a crash.
        """
        self.crashed = True

    def save(self):
        """
        Saves playback JSON data, updates data.js, ensures index.html template exists,
        and opens the viewer in the browser.
        """
        if not self.records:
            return None

        timestamp = self.start_wall_time.strftime("%Y%m%d_%H%M%S")
        duration = round(time.time() - self.start_perf_time, 2)
        total_steps = len(self.records)

        forest_data = extract_forest_data(self.model, self.features, self.actions)

        playback_payload = {
            "model_name": self.model_name,
            "model_type": forest_data["model_type"],
            "n_estimators": forest_data["n_estimators"],
            "recorded_at": self.start_wall_time.strftime("%Y-%m-%d %H:%M:%S"),
            "duration": duration,
            "total_steps": total_steps,
            "crashed": self.crashed,
            "forest": forest_data,
            "tree": forest_data["trees"][0] if forest_data["trees"] else None,
            "records": self.records,
        }

        json_filename = f"playback_{self.model_name}_{timestamp}.json"
        json_path = PLAYBACK_DIR / json_filename
        data_js_path = PLAYBACK_DIR / "data.js"
        index_html_path = PLAYBACK_DIR / "index.html"

        with json_path.open("w", encoding="utf-8") as f:
            json.dump(playback_payload, f)

        with data_js_path.open("w", encoding="utf-8") as f:
            f.write("window.__PLAYBACK_DATA__ = " + json.dumps(playback_payload) + ";\n")

        template_html = get_playback_template_html()
        with index_html_path.open("w", encoding="utf-8") as f:
            f.write(template_html)

        Logger.log(
            indent=1,
            label="PLAYBACK",
            message=f"Recorded {total_steps} predictions ({duration}s)"
        )
        Logger.log(
            indent=1,
            label="PLAYBACK",
            message=f"Saved data: {json_path.name}"
        )

        opened = open_in_browser(index_html_path)
        if opened:
            Logger.log(
                indent=1,
                label="PLAYBACK",
                message="Playback viewer opened in browser"
            )

        return json_path


def get_playback_template_html():
    """
    Returns the un-slopped playback dashboard template HTML.
    Visualizes session predictions and reusable decision tree visualizer.
    Supports single tree and random forest ensemble views with individual tree inspection.
    """
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Autoplay playback</title>
<style>
  :root {
    --bg: #0b0e14;
    --panel-bg: #121721;
    --card-bg: #18202e;
    --border: #243044;
    --border-light: #33435c;
    --text: #f0f4fc;
    --text-dim: #94a3b8;
    --text-muted: #64748b;
    --accent: #38bdf8;
    --jump: #10b981;
    --duck: #f59e0b;
    --none: #64748b;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  header {
    background: var(--panel-bg);
    border-bottom: 1px solid var(--border);
    padding: 10px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 12px;
    z-index: 30;
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }
  .meta-tag {
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 4px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    color: var(--text-dim);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .btn {
    background: var(--card-bg);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.15s, border-color 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .btn:hover {
    background: var(--border);
    border-color: var(--border-light);
  }
  .btn-sm {
    padding: 3px 8px;
    font-size: 11px;
  }
  .btn-active {
    background: var(--accent);
    color: #0b0e14;
    border-color: var(--accent);
    font-weight: 600;
  }
  #workspace {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }
  #table-panel {
    width: 44%;
    min-width: 420px;
    max-width: 620px;
    background: var(--panel-bg);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    z-index: 10;
  }
  .table-toolbar {
    padding: 10px 14px;
    background: var(--panel-bg);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }
  .filter-select, .search-box {
    background: var(--card-bg);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 12px;
    outline: none;
  }
  .filter-select:focus, .search-box:focus {
    border-color: var(--accent);
  }
  .search-box {
    width: 130px;
  }
  .table-scroll-container {
    flex: 1;
    overflow-y: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
  }
  thead {
    position: sticky;
    top: 0;
    background: var(--card-bg);
    border-bottom: 1px solid var(--border);
    z-index: 5;
  }
  th {
    padding: 8px 10px;
    text-align: left;
    font-weight: 600;
    color: var(--text-muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  tbody tr {
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    transition: background 0.1s;
  }
  tbody tr:hover {
    background: rgba(255, 255, 255, 0.04);
  }
  tbody tr.selected {
    background: rgba(56, 189, 248, 0.12) !important;
    border-left: 3px solid var(--accent);
  }
  td {
    padding: 7px 10px;
    white-space: nowrap;
    color: var(--text);
  }
  .action-badge {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 700;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: 0.5px;
  }
  .action-jump {
    background: rgba(16, 185, 129, 0.2);
    color: var(--jump);
    border: 1px solid var(--jump);
  }
  .action-duck {
    background: rgba(245, 158, 11, 0.2);
    color: var(--duck);
    border: 1px solid var(--duck);
  }
  .action-none {
    background: rgba(100, 116, 139, 0.2);
    color: var(--text-dim);
    border: 1px solid var(--border);
  }
  #inspector-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    position: relative;
    background: var(--bg);
  }
  #step-card {
    background: var(--panel-bg);
    border-bottom: 1px solid var(--border);
    padding: 12px 18px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 10;
  }
  .step-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .step-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
  }
  .step-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 12px;
  }
  .metric-item {
    background: var(--card-bg);
    border: 1px solid var(--border);
    padding: 4px 8px;
    border-radius: 4px;
    color: var(--text-dim);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .metric-item strong {
    color: var(--text);
  }
  #forest-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 4px;
    border-top: 1px solid var(--border);
  }
  .forest-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }
  .forest-trees-row {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 4px;
  }
  .forest-tree-card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 6px 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    transition: border-color 0.15s, background 0.15s;
  }
  .forest-tree-card:hover {
    border-color: var(--border-light);
  }
  .forest-tree-card.active {
    border-color: var(--accent);
    background: rgba(56, 189, 248, 0.08);
  }
  .tree-card-name {
    font-size: 11px;
    font-weight: 600;
    color: var(--text);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }
  .path-summary {
    font-size: 12px;
    color: var(--text-dim);
    line-height: 1.4;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  #tree-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    cursor: grab;
  }
  #tree-container:active {
    cursor: grabbing;
  }
  svg {
    width: 100%;
    height: 100%;
  }
  .link {
    fill: none;
    stroke: var(--border);
    stroke-width: 1.5px;
    transition: stroke 0.15s, stroke-width 0.15s;
  }
  .link-highlight {
    stroke: var(--accent) !important;
    stroke-width: 2.5px !important;
  }
  .link-label {
    font-size: 10px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    fill: var(--text-muted);
    font-weight: 600;
  }
  .node-box {
    fill: var(--panel-bg);
    stroke: var(--border);
    stroke-width: 1.5px;
    rx: 4px;
    ry: 4px;
    cursor: pointer;
    transition: stroke 0.15s, fill 0.15s;
  }
  .node-box:hover {
    stroke: var(--border-light);
    fill: var(--card-bg);
  }
  .node-active .node-box {
    stroke: var(--accent) !important;
    stroke-width: 2px !important;
    fill: var(--card-bg);
  }
  .node-id {
    font-size: 10px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    fill: var(--text-muted);
    font-weight: 600;
    pointer-events: none;
  }
  .node-condition {
    font-size: 11px;
    font-weight: 600;
    fill: var(--text);
    pointer-events: none;
  }
  .node-samples {
    font-size: 10px;
    fill: var(--text-dim);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    pointer-events: none;
  }
  .node-pill {
    rx: 3px;
    ry: 3px;
    pointer-events: none;
  }
  .node-pill-jump { fill: rgba(16, 185, 129, 0.2); stroke: var(--jump); stroke-width: 1px; }
  .node-pill-duck { fill: rgba(245, 158, 11, 0.2); stroke: var(--duck); stroke-width: 1px; }
  .node-pill-none { fill: rgba(100, 116, 139, 0.2); stroke: var(--none); stroke-width: 1px; }
  .node-pill-text {
    font-size: 10px;
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: central;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    pointer-events: none;
  }
  .pill-text-jump { fill: var(--jump); }
  .pill-text-duck { fill: var(--duck); }
  .pill-text-none { fill: var(--text-dim); }
  .legend {
    position: absolute;
    bottom: 14px;
    left: 14px;
    background: rgba(17, 20, 28, 0.9);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 8px 12px;
    display: flex;
    gap: 14px;
    font-size: 11px;
    color: var(--text-dim);
    z-index: 10;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .tree-badge-indicator {
    position: absolute;
    top: 14px;
    right: 14px;
    background: rgba(17, 20, 28, 0.9);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 6px 10px;
    font-size: 11px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    color: var(--accent);
    z-index: 10;
  }
</style>
<script src="data.js"></script>
</head>
<body>

<header>
  <div class="brand-group">
    <div class="title">Autoplay playback</div>
    <div class="meta-tag" id="meta-model">Model: (none)</div>
    <div class="meta-tag" id="meta-type">Type: (none)</div>
    <div class="meta-tag" id="meta-steps">Steps: 0</div>
    <div class="meta-tag" id="meta-duration">Duration: 0s</div>
  </div>

  <div class="header-actions">
    <input type="file" id="file-input" accept=".json" style="display:none" onchange="handleFileSelect(event)">
    <button class="btn" onclick="document.getElementById('file-input').click()">Load JSON file</button>
    <button class="btn" id="btn-scrub" onclick="toggleAutoScrub()">Play</button>
    <button class="btn" onclick="prevStep()">Previous</button>
    <button class="btn" onclick="nextStep()">Next</button>
    <button class="btn" onclick="resetZoom()">Reset view</button>
  </div>
</header>

<div id="workspace">
  <div id="table-panel">
    <div class="table-toolbar">
      <div style="display:flex; align-items:center; gap:8px;">
        <label style="font-size:11px; color:var(--text-dim);">Filter:</label>
        <select class="filter-select" id="action-filter" onchange="applyFilters()">
          <option value="all">All actions</option>
          <option value="jump">Jump only</option>
          <option value="duck">Duck only</option>
          <option value="none">None only</option>
          <option value="obstacle">Obstacle within 160px</option>
        </select>
      </div>

      <input type="text" class="search-box" id="search-input" placeholder="Search..." oninput="applyFilters()">
      <span id="filtered-count" style="font-size:11px; color:var(--text-muted); font-family:ui-monospace, monospace;"></span>
    </div>

    <div class="table-scroll-container" id="table-container">
      <table>
        <thead>
          <tr>
            <th style="width:45px;">#</th>
            <th style="width:60px;">Time</th>
            <th style="width:65px;">Action</th>
            <th>Obstacle 1</th>
            <th style="width:55px;">TTI</th>
            <th>Obstacle 2</th>
            <th style="width:50px;">Speed</th>
            <th style="width:65px;">State</th>
          </tr>
        </thead>
        <tbody id="predictions-tbody"></tbody>
      </table>
    </div>
  </div>

  <div id="inspector-panel">
    <div id="step-card">
      <div class="step-top">
        <div class="step-title" id="hud-step-title">Select a row to inspect</div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span id="hud-votes-tag" class="meta-tag" style="display:none;"></span>
          <span class="action-badge action-none" id="hud-action-badge">NONE</span>
        </div>
      </div>

      <div class="step-metrics">
        <div class="metric-item">Obstacle 1: <strong id="hud-obs1">None</strong></div>
        <div class="metric-item">TTI: <strong id="hud-tti">None</strong></div>
        <div class="metric-item">Speed: <strong id="hud-speed">0.0</strong></div>
        <div class="metric-item">State: <strong id="hud-state">Ground</strong></div>
        <div class="metric-item">Obstacle 2: <strong id="hud-obs2">None</strong></div>
      </div>

      <div id="forest-section" style="display:none;">
        <div class="forest-label-row">
          <span>Ensemble estimators</span>
          <span id="forest-active-label" style="color:var(--accent);">Viewing Tree 1</span>
        </div>
        <div class="forest-trees-row" id="forest-trees-row"></div>
      </div>

      <div class="path-summary" id="hud-path">Path: Not selected</div>
    </div>

    <div id="tree-container">
      <div class="tree-badge-indicator" id="tree-badge-indicator">Tree 1</div>

      <svg id="tree-svg">
        <g id="viewport">
          <g id="links-layer"></g>
          <g id="nodes-layer"></g>
        </g>
      </svg>

      <div class="legend">
        <div class="legend-item"><span class="legend-dot" style="background:var(--jump)"></span> Jump</div>
        <div class="legend-item"><span class="legend-dot" style="background:var(--duck)"></span> Duck</div>
        <div class="legend-item"><span class="legend-dot" style="background:var(--none)"></span> None</div>
        <div class="legend-item"><span class="legend-dot" style="background:var(--accent)"></span> Active path</div>
      </div>
    </div>
  </div>
</div>

<script>
let currentPayload = null;
let forestData = null;
let records = [];
let filteredIndices = [];
let currentStepIndex = 0;
let activeTreeIndex = 0;
let isScrubbing = false;
let scrubTimer = null;

const NODE_W = 180;
const NODE_H = 72;
const LEVEL_H = 120;
const SIBLING_GAP = 24;

let scale = 0.85;
let tx = 60;
let ty = 30;
let isPanning = false;
let startX = 0;
let startY = 0;

const viewport = document.getElementById("viewport");
const linksLayer = document.getElementById("links-layer");
const nodesLayer = document.getElementById("nodes-layer");
const treeContainer = document.getElementById("tree-container");
const tbody = document.getElementById("predictions-tbody");

function updateTransform() {
  viewport.setAttribute("transform", `translate(${tx}, ${ty}) scale(${scale})`);
}

treeContainer.addEventListener("mousedown", (e) => {
  if (e.target.closest(".node-group")) return;
  isPanning = true;
  startX = e.clientX - tx;
  startY = e.clientY - ty;
});

window.addEventListener("mousemove", (e) => {
  if (!isPanning) return;
  tx = e.clientX - startX;
  ty = e.clientY - startY;
  updateTransform();
});

window.addEventListener("mouseup", () => {
  isPanning = false;
});

treeContainer.addEventListener("wheel", (e) => {
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  const mouseX = e.clientX - treeContainer.getBoundingClientRect().left;
  const mouseY = e.clientY - treeContainer.getBoundingClientRect().top;
  tx = mouseX - (mouseX - tx) * zoomFactor;
  ty = mouseY - (mouseY - ty) * zoomFactor;
  scale *= zoomFactor;
  updateTransform();
}, { passive: false });

function resetZoom() {
  scale = 0.85;
  tx = 60;
  ty = 30;
  updateTransform();
}

const allNodes = new Map();
const allLinks = [];

function layoutTree(root) {
  let nextX = 40;
  function assignX(node) {
    if (!node) return;
    if (node.is_leaf || (!node.left && !node.right)) {
      node.x = nextX;
      nextX += NODE_W + SIBLING_GAP;
    } else {
      if (node.left) assignX(node.left);
      if (node.right) assignX(node.right);
      const l = node.left ? node.left.x : node.right.x;
      const r = node.right ? node.right.x : node.left.x;
      node.x = (l + r) / 2;
    }
    node.y = 40 + node.depth * LEVEL_H;
  }
  assignX(root);
}

function renderTree(node, parent = null, isLeft = true) {
  if (!node) return;
  allNodes.set(node.id, { node, parent });

  if (parent) {
    const sx = parent.x + NODE_W / 2;
    const sy = parent.y + NODE_H;
    const ex = node.x + NODE_W / 2;
    const ey = node.y;
    const my = (sy + ey) / 2;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M ${sx} ${sy} C ${sx} ${my}, ${ex} ${my}, ${ex} ${ey}`);
    path.setAttribute("class", "link");
    path.id = `link-${parent.id}-${node.id}`;
    linksLayer.appendChild(path);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("class", "link-label");
    label.setAttribute("x", (sx + ex) / 2 + (isLeft ? -14 : 6));
    label.setAttribute("y", my);
    label.textContent = isLeft ? "<=" : ">";
    linksLayer.appendChild(label);

    allLinks.push({ parentId: parent.id, childId: node.id, element: path });
  }

  if (node.left) renderTree(node.left, node, true);
  if (node.right) renderTree(node.right, node, false);

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", "node-group");
  g.setAttribute("id", `node-${node.id}`);
  g.setAttribute("transform", `translate(${node.x}, ${node.y})`);

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("class", "node-box");
  rect.setAttribute("width", NODE_W);
  rect.setAttribute("height", NODE_H);
  g.appendChild(rect);

  const textId = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textId.setAttribute("class", "node-id");
  textId.setAttribute("x", 10);
  textId.setAttribute("y", 16);
  textId.textContent = `#${node.id} ${node.is_leaf ? "LEAF" : ""}`;
  g.appendChild(textId);

  const textCond = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textCond.setAttribute("class", "node-condition");
  textCond.setAttribute("x", 10);
  textCond.setAttribute("y", 34);
  if (node.is_leaf) {
    textCond.textContent = `Action: ${node.prediction.toUpperCase()}`;
    textCond.setAttribute("fill", `var(--${node.prediction})`);
  } else {
    textCond.textContent = node.condition;
  }
  g.appendChild(textCond);

  const textSamples = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textSamples.setAttribute("class", "node-samples");
  textSamples.setAttribute("x", 10);
  textSamples.setAttribute("y", 52);
  textSamples.textContent = `samples: ${node.samples} | gini: ${node.impurity}`;
  g.appendChild(textSamples);

  const pillW = 44;
  const pillH = 18;
  const pillRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  pillRect.setAttribute("class", `node-pill node-pill-${node.prediction}`);
  pillRect.setAttribute("x", NODE_W - pillW - 8);
  pillRect.setAttribute("y", 8);
  pillRect.setAttribute("width", pillW);
  pillRect.setAttribute("height", pillH);
  g.appendChild(pillRect);

  const pillText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  pillText.setAttribute("class", `node-pill-text pill-text-${node.prediction}`);
  pillText.setAttribute("x", NODE_W - pillW / 2 - 8);
  pillText.setAttribute("y", 17);
  pillText.textContent = node.prediction.toUpperCase();
  g.appendChild(pillText);

  nodesLayer.appendChild(g);
}

function loadTreeIntoView(treeIdx, preserveTransform = false) {
  if (!forestData || !forestData.trees || !forestData.trees[treeIdx]) return;
  activeTreeIndex = treeIdx;

  allNodes.clear();
  allLinks.length = 0;
  linksLayer.innerHTML = "";
  nodesLayer.innerHTML = "";

  const tree = forestData.trees[treeIdx];
  layoutTree(tree);
  renderTree(tree);

  if (!preserveTransform) {
    resetZoom();
  } else {
    updateTransform();
  }

  const indicator = document.getElementById("tree-badge-indicator");
  indicator.textContent = forestData.n_estimators > 1 ? `Tree ${treeIdx + 1} of ${forestData.n_estimators}` : "Decision tree";
  const forestActiveLabel = document.getElementById("forest-active-label");
  if (forestActiveLabel) {
    forestActiveLabel.textContent = `Viewing Tree ${treeIdx + 1}`;
  }

  updateTreeCardsActiveState();
  highlightActiveStepTreePath();
}

function renderTableRows() {
  tbody.innerHTML = "";
  const frag = document.createDocumentFragment();

  filteredIndices.forEach((recIdx) => {
    const r = records[recIdx];
    const tr = document.createElement("tr");
    tr.id = `row-${recIdx}`;
    if (recIdx === currentStepIndex) tr.classList.add("selected");

    tr.onclick = () => selectStep(recIdx);

    let obs1Str = "None";
    if (r.obs1 && r.obs1.type !== "none") {
      obs1Str = `${r.obs1.type} (${r.obs1.x.toFixed(1)} px)`;
    }

    let ttiStr = "None";
    if (r.time_to_impact !== undefined && r.time_to_impact > 0) {
      ttiStr = `${r.time_to_impact.toFixed(1)}`;
    }

    let obs2Str = "None";
    if (r.obs2 && r.obs2.type !== "none") {
      obs2Str = `${r.obs2.type} (${r.obs2.x.toFixed(1)} px)`;
    }

    let stateStr = "Ground";
    if (r.jumping) stateStr = "Jumping";
    else if (r.ducking) stateStr = "Ducking";

    tr.innerHTML = `
      <td style="color:var(--text-muted); font-family:ui-monospace, monospace;">${r.step}</td>
      <td style="font-family:ui-monospace, monospace;">${r.time.toFixed(2)}s</td>
      <td><span class="action-badge action-${r.action}">${r.action.toUpperCase()}</span></td>
      <td>${obs1Str}</td>
      <td style="font-family:ui-monospace, monospace; color:var(--text-dim);">${ttiStr}</td>
      <td>${obs2Str}</td>
      <td style="font-family:ui-monospace, monospace;">${r.speed.toFixed(1)}</td>
      <td style="color:var(--text-dim);">${stateStr}</td>
    `;

    frag.appendChild(tr);
  });

  tbody.appendChild(frag);
  document.getElementById("filtered-count").textContent = `${filteredIndices.length} of ${records.length} steps`;
}

function applyFilters() {
  const actionVal = document.getElementById("action-filter").value;
  const searchVal = document.getElementById("search-input").value.trim().toLowerCase();

  filteredIndices = [];
  records.forEach((r, idx) => {
    let matchAction = true;
    if (actionVal === "jump") matchAction = r.action === "jump";
    else if (actionVal === "duck") matchAction = r.action === "duck";
    else if (actionVal === "none") matchAction = r.action === "none";
    else if (actionVal === "obstacle") matchAction = r.obs1 && r.obs1.x >= 0 && r.obs1.x <= 160;

    let matchSearch = true;
    if (searchVal) {
      const stepStr = String(r.step);
      const obsType = r.obs1 ? r.obs1.type.toLowerCase() : "";
      matchSearch = stepStr.includes(searchVal) || obsType.includes(searchVal) || r.action.includes(searchVal);
    }

    if (matchAction && matchSearch) filteredIndices.push(idx);
  });

  renderTableRows();
}

function selectStep(recIdx) {
  if (recIdx < 0 || recIdx >= records.length) return;
  currentStepIndex = recIdx;
  const rec = records[recIdx];

  document.querySelectorAll("#predictions-tbody tr").forEach(tr => tr.classList.remove("selected"));
  const rowElem = document.getElementById(`row-${recIdx}`);
  if (rowElem) {
    rowElem.classList.add("selected");
    rowElem.scrollIntoView({ block: "nearest" });
  }

  // Update HUD
  document.getElementById("hud-step-title").textContent = `Step #${rec.step} (${rec.time.toFixed(2)}s)`;
  const badge = document.getElementById("hud-action-badge");
  badge.textContent = rec.action.toUpperCase();
  badge.className = `action-badge action-${rec.action}`;

  // Votes summary if random forest
  const votesTag = document.getElementById("hud-votes-tag");
  if (rec.votes && Object.keys(rec.votes).length > 0 && forestData && forestData.n_estimators > 1) {
    const voteParts = Object.entries(rec.votes).map(([act, count]) => `${act}: ${count}`);
    votesTag.textContent = `Votes: ${voteParts.join(", ")}`;
    votesTag.style.display = "inline-block";
  } else {
    votesTag.style.display = "none";
  }

  let obs1Text = "None";
  if (rec.obs1 && rec.obs1.type !== "none") {
    obs1Text = `${rec.obs1.type} at ${rec.obs1.x.toFixed(1)} px`;
  }
  document.getElementById("hud-obs1").textContent = obs1Text;

  let ttiText = "None";
  if (rec.time_to_impact !== undefined && rec.time_to_impact > 0) {
    ttiText = `${rec.time_to_impact.toFixed(2)}`;
  }
  document.getElementById("hud-tti").textContent = ttiText;

  let obs2Text = "None";
  if (rec.obs2 && rec.obs2.type !== "none") {
    obs2Text = `${rec.obs2.type} at ${rec.obs2.x.toFixed(1)} px`;
  }
  document.getElementById("hud-obs2").textContent = obs2Text;

  document.getElementById("hud-speed").textContent = rec.speed.toFixed(2);
  document.getElementById("hud-state").textContent = rec.jumping ? "Jumping" : (rec.ducking ? "Ducking" : "Ground");

  updateForestCards(rec);
  highlightActiveStepTreePath();
}

function updateForestCards(rec) {
  const container = document.getElementById("forest-trees-row");
  const section = document.getElementById("forest-section");

  if (!forestData || forestData.n_estimators <= 1 || !rec.trees || rec.trees.length <= 1) {
    section.style.display = "none";
    return;
  }

  section.style.display = "flex";
  container.innerHTML = "";

  rec.trees.forEach((t) => {
    const card = document.createElement("div");
    card.className = "forest-tree-card" + (t.tree_index === activeTreeIndex ? " active" : "");
    card.id = `tree-card-${t.tree_index}`;

    card.innerHTML = `
      <span class="tree-card-name">Tree ${t.tree_index + 1}</span>
      <span class="action-badge action-${t.predicted_action}">${t.predicted_action.toUpperCase()}</span>
      <button class="btn btn-sm ${t.tree_index === activeTreeIndex ? "btn-active" : ""}" onclick="loadTreeIntoView(${t.tree_index}, true)">View tree</button>
    `;

    container.appendChild(card);
  });
}

function updateTreeCardsActiveState() {
  document.querySelectorAll(".forest-tree-card").forEach(c => c.classList.remove("active"));
  document.querySelectorAll(".forest-tree-card .btn").forEach(b => b.classList.remove("btn-active"));
  const activeCard = document.getElementById(`tree-card-${activeTreeIndex}`);
  if (activeCard) {
    activeCard.classList.add("active");
    const btn = activeCard.querySelector(".btn");
    if (btn) btn.classList.add("btn-active");
  }
}

function highlightActiveStepTreePath() {
  if (records.length === 0 || currentStepIndex < 0 || currentStepIndex >= records.length) return;
  const rec = records[currentStepIndex];

  let targetTreeInfo = null;
  if (rec.trees && rec.trees.length > 0) {
    targetTreeInfo = rec.trees.find(t => t.tree_index === activeTreeIndex) || rec.trees[0];
  }

  const nodeIds = targetTreeInfo ? targetTreeInfo.node_ids : (rec.path || []);
  const steps = targetTreeInfo ? targetTreeInfo.steps : (rec.steps || []);

  highlightPath(nodeIds);

  const conditions = [];
  if (steps) {
    steps.forEach(s => {
      if (!s.is_leaf) {
        conditions.push(`${s.feature} ${s.branch} ${s.thresh} (actual: ${s.actual})`);
      }
    });
  }
  const pathStr = nodeIds.length > 0 ? nodeIds.map(id => `#${id}`).join(" -> ") : "None";
  const condStr = conditions.length > 0 ? " | Tests: " + conditions.join(", ") : "";
  document.getElementById("hud-path").textContent = `Path: ${pathStr}${condStr}`;
}

function highlightPath(nodeIds) {
  const activeSet = new Set(nodeIds);

  allNodes.forEach(({ node }) => {
    const el = document.getElementById(`node-${node.id}`);
    if (el) {
      if (activeSet.has(node.id)) {
        el.classList.add("node-active");
      } else {
        el.classList.remove("node-active");
      }
    }
  });

  allLinks.forEach(link => {
    if (activeSet.has(link.parentId) && activeSet.has(link.childId)) {
      link.element.classList.add("link-highlight");
    } else {
      link.element.classList.remove("link-highlight");
    }
  });
}

function prevStep() {
  if (filteredIndices.length === 0) return;
  const currentPos = filteredIndices.indexOf(currentStepIndex);
  if (currentPos > 0) {
    selectStep(filteredIndices[currentPos - 1]);
  }
}

function nextStep() {
  if (filteredIndices.length === 0) return;
  const currentPos = filteredIndices.indexOf(currentStepIndex);
  if (currentPos !== -1 && currentPos < filteredIndices.length - 1) {
    selectStep(filteredIndices[currentPos + 1]);
  } else if (currentPos === -1 && filteredIndices.length > 0) {
    selectStep(filteredIndices[0]);
  }
}

function toggleAutoScrub() {
  const btn = document.getElementById("btn-scrub");
  if (isScrubbing) {
    clearInterval(scrubTimer);
    isScrubbing = false;
    btn.textContent = "Play";
  } else {
    isScrubbing = true;
    btn.textContent = "Pause";
    scrubTimer = setInterval(() => {
      const currentPos = filteredIndices.indexOf(currentStepIndex);
      if (currentPos < filteredIndices.length - 1) {
        selectStep(filteredIndices[currentPos + 1]);
      } else {
        toggleAutoScrub();
      }
    }, 100);
  }
}

window.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") return;
  if (e.key === "ArrowDown" || e.key === "j") {
    e.preventDefault();
    nextStep();
  } else if (e.key === "ArrowUp" || e.key === "k") {
    e.preventDefault();
    prevStep();
  } else if (e.key === " ") {
    e.preventDefault();
    toggleAutoScrub();
  }
});

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      renderSession(data);
    } catch (err) {
      alert("Invalid JSON playback file.");
    }
  };
  reader.readAsText(file);
}

function renderSession(payload) {
  currentPayload = payload;
  records = payload.records || [];
  filteredIndices = records.map((_, i) => i);

  if (payload.forest && payload.forest.trees) {
    forestData = payload.forest;
  } else if (payload.tree) {
    forestData = {
      model_type: payload.model_type || "decision_tree",
      n_estimators: 1,
      trees: [payload.tree],
    };
  } else {
    forestData = null;
  }

  const modelTypeLabel = forestData && forestData.model_type === "random_forest"
    ? `Random forest (${forestData.n_estimators} trees)`
    : "Decision tree";

  document.getElementById("meta-model").textContent = `Model: ${payload.model_name || "(none)"}`;
  document.getElementById("meta-type").textContent = `Type: ${modelTypeLabel}`;
  document.getElementById("meta-steps").textContent = `Steps: ${payload.total_steps || records.length}`;
  document.getElementById("meta-duration").textContent = `Duration: ${payload.duration || 0}s`;

  activeTreeIndex = 0;
  if (forestData && forestData.trees && forestData.trees.length > 0) {
    loadTreeIntoView(0);
  }

  applyFilters();

  if (records.length > 0) {
    selectStep(0);
  }
}

if (window.__PLAYBACK_DATA__) {
  renderSession(window.__PLAYBACK_DATA__);
}
</script>
</body>
</html>
"""
