import { DiagramFlowVertical, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { StopwatchTimer } from "../StopwatchTimer";
import type { TimerData } from "../../hooks/useActionPanelTimer";
import type { GameStatus } from "../../game/useGameRunnerControls";

export interface AutoplayActionBarProps {
  timer: TimerData; isRecording?: boolean; isRecordingPaused?: boolean;
  gameStatus: GameStatus; soundEnabled: boolean; soundDisabled?: boolean;
  showVisualize?: boolean; onPlayToggle: () => void;
  onToggleSound?: () => void; onVisualize?: () => void;
}

export function AutoplayActionBar({
  timer, isRecording, isRecordingPaused, gameStatus, soundEnabled,
  soundDisabled, showVisualize, onPlayToggle, onToggleSound, onVisualize,
}: AutoplayActionBarProps) {
  const isCrashed = gameStatus === "crashed", isPlaying = gameStatus === "playing";
  return (
    <div className="flex gap-5 items-center pr-7">
      <StopwatchTimer mins={timer.mins} secs={timer.secs} ms={timer.ms} isRecording={isRecording} isRecordingPaused={isRecordingPaused} />
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={onPlayToggle} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent text-white flex items-center">
            {isCrashed || !isPlaying ? <Play strokeWidth={1.5} fill="white" className="size-7" /> : <Pause strokeWidth={1.5} fill="white" className="size-7" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{isCrashed ? "Restart" : isPlaying ? "Pause" : "Play"} <Kbd>P</Kbd></TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" disabled={soundDisabled} onClick={soundDisabled ? undefined : onToggleSound} className={`p-0 m-0 bg-transparent text-white flex items-center ${soundDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}>
            {soundEnabled && !soundDisabled ? <Volume2 strokeWidth={1.5} fill="white" className="size-8" /> : <VolumeX strokeWidth={1.5} fill="white" className="size-8" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{soundDisabled ? "Sound not available" : soundEnabled ? "Mute" : "Unmute"} <Kbd>M</Kbd></TooltipContent>
      </Tooltip>
      {showVisualize && onVisualize && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onVisualize} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent text-white flex items-center">
              <DiagramFlowVertical strokeWidth={1.5} fill="white" className="size-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Visualize Playback <Kbd>V</Kbd></TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
export default AutoplayActionBar;
