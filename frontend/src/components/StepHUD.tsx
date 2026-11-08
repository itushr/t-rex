import React from "react";
import { PlaybackStep } from "../types/playback";

interface StepHUDProps {
  step: PlaybackStep | null;
  activeTreeIndex: number;
}

export const StepHUD: React.FC<StepHUDProps> = ({ step, activeTreeIndex }) => {
  if (!step) {
    return (
      <div className="bg-bg-panel border-b border-border-default p-3 text-xs text-text-muted">
        Select a step row to inspect decision rules.
      </div>
    );
  }

  const act = step.action.toLowerCase();
  const treeRec = step.trees?.find((t) => t.tree_index === activeTreeIndex);
  const nodeIds = treeRec?.node_ids ?? step.path ?? [];
  const rules = (treeRec?.steps ?? step.steps ?? [])
    .filter((s) => !s.is_leaf && s.feature)
    .map((s) => `${s.feature} ${s.branch} ${s.thresh} (actual: ${s.actual})`);

  return (
    <div className="bg-bg-panel border-b border-border-default p-3.5 flex flex-col gap-2.5 z-10">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-text-primary">
          Step #{step.step} ({step.time.toFixed(2)}s)
        </span>
        <div className="flex items-center gap-2">
          {step.votes && Object.keys(step.votes).length > 0 && (
            <span className="text-xs font-mono-code text-text-dim px-2 py-0.5 rounded bg-bg-card border border-border-default">
              Votes: {Object.entries(step.votes).map(([a, c]) => `${a}:${c}`).join(" ")}
            </span>
          )}
          <span className={`text-xs font-mono-code font-bold px-2 py-0.5 rounded border uppercase ${
            act === "jump" ? "bg-jump/20 text-jump border-jump" :
            act === "duck" ? "bg-duck/20 text-duck border-duck" :
            "bg-none/20 text-text-dim border-border-default"
          }`}>
            {step.action}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-mono-code">
        <div className="bg-bg-card border border-border-default px-2 py-1 rounded text-text-dim">
          Obs 1: <strong className="text-text-primary">{step.obs1.type !== "none" ? `${step.obs1.type} @ ${step.obs1.x.toFixed(1)}px` : "None"}</strong>
        </div>
        <div className="bg-bg-card border border-border-default px-2 py-1 rounded text-text-dim">
          TTI: <strong className="text-text-primary">{step.time_to_impact && step.time_to_impact > 0 ? step.time_to_impact.toFixed(2) : "None"}</strong>
        </div>
        <div className="bg-bg-card border border-border-default px-2 py-1 rounded text-text-dim">
          Speed: <strong className="text-text-primary">{step.speed.toFixed(2)}</strong>
        </div>
        <div className="bg-bg-card border border-border-default px-2 py-1 rounded text-text-dim">
          State: <strong className="text-text-primary">{step.jumping ? "Jumping" : step.ducking ? "Ducking" : "Ground"}</strong>
        </div>
      </div>

      <div className="text-xs font-mono-code text-text-dim truncate">
        Path: {nodeIds.length > 0 ? nodeIds.map((id) => `#${id}`).join(" -> ") : "None"}
        {rules.length > 0 && ` | Tests: ${rules.join(", ")}`}
      </div>
    </div>
  );
};
