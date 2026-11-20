import { useState } from "react";
import { Aperture, X } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { ActionPanelControls } from "./ActionPanelControls";
import { useActionPanelTimer } from "../hooks/useActionPanelTimer";
import { useActionPanelShortcuts } from "../hooks/useActionPanelShortcuts";
import type { GameStatus } from "../game/useGameRunnerControls";

interface ActionPanelProps {
  soundEnabled?: boolean; onToggleSound?: () => void;
  gameStatus?: GameStatus; onTogglePlayPause?: () => void; onRestart?: () => void;
  isRecording?: boolean; isRecordingPaused?: boolean; onToggleRecord?: () => void;
  onForward?: () => void; showVisualize?: boolean; onVisualize?: () => void;
  soundDisabled?: boolean; trainDisabled?: boolean; recordDisabled?: boolean;
}

export function ActionPanel({
  soundEnabled = true, onToggleSound, gameStatus = "paused",
  onTogglePlayPause, onRestart, isRecording = false, isRecordingPaused = false,
  onToggleRecord, onForward, showVisualize = false, onVisualize,
  soundDisabled = false, trainDisabled = false, recordDisabled = false,
}: ActionPanelProps) {
  const [hidden, setHidden] = useState(false);
  const timer = useActionPanelTimer(isRecording, isRecordingPaused);

  const handlePlayToggle = () => (gameStatus === "crashed" ? onRestart ?? onTogglePlayPause : onTogglePlayPause)?.();
  const toggleVisibility = () => setHidden((h) => !h);

  useActionPanelShortcuts({
    onToggleRecord: recordDisabled ? undefined : onToggleRecord,
    onTogglePlayPause: handlePlayToggle,
    onToggleSound: soundDisabled ? undefined : onToggleSound,
    onForward: trainDisabled ? undefined : onForward,
    onToggleCollapse: toggleVisibility, onVisualize, showVisualize,
  });

  if (hidden) return null;
  const isRotating = isRecording && !isRecordingPaused;

  return (
    <TooltipProvider delayDuration={150}>
      <div className="action-panel fixed bottom-10 bg-black/95 text-white rounded-l-[50%] rounded-r-[30px] flex items-center scale-y-80 pointer-events-auto select-none z-50">
        <div className="flex gap-2 items-center bg-black rounded-full border border-border/20 scale-y-120">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2">
                <button
                  type="button"
                  disabled={recordDisabled}
                  onClick={recordDisabled ? undefined : onToggleRecord}
                  className={`rounded-full border border-border/20 p-3 transition-colors ${recordDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <motion.div
                    animate={isRotating ? { rotate: 360 } : { rotate: 0 }}
                    transition={isRotating ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                    className="flex items-center justify-center"
                  >
                    <Aperture strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 stroke-black" />
                  </motion.div>
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">{recordDisabled ? "Recording not available" : isRecording ? (isRecordingPaused ? "Resume Recording" : "Pause Recording") : "Start Recording"} {!recordDisabled && <Kbd>R</Kbd>}</TooltipContent>
          </Tooltip>

          <ActionPanelControls
            timer={timer} isRecording={isRecording} isRecordingPaused={isRecordingPaused}
            gameStatus={gameStatus} soundEnabled={soundEnabled}
            showVisualize={showVisualize} soundDisabled={soundDisabled} trainDisabled={trainDisabled}
            onPlayToggle={handlePlayToggle} onToggleSound={onToggleSound} onForward={onForward} onVisualize={onVisualize}
          />
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={() => setHidden(true)} className="cursor-pointer text-white flex items-center justify-center pl-1 pr-3">
              <X className="size-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Close Panel <Kbd>C</Kbd></TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export default ActionPanel;
