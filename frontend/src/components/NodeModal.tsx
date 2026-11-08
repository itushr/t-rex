import React from "react";
import { TreeNode } from "../types/tree";

interface NodeModalProps {
  node: TreeNode | null;
  onClose: () => void;
}

export const NodeModal: React.FC<NodeModalProps> = ({ node, onClose }) => {
  if (!node) return null;

  return (
    <div className="absolute top-4 right-4 w-72 bg-bg-panel border border-border-default rounded shadow-xl p-3 z-30 flex flex-col gap-2">
      <div className="flex items-center justify-between border-b border-border-default pb-1.5">
        <span className="text-xs font-bold text-text-primary">
          Node #{node.id} {node.is_leaf ? "(Leaf)" : "(Split)"}
        </span>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xs">
          ✕
        </button>
      </div>

      <div className="text-xs flex flex-col gap-1 font-mono-code">
        <div>Condition: <strong className="text-accent">{node.condition}</strong></div>
        <div>Prediction: <strong className="text-text-primary">{node.prediction.toUpperCase()}</strong></div>
        <div>Samples: <span className="text-text-dim">{node.samples}</span></div>
        <div>Impurity (gini): <span className="text-text-dim">{node.impurity}</span></div>
      </div>

      {node.distribution && (
        <div className="border-t border-border-default pt-2 flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-text-muted uppercase">Class distribution</span>
          <div className="flex flex-col gap-1 text-xs font-mono-code">
            {Object.entries(node.distribution).map(([act, pct]) => (
              <div key={act} className="flex items-center justify-between">
                <span className="capitalize">{act}:</span>
                <span className="text-text-dim">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
