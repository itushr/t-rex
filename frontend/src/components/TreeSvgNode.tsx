import React from "react";
import { TreeNode } from "../types/tree";
import { NODE_W, NODE_H } from "../services/treeLayout";

interface TreeSvgNodeProps {
  node: TreeNode;
  isActive: boolean;
  onSelect: (node: TreeNode) => void;
}

export const TreeSvgNode: React.FC<TreeSvgNodeProps> = ({ node, isActive, onSelect }) => {
  const pred = node.prediction.toLowerCase();
  const pillW = 44;
  const pillH = 18;

  const pillColors: Record<string, { bg: string; border: string; text: string }> = {
    jump: { bg: "rgba(16, 185, 129, 0.2)", border: "#10b981", text: "#10b981" },
    duck: { bg: "rgba(245, 158, 11, 0.2)", border: "#f59e0b", text: "#f59e0b" },
    none: { bg: "rgba(100, 116, 139, 0.2)", border: "#64748b", text: "#94a3b8" },
  };
  const color = pillColors[pred] || pillColors.none;

  return (
    <g
      transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`}
      className="cursor-pointer select-none"
      onClick={() => onSelect(node)}
    >
      <rect
        width={NODE_W}
        height={NODE_H}
        rx={4}
        ry={4}
        className={`transition-colors ${
          isActive
            ? "fill-bg-card stroke-accent stroke-2"
            : "fill-bg-panel stroke-border-default hover:stroke-border-hover"
        }`}
      />

      <text x={10} y={16} className="text-[10px] font-mono-code fill-text-muted font-semibold">
        #{node.id} {node.is_leaf ? "LEAF" : ""}
      </text>

      <text
        x={10}
        y={34}
        className="text-[11px] font-semibold"
        fill={node.is_leaf ? color.text : "var(--color-text-primary)"}
      >
        {node.is_leaf ? `Action: ${node.prediction.toUpperCase()}` : node.condition}
      </text>

      <text x={10} y={52} className="text-[10px] font-mono-code fill-text-dim">
        samples: {node.samples} | gini: {node.impurity}
      </text>

      <rect
        x={NODE_W - pillW - 8}
        y={8}
        width={pillW}
        height={pillH}
        rx={3}
        ry={3}
        fill={color.bg}
        stroke={color.border}
        strokeWidth={1}
      />
      <text
        x={NODE_W - pillW / 2 - 8}
        y={20}
        textAnchor="middle"
        className="text-[10px] font-mono-code font-bold pointer-events-none"
        fill={color.text}
      >
        {node.prediction.toUpperCase()}
      </text>
    </g>
  );
};
