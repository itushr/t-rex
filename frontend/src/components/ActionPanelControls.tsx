import { DiagramFlowVertical, Pause, Play, SkipForward, Volume2, VolumeX } from "lucide-react";
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
  soundDisabled?: boolean;
  trainDisabled?: boolean;
  onPlayToggle: () => void;
  onToggleSound?: () => void;
  onForward?: () => void;
  onVisualize?: () => void;
}

export function ActionPanelControls({
  timer, isRecording, isRecordingPaused, gameStatus, soundEnabled,
  showVisualize, soundDisabled, trainDisabled, onPlayToggle,
  onToggleSound, onForward, onVisualize,
}: ControlsProps) {
  const isCrashed = gameStatus === "crashed";
  const isPlaying = gameStatus === "playing";

  return (
    <div className="flex gap-5 items-center self-stretch pr-7">
      <StopwatchTimer mins={timer.mins} secs={timer.secs} ms={timer.ms} isRecording={isRecording} isRecordingPaused={isRecordingPaused} />

      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={onPlayToggle} className="h-full cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center">
            {isCrashed || !isPlaying ? <Play strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" /> : <Pause strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{isCrashed ? "Restart Game" : isPlaying ? "Pause Game" : "Play Game"} <Kbd>P</Kbd></TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled={soundDisabled}
            onClick={soundDisabled ? undefined : onToggleSound}
            className={`h-full p-0 m-0 bg-transparent border-0 text-white flex items-center ${soundDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}
          >
            {soundEnabled && !soundDisabled ? <Volume2 strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 text-white" /> : <VolumeX strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 text-white" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{soundDisabled ? "Sound not available" : soundEnabled ? "Mute" : "Unmute"} {!soundDisabled && <Kbd>M</Kbd>}</TooltipContent>
      </Tooltip>

      {!showVisualize && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              disabled={trainDisabled || !onForward}
              onClick={trainDisabled ? undefined : onForward}
              className={`h-full p-0 m-0 bg-transparent border-0 text-white flex items-center ${trainDisabled || !onForward ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}
            >
              <SkipForward strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{trainDisabled ? "Training not available" : "Start Training"} {!trainDisabled && onForward && <Kbd>T</Kbd>}</TooltipContent>
        </Tooltip>
      )}

      {showVisualize && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onVisualize} className="h-full cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 flex items-center">
              <DiagramFlowVertical strokeWidth={1.5} fill="white" className="size-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Open Visualizer <Kbd>V</Kbd></TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
