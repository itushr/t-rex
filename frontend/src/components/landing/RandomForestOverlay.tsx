import { useState, useEffect, useRef, useMemo } from "react";
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
const ACTIONS: DinoAction[] = ["jump", "duck", "none"];

function generateVotes(target: DinoAction): DinoAction[] {
  const targetCount = Math.random() < 0.65 ? 3 : 4;
  const res: DinoAction[] = Array(targetCount).fill(target);
  while (res.length < 5) res.push(ACTIONS[Math.floor(Math.random() * ACTIONS.length)]);
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

function resolveAction(s?: SimState): DinoAction {
  if (!s) return "none";
  if (s.action !== "none") return s.action;
  if (s.dist < 260 && s.dist > 15 && s.obsType !== "none") {
    return s.obsType === "bird" ? "duck" : "jump";
  }
  return "none";
}

export function RandomForestOverlay({ state }: { state?: SimState }) {
  const dur = `${PREDICTION_INTERVAL_SEC}s`;
  const stateRef = useRef(state);
  const [votes, setVotes] = useState<DinoAction[]>(() => generateVotes("none"));

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // STRICTLY TIME-SPECIFIC UPDATES - NEVER IN BETWEEN
  useEffect(() => {
    const timer = setInterval(() => {
      const act = resolveAction(stateRef.current);
      setVotes(generateVotes(act));
    }, PREDICTION_INTERVAL_SEC * 1000);
    return () => clearInterval(timer);
  }, []);

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
        style={{ background: "transparent", backgroundColor: "transparent" }}
        className="!bg-transparent"
      />
    </div>
  );
}
export default RandomForestOverlay;
