import React from "react";
import { TreePathResult } from "@/types/playback";

interface ForestSelectorProps {
  nEstimators: number;
  activeTreeIndex: number;
  onSelectTree: (idx: number) => void;
  stepTrees?: TreePathResult[];
}

export const ForestSelector: React.FC<ForestSelectorProps> = ({
  nEstimators,
  activeTreeIndex,
  onSelectTree,
  stepTrees = [],
}) => {
  if (nEstimators <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {Array.from({ length: nEstimators }).map((_, idx) => {
        const treeInfo = stepTrees.find((t) => t.tree_index === idx);
        const pred = treeInfo?.predicted_action?.toLowerCase() ?? "none";
        const isSelected = idx === activeTreeIndex;

        const pillStyles: Record<string, string> = {
          jump: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
          duck: "bg-amber-500/20 text-amber-400 border-amber-500/40",
          none: "bg-muted/20 text-muted-foreground border-border",
        };

        return (
          <button
            key={`forest-tree-${idx}`}
            onClick={() => onSelectTree(idx)}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded border transition-colors shrink-0 cursor-pointer ${
              isSelected ? "bg-accent border-primary" : "hover:bg-card border-border"
            }`}
          >
            <span className="text-xs font-mono font-semibold">#{idx + 1}</span>
            {treeInfo && (
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${pillStyles[pred] || pillStyles.none}`}>
                {pred.toUpperCase()}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ForestSelector;
