import { Eye, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { StopwatchTimer } from "./StopwatchTimer";
import type { TimerData } from "../hooks/useActionPanelTimer";
import type { GameStatus } from "../game/useGameRunnerControls";

interface ControlsProps {
  timer: TimerData; isRecording?: boolean; isRecordingPaused?: boolean;
  gameStatus: GameStatus; soundEnabled: boolean; showVisualize: boolean;
  onPlayToggle: () => void; onToggleSound?: () => void;
  onForward?: () => void; onVisualize?: () => void;
}

export function ActionPanelControls({
  timer, isRecording, isRecordingPaused, gameStatus, soundEnabled,
  showVisualize, onPlayToggle, onToggleSound, onForward, onVisualize,
}: ControlsProps) {
  return (
    <div className="h-full flex gap-5 items-center">
      <div className="h-full flex items-center">
        <StopwatchTimer mins={timer.mins} secs={timer.secs} ms={timer.ms} isRecording={isRecording} isRecordingPaused={isRecordingPaused} />
      </div>

      <div className="h-full flex items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onPlayToggle} className="h-full cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center justify-center">
              {gameStatus === "crashed" ? <Play strokeWidth={1.5} nonScalingStroke fill="white" className="size-7" /> : gameStatus === "playing" ? <Pause strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" /> : <Play strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={14}>{gameStatus === "crashed" ? "Restart" : gameStatus === "playing" ? "Pause" : "Play"} <Kbd>P</Kbd></TooltipContent>
        </Tooltip>
      </div>

      <div className="h-full flex items-center justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onToggleSound} className="h-full cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center justify-center">
              {soundEnabled ? <Volume2 strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 text-white" /> : <VolumeX strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 text-white" />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={14}>{soundEnabled ? "Mute" : "Unmute"} <Kbd>M</Kbd></TooltipContent>
        </Tooltip>
      </div>

      {!showVisualize && onForward && (
        <div className="h-full flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onForward} className="h-full cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-white flex items-center justify-center">
                <SkipForward strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={14}>train</TooltipContent>
          </Tooltip>
        </div>
      )}

      {showVisualize && (
        <div className="h-full flex items-center justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" onClick={onVisualize} className="h-full cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent border-0 text-cyan-400 flex items-center justify-center">
                <Eye strokeWidth={1.8} className="size-7 text-cyan-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" sideOffset={14}>visualize <Kbd>V</Kbd></TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

export default ActionPanelControls;
