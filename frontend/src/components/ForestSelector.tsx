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
    <div className="flex flex-col gap-1.5 pt-2 border-t border-border-default">
      <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted uppercase tracking-wider">
        <span>Ensemble estimators</span>
        <span className="text-accent lowercase font-mono-code font-normal">
          Viewing tree {activeTreeIndex + 1} of {nEstimators}
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
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
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded border transition-colors shrink-0 ${
                isSelected
                  ? "border-accent bg-accent/10"
                  : "border-border-default bg-bg-card hover:border-border-hover"
              }`}
            >
              <span className="text-xs font-mono-code font-semibold text-text-primary">
                T{idx + 1}
              </span>
              {treeInfo && (
                <span
                  className={`text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded border ${
                    pillStyles[pred] || pillStyles.none
                  }`}
                >
                  {pred.toUpperCase()}
                </span>
              )}
              <button
                onClick={() => onSelectTree(idx)}
                className={`text-[11px] px-2 py-0.5 rounded transition-colors ${
                  isSelected
                    ? "bg-accent text-bg-primary font-semibold"
                    : "bg-bg-panel hover:bg-bg-hover text-text-dim hover:text-text-primary border border-border-default"
                }`}
              >
                View
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
