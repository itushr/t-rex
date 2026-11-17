import { Eye, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { StopwatchTimer } from "./StopwatchTimer";
import type { TimerData } from "../hooks/useActionPanelTimer";
import type { GameStatus } from "../game/useGameRunnerControls";

interface ControlsProps {
  timer: TimerData;
  isRecording?: boolean;
  isRecordingPaused?: boolean;
  gameStatus: GameStatus;
  soundEnabled: boolean;
  showVisualize: boolean;
  onPlayToggle: () => void;
  onToggleSound?: () => void;
  onForward?: () => void;
  onVisualize?: () => void;
}

export function ActionPanelControls({
  timer, isRecording, isRecordingPaused, gameStatus, soundEnabled,
  showVisualize, onPlayToggle, onToggleSound, onForward, onVisualize,
}: ControlsProps) {
  return (
    <div className="flex gap-5 items-center">
      <StopwatchTimer
        mins={timer.mins}
        secs={timer.secs}
        ms={timer.ms}
        isRecording={isRecording}
        isRecordingPaused={isRecordingPaused}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={onPlayToggle} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center">
            {gameStatus === "crashed" ? <RotateCcw strokeWidth={2} className="size-7" /> : gameStatus === "playing" ? <Pause strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" /> : <Play strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">play <Kbd>P</Kbd></TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={onToggleSound} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center">
            {soundEnabled ? <Volume2 strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 text-white" /> : <VolumeX strokeWidth={1.5} className="size-8 text-white opacity-60" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">mute <Kbd>M</Kbd></TooltipContent>
      </Tooltip>

      {!showVisualize && onForward && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onForward} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center">
              <SkipForward strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">train</TooltipContent>
        </Tooltip>
      )}

      {showVisualize && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onVisualize} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-cyan-400 flex items-center">
              <Eye strokeWidth={1.8} className="size-7 text-cyan-400" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">visualize <Kbd>V</Kbd></TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
