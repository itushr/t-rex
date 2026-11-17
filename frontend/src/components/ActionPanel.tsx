import { useState } from "react";
import { Camera, X } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { Button } from "@/components/ui/button";
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
  const [collapsed, setCollapsed] = useState(false);
  const timerDisplay = useActionPanelTimer(isRecording, isRecordingPaused);

  const handlePlayToggle = () => (gameStatus === "crashed" ? onRestart ?? onTogglePlayPause : onTogglePlayPause)?.();
  const toggleCollapse = () => setCollapsed((c) => !c);

  useActionPanelShortcuts({
    onToggleRecord, onTogglePlayPause: handlePlayToggle, onToggleSound,
    onToggleCollapse: toggleCollapse, onVisualize, showVisualize,
  });

  const camBg = isRecording ? (isRecordingPaused ? "border-amber-500 bg-amber-500/20" : "border-red-500 bg-red-500/20 animate-pulse") : "border-border/20";

  return (
    <div className="action-panel fixed bottom-10 bg-black/95 text-white rounded-full flex items-center scale-y-90 pointer-events-auto select-none z-50 transition-all duration-200">
      <div className="flex gap-5 items-center bg-black rounded-full p-2 border border-border/20 scale-y-110">
        <Tooltip>
          <TooltipTrigger render={
            <Button variant="ghost" onClick={onToggleRecord} className={`rounded-full border p-3 cursor-pointer ${camBg}`}>
              <Camera strokeWidth={1.5} fill={isRecording ? (isRecordingPaused ? "#f59e0b" : "#ef4444") : "white"} nonScalingStroke className="size-8 stroke-black" />
            </Button>
          } />
          <TooltipContent>record <Kbd>R</Kbd></TooltipContent>
        </Tooltip>

        {!collapsed && (
          <ActionPanelControls
            timerDisplay={timerDisplay} gameStatus={gameStatus} soundEnabled={soundEnabled}
            showVisualize={showVisualize} onPlayToggle={handlePlayToggle}
            onToggleSound={onToggleSound} onForward={onForward} onVisualize={onVisualize}
          />
        )}
      </div>

      <Tooltip>
        <TooltipTrigger render={
          <Button variant="ghost" onClick={toggleCollapse} aria-label="toggle with" title="toggle with" className="pl-3 pr-5 cursor-pointer hover:opacity-80 text-white flex items-center">
            <X className={`size-5 transition-transform duration-200 ${collapsed ? "rotate-45" : ""}`} />
          </Button>
        } />
        <TooltipContent>toggle width <Kbd>C</Kbd></TooltipContent>
      </Tooltip>
    </div>
  );
}

export default ActionPanel;
