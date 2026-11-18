import { useState } from "react";
import { Aperture, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  const isRotating = isRecording && !isRecordingPaused;

  return (
    <TooltipProvider delayDuration={150}>
      <AnimatePresence>
        {!hidden && (
          <motion.div
            initial={{ width: 72, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 72, opacity: 0 }}
            transition={{
              width: { type: "spring", stiffness: 220, damping: 22, mass: 0.8 },
              opacity: { duration: 0.18 },
            }}
            className="action-panel fixed bottom-10 left-1/2 -translate-x-1/2 overflow-hidden bg-black/95 text-white rounded-full flex items-center scale-y-90 pointer-events-auto select-none z-50 whitespace-nowrap"
          >
            {/* Actual ActionPanel */}
            <div className="h-full min-w-max flex gap-5 items-center bg-black rounded-full p-2 pr-7 border border-border/20 scale-y-110">
              <div className="h-full flex items-center justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" onClick={onToggleRecord} className="h-full rounded-full border border-border/20 p-3 cursor-pointer transition-colors flex items-center justify-center">
                      <motion.div animate={isRotating ? { rotate: 360 } : { rotate: 0 }} transition={isRotating ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }} className="flex items-center justify-center">
                        <Aperture strokeWidth={1.5} fill="white" nonScalingStroke className="size-8 stroke-black" />
                      </motion.div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" sideOffset={14}>{isRecording ? (isRecordingPaused ? "Resume Recording" : "Pause Recording") : "Start Recording"} <Kbd>R</Kbd></TooltipContent>
                </Tooltip>
              </div>

              <ActionPanelControls
                timer={timer} isRecording={isRecording} isRecordingPaused={isRecordingPaused}
                gameStatus={gameStatus} soundEnabled={soundEnabled} showVisualize={showVisualize}
                onPlayToggle={handlePlayToggle} onToggleSound={onToggleSound}
                onForward={onForward} onVisualize={onVisualize}
              />
            </div>

            {/* Close button outside Actual ActionPanel */}
            <div className="h-full flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" onClick={() => setHidden(true)} className="h-full pl-2.5 pr-5 cursor-pointer bg-transparent border-0 text-white flex items-center justify-center p-0 m-0 hover:opacity-80" title="Close panel">
                    <X className="size-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" sideOffset={14}>Close Panel <Kbd>C</Kbd></TooltipContent>
              </Tooltip>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}

export default ActionPanel;
