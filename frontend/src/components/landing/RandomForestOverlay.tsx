import { useMemo } from "react";
import { ReactFlow, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { InputFlowNode, TreeFlowNode, ActionFlowNode } from "./rfNodes";
import { SimState } from "./types";

const NODE_TYPES = { inputNode: InputFlowNode, treeNode: TreeFlowNode, actionNode: ActionFlowNode };
const DEFAULT_VIEWPORT = { x: 5, y: 15, zoom: 0.95 };

export function RandomForestOverlay({ state }: { state?: SimState }) {
  const currentAction = state?.action || "RUN";
  const trees = state?.trees || [
    { id: "1", name: "Tree #1", rule: "dist < 125", action: currentAction },
    { id: "2", name: "Tree #2", rule: "obs == small", action: currentAction },
    { id: "3", name: "Tree #3", rule: "tti < 0.65", action: currentAction },
  ];

  const nodes: Node[] = useMemo(() => [
    {
      id: "input",
      type: "inputNode",
      position: { x: 5, y: 95 },
      data: { dist: state?.dist ?? 999, speed: state?.speed ?? 7.0, obsType: state?.obsType ?? "none" },
    },
    ...trees.map((t, idx) => ({
      id: `tree-${t.id}`,
      type: "treeNode",
      position: { x: 160, y: 15 + idx * 88 },
      data: { label: t.name, rule: t.rule, action: t.action, active: t.action === currentAction },
    })),
    ...trees.map((t, idx) => ({
      id: `action-${t.id}`,
      type: "actionNode",
      position: { x: 325, y: 18 + idx * 88 },
      data: { action: t.action, active: t.action === currentAction && currentAction !== "RUN" },
    })),
  ], [state?.dist, state?.speed, state?.obsType, currentAction, trees]);

  const edges: Edge[] = useMemo(() => {
    const list: Edge[] = [];
    const strokeColor = currentAction === "JUMP" ? "#10b981" : currentAction === "DUCK" ? "#f59e0b" : "#a1a1aa";
    const isSpecial = currentAction !== "RUN";
    trees.forEach((t) => {
      list.push({
        id: `e-in-tree-${t.id}`,
        source: "input",
        target: `tree-${t.id}`,
        animated: isSpecial,
        style: { stroke: strokeColor, strokeWidth: isSpecial ? 2.5 : 1.5 },
      });
      list.push({
        id: `e-tree-${t.id}-act`,
        source: `tree-${t.id}`,
        target: `action-${t.id}`,
        animated: isSpecial,
        style: { stroke: strokeColor, strokeWidth: isSpecial ? 2.5 : 1.5 },
      });
    });
    return list;
  }, [trees, currentAction]);

  return (
    <div className="w-full max-w-[450px] h-[300px] select-none bg-transparent pointer-events-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        defaultViewport={DEFAULT_VIEWPORT}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        nodesDraggable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}
export default RandomForestOverlay;
