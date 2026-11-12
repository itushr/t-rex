import { Camera, Eye, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import type { GameStatus } from "../game/useGameRunnerControls";

interface ActionPanelProps {
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  gameStatus?: GameStatus;
  onTogglePlayPause?: () => void;
  onRestart?: () => void;
  isRecording?: boolean;
  isRecordingPaused?: boolean;
  onToggleRecord?: () => void;
  onForward?: () => void;
  showVisualize?: boolean;
  onVisualize?: () => void;
}

export function ActionPanel({
  soundEnabled = true, onToggleSound, gameStatus = "paused",
  onTogglePlayPause, onRestart, isRecording = false, isRecordingPaused = false,
  onToggleRecord, onForward, showVisualize = false, onVisualize,
}: ActionPanelProps) {
  const camBg = isRecording ? (isRecordingPaused ? "border-amber-500 bg-amber-500/20" : "border-red-500 bg-red-500/20 animate-pulse") : "border-border/20";
  return (
    <div className="action-panel fixed bottom-10 bg-black/95 text-white rounded-full flex items-center scale-y-90 pointer-events-auto select-none z-50">
      <div className="flex gap-5 items-center bg-black rounded-full p-2 pr-7 border border-border/20 scale-y-110">
        <button type="button" onClick={onToggleRecord} className={`rounded-full border p-3 cursor-pointer transition-colors ${camBg}`} title={isRecording ? (isRecordingPaused ? "Resume Recording" : "Pause Recording") : "Start Recording"}>
          <Camera strokeWidth={1.5} fill={isRecording ? (isRecordingPaused ? "#f59e0b" : "#ef4444") : "white"} nonScalingStroke className="size-8 stroke-black" />
        </button>
        <div className="flex gap-5 items-center">
          <div className="text-3xl">00:00:05</div>
          {gameStatus === "crashed" ? (
            <button type="button" onClick={onRestart} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center" title="Restart">
              <RotateCcw strokeWidth={2} className="size-7" />
            </button>
          ) : gameStatus === "playing" ? (
            <button type="button" onClick={onTogglePlayPause} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center" title="Pause">
              <Pause strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
            </button>
          ) : (
            <button type="button" onClick={onTogglePlayPause} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center" title="Play">
              <Play strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
            </button>
          )}
          <button type="button" onClick={onToggleSound} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center" title={soundEnabled ? "Disable sound" : "Enable sound"}>
            {soundEnabled ? <Volume2 strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 text-white" /> : <VolumeX strokeWidth={1.5} className="size-8 text-white opacity-60" />}
          </button>
          <button type="button" onClick={onForward} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center" title="Send to Train">
            <SkipForward strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
          </button>
          {showVisualize && (
            <button type="button" onClick={onVisualize} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-cyan-400 flex items-center" title="Visualize Playback">
              <Eye strokeWidth={1.8} className="size-7 text-cyan-400" />
            </button>
          )}
        </div>
      </div>
      <div className="pl-2.5 pr-5 cursor-pointer"><X className="size-5" /></div>
    </div>
  );
}

export default ActionPanel;
