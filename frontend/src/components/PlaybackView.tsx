import React, { useState } from "react";
import { PlaybackSession } from "../types/playback";
import { TreeNode } from "../types/tree";
import { usePlaybackScrubber } from "../hooks/usePlaybackScrubber";
import { StepTable } from "./StepTable";
import { StepHUD } from "./StepHUD";
import { ForestSelector } from "./ForestSelector";
import { TreeViewer } from "./TreeViewer";
import { NodeModal } from "./NodeModal";

interface PlaybackViewProps {
  session: PlaybackSession;
  scrubber: ReturnType<typeof usePlaybackScrubber>;
}

export const PlaybackView: React.FC<PlaybackViewProps> = ({ session, scrubber }) => {
  const [activeTreeIndex, setActiveTreeIndex] = useState<number>(0);
  const [inspectedNode, setInspectedNode] = useState<TreeNode | null>(null);

  const forest = session.forest;
  const nEstimators = forest?.n_estimators ?? session.n_estimators ?? 1;
  const activeTree: TreeNode | null =
    forest?.trees?.[activeTreeIndex] ?? session.tree ?? null;

  const currentStep = scrubber.activeStep;
  const currentTreeResult = currentStep?.trees?.find(
    (t) => t.tree_index === activeTreeIndex
  );
  const activeNodeIds = currentTreeResult?.node_ids ?? currentStep?.path ?? [];

  return (
    <div className="flex-1 flex overflow-hidden relative">
      <StepTable
        records={session.records}
        currentIndex={scrubber.currentIndex}
        onSelectIndex={(idx) => scrubber.setCurrentIndex(idx)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-primary">
        <StepHUD step={currentStep} activeTreeIndex={activeTreeIndex} />

        {nEstimators > 1 && (
          <div className="px-3 py-1.5 bg-bg-panel border-b border-border-default">
            <ForestSelector
              nEstimators={nEstimators}
              activeTreeIndex={activeTreeIndex}
              onSelectTree={(idx) => setActiveTreeIndex(idx)}
              stepTrees={currentStep?.trees}
            />
          </div>
        )}

        <div className="relative flex-1 overflow-hidden">
          <TreeViewer
            tree={activeTree}
            activeNodeIds={activeNodeIds}
            titleBadge={
              nEstimators > 1
                ? `Tree ${activeTreeIndex + 1} of ${nEstimators}`
                : "Decision tree"
            }
            onSelectNode={(node) => setInspectedNode(node)}
          />
          <NodeModal
            node={inspectedNode}
            onClose={() => setInspectedNode(null)}
          />
        </div>
      </div>
    </div>
  );
};
