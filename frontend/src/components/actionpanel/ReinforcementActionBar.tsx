import { DiagramFlowVertical, Pause, Play, Repeat, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { TriesCounter } from "./TriesCounter";
import { ModelSelector } from "./ModelSelector";
import type { GameStatus } from "../../game/useGameRunnerControls";

export interface ReinforcementActionBarProps {
  gameStatus: GameStatus; soundEnabled: boolean; soundDisabled?: boolean;
  tries?: number; repeat?: boolean; selectedModel?: string;
  onSelectModel?: (m: string) => void; onPlayToggle: () => void;
  onToggleSound?: () => void; onToggleRepeat?: () => void;
  onVisualize?: () => void; onForward?: () => void;
}

export function ReinforcementActionBar({
  gameStatus, soundEnabled, soundDisabled, tries = 1, repeat = true,
  selectedModel, onSelectModel, onPlayToggle, onToggleSound, onToggleRepeat,
  onVisualize, onForward,
}: ReinforcementActionBarProps) {
  const isCrashed = gameStatus === "crashed", isPlaying = gameStatus === "playing";
  return (
    <div className="flex gap-5 items-center pr-7">
      <TriesCounter tries={tries} />
      <ModelSelector selectedModel={selectedModel} onSelectModel={onSelectModel} />
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
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" onClick={onToggleRepeat} className={`cursor-pointer transition-colors p-0 m-0 bg-transparent flex items-center ${repeat ? "text-white opacity-100" : "text-neutral-500 opacity-40 hover:opacity-75"}`}>
            <Repeat strokeWidth={1.75} className="size-6" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">Auto Retry: {repeat ? "ON" : "OFF"}</TooltipContent>
      </Tooltip>
      {onVisualize && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onVisualize} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent text-white flex items-center">
              <DiagramFlowVertical strokeWidth={1.5} fill="white" className="size-6" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Inspect Q-Table <Kbd>V</Kbd></TooltipContent>
        </Tooltip>
      )}
      {onForward && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={onForward} className="cursor-pointer hover:opacity-80 p-0 m-0 bg-transparent text-white flex items-center">
              <SkipForward strokeWidth={1.5} fill="white" className="size-7" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">Save Model <Kbd>F</Kbd></TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
export default ReinforcementActionBar;
