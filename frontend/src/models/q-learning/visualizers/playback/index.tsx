import { useEffect, useState, useRef } from "react";
import { fetchPlaybackMeta, fetchPlaybackStep } from "@/services/api";
import { getPrivatePlaybackMeta, getPrivatePlaybackStep } from "@/services/privateApi";
import type { PlaybackMetaResponse } from "@/types/playback";
import { PlaybackHeader } from "@/components/visualizer/PlaybackHeader";

export interface QLearningPlaybackVisualizerProps {
  playbackName: string;
  isPrivate?: boolean;
}

export function QLearningPlaybackVisualizer({ playbackName, isPrivate = false }: QLearningPlaybackVisualizerProps) {
  const [meta, setMeta] = useState<PlaybackMetaResponse | null>(null);
  const [stepNo, setStepNo] = useState(1);
  const [stepData, setStepData] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimer = useRef<number | null>(null);

  const getMeta = isPrivate ? getPrivatePlaybackMeta : fetchPlaybackMeta;
  const getStep = isPrivate ? getPrivatePlaybackStep : fetchPlaybackStep;

  useEffect(() => { getMeta(playbackName).then(setMeta); }, [playbackName, isPrivate]);

  useEffect(() => {
    if (!meta) return;
    getStep(playbackName, stepNo).then(setStepData);
  }, [playbackName, stepNo, meta, isPrivate]);

  useEffect(() => {
    if (!isPlaying || !meta) return;
    playTimer.current = window.setInterval(() => {
      setStepNo((prev) => (prev >= meta.total_steps ? 1 : prev + 1));
    }, 300);
    return () => { if (playTimer.current) clearInterval(playTimer.current); };
  }, [isPlaying, meta]);

  const qValues: Record<string, number> = stepData?.q_values ?? stepData?.action_values ?? {};
  const currentAction = stepData?.action ?? "NONE";

  return (
    <div className="flex flex-col h-full w-full overflow-hidden text-foreground bg-background">
      <PlaybackHeader
        playbackName={playbackName} modelType="q_learning" stepNo={stepNo}
        totalSteps={meta?.total_steps ?? 0} isPlaying={isPlaying} onTogglePlay={() => setIsPlaying(!isPlaying)}
        onPrev={() => setStepNo((s: number) => Math.max(1, s - 1))}
        onNext={() => setStepNo((s: number) => Math.min(meta?.total_steps ?? 1, s + 1))}
      />
      <div className="flex-1 overflow-auto p-6 max-w-2xl mx-auto w-full flex flex-col gap-4">
        <div className="border border-border rounded bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase font-mono mb-2">Step State</div>
          <div className="font-mono text-sm bg-background border border-border p-3 rounded text-primary">
            {stepData?.state ? JSON.stringify(stepData.state, null, 2) : "State: Safe / Advancing"}
          </div>
        </div>
        <div className="border border-border rounded bg-card p-4">
          <div className="text-xs text-muted-foreground uppercase font-mono mb-3">Q-Value Distribution</div>
          <div className="flex flex-col gap-2">
            {Object.keys(qValues).length > 0 ? (
              Object.entries(qValues).map(([act, val]) => (
                <div key={act} className="flex items-center gap-3 text-xs font-mono">
                  <span className="w-16 uppercase font-bold">{act}</span>
                  <div className="flex-1 bg-background border border-border h-4 rounded overflow-hidden">
                    <div className="bg-primary h-full transition-all" style={{ width: `${Math.min(100, Math.max(5, (val + 10) * 5))}%` }} />
                  </div>
                  <span className="w-16 text-right font-semibold">{val.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-muted-foreground">Action chosen: <span className="font-mono text-primary font-bold uppercase">{currentAction}</span></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QLearningPlaybackVisualizer;
