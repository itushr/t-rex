import { useMemo } from "react";
import { ReactFlow, Node, Edge, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FeatureLabelNode, CircleNode, ActionLabelNode } from "./rfNodes";
import { SimState, DinoAction } from "./types";

const NODE_TYPES = { feat: FeatureLabelNode, circle: CircleNode, act: ActionLabelNode };
const VIEWPORT = { x: 10, y: 10, zoom: 0.98 };
const FEATS = ["obs_distx", "obs_disty", "obs_type", "obs_size"];
const DEF_VOTES: DinoAction[] = ["jump", "jump", "duck", "jump", "none"];

export function RandomForestOverlay({ state }: { state?: SimState }) {
  const votes = state?.votes || DEF_VOTES;
  const currentAction = state?.action || "none";

  const nodes: Node[] = useMemo(() => [
    ...FEATS.map((label, i) => ({
      id: `feat-${i}`, type: "feat", position: { x: 10, y: 30 + i * 70 }, data: { label },
    })),
    { id: "hub", type: "circle", position: { x: 160, y: 135 }, data: {} },
    ...votes.map((_, i) => ({
      id: `tree-${i}`, type: "circle", position: { x: 275, y: 15 + i * 60 }, data: {},
    })),
    ...votes.map((action, i) => ({
      id: `act-${i}`, type: "act", position: { x: 375, y: 15 + i * 60 },
      data: { action, active: action === currentAction && currentAction !== "none" },
    })),
  ], [votes, currentAction]);

  const edges: Edge[] = useMemo(() => [
    ...FEATS.map((_, i) => ({
      id: `e-in-${i}`, source: `feat-${i}`, target: "hub",
      style: { stroke: "#27272a", strokeWidth: 1.3 },
    })),
    ...votes.map((_, i) => ({
      id: `e-hub-tree-${i}`, source: "hub", target: `tree-${i}`,
      style: { stroke: "#27272a", strokeWidth: 1.3 },
    })),
    ...votes.map((_, i) => ({
      id: `e-tree-act-${i}`, source: `tree-${i}`, target: `act-${i}`, type: "straight",
      markerEnd: { type: MarkerType.Arrow, color: "#27272a", width: 14, height: 14 },
      style: { stroke: "#27272a", strokeWidth: 1.3 },
    })),
  ], [votes]);

  return (
    <div className="w-full max-w-[460px] h-[340px] select-none bg-transparent pointer-events-none">
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} defaultViewport={VIEWPORT}
        panOnDrag={false} zoomOnScroll={false} zoomOnPinch={false} nodesDraggable={false}
        elementsSelectable={false} proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}
export default RandomForestOverlay;
