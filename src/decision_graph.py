import json
import os
import subprocess
import webbrowser
from pathlib import Path
import numpy as np
import pandas as pd
import requests

from src.logger import Logger

BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG_URL = "http://localhost:9222"


def extract_tree_data(model, feature_names, class_names=None):
    """
    Extracts scikit-learn DecisionTreeClassifier tree_ into a structured dictionary.
    """
    tree = model.tree_
    model_classes = [str(c) for c in getattr(model, "classes_", class_names or [])]
    all_actions = ["jump", "duck", "none"]

    def build_node(node_id, depth=0):
        left_child = int(tree.children_left[node_id])
        right_child = int(tree.children_right[node_id])
        is_leaf = left_child == -1 and right_child == -1

        raw_values = tree.value[node_id][0]
        total_samples = int(tree.n_node_samples[node_id])
        total_val = float(np.sum(raw_values)) if np.sum(raw_values) > 0 else 1.0

        distribution = {act: 0.0 for act in all_actions}
        counts = {act: 0 for act in all_actions}
        for i, cls_name in enumerate(model_classes):
            distribution[cls_name] = round(float(raw_values[i]) / total_val * 100, 1)
            counts[cls_name] = int(raw_values[i])

        pred_idx = int(np.argmax(raw_values))
        pred_class = model_classes[pred_idx] if pred_idx < len(model_classes) else "none"

        node_data = {
            "id": int(node_id),
            "depth": int(depth),
            "is_leaf": bool(is_leaf),
            "samples": total_samples,
            "impurity": round(float(tree.impurity[node_id]), 3),
            "prediction": pred_class,
            "distribution": distribution,
            "counts": counts,
        }

        if is_leaf:
            node_data["feature"] = None
            node_data["threshold"] = None
            node_data["condition"] = f"Action: {pred_class.upper()}"
            node_data["left"] = None
            node_data["right"] = None
        else:
            feat_idx = int(tree.feature[node_id])
            feat_name = feature_names[feat_idx] if feat_idx < len(feature_names) else f"feature_{feat_idx}"
            threshold = float(tree.threshold[node_id])
            node_data["feature"] = feat_name
            node_data["threshold"] = round(threshold, 2)
            node_data["condition"] = f"{feat_name} <= {threshold:.2f}"
            node_data["left"] = build_node(left_child, depth + 1)
            node_data["right"] = build_node(right_child, depth + 1)

        return node_data

    return build_node(0, 0)


def trace_decision_path(model, frame, feature_names, class_names=None):
    """
    Computes the exact node path taken by the decision tree for a single row sample.
    """
    model_classes = [str(c) for c in getattr(model, "classes_", class_names or [])]
    all_actions = ["jump", "duck", "none"]
    tree = model.tree_

    # Get indicator matrix
    indicator = model.decision_path(frame)
    node_indices = indicator.indices.tolist()

    steps = []
    row_dict = frame.iloc[0].to_dict()

    for idx, node_id in enumerate(node_indices):
        left_child = int(tree.children_left[node_id])
        right_child = int(tree.children_right[node_id])
        is_leaf = left_child == -1 and right_child == -1

        raw_values = tree.value[node_id][0]
        total_val = float(np.sum(raw_values)) if np.sum(raw_values) > 0 else 1.0
        distribution = {act: 0.0 for act in all_actions}
        for i, cls_name in enumerate(model_classes):
            distribution[cls_name] = round(float(raw_values[i]) / total_val * 100, 1)

        pred_idx = int(np.argmax(raw_values))
        pred_class = model_classes[pred_idx] if pred_idx < len(model_classes) else "none"

        step = {
            "node_id": node_id,
            "is_leaf": is_leaf,
            "samples": int(tree.n_node_samples[node_id]),
            "prediction": pred_class,
            "distribution": distribution,
        }

        if not is_leaf:
            feat_idx = int(tree.feature[node_id])
            feat_name = feature_names[feat_idx]
            threshold = float(tree.threshold[node_id])
            actual_val = float(row_dict.get(feat_name, 0.0))
            is_satisfied = actual_val <= threshold
            next_node = node_indices[idx + 1] if idx + 1 < len(node_indices) else None

            step.update({
                "feature": feat_name,
                "threshold": round(threshold, 2),
                "actual_value": round(actual_val, 2),
                "condition": f"{feat_name} <= {threshold:.2f}",
                "branch_taken": "<=" if is_satisfied else ">",
                "is_satisfied": bool(is_satisfied),
                "next_node": next_node,
            })
        else:
            step.update({
                "feature": None,
                "threshold": None,
                "actual_value": None,
                "condition": f"LEAF: Action = {pred_class.upper()}",
                "branch_taken": None,
                "is_satisfied": None,
                "next_node": None,
            })

        steps.append(step)

    return {
        "node_ids": node_indices,
        "leaf_id": node_indices[-1],
        "predicted_action": steps[-1]["prediction"],
        "steps": steps,
    }


def diagnose_crash(saved, crash_state, history=None):
    """
    Analyzes game state when crashed and reconstructs why the model caused or allowed the crash.
    """
    model = saved["model"]
    features = saved["features"]
    type_features = saved["type_features"]
    class_names = [str(c) for c in model.classes_]

    # Select critical frame: either recent approaching frame or crash state
    critical_entry = None
    if history and len(history) > 0:
        # Search backwards for a frame where obstacle was in active collision approach (x in [0, 160])
        for entry in reversed(history):
            raw = entry.get("raw_features", {})
            obs_x = raw.get("obstacle1_x", -1)
            if 0 <= obs_x <= 160:
                critical_entry = entry
                break
        if not critical_entry:
            critical_entry = history[-1]

    if critical_entry:
        frame = critical_entry["frame"]
        raw_features = critical_entry["raw_features"]
        action_executed = critical_entry.get("action", "none")
        recorded_state = critical_entry.get("state", crash_state)
    else:
        # Fallback to reconstructing from crash_state directly
        first, second = crash_state.get("obstacles", [{}, {}])[:2]
        raw_features = {
            "obstacle1_x": float(first.get("x", -1)),
            "obstacle1_y": float(first.get("y", -1)),
            "obstacle1_type": first.get("type", "none"),
            "obstacle1_size": int(first.get("size", 1)),
            "obstacle2_x": float(second.get("x", -1)),
            "obstacle2_y": float(second.get("y", -1)),
            "obstacle2_type": second.get("type", "none"),
            "obstacle2_size": int(second.get("size", 1)),
            "speed": float(crash_state.get("speed", 0)),
            "jumping": int(bool(crash_state.get("jumping", False))),
            "ducking": int(bool(crash_state.get("ducking", False))),
        }
        frame = pd.get_dummies(
            pd.DataFrame([raw_features]),
            columns=type_features,
            dtype=int,
        ).reindex(columns=features, fill_value=0)
        action_executed = str(model.predict(frame)[0]).lower()
        recorded_state = crash_state

    # Trace decision path
    path_info = trace_decision_path(model, frame, features, class_names)

    # Determine obstacle details
    obs_type = raw_features.get("obstacle1_type", "unknown")
    obs_x = raw_features.get("obstacle1_x", -1)
    obs_y = raw_features.get("obstacle1_y", -1)
    speed = raw_features.get("speed", 0)
    jumping = bool(raw_features.get("jumping", 0))
    ducking = bool(raw_features.get("ducking", 0))

    predicted_action = path_info["predicted_action"]
    leaf_step = path_info["steps"][-1]
    leaf_dist = leaf_step["distribution"]

    # Deduce reason
    if obs_type in ["cactusSmall", "cactusLarge"]:
        if predicted_action == "none":
            explanation = (
                f"Collision with {obs_type} at distance {obs_x:.1f}px. "
                f"The decision tree chose action '{predicted_action.upper()}' instead of jumping. "
                f"Leaf #{path_info['leaf_id']} prioritized '{predicted_action}' with "
                f"{leaf_dist.get(predicted_action, 0)}% training probability."
            )
        elif predicted_action == "duck":
            explanation = (
                f"Collision with {obs_type} at distance {obs_x:.1f}px. "
                f"The model ducked instead of jumping, which cannot avoid a ground cactus."
            )
        elif predicted_action == "jump":
            explanation = (
                f"Collision with {obs_type} at distance {obs_x:.1f}px (speed {speed:.1f}). "
                f"Model triggered jump, but did so too late (or too early) to clear the obstacle."
            )
        else:
            explanation = f"Collision with {obs_type} at distance {obs_x:.1f}px."
    elif obs_type == "pterodactyl":
        if obs_y > 75 and predicted_action != "jump":
            explanation = (
                f"Pterodactyl flying low (y={obs_y:.1f}) at distance {obs_x:.1f}px. "
                f"The model chose '{predicted_action.upper()}' instead of jumping over it."
            )
        elif obs_y <= 75 and predicted_action == "jump":
            explanation = (
                f"Pterodactyl flying overhead (y={obs_y:.1f}) at distance {obs_x:.1f}px. "
                f"The model jumped into the pterodactyl instead of ducking or staying low."
            )
        else:
            explanation = (
                f"Collision with pterodactyl (y={obs_y:.1f}) at distance {obs_x:.1f}px. "
                f"Decision tree chose '{predicted_action.upper()}'."
            )
    else:
        explanation = (
            f"Collision detected at speed {speed:.1f} with obstacle at distance {obs_x:.1f}px. "
            f"Decision tree predicted '{predicted_action.upper()}'."
        )

    return {
        "obstacle_type": obs_type,
        "obstacle_x": obs_x,
        "obstacle_y": obs_y,
        "speed": speed,
        "jumping": jumping,
        "ducking": ducking,
        "action_executed": action_executed,
        "predicted_action": predicted_action,
        "explanation": explanation,
        "path_info": path_info,
        "raw_features": raw_features,
    }


def generate_decision_graph_html(model, feature_names, class_names, crash_info=None, title="Decision Graph"):
    """
    Builds a standalone interactive HTML graph with SVG tree visualization.
    If crash_info is provided, highlights the crash path with distinct styling and diagnostic HUD.
    """
    tree_data = extract_tree_data(model, feature_names, class_names)
    tree_json = json.dumps(tree_data)
    crash_json = json.dumps(crash_info) if crash_info else "null"

    highlight_ids = crash_info["path_info"]["node_ids"] if crash_info else []
    highlight_json = json.dumps(highlight_ids)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>
  :root {{
    --bg: #0b0f19;
    --card-bg: #151d30;
    --card-border: #23314d;
    --text: #e2e8f0;
    --text-dim: #94a3b8;
    --accent: #38bdf8;
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
    overflow: hidden;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }}
  header {{
    background: #111827;
    border-bottom: 1px solid #1f2937;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 20;
  }}
  .brand {{
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .logo {{
    font-weight: 800;
    font-size: 18px;
    letter-spacing: 1px;
    color: #38bdf8;
  }}
  .badge {{
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 9999px;
    font-weight: 600;
    text-transform: uppercase;
  }}
  .badge-crash {{
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.4);
    animation: pulse 2s infinite;
  }}
  .badge-model {{
    background: rgba(56, 189, 248, 0.2);
    color: #38bdf8;
    border: 1px solid rgba(56, 189, 248, 0.4);
  }}
  @keyframes pulse {{
    0%, 100% {{ opacity: 1; }}
    50% {{ opacity: 0.5; }}
  }}
  .controls {{
    display: flex;
    gap: 8px;
    align-items: center;
  }}
  .btn {{
    background: #1f2937;
    border: 1px solid #374151;
    color: var(--text);
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }}
  .btn:hover {{
    background: #374151;
    border-color: #4b5563;
  }}
  .btn-primary {{
    background: #2563eb;
    border-color: #3b82f6;
  }}
  .btn-primary:hover {{ background: #1d4ed8; }}
  .btn-crash {{
    background: #dc2626;
    border-color: #ef4444;
  }}
  .btn-crash:hover {{ background: #b91c1c; }}

  #crash-banner {{
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.15), rgba(15, 23, 42, 0.95));
    border-bottom: 2px solid #ef4444;
    padding: 14px 24px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 15;
  }}
  .crash-title {{
    font-size: 16px;
    font-weight: 700;
    color: #f87171;
    display: flex;
    align-items: center;
    gap: 8px;
  }}
  .crash-desc {{
    font-size: 13.5px;
    color: #f1f5f9;
    line-height: 1.4;
  }}
  .crash-metrics {{
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: 12px;
  }}
  .metric-item {{
    background: rgba(30, 41, 59, 0.8);
    padding: 4px 10px;
    border-radius: 4px;
    border: 1px solid #334155;
  }}
  .metric-item span {{
    color: #94a3b8;
  }}
  .metric-item strong {{
    color: #38bdf8;
  }}

  #canvas-container {{
    flex: 1;
    position: relative;
    overflow: hidden;
    cursor: grab;
    background: radial-gradient(circle at center, #111a2e 0%, #070a12 100%);
  }}
  #canvas-container:active {{
    cursor: grabbing;
  }}
  svg {{
    width: 100%;
    height: 100%;
  }}
  .link {{
    fill: none;
    stroke: #334155;
    stroke-width: 1.5px;
    transition: stroke 0.3s, stroke-width 0.3s;
  }}
  .link-crash {{
    stroke: #ef4444 !important;
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
  .link-label-crash {{
    fill: #fca5a5 !important;
    font-weight: 700 !important;
    font-size: 11px !important;
  }}

  .node-group {{
    cursor: pointer;
  }}
  .node-box {{
    rx: 8px;
    ry: 8px;
    fill: #151d30;
    stroke: #2b3b5c;
    stroke-width: 1.5px;
    transition: all 0.2s;
  }}
  .node-group:hover .node-box {{
    stroke: var(--accent);
    filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.4));
  }}
  .node-crash .node-box {{
    stroke: #ef4444 !important;
    stroke-width: 3px !important;
    filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.6));
  }}
  .node-leaf-jump .node-box {{ border-left: 4px solid var(--jump); }}
  .node-leaf-duck .node-box {{ border-left: 4px solid var(--duck); }}
  .node-leaf-none .node-box {{ border-left: 4px solid var(--none); }}

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
  .node-crash-badge {{
    font-size: 10px;
    font-weight: 700;
    fill: #fca5a5;
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

  /* Legend & Info Drawer */
  #legend {{
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(8px);
    border: 1px solid #334155;
    padding: 10px 14px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 11px;
    z-index: 10;
  }}
  .legend-item {{
    display: flex;
    align-items: center;
    gap: 8px;
  }}
  .legend-color {{
    width: 12px;
    height: 12px;
    border-radius: 3px;
  }}

  #details-drawer {{
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 320px;
    max-height: calc(100% - 140px);
    overflow-y: auto;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 16px;
    display: none;
    flex-direction: column;
    gap: 12px;
    z-index: 10;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  }}
  .drawer-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #334155;
    padding-bottom: 8px;
  }}
  .drawer-title {{
    font-size: 14px;
    font-weight: 700;
    color: #38bdf8;
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
  .dist-segment {{
    height: 100%;
  }}
</style>
</head>
<body>

<header>
  <div class="brand">
    <div class="logo">T-REX AI // DECISION GRAPH</div>
    {'<div class="badge badge-crash">Crash Diagnosis Mode</div>' if crash_info else '<div class="badge badge-model">Model Tree View</div>'}
  </div>
  <div class="controls">
    <button class="btn" onclick="resetZoom()">Fit View</button>
    <button class="btn" onclick="zoomIn()">Zoom +</button>
    <button class="btn" onclick="zoomOut()">Zoom -</button>
    {f'<button class="btn btn-crash" onclick="focusCrashPath()">Focus Crash Path</button>' if crash_info else ''}
  </div>
</header>

{'<div id="crash-banner">' +
  f'<div class="crash-title">' +
    '<span>&#9888; Collision Root Cause Analysis</span>' +
  '</div>' +
  f'<div class="crash-desc">{crash_info["explanation"]}</div>' +
  '<div class="crash-metrics">' +
    f'<div class="metric-item"><span>Obstacle:</span> <strong>{crash_info["obstacle_type"]}</strong></div>' +
    f'<div class="metric-item"><span>Distance:</span> <strong>{crash_info["obstacle_x"]:.1f} px</strong></div>' +
    f'<div class="metric-item"><span>Speed:</span> <strong>{crash_info["speed"]:.1f}</strong></div>' +
    f'<div class="metric-item"><span>Dino State:</span> <strong>{"Jumping" if crash_info["jumping"] else ("Ducking" if crash_info["ducking"] else "Running")}</strong></div>' +
    f'<div class="metric-item"><span>Decision Path:</span> <strong>{len(crash_info["path_info"]["steps"])} nodes traversed</strong></div>' +
    f'<div class="metric-item"><span>Leaf Action:</span> <strong>{crash_info["predicted_action"].upper()}</strong></div>' +
  '</div>' +
'</div>' if crash_info else ''}

<div id="canvas-container">
  <svg id="tree-svg">
    <g id="viewport">
      <g id="links-layer"></g>
      <g id="nodes-layer"></g>
    </g>
  </svg>

  <div id="legend">
    <div style="font-weight:700;margin-bottom:2px;color:#94a3b8;">ACTION CLASSES</div>
    <div class="legend-item"><div class="legend-color" style="background:var(--jump)"></div> JUMP</div>
    <div class="legend-item"><div class="legend-color" style="background:var(--duck)"></div> DUCK</div>
    <div class="legend-item"><div class="legend-color" style="background:var(--none)"></div> NONE</div>
    {'<div class="legend-item"><div class="legend-color" style="background:var(--crash)"></div> CRASH DECISION PATH</div>' if crash_info else ''}
  </div>

  <div id="details-drawer">
    <div class="drawer-header">
      <div class="drawer-title" id="drawer-node-title">Node Details</div>
      <button class="drawer-close" onclick="closeDrawer()">&times;</button>
    </div>
    <div id="drawer-content"></div>
  </div>
</div>

<script>
const rawTree = {tree_json};
const crashData = {crash_json};
const highlightIds = new Set({highlight_json});

// Map of crash steps by node id
const crashStepsMap = {{}};
if (crashData && crashData.path_info) {{
  crashData.path_info.steps.forEach(s => {{
    crashStepsMap[s.node_id] = s;
  }});
}}

const NODE_W = 180;
const NODE_H = 75;
const LEVEL_H = 130;
const SIBLING_GAP = 30;

// Hierarchical layout calculation
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
    node.y = 60 + node.depth * LEVEL_H;
  }}
  assignX(root);
}}

layoutTree(rawTree);

// SVG Pan & Zoom state
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

function updateTransform() {{
  viewport.setAttribute("transform", `translate(${{tx}}, ${{ty}}) scale(${{scale}})`);
}}

const container = document.getElementById("canvas-container");
container.addEventListener("mousedown", (e) => {{
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

container.addEventListener("wheel", (e) => {{
  e.preventDefault();
  const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
  const mouseX = e.clientX - container.getBoundingClientRect().left;
  const mouseY = e.clientY - container.getBoundingClientRect().top;
  
  tx = mouseX - (mouseX - tx) * zoomFactor;
  ty = mouseY - (mouseY - ty) * zoomFactor;
  scale *= zoomFactor;
  updateTransform();
}}, {{ passive: false }});

function zoomIn() {{
  scale *= 1.25;
  updateTransform();
}}

function zoomOut() {{
  scale *= 0.8;
  updateTransform();
}}

function resetZoom() {{
  scale = 0.8;
  tx = 60;
  ty = 40;
  updateTransform();
}}

function focusCrashPath() {{
  if (!crashData || !crashData.path_info) return;
  const leafId = crashData.path_info.leaf_id;
  let targetNode = null;
  function findNode(n) {{
    if (!n) return;
    if (n.id === leafId) {{ targetNode = n; return; }}
    findNode(n.left);
    findNode(n.right);
  }}
  findNode(rawTree);
  if (targetNode) {{
    const rect = container.getBoundingClientRect();
    scale = 1.0;
    tx = rect.width / 2 - targetNode.x - NODE_W / 2;
    ty = rect.height / 2 - targetNode.y - NODE_H / 2;
    updateTransform();
    selectNode(targetNode);
  }}
}}

// Render Nodes & Links
function render(node) {{
  if (!node) return;

  const isCrashNode = highlightIds.has(node.id);
  const crashStep = crashStepsMap[node.id];

  // Render children links
  if (node.left) {{
    renderLink(node, node.left, true);
    render(node.left);
  }}
  if (node.right) {{
    renderLink(node, node.right, false);
    render(node.right);
  }}

  // Node Element
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("class", `node-group ${{isCrashNode ? "node-crash" : ""}}`);
  g.setAttribute("transform", `translate(${{node.x}}, ${{node.y}})`);
  g.onclick = () => selectNode(node);

  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("class", `node-box node-leaf-${{node.prediction}}`);
  rect.setAttribute("width", NODE_W);
  rect.setAttribute("height", NODE_H);
  g.appendChild(rect);

  // Node ID text
  const textId = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textId.setAttribute("class", "node-id");
  textId.setAttribute("x", 10);
  textId.setAttribute("y", 18);
  textId.textContent = `#${{node.id}} ${{node.is_leaf ? "LEAF" : ""}}`;
  g.appendChild(textId);

  // Condition or Leaf Action
  const textCond = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textCond.setAttribute("class", "node-condition");
  textCond.setAttribute("x", 10);
  textCond.setAttribute("y", 36);
  if (node.is_leaf) {{
    textCond.textContent = `Action: ${{node.prediction.toUpperCase()}}`;
    textCond.setAttribute("fill", `var(--${{node.prediction}})`);
  }} else {{
    textCond.textContent = node.condition;
  }}
  g.appendChild(textCond);

  // Crash actual value badge
  if (crashStep) {{
    const textCrash = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textCrash.setAttribute("class", "node-crash-badge");
    textCrash.setAttribute("x", 10);
    textCrash.setAttribute("y", 52);
    if (!node.is_leaf) {{
      textCrash.textContent = `Actual: ${{crashStep.actual_value}} (${{crashStep.branch_taken}})`;
    }} else {{
      textCrash.textContent = `CRASH ACTION: ${{crashStep.prediction.toUpperCase()}}`;
    }}
    g.appendChild(textCrash);
  }} else {{
    // Samples count
    const textSamples = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textSamples.setAttribute("class", "node-samples");
    textSamples.setAttribute("x", 10);
    textSamples.setAttribute("y", 52);
    textSamples.textContent = `samples: ${{node.samples}} | gini: ${{node.impurity}}`;
    g.appendChild(textSamples);
  }}

  // Action badge pill in corner
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
}}

function renderLink(parent, child, isLeft) {{
  const x1 = parent.x + NODE_W / 2;
  const y1 = parent.y + NODE_H;
  const x2 = child.x + NODE_W / 2;
  const y2 = child.y;

  const isCrashLink = highlightIds.has(parent.id) && highlightIds.has(child.id);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  const cy = (y1 + y2) / 2;
  const d = `M ${{x1}} ${{y1}} C ${{x1}} ${{cy}}, ${{x2}} ${{cy}}, ${{x2}} ${{y2}}`;
  path.setAttribute("d", d);
  path.setAttribute("class", `link ${{isCrashLink ? "link-crash" : ""}}`);
  linksLayer.appendChild(path);

  // Branch label (<= or >)
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("class", `link-label ${{isCrashLink ? "link-label-crash" : ""}}`);
  label.setAttribute("x", (x1 + x2) / 2 + (isLeft ? -12 : 12));
  label.setAttribute("y", cy - 4);
  label.textContent = isLeft ? "<= True" : "> False";
  linksLayer.appendChild(label);
}}

function selectNode(node) {{
  const drawer = document.getElementById("details-drawer");
  const title = document.getElementById("drawer-node-title");
  const content = document.getElementById("drawer-content");

  title.textContent = `Node #${{node.id}} (${{node.is_leaf ? "Leaf" : "Decision"}})`;
  
  const crashStep = crashStepsMap[node.id];
  let crashHtml = "";
  if (crashStep) {{
    crashHtml = `
      <div style="background:rgba(239, 68, 68, 0.2); border:1px solid #ef4444; border-radius:6px; padding:10px; margin-bottom:10px;">
        <div style="color:#f87171; font-weight:700; margin-bottom:4px;">&#9888; CRASH DECISION STEP</div>
        ${{!node.is_leaf ? `
          <div style="font-size:12px;"><strong>Feature Tested:</strong> ${{crashStep.feature}}</div>
          <div style="font-size:12px;"><strong>Dino Value:</strong> ${{crashStep.actual_value}}</div>
          <div style="font-size:12px;"><strong>Split Condition:</strong> ${{crashStep.condition}}</div>
          <div style="font-size:12px;"><strong>Branch Selected:</strong> <span style="color:#38bdf8; font-weight:bold;">${{crashStep.branch_taken}}</span></div>
        ` : `
          <div style="font-size:12px;"><strong>Predicted Action:</strong> ${{crashStep.prediction.toUpperCase()}}</div>
          <div style="font-size:12px; color:#fca5a5; margin-top:4px;">This leaf selected action '${{crashStep.prediction}}', resulting in collision.</div>
        `}}
      </div>
    `;
  }}

  const distJump = node.distribution.jump || 0;
  const distDuck = node.distribution.duck || 0;
  const distNone = node.distribution.none || 0;

  content.innerHTML = `
    ${{crashHtml}}
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

render(rawTree);
updateTransform();

if (crashData) {{
  setTimeout(focusCrashPath, 300);
}}
</script>
</body>
</html>
"""
    return html


def export_matplotlib_png(model, feature_names, class_names, output_png_path):
    """
    Attempts to export a matplotlib plot_tree PNG if matplotlib is installed.
    """
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        from sklearn.tree import plot_tree

        fig = plt.figure(figsize=(24, 12), dpi=120)
        plot_tree(
            model,
            feature_names=feature_names,
            class_names=[str(c) for c in getattr(model, "classes_", class_names)],
            filled=True,
            rounded=True,
            max_depth=4,
            fontsize=7,
        )
        plt.title("T-Rex Dino Decision Tree (Overview max_depth=4)", fontsize=14, fontweight="bold")
        plt.tight_layout()
        plt.savefig(output_png_path)
        plt.close(fig)
        return True
    except Exception as e:
        return False


def open_in_browser(file_path):
    """
    Opens the generated HTML decision graph in a browser window or tab.
    First tries the active Chrome remote debugging instance, then xdg-open / webbrowser.
    """
    abs_path = Path(file_path).resolve()
    url = abs_path.as_uri()

    # Try existing Chrome debugging instance first
    try:
        resp = requests.put(f"{DEBUG_URL}/json/new?{url}", timeout=1)
        if resp.status_code == 200:
            return True
    except Exception:
        pass

    # Try xdg-open
    try:
        subprocess.Popen(
            ["xdg-open", str(abs_path)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return True
    except Exception:
        pass

    # Fallback to python webbrowser
    try:
        webbrowser.open(url)
        return True
    except Exception:
        pass

    return False


def show_decision_graph(model, feature_names, class_names, name="model"):
    """
    Called after training to show the full decision graph.
    """
    out_dir = BASE_DIR / "models"
    out_dir.mkdir(parents=True, exist_ok=True)

    html_path = out_dir / f"{name}_decision_graph.html"
    png_path = out_dir / f"{name}_decision_graph.png"

    html_content = generate_decision_graph_html(
        model,
        feature_names,
        class_names,
        crash_info=None,
        title=f"Decision Graph - {name}",
    )
    with html_path.open("w", encoding="utf-8") as f:
        f.write(html_content)

    export_matplotlib_png(model, feature_names, class_names, png_path)

    opened = open_in_browser(html_path)

    Logger.log(
        indent=1,
        message=f"Decision Graph generated: {html_path.name}"
    )
    Logger.log(
        indent=1,
        message=f"Interactive view: {html_path}"
    )
    if png_path.exists():
        Logger.log(
            indent=1,
            message=f"Static PNG export: {png_path}"
        )
    if opened:
        Logger.log(
            indent=1,
            message="Decision Graph opened in browser window"
        )


def show_crash_decision_graph(saved, crash_state, history=None, model_name="model"):
    """
    Called when autoplay crashes: diagnoses the crash using the decision graph,
    logs the step-by-step traversal to terminal, generates the highlighted crash graph,
    and opens it in the browser.
    """
    diagnosis = diagnose_crash(saved, crash_state, history)

    # Log clean terminal crash diagnostics
    obs_type = diagnosis["obstacle_type"]
    obs_x = diagnosis["obstacle_x"]
    speed = diagnosis["speed"]
    action = diagnosis["predicted_action"].upper()
    steps = diagnosis["path_info"]["steps"]

    print()
    Logger.log(indent=1, label="CRASH ANALYSIS", message="=" * 55)
    Logger.log(
        indent=1,
        label="CRASH",
        message=f"Obstacle: {obs_type} at distance {obs_x:.1f}px (speed: {speed:.1f})"
    )
    Logger.log(
        indent=1,
        label="DECISION",
        message=f"Bot predicted '{action}' via Decision Tree"
    )
    Logger.log(
        indent=1,
        label="EXPLANATION",
        message=diagnosis["explanation"]
    )

    Logger.log(indent=1, label="DECISION PATH", message="Traversal down the Decision Tree:")
    for i, s in enumerate(steps):
        if not s["is_leaf"]:
            Logger.log(
                indent=2,
                message=(
                    f"Step {i+1} [Node #{s['node_id']}]: "
                    f"{s['feature']}={s['actual_value']} "
                    f"{'<=' if s['is_satisfied'] else '>'} {s['threshold']} "
                    f"-> Branch: {s['branch_taken']}"
                )
            )
        else:
            probs = ", ".join([f"{k}: {v}%" for k, v in s["distribution"].items()])
            Logger.log(
                indent=2,
                message=f"Result [Leaf #{s['node_id']}]: Action '{s['prediction'].upper()}' ({probs})"
            )
    Logger.log(indent=1, label="CRASH ANALYSIS", message="=" * 55)

    # Save and display interactive crash decision graph
    out_dir = BASE_DIR / "models"
    out_dir.mkdir(parents=True, exist_ok=True)
    html_path = out_dir / f"{model_name}_crash_analysis.html"

    html_content = generate_decision_graph_html(
        saved["model"],
        saved["features"],
        saved["actions"],
        crash_info=diagnosis,
        title=f"Crash Analysis - {model_name}",
    )
    with html_path.open("w", encoding="utf-8") as f:
        f.write(html_content)

    opened = open_in_browser(html_path)
    Logger.log(
        indent=1,
        message=f"Crash Decision Graph: {html_path}"
    )
    if opened:
        Logger.log(
            indent=1,
            message="Crash Decision Graph opened in browser"
        )
