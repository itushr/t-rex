import { useEffect, useState, useRef } from "react";
import { fetchPlaybackMeta, fetchPlaybackStep, fetchPlaybackStepTree } from "../services/api";
import { PlaybackMetaResponse } from "../types/playback";
import { PlaybackHeader } from "../components/PlaybackHeader";
import { PlaybackPredictionSidebar } from "../components/PlaybackPredictionSidebar";
import { PlaybackTreesTable } from "../components/PlaybackTreesTable";
import { TreeViewer } from "../components/TreeViewer";
import { NodeModal } from "../components/NodeModal";
import { navigateTo } from "../utils/navigation";

export function PlaybackVisualizePage({ playbackName, predictionStep = 1, treeNo }: { playbackName: string; predictionStep?: number; treeNo?: number }) {
  const [meta, setMeta] = useState<PlaybackMetaResponse | null>(null);
  const [stepData, setStepData] = useState<any>(null);
  const [treeData, setTreeData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inspected, setInspected] = useState<any>(null);
  const playTimer = useRef<number | null>(null);

  useEffect(() => {
    fetchPlaybackMeta(playbackName).then(setMeta);
  }, [playbackName]);

  useEffect(() => {
    if (!meta) return;
    if (meta.model_type === "decision_tree" || !treeNo) {
      fetchPlaybackStep(playbackName, predictionStep).then(setStepData);
    }
    if (meta.model_type === "random_forest" && treeNo) {
      fetchPlaybackStepTree(playbackName, predictionStep, treeNo).then(setTreeData);
    }
  }, [playbackName, predictionStep, treeNo, meta]);

  useEffect(() => {
    if (!isPlaying || !meta) return;
    playTimer.current = window.setInterval(() => {
      const next = predictionStep >= meta.total_steps ? 1 : predictionStep + 1;
      const target = treeNo ? `/visualize/playback/${playbackName}/prediction/${next}/tree/${treeNo}` : `/visualize/playback/${playbackName}/prediction/${next}`;
      navigateTo(target);
    }, 400);
    return () => { if (playTimer.current) clearInterval(playTimer.current); };
  }, [isPlaying, predictionStep, treeNo, meta, playbackName]);

  const selectStep = (s: number) => {
    navigateTo(treeNo ? `/visualize/playback/${playbackName}/prediction/${s}/tree/${treeNo}` : `/visualize/playback/${playbackName}/prediction/${s}`);
  };

  const isDt = meta?.model_type === "decision_tree";
  const activeTree = isDt ? stepData?.tree : treeData?.tree;
  const activePath = isDt ? stepData?.path : treeData?.path;

  return (
    <div className="visualizer-theme flex flex-col h-screen w-screen overflow-hidden text-foreground bg-background">
      <PlaybackHeader
        playbackName={playbackName} modelType={meta?.model_type ?? ""} stepNo={predictionStep}
        totalSteps={meta?.total_steps ?? 0} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
        onPrev={() => selectStep(Math.max(1, predictionStep - 1))} onNext={() => selectStep(Math.min(meta?.total_steps ?? 1, predictionStep + 1))}
        treeNo={treeNo} onBackToTrees={treeNo ? () => navigateTo(`/visualize/playback/${playbackName}/prediction/${predictionStep}`) : undefined}
      />
      <div className="flex-1 flex overflow-hidden">
        <PlaybackPredictionSidebar modelType={meta?.model_type ?? ""} steps={meta?.steps ?? []} activeStepNo={predictionStep} onSelectStep={selectStep} />
        <div className="flex-1 overflow-hidden relative">
          {!isDt && !treeNo ? (
            <PlaybackTreesTable trees={stepData?.trees ?? []} onSelectTree={(y) => navigateTo(`/visualize/playback/${playbackName}/prediction/${predictionStep}/tree/${y}`)} />
          ) : (
            <div className="h-full w-full relative">
              <TreeViewer tree={activeTree ?? null} activeNodeIds={activePath ?? []} onSelectNode={(node) => setInspected(node)} />
              <NodeModal node={inspected} onClose={() => setInspected(null)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
