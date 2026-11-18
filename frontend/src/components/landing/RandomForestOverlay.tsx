import { useMemo } from "react";
import { ReactFlow, Node, Edge, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FeatureLabelNode, CircleNode, ActionLabelNode } from "./rfNodes";
import { SimState, DinoAction } from "./types";
import { PREDICTION_INTERVAL_SEC } from "./constants";

const NODE_TYPES = { feat: FeatureLabelNode, circle: CircleNode, act: ActionLabelNode };
const VIEWPORT = { x: 10, y: 10, zoom: 0.98 };
const FEATS = ["obs_distx", "obs_disty", "obs_type", "obs_size"];
const DEF_VOTES: DinoAction[] = ["jump", "jump", "duck", "jump", "none"];

export function RandomForestOverlay({ state }: { state?: SimState }) {
  const votes = state?.votes || DEF_VOTES;
  const dur = `${PREDICTION_INTERVAL_SEC}s`;

  const nodes: Node[] = useMemo(() => [
    ...FEATS.map((label, i) => ({
      id: `feat-${i}`, type: "feat", position: { x: 10, y: 30 + i * 70 }, data: { label },
    })),
    { id: "hub", type: "circle", position: { x: 160, y: 135 }, data: { variant: "hub" } },
    ...votes.map((_, i) => ({
      id: `tree-${i}`, type: "circle", position: { x: 275, y: 15 + i * 60 }, data: { variant: "tree" },
    })),
    ...votes.map((action, i) => ({
      id: `act-${i}`, type: "act", position: { x: 375, y: 15 + i * 60 }, data: { action },
    })),
  ], [votes]);

  const edges: Edge[] = useMemo(() => [
    ...FEATS.map((_, i) => ({
      id: `e-in-${i}`, source: `feat-${i}`, target: "hub",
      style: { stroke: "#27272a", strokeWidth: 1.3, animation: `flowStage1 ${dur} infinite ease-in-out` },
    })),
    ...votes.map((_, i) => ({
      id: `e-hub-tree-${i}`, source: "hub", target: `tree-${i}`,
      style: { stroke: "#27272a", strokeWidth: 1.3, animation: `flowStage2 ${dur} infinite ease-in-out` },
    })),
    ...votes.map((_, i) => ({
      id: `e-tree-act-${i}`, source: `tree-${i}`, target: `act-${i}`, type: "straight",
      markerEnd: { type: MarkerType.Arrow, color: "#27272a", width: 14, height: 14 },
      style: { stroke: "#27272a", strokeWidth: 1.3, animation: `flowStage3 ${dur} infinite ease-in-out` },
    })),
  ], [votes, dur]);

  return (
    <div
      className="w-full max-w-[460px] h-[340px] select-none bg-transparent pointer-events-none"
      style={{ ["--pred-dur" as any]: dur }}
    >
      <style>{`
        @keyframes flowStage1 {
          0% { stroke: #71717a; stroke-width: 1.2px; filter: none; }
          18% { stroke: #09090b; stroke-width: 2.2px; filter: drop-shadow(0 0 3px rgba(9,9,11,0.5)); }
          36%, 100% { stroke: #71717a; stroke-width: 1.2px; filter: none; }
        }
        @keyframes pulseHub {
          0%, 18% { transform: scale(1); box-shadow: none; }
          34% { transform: scale(1.18); box-shadow: 0 0 6px rgba(9,9,11,0.45); }
          50%, 100% { transform: scale(1); box-shadow: none; }
        }
        @keyframes flowStage2 {
          0%, 34% { stroke: #71717a; stroke-width: 1.2px; filter: none; }
          50% { stroke: #09090b; stroke-width: 2.2px; filter: drop-shadow(0 0 3px rgba(9,9,11,0.5)); }
          66%, 100% { stroke: #71717a; stroke-width: 1.2px; filter: none; }
        }
        @keyframes pulseTrees {
          0%, 50% { transform: scale(1); box-shadow: none; }
          66% { transform: scale(1.18); box-shadow: 0 0 6px rgba(9,9,11,0.45); }
          82%, 100% { transform: scale(1); box-shadow: none; }
        }
        @keyframes flowStage3 {
          0%, 66% { stroke: #71717a; stroke-width: 1.2px; filter: none; }
          82% { stroke: #09090b; stroke-width: 2.4px; filter: drop-shadow(0 0 3px rgba(9,9,11,0.5)); }
          98%, 100% { stroke: #71717a; stroke-width: 1.2px; filter: none; }
        }
        @keyframes pulseAction {
          0%, 78% { opacity: 0.6; transform: scale(1); }
          90% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.6; transform: scale(1); }
        }
      `}</style>
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} defaultViewport={VIEWPORT}
        panOnDrag={false} zoomOnScroll={false} zoomOnPinch={false} nodesDraggable={false}
        elementsSelectable={false} proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}
export default RandomForestOverlay;
