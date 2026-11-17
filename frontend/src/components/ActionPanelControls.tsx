import { Eye, Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
import type { GameStatus } from "../game/useGameRunnerControls";

interface ControlsProps {
  timerDisplay: string;
  gameStatus: GameStatus;
  soundEnabled: boolean;
  showVisualize: boolean;
  onPlayToggle: () => void;
  onToggleSound?: () => void;
  onForward?: () => void;
  onVisualize?: () => void;
}

export function ActionPanelControls({
  timerDisplay, gameStatus, soundEnabled, showVisualize,
  onPlayToggle, onToggleSound, onForward, onVisualize,
}: ControlsProps) {
  return (
    <div className="flex gap-5 items-center pr-3">
      <div className="text-3xl font-mono tabular-nums">{timerDisplay}</div>
      <Tooltip>
        <TooltipTrigger render={
          <Button variant="ghost" onClick={onPlayToggle} className="cursor-pointer hover:opacity-80 p-0 text-white flex items-center">
            {gameStatus === "crashed" ? <RotateCcw strokeWidth={2} className="size-7" /> : gameStatus === "playing" ? <Pause strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" /> : <Play strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />}
          </Button>
        } />
        <TooltipContent>play <Kbd>P</Kbd></TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={
          <Button variant="ghost" onClick={onToggleSound} className="cursor-pointer hover:opacity-80 p-0 text-white flex items-center">
            {soundEnabled ? <Volume2 strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 text-white" /> : <VolumeX strokeWidth={1.5} className="size-8 text-white opacity-60" />}
          </Button>
        } />
        <TooltipContent>mute <Kbd>M</Kbd></TooltipContent>
      </Tooltip>

      {!showVisualize && onForward && (
        <Tooltip>
          <TooltipTrigger render={
            <Button variant="ghost" onClick={onForward} className="cursor-pointer hover:opacity-80 p-0 text-white flex items-center">
              <SkipForward strokeWidth={1.5} fill="white" nonScalingStroke className="size-7" />
            </Button>
          } />
          <TooltipContent>train</TooltipContent>
        </Tooltip>
      )}

      {showVisualize && (
        <Tooltip>
          <TooltipTrigger render={
            <Button variant="ghost" onClick={onVisualize} aria-label="visulize" title="visulize" className="cursor-pointer hover:opacity-80 p-0 text-cyan-400 flex items-center">
              <Eye strokeWidth={1.8} className="size-7 text-cyan-400" />
            </Button>
          } />
          <TooltipContent>visualize <Kbd>V</Kbd></TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
