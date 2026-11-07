import json
import os
import subprocess
import webbrowser
from pathlib import Path
import numpy as np
import requests

from src.logger import Logger

BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG_URL = "http://localhost:9222"


def _resolve_model_classes(model, class_names=None):
    """
    Safely resolves string class names for DecisionTreeClassifier or RandomForest estimator.
    """
    if hasattr(model, "classes_"):
        raw_classes = model.classes_
        if len(raw_classes) > 0 and isinstance(raw_classes[0], (int, float, np.integer, np.floating)) and class_names is not None:
            return [str(class_names[int(c)]) if int(c) < len(class_names) else str(c) for c in raw_classes]
        return [str(c) for c in raw_classes]
    elif class_names is not None:
        return [str(c) for c in class_names]
    return ["jump", "duck", "none"]


def extract_tree_data(model, feature_names, class_names=None):
    """
    Extracts scikit-learn DecisionTreeClassifier tree_ into a structured dictionary.
    """
    tree = model.tree_
    model_classes = _resolve_model_classes(model, class_names)
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
        limit = min(len(raw_values), len(model_classes))
        for i in range(limit):
            cls_name = model_classes[i]
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


def extract_forest_data(model, feature_names, class_names=None):
    """
    Extracts all decision trees from a model (either a single tree or random forest ensemble).
    """
    target_classes = list(model.classes_) if hasattr(model, "classes_") else class_names
    if hasattr(model, "estimators_"):
        trees = [
            extract_tree_data(est, feature_names, target_classes)
            for est in model.estimators_
        ]
        return {
            "model_type": "random_forest",
            "n_estimators": len(trees),
            "trees": trees,
        }
    else:
        tree = extract_tree_data(model, feature_names, target_classes)
        return {
            "model_type": "decision_tree",
            "n_estimators": 1,
            "trees": [tree],
        }


def trace_single_tree_path(model, frame, feature_names, class_names=None):
    """
    Computes the decision path for a single DecisionTreeClassifier.
    """
    model_classes = _resolve_model_classes(model, class_names)
    all_actions = ["jump", "duck", "none"]
    tree = model.tree_

    eval_frame = frame if hasattr(model, "feature_names_in_") else (frame.values if hasattr(frame, "values") else frame)
    indicator = model.decision_path(eval_frame)
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
        limit = min(len(raw_values), len(model_classes))
        for i in range(limit):
            cls_name = model_classes[i]
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
                "condition": f"Action: {pred_class.upper()}",
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


def trace_decision_path(model, frame, feature_names, class_names=None):
    """
    Computes decision path for either a DecisionTreeClassifier or RandomForestClassifier.
    For a random forest, returns each individual tree's prediction and path.
    """
    target_classes = list(model.classes_) if hasattr(model, "classes_") else class_names
    if hasattr(model, "estimators_"):
        forest_paths = []
        votes = {}
        for i, est in enumerate(model.estimators_):
            t_path = trace_single_tree_path(est, frame, feature_names, target_classes)
            pred = t_path["predicted_action"]
            forest_paths.append({
                "tree_index": i,
                "predicted_action": pred,
                "node_ids": t_path["node_ids"],
                "leaf_id": t_path["leaf_id"],
                "steps": t_path["steps"],
            })
            votes[pred] = votes.get(pred, 0) + 1

        ensemble_pred = str(model.predict(frame)[0]).lower()

        return {
            "model_type": "random_forest",
            "predicted_action": ensemble_pred,
            "votes": votes,
            "trees": forest_paths,
            "node_ids": forest_paths[0]["node_ids"],
            "leaf_id": forest_paths[0]["leaf_id"],
            "steps": forest_paths[0]["steps"],
        }
    else:
        path = trace_single_tree_path(model, frame, feature_names, class_names)
        return {
            "model_type": "decision_tree",
            "predicted_action": path["predicted_action"],
            "votes": {path["predicted_action"]: 1},
            "trees": [{
                "tree_index": 0,
                "predicted_action": path["predicted_action"],
                "node_ids": path["node_ids"],
                "leaf_id": path["leaf_id"],
                "steps": path["steps"],
            }],
            "node_ids": path["node_ids"],
            "leaf_id": path["leaf_id"],
            "steps": path["steps"],
        }


def generate_decision_graph_html(model, feature_names, class_names, title="Decision graph"):
    """
    Builds a standalone interactive HTML document with SVG tree visualization.
    Supports both DecisionTreeClassifier (single tree) and RandomForestClassifier (tree selector list).
    Follows the unslop and frontend design skill specifications.
    """
    if isinstance(model, dict) and "trees" in model:
        forest_data = model
    else:
        forest_data = extract_forest_data(model, feature_names, class_names)
    forest_json = json.dumps(forest_data)

    is_rf = forest_data["model_type"] == "random_forest"
    type_label = f"Random forest ({forest_data['n_estimators']} trees)" if is_rf else "Decision tree"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>
  :root {{
    --bg: #0b0e14;
    --panel-bg: #121721;
    --card-bg: #18202e;
    --border: #243044;
    --border-light: #34445f;
    --text: #f1f5f9;
    --text-dim: #8b9bb4;
    --text-muted: #64748b;
    --accent: #38bdf8;
    --jump: #10b981;
    --duck: #f59e0b;
    --none: #64748b;
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
    background: var(--panel-bg);
    border-bottom: 1px solid var(--border);
    padding: 10px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 20;
    gap: 12px;
  }}
  .brand-group {{
    display: flex;
    align-items: center;
    gap: 12px;
  }}
  .title {{
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }}
  .meta-tag {{
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 4px;
    background: var(--card-bg);
    border: 1px solid var(--border);
    color: var(--text-dim);
  }}
  .controls {{
    display: flex;
    gap: 8px;
    align-items: center;
  }}
  .search-input {{
    background: var(--card-bg);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    width: 180px;
    outline: none;
    transition: border-color 0.15s;
  }}
  .search-input:focus {{
    border-color: var(--accent);
  }}
  .btn {{
    background: var(--card-bg);
    border: 1px solid var(--border);
    color: var(--text);
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.15s, border-color 0.15s;
  }}
  .btn:hover {{
    background: var(--border);
    border-color: var(--border-light);
  }}
  .btn-sm {{
    padding: 4px 8px;
    font-size: 11px;
  }}
  .btn-active {{
    background: var(--accent);
    color: #0b0e14;
    border-color: var(--accent);
    font-weight: 600;
  }}
  #workspace {{
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }}
  #forest-sidebar {{
    width: 270px;
    background: var(--panel-bg);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    z-index: 10;
  }}
  .panel-header {{
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    letter-spacing: 0.3px;
  }}
  .tree-list {{
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
  }}
  .tree-item {{
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 8px 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }}
  .tree-item:hover {{
    border-color: var(--border-light);
  }}
  .tree-item.selected {{
    border-color: var(--accent);
    background: rgba(56, 189, 248, 0.08);
  }}
  .tree-item-info {{
    display: flex;
    flex-direction: column;
    gap: 2px;
  }}
  .tree-item-title {{
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
  }}
  .tree-item-meta {{
    font-size: 11px;
    color: var(--text-muted);
    font-family: ui-monospace, monospace;
  }}
  #canvas-container {{
    flex: 1;
    position: relative;
    overflow: hidden;
    cursor: grab;
    background: var(--bg);
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
    stroke: var(--border);
    stroke-width: 1.5px;
    transition: stroke 0.15s, stroke-width 0.15s;
  }}
  .link-highlight {{
    stroke: var(--accent) !important;
    stroke-width: 2.5px !important;
  }}
  .link-label {{
    font-size: 10px;
    font-family: ui-monospace, monospace;
    fill: var(--text-muted);
    font-weight: 600;
  }}
  .node-group {{
    cursor: pointer;
  }}
  .node-box {{
    fill: var(--panel-bg);
    stroke: var(--border);
    stroke-width: 1.5px;
    rx: 4px;
    ry: 4px;
    transition: stroke 0.15s, fill 0.15s;
  }}
  .node-group:hover .node-box {{
    stroke: var(--border-light);
    fill: var(--card-bg);
  }}
  .node-selected .node-box {{
    stroke: var(--accent) !important;
    stroke-width: 2px !important;
  }}
  .node-match .node-box {{
    stroke: #fbbf24 !important;
    stroke-width: 2px !important;
  }}
  .node-id {{
    font-size: 10px;
    font-family: ui-monospace, monospace;
    fill: var(--text-muted);
    font-weight: 600;
  }}
  .node-condition {{
    font-size: 11px;
    font-weight: 600;
    fill: var(--text);
  }}
  .node-samples {{
    font-size: 10px;
    fill: var(--text-dim);
    font-family: ui-monospace, monospace;
  }}
  .node-pill {{
    rx: 3px;
    ry: 3px;
  }}
  .node-pill-jump {{ fill: rgba(16, 185, 129, 0.2); stroke: var(--jump); stroke-width: 1px; }}
  .node-pill-duck {{ fill: rgba(245, 158, 11, 0.2); stroke: var(--duck); stroke-width: 1px; }}
  .node-pill-none {{ fill: rgba(100, 116, 139, 0.2); stroke: var(--none); stroke-width: 1px; }}

  .node-pill-text {{
    font-size: 10px;
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: central;
    font-family: ui-monospace, monospace;
  }}
  .pill-text-jump {{ fill: var(--jump); }}
  .pill-text-duck {{ fill: var(--duck); }}
  .pill-text-none {{ fill: var(--text-dim); }}

  #node-sidebar {{
    width: 300px;
    background: var(--panel-bg);
    border-left: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    z-index: 10;
  }}
  .sidebar-body {{
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }}
  .card {{
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 12px;
  }}
  .card-label {{
    font-size: 11px;
    color: var(--text-muted);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }}
  .card-value {{
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    font-family: ui-monospace, monospace;
  }}
  .dist-row {{
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 8px;
  }}
  .dist-item {{
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    font-family: ui-monospace, monospace;
  }}
  .dist-bar-track {{
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 2px;
    margin-bottom: 6px;
  }}
  .dist-bar-fill {{
    height: 100%;
    border-radius: 2px;
  }}
  .legend {{
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
  }}
  .legend-item {{
    display: flex;
    align-items: center;
    gap: 6px;
  }}
  .legend-dot {{
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }}
</style>
</head>
<body>

<header>
  <div class="brand-group">
    <div class="title">Decision graph</div>
    <div class="meta-tag">{title}</div>
    <div class="meta-tag">{type_label}</div>
  </div>

  <div class="controls">
    <input type="text" id="search-input" class="search-input" placeholder="Search feature..." oninput="handleSearch()">
    <button class="btn" onclick="zoomIn()">Zoom in</button>
    <button class="btn" onclick="zoomOut()">Zoom out</button>
    <button class="btn" onclick="resetZoom()">Reset view</button>
  </div>
</header>

<div id="workspace">
  {"<div id='forest-sidebar'><div class='panel-header'>Trees in ensemble</div><div class='tree-list' id='tree-list-container'></div></div>" if is_rf else ""}

  <div id="canvas-container">
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
      <div class="legend-item"><span class="legend-dot" style="background:var(--accent)"></span> Selected path</div>
    </div>
  </div>

  <div id="node-sidebar">
    <div class="panel-header">Node details</div>
    <div class="sidebar-body" id="node-details-body">
      <p style="font-size:12px; color:var(--text-muted); line-height:1.5;">
        Select any node in the tree to inspect its split condition, sample count, and class distribution.
      </p>
    </div>
  </div>
</div>

<script>
const forestData = {forest_json};
let activeTreeIndex = 0;

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
const container = document.getElementById("canvas-container");

function updateTransform() {{
  viewport.setAttribute("transform", `translate(${{tx}}, ${{ty}}) scale(${{scale}})`);
}}

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
  scale = 0.85;
  tx = 60;
  ty = 30;
  updateTransform();
}}

// Reusable Tree Component
const allNodes = new Map();
const allLinks = [];

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
    node.y = 40 + node.depth * LEVEL_H;
  }}
  assignX(root);
}}

function renderTree(root) {{
  allNodes.clear();
  allLinks.length = 0;
  linksLayer.innerHTML = "";
  nodesLayer.innerHTML = "";

  if (!root) return;
  layoutTree(root);

  function drawBranch(node, parent = null, isLeft = true) {{
    if (!node) return;
    allNodes.set(node.id, {{ node, parent }});

    if (parent) {{
      const sx = parent.x + NODE_W / 2;
      const sy = parent.y + NODE_H;
      const ex = node.x + NODE_W / 2;
      const ey = node.y;
      const my = (sy + ey) / 2;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M ${{sx}} ${{sy}} C ${{sx}} ${{my}}, ${{ex}} ${{my}}, ${{ex}} ${{ey}}`);
      path.setAttribute("class", "link");
      path.id = `link-${{parent.id}}-${{node.id}}`;
      linksLayer.appendChild(path);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("class", "link-label");
      label.setAttribute("x", (sx + ex) / 2 + (isLeft ? -14 : 6));
      label.setAttribute("y", my);
      label.textContent = isLeft ? "<=" : ">";
      linksLayer.appendChild(label);

      allLinks.push({{ parentId: parent.id, childId: node.id, element: path }});
    }}

    if (node.left) drawBranch(node.left, node, true);
    if (node.right) drawBranch(node.right, node, false);

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "node-group");
    g.setAttribute("id", `node-${{node.id}}`);
    g.setAttribute("transform", `translate(${{node.x}}, ${{node.y}})`);
    g.onclick = (e) => {{
      e.stopPropagation();
      selectNode(node);
    }};

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("class", "node-box");
    rect.setAttribute("width", NODE_W);
    rect.setAttribute("height", NODE_H);
    g.appendChild(rect);

    const textId = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textId.setAttribute("class", "node-id");
    textId.setAttribute("x", 10);
    textId.setAttribute("y", 16);
    textId.textContent = `#${{node.id}} ${{node.is_leaf ? "LEAF" : ""}}`;
    g.appendChild(textId);

    const textCond = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textCond.setAttribute("class", "node-condition");
    textCond.setAttribute("x", 10);
    textCond.setAttribute("y", 34);
    if (node.is_leaf) {{
      textCond.textContent = `Action: ${{node.prediction.toUpperCase()}}`;
      textCond.setAttribute("fill", `var(--${{node.prediction}})`);
    }} else {{
      textCond.textContent = node.condition;
    }}
    g.appendChild(textCond);

    const textSamples = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textSamples.setAttribute("class", "node-samples");
    textSamples.setAttribute("x", 10);
    textSamples.setAttribute("y", 52);
    textSamples.textContent = `samples: ${{node.samples}} | gini: ${{node.impurity}}`;
    g.appendChild(textSamples);

    const pillW = 44;
    const pillH = 18;
    const pillRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    pillRect.setAttribute("class", `node-pill node-pill-${{node.prediction}}`);
    pillRect.setAttribute("x", NODE_W - pillW - 8);
    pillRect.setAttribute("y", 8);
    pillRect.setAttribute("width", pillW);
    pillRect.setAttribute("height", pillH);
    g.appendChild(pillRect);

    const pillText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    pillText.setAttribute("class", `node-pill-text pill-text-${{node.prediction}}`);
    pillText.setAttribute("x", NODE_W - pillW / 2 - 8);
    pillText.setAttribute("y", 17);
    pillText.textContent = node.prediction.toUpperCase();
    g.appendChild(pillText);

    nodesLayer.appendChild(g);
  }}

  drawBranch(root);
  resetZoom();
}}

function selectNode(node) {{
  document.querySelectorAll(".node-group").forEach(el => el.classList.remove("node-selected"));
  const group = document.getElementById(`node-${{node.id}}`);
  if (group) group.classList.add("node-selected");

  const pathNodeIds = new Set();
  let curr = node.id;
  while (curr !== undefined && curr !== null) {{
    pathNodeIds.add(curr);
    const entry = allNodes.get(curr);
    curr = entry && entry.parent ? entry.parent.id : null;
  }}

  allLinks.forEach(link => {{
    if (pathNodeIds.has(link.parentId) && pathNodeIds.has(link.childId)) {{
      link.element.classList.add("link-highlight");
    }} else {{
      link.element.classList.remove("link-highlight");
    }}
  }});

  renderSidebar(node);
}}

function renderSidebar(node) {{
  const body = document.getElementById("node-details-body");
  const isLeaf = node.is_leaf;

  let html = `
    <div class="card">
      <div class="card-label">Node summary</div>
      <div class="card-value">Node #${{node.id}} (${{isLeaf ? "Leaf" : "Split"}})</div>
    </div>
  `;

  if (!isLeaf) {{
    html += `
      <div class="card">
        <div class="card-label">Split condition</div>
        <div class="card-value">${{node.condition}}</div>
      </div>
    `;
  }} else {{
    html += `
      <div class="card">
        <div class="card-label">Predicted action</div>
        <div class="card-value" style="color:var(--${{node.prediction}})">${{node.prediction.toUpperCase()}}</div>
      </div>
    `;
  }}

  html += `
    <div class="card">
      <div class="card-label">Metrics</div>
      <div style="font-size:12px; color:var(--text-dim); display:flex; flex-direction:column; gap:4px; margin-top:4px;">
        <div>Samples: <strong style="color:var(--text)">${{node.samples}}</strong></div>
        <div>Impurity: <strong style="color:var(--text)">${{node.impurity}} Gini</strong></div>
        <div>Depth: <strong style="color:var(--text)">${{node.depth}}</strong></div>
      </div>
    </div>

    <div class="card">
      <div class="card-label">Class distribution</div>
      <div class="dist-row">
  `;

  ["jump", "duck", "none"].forEach(cls => {{
    const pct = node.distribution[cls] || 0;
    const count = node.counts[cls] || 0;
    html += `
      <div class="dist-item">
        <span style="color:var(--${{cls}}); text-transform:uppercase;">${{cls}}</span>
        <span>${{count}} (${{pct}}%)</span>
      </div>
      <div class="dist-bar-track">
        <div class="dist-bar-fill" style="width:${{pct}}%; background:var(--${{cls}})"></div>
      </div>
    `;
  }});

  html += `
      </div>
    </div>
  `;

  body.innerHTML = html;
}}

function handleSearch() {{
  const query = document.getElementById("search-input").value.trim().toLowerCase();
  document.querySelectorAll(".node-group").forEach(el => el.classList.remove("node-match"));
  if (!query) return;

  allNodes.forEach(({{ node }}) => {{
    const matchCond = node.condition && node.condition.toLowerCase().includes(query);
    const matchPred = node.prediction && node.prediction.toLowerCase().includes(query);
    if (matchCond || matchPred) {{
      const group = document.getElementById(`node-${{node.id}}`);
      if (group) group.classList.add("node-match");
    }}
  }});
}}

function selectTree(index) {{
  activeTreeIndex = index;
  document.querySelectorAll(".tree-item").forEach((el, i) => {{
    if (i === index) el.classList.add("selected");
    else el.classList.remove("selected");
  }});
  renderTree(forestData.trees[index]);
}}

// Initialize
if (forestData.model_type === "random_forest") {{
  const treeList = document.getElementById("tree-list-container");
  if (treeList) {{
    treeList.innerHTML = forestData.trees.map((t, i) => `
      <div class="tree-item ${{i === 0 ? "selected" : ""}}" onclick="selectTree(${{i}})">
        <div class="tree-item-info">
          <div class="tree-item-title">Tree #${{i + 1}}</div>
          <div class="tree-item-meta">${{t.samples}} samples</div>
        </div>
        <button class="btn btn-sm" onclick="event.stopPropagation(); selectTree(${{i}})">View tree</button>
      </div>
    `).join("");
  }}
}}

renderTree(forestData.trees[0]);
</script>
</body>
</html>
"""
    return html


def export_matplotlib_png(model, feature_names, class_names, output_png_path):
    """
    Exports a clean static PNG visualization of the decision tree (or tree #1 if forest).
    """
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        from sklearn.tree import plot_tree

        fig = plt.figure(figsize=(24, 12), dpi=150)
        tree_to_plot = model.estimators_[0] if hasattr(model, "estimators_") else model
        title = "T-Rex random forest (Tree #1)" if hasattr(model, "estimators_") else "T-Rex decision tree overview"

        plot_tree(
            tree_to_plot,
            feature_names=feature_names,
            class_names=[str(c) for c in class_names],
            filled=True,
            rounded=True,
            max_depth=4,
            fontsize=7,
        )
        plt.title(title, fontsize=14, fontweight="bold")
        plt.tight_layout()
        plt.savefig(output_png_path)
        plt.close(fig)
        return True
    except Exception:
        return False


def open_in_browser(file_path):
    """
    Opens the generated HTML in a browser window or tab.
    First tries the active Chrome remote debugging instance, then xdg-open / webbrowser.
    """
    abs_path = Path(file_path).resolve()
    url = abs_path.as_uri()

    try:
        resp = requests.put(f"{DEBUG_URL}/json/new?{url}", timeout=1)
        if resp.status_code == 200:
            return True
    except Exception:
        pass

    try:
        subprocess.Popen(
            ["xdg-open", str(abs_path)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return True
    except Exception:
        pass

    try:
        webbrowser.open(url)
        return True
    except Exception:
        pass

    return False


def show_decision_graph(model, feature_names, class_names, name="model"):
    """
    Called after training to show the decision graph.
    """
    out_dir = BASE_DIR / "models"
    out_dir.mkdir(parents=True, exist_ok=True)

    html_path = out_dir / f"{name}_decision_graph.html"
    png_path = out_dir / f"{name}_decision_graph.png"

    html_content = generate_decision_graph_html(
        model,
        feature_names,
        class_names,
        title=f"Decision graph: {name}",
    )
    with html_path.open("w", encoding="utf-8") as f:
        f.write(html_content)

    export_matplotlib_png(model, feature_names, class_names, png_path)

    opened = open_in_browser(html_path)

    Logger.log(
        indent=1,
        message=f"Decision graph saved: {html_path.name}"
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
            message="Decision graph opened in browser"
        )
