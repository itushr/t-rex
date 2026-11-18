import { useMemo } from "react";
import { ReactFlow, Node, Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { InputFlowNode, TreeFlowNode, ActionFlowNode } from "./rfNodes";
import { SimState } from "./types";

const NODE_TYPES = { inputNode: InputFlowNode, treeNode: TreeFlowNode, actionNode: ActionFlowNode };

export function RandomForestOverlay({ state }: { state?: SimState }) {
  const currentAction = state?.action || "RUN";
  const trees = state?.trees || [
    { id: "1", name: "Tree #1", rule: "dist < 115", action: currentAction },
    { id: "2", name: "Tree #2", rule: "tti < 0.62", action: currentAction },
    { id: "3", name: "Tree #3", rule: "bird == false", action: currentAction },
  ];

  const nodes: Node[] = useMemo(() => [
    {
      id: "input",
      type: "inputNode",
      position: { x: 10, y: 90 },
      data: { dist: state?.dist ?? 999, speed: state?.speed ?? 6.8, obsType: state?.obsType ?? "none" },
    },
    ...trees.map((t, idx) => ({
      id: `tree-${t.id}`,
      type: "treeNode",
      position: { x: 155, y: 15 + idx * 85 },
      data: { label: t.name, rule: t.rule, action: t.action, active: t.action === currentAction },
    })),
    ...trees.map((t, idx) => ({
      id: `action-${t.id}`,
      type: "actionNode",
      position: { x: 300, y: 18 + idx * 85 },
      data: { action: t.action, active: t.action === currentAction && currentAction !== "RUN" },
    })),
  ], [state, currentAction, trees]);

  const edges: Edge[] = useMemo(() => {
    const list: Edge[] = [];
    const strokeColor = currentAction === "JUMP" ? "#10b981" : currentAction === "DUCK" ? "#f59e0b" : "#71717a";
    trees.forEach((t) => {
      list.push({
        id: `e-in-tree-${t.id}`,
        source: "input",
        target: `tree-${t.id}`,
        animated: currentAction !== "RUN",
        style: { stroke: strokeColor, strokeWidth: currentAction !== "RUN" ? 2 : 1.2 },
      });
      list.push({
        id: `e-tree-${t.id}-act`,
        source: `tree-${t.id}`,
        target: `action-${t.id}`,
        animated: currentAction !== "RUN",
        style: { stroke: strokeColor, strokeWidth: currentAction !== "RUN" ? 2 : 1.2 },
      });
    });
    return list;
  }, [trees, currentAction]);

  return (
    <div className="w-[410px] h-[285px] rounded-2xl bg-zinc-50/90 border border-zinc-200/80 shadow-inner overflow-hidden select-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.15 }}
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
