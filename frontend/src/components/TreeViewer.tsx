import React, { useRef, useState, useMemo } from "react";
import { TreeNode } from "../types/tree";
import { layoutTree } from "../services/treeLayout";
import { TreeSvgNode } from "./TreeSvgNode";

interface TreeViewerProps {
  tree: TreeNode | null;
  activeNodeIds?: number[];
  titleBadge?: string;
  onSelectNode?: (node: TreeNode) => void;
}

export const TreeViewer: React.FC<TreeViewerProps> = ({
  tree,
  activeNodeIds = [],
  titleBadge,
  onSelectNode = () => {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ scale: 0.85, tx: 50, ty: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const activeSet = useMemo(() => new Set(activeNodeIds), [activeNodeIds]);
  const layout = useMemo(() => (tree ? layoutTree(tree) : { nodes: [], links: [] }), [tree]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("g.cursor-pointer")) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - transform.tx, y: e.clientY - transform.ty });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setTransform((prev) => ({ ...prev, tx: e.clientX - dragStart.x, ty: e.clientY - dragStart.y }));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform((prev) => ({ ...prev, scale: Math.max(0.2, Math.min(3.0, prev.scale * factor)) }));
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsPanning(false)}
      onWheel={handleWheel}
      className="relative flex-1 h-full w-full overflow-hidden cursor-grab active:cursor-grabbing bg-bg-primary select-none"
    >
      {titleBadge && (
        <div className="absolute top-3 right-3 bg-bg-panel/90 border border-border-default px-2.5 py-1 rounded text-xs font-mono-code text-accent z-10">
          {titleBadge}
        </div>
      )}

      <svg className="w-full h-full">
        <g transform={`translate(${transform.tx}, ${transform.ty}) scale(${transform.scale})`}>
          <g>
            {layout.links.map((link) => {
              const isHighlight = activeSet.has(link.parentId) && activeSet.has(link.childId);
              return (
                <g key={`link-${link.parentId}-${link.childId}`}>
                  <path
                    d={`M ${link.sx} ${link.sy} C ${link.sx} ${link.my}, ${link.ex} ${link.my}, ${link.ex} ${link.ey}`}
                    fill="none"
                    stroke={isHighlight ? "var(--color-accent)" : "var(--color-border-default)"}
                    strokeWidth={isHighlight ? 2.5 : 1.5}
                  />
                  <text
                    x={(link.sx + link.ex) / 2 + (link.isLeft ? -14 : 6)}
                    y={link.my}
                    className="text-[10px] font-mono-code fill-text-muted font-semibold"
                  >
                    {link.isLeft ? "<=" : ">"}
                  </text>
                </g>
              );
            })}
          </g>

          <g>
            {layout.nodes.map((node) => (
              <TreeSvgNode
                key={`node-${node.id}`}
                node={node}
                isActive={activeSet.has(node.id)}
                onSelect={onSelectNode}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
};
