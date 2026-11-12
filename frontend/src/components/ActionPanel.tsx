import { Camera, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import type { GameStatus } from "../game/useGameRunnerControls";

interface ActionPanelProps {
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  gameStatus?: GameStatus;
  onTogglePlayPause?: () => void;
  onRestart?: () => void;
}

export function ActionPanel({
  soundEnabled = true,
  onToggleSound,
  gameStatus = "paused",
  onTogglePlayPause,
  onRestart,
}: ActionPanelProps) {
  return (
    <div className="action-panel fixed bottom-10 bg-black/95 text-white rounded-full flex items-center scale-y-90 pointer-events-auto select-none z-50">
      <div className="flex gap-5 items-center bg-black rounded-full p-2 pr-7 border border-border/20 scale-y-110">
        <div className="rounded-full border border-border/20 p-3">
          <Camera strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 stroke-black" />
        </div>
        <div className="flex gap-5 items-center">
          <div className="text-3xl">00:00:05</div>
          {gameStatus === "crashed" ? (
            <button
              type="button"
              onClick={onRestart}
              className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center justify-center"
              title="Restart"
            >
              <RotateCcw strokeWidth={2} className="size-7" />
            </button>
          ) : gameStatus === "playing" ? (
            <button
              type="button"
              onClick={onTogglePlayPause}
              className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center justify-center"
              title="Pause"
            >
              <Pause strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onTogglePlayPause}
              className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center justify-center"
              title="Play"
            >
              <Play strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleSound}
            className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center justify-center"
            title={soundEnabled ? "Disable sound" : "Enable sound"}
          >
            {soundEnabled ? (
              <Volume2 strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 text-white" />
            ) : (
              <VolumeX strokeWidth={1.5} className="size-8 text-white opacity-60" />
            )}
          </button>
          <SkipForward strokeWidth={1.5} fill="white" nonScalingStroke className="size-7 cursor-pointer" />
        </div>
      </div>
      <div className="pl-2.5 pr-5 cursor-pointer">
        <X className="size-5" />
      </div>
    </div>
  );
}

export default ActionPanel;
