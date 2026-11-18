import { useMemo } from "react";
import { ReactFlow, Node, Edge, MarkerType } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FeatureLabelNode, CircleNode, ActionLabelNode } from "./rfNodes";
import { DotEdge } from "./DotEdge";
import { SimState, DinoAction } from "./types";
import { PREDICTION_INTERVAL_SEC } from "./constants";

const NODE_TYPES = { feat: FeatureLabelNode, circle: CircleNode, act: ActionLabelNode };
const EDGE_TYPES = { dotEdge: DotEdge };
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
    { id: "hub", type: "circle", position: { x: 160, y: 135 }, data: {} },
    ...votes.map((_, i) => ({
      id: `tree-${i}`, type: "circle", position: { x: 275, y: 15 + i * 60 }, data: {},
    })),
    ...votes.map((action, i) => ({
      id: `act-${i}`, type: "act", position: { x: 375, y: 15 + i * 60 }, data: { action },
    })),
  ], [votes]);

  const edges: Edge[] = useMemo(() => [
    ...FEATS.map((_, i) => ({
      id: `e-in-${i}`, source: `feat-${i}`, target: "hub", type: "dotEdge",
      data: { stage: 1, dur },
    })),
    ...votes.map((_, i) => ({
      id: `e-hub-tree-${i}`, source: "hub", target: `tree-${i}`, type: "dotEdge",
      data: { stage: 2, dur },
    })),
    ...votes.map((_, i) => ({
      id: `e-tree-act-${i}`, source: `tree-${i}`, target: `act-${i}`, type: "dotEdge",
      markerEnd: { type: MarkerType.Arrow, color: "#27272a", width: 14, height: 14 },
      data: { stage: 3, dur, straight: true },
    })),
  ], [votes, dur]);

  return (
    <div className="w-full max-w-[460px] h-[340px] select-none bg-transparent pointer-events-none">
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={NODE_TYPES} edgeTypes={EDGE_TYPES}
        defaultViewport={VIEWPORT} panOnDrag={false} zoomOnScroll={false} zoomOnPinch={false}
        nodesDraggable={false} elementsSelectable={false} proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}
export default RandomForestOverlay;
