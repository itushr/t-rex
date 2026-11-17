import { useState } from "react";
import { Camera, X } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { ActionPanelControls } from "./ActionPanelControls";
import { useActionPanelTimer } from "../hooks/useActionPanelTimer";
import { useActionPanelShortcuts } from "../hooks/useActionPanelShortcuts";
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
  const [hidden, setHidden] = useState(false);
  const timer = useActionPanelTimer(isRecording, isRecordingPaused);

  const handlePlayToggle = () => (gameStatus === "crashed" ? onRestart ?? onTogglePlayPause : onTogglePlayPause)?.();
  const toggleVisibility = () => setHidden((h) => !h);

  useActionPanelShortcuts({
    onToggleRecord, onTogglePlayPause: handlePlayToggle, onToggleSound,
    onToggleCollapse: toggleVisibility, onVisualize, showVisualize,
  });

  if (hidden) return null;

  const camBg = isRecording
    ? isRecordingPaused
      ? "border-amber-500 bg-amber-500/20"
      : "border-red-500 bg-red-500/20 animate-pulse"
    : "border-border/20";

  return (
    <TooltipProvider delayDuration={150}>
      <div className="action-panel fixed bottom-10 bg-black/95 text-white rounded-full flex items-center scale-y-90 pointer-events-auto select-none z-50">
        <div className="flex gap-5 items-center bg-black rounded-full p-2 pr-7 border border-border/20 scale-y-110">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onToggleRecord}
                className={`rounded-full border p-3 cursor-pointer transition-colors ${camBg}`}
                title={isRecording ? (isRecordingPaused ? "Resume Recording" : "Pause Recording") : "Start Recording"}
              >
                <Camera strokeWidth={1.5} fill={isRecording ? (isRecordingPaused ? "#f59e0b" : "#ef4444") : "white"} nonScalingStroke className="size-8 stroke-black" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">record <Kbd>R</Kbd></TooltipContent>
          </Tooltip>

          <ActionPanelControls
            timer={timer} isRecording={isRecording} isRecordingPaused={isRecordingPaused}
            gameStatus={gameStatus} soundEnabled={soundEnabled}
            showVisualize={showVisualize} onPlayToggle={handlePlayToggle}
            onToggleSound={onToggleSound} onForward={onForward} onVisualize={onVisualize}
          />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setHidden(true)}
              className="pl-2.5 pr-5 cursor-pointer bg-transparent border-0 text-white flex items-center p-0 m-0"
              title="Close panel"
            >
              <X className="size-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">toggle width <Kbd>C</Kbd></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export default ActionPanel;
