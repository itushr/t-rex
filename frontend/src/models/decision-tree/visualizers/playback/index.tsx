import { useEffect, useState, useRef } from "react";
import { fetchPlaybackMeta, fetchPlaybackStep } from "@/services/api";
import { getPrivatePlaybackMeta, getPrivatePlaybackStep } from "@/services/privateApi";
import type { PlaybackMetaResponse } from "@/types/playback";
import { PlaybackHeader } from "@/components/visualizer/PlaybackHeader";
import { PlaybackPredictionSidebar } from "@/components/visualizer/PlaybackPredictionSidebar";
import { TreeViewer } from "@/components/visualizer/TreeViewer";
import { NodeModal } from "@/components/visualizer/NodeModal";
import type { TreeNode } from "@/types/tree";

export interface PlaybackVisualizerProps {
  playbackName: string;
  isPrivate?: boolean;
}

export function DecisionTreePlaybackVisualizer({ playbackName, isPrivate = false }: PlaybackVisualizerProps) {
  const [meta, setMeta] = useState<PlaybackMetaResponse | null>(null);
  const [predictionStep, setPredictionStep] = useState(1);
  const [stepData, setStepData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inspected, setInspected] = useState<TreeNode | null>(null);
  const playTimer = useRef<number | null>(null);

  const getMeta = isPrivate ? getPrivatePlaybackMeta : fetchPlaybackMeta;
  const getStep = isPrivate ? getPrivatePlaybackStep : fetchPlaybackStep;

  useEffect(() => { getMeta(playbackName).then(setMeta); }, [playbackName, isPrivate]);

  useEffect(() => {
    if (!meta) return;
    getStep(playbackName, predictionStep).then(setStepData);
  }, [playbackName, predictionStep, meta, isPrivate]);

  useEffect(() => {
    if (!isPlaying || !meta) return;
    playTimer.current = window.setInterval(() => {
      setPredictionStep((prev) => (prev >= meta.total_steps ? 1 : prev + 1));
    }, 400);
    return () => { if (playTimer.current) clearInterval(playTimer.current); };
  }, [isPlaying, meta]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden text-foreground bg-background">
      <PlaybackHeader
        playbackName={playbackName} modelType={meta?.model_type ?? "decision_tree"} stepNo={predictionStep}
        totalSteps={meta?.total_steps ?? 0} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
        onPrev={() => setPredictionStep((s: number) => Math.max(1, s - 1))}
        onNext={() => setPredictionStep((s: number) => Math.min(meta?.total_steps ?? 1, s + 1))}
      />
      <div className="flex-1 flex overflow-hidden">
        <PlaybackPredictionSidebar
          modelType={meta?.model_type ?? "decision_tree"} steps={meta?.steps ?? []}
          activeStepNo={predictionStep} onSelectStep={(s: number) => setPredictionStep(s)}
        />
        <div className="flex-1 overflow-hidden relative">
          <div className="h-full w-full relative">
            <TreeViewer tree={stepData?.tree ?? null} activeNodeIds={stepData?.path ?? []} onSelectNode={(n: TreeNode) => setInspected(n)} />
            <NodeModal node={inspected} onClose={() => setInspected(null)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DecisionTreePlaybackVisualizer;
