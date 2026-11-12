import React from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { DinoIcon } from "./DinoIcon";

interface Props {
  playbackName: string;
  modelType: string;
  stepNo: number;
  totalSteps: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  treeNo?: number;
  onBackToTrees?: () => void;
}

export const PlaybackHeader: React.FC<Props> = ({
  playbackName, modelType, stepNo, totalSteps, isPlaying,
  onTogglePlay, onPrev, onNext, treeNo, onBackToTrees,
}) => {
  return (
    <header className="border-b border-border px-2 py-2.5 flex items-center justify-between flex-wrap gap-3 z-30 bg-background text-foreground">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2">
          <DinoIcon />
          <span className="font-semibold text-sm">{playbackName}</span>
        </span>
        <span className="border border-border rounded px-2 py-0.5 text-xs text-muted-foreground uppercase">
          {modelType}
        </span>
        {treeNo && <span className="text-xs font-mono font-medium">Viewing Tree #{treeNo}</span>}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onTogglePlay} className="px-1 py-1 cursor-pointer text-xs font-medium">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button onClick={onPrev} className="px-1 py-1 cursor-pointer text-xs font-medium">
          <SkipBack size={20} />
        </button>
        <button onClick={onNext} className="px-1 py-1 cursor-pointer text-xs font-medium">
          <SkipForward size={20} />
        </button>
        <span className="text-xs font-mono text-muted-foreground ml-1">
          {stepNo} / {totalSteps}
        </span>

        {onBackToTrees && (
          <button
            onClick={onBackToTrees}
            className="border border-border rounded px-2.5 py-1 text-xs hover:bg-card cursor-pointer transition-colors"
          >
            ← Back to Trees Table
          </button>
        )}
      </div>
    </header>
  );
};
