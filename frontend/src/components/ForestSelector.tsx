import React from "react";
import { TreePathResult } from "../types/playback";

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
    <div className="flex flex-col gap-1.5 pt-2">
      {/* <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted uppercase tracking-wider">
        <span>Ensemble estimators</span>
        <span className="text-accent lowercase font-mono-code font-normal">
          Viewing tree {activeTreeIndex + 1} of {nEstimators}
        </span>
      </div> */}

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thumb-accent scrollbar-thin">
        {Array.from({ length: nEstimators }).map((_, idx) => {
          const treeInfo = stepTrees.find((t) => t.tree_index === idx);
          const pred = treeInfo?.predicted_action?.toLowerCase() ?? "none";
          const isSelected = idx === activeTreeIndex;

          const pillStyles: Record<string, string> = {
            jump: "bg-jump/20 text-jump border-jump",
            duck: "bg-duck/20 text-duck border-duck",
            none: "bg-none/20 text-text-dim border-border-default",
          };

          return (
            <div
              key={`forest-tree-${idx}`}
              onClick={() => onSelectTree(idx)}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded border transition-colors shrink-0 ${
                isSelected
                  ? "bg-accent"
                  : "hover:bg-card cursor-pointer"
              }`}
            >
              <span className="text-sm font-mono-code font-semibold text-text-primary">
                #{idx + 1}
              </span>
              {treeInfo && (
                <span
                  className={`text-xs font-mono-code font-bold px-1.5 py-0.5 ${
                    pillStyles[pred] || pillStyles.none
                  }`}
                >
                  {pred.toUpperCase()}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
