import { DiagramFlowVertical, Eye, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
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
    <div className="flex gap-5 items-center self-stretch pr-7">
      <StopwatchTimer
        mins={timer.mins}
        secs={timer.secs}
        ms={timer.ms}
        isRecording={isRecording}
        isRecordingPaused={isRecordingPaused}
      />

      {!showVisualize && onForward && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onPlayToggle} className="h-full cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center">
              {gameStatus === "crashed" ? <Play strokeWidth={1.5} nonScalingStroke fill="white" className="size-7" /> : gameStatus === "playing" ? <Pause strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" /> : <Play strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{gameStatus === "crashed" ? "Restart Game" : gameStatus === "playing" ? "Pause Game" : "Play Game"} <Kbd>P</Kbd></TooltipContent>
        </Tooltip>
      )}

      {showVisualize && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onPlayToggle} className="h-full cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center">
              {gameStatus === "crashed" ? <Play strokeWidth={1.5} nonScalingStroke fill="white" className="size-7" /> : gameStatus === "playing" ? <Pause strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" /> : <Play strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">{gameStatus === "crashed" ? "Restart Autoplay" : gameStatus === "playing" ? "Pause Autoplay" : "Start Autoplay"} <Kbd>P</Kbd></TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={onToggleSound} className="h-full cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center">
            {soundEnabled ? <Volume2 strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 text-white" /> : <VolumeX strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 text-white" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">{soundEnabled ? "Mute" : "Unmute"} <Kbd>M</Kbd></TooltipContent>
      </Tooltip>

      {!showVisualize && onForward && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onForward} className="h-full cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center">
              <SkipForward strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Start Training <Kbd>T</Kbd></TooltipContent>
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
