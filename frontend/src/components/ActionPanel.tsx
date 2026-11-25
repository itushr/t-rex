import { useState } from "react";
import { Aperture, Cog, SlidersHorizontal, X } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { ImitationActionBar } from "./actionpanel/ImitationActionBar";
import { ReinforcementActionBar } from "./actionpanel/ReinforcementActionBar";
import { AutoplayActionBar } from "./actionpanel/AutoplayActionBar";
import { RLConfigModal } from "./actionpanel/RLConfigModal";
import { useActionPanelTimer } from "../hooks/useActionPanelTimer";
import { useActionPanelShortcuts } from "../hooks/useActionPanelShortcuts";
import type { GameStatus } from "../game/useGameRunnerControls";
import type { RLConfig } from "@/types/rl";

export interface ActionPanelProps {
  mode?: "supervised" | "imitation" | "reinforcement" | "autoplay";
  soundEnabled?: boolean; onToggleSound?: () => void;
  gameStatus?: GameStatus; onTogglePlayPause?: () => void; onRestart?: () => void;
  isRecording?: boolean; isRecordingPaused?: boolean; onToggleRecord?: () => void;
  onForward?: () => void; showVisualize?: boolean; onVisualize?: () => void;
  soundDisabled?: boolean; trainDisabled?: boolean; recordDisabled?: boolean;
  tries?: number; repeat?: boolean; onToggleRepeat?: () => void;
  rlConfig?: RLConfig; onSaveRLConfig?: (cfg: RLConfig) => void;
  selectedModel?: string; onSelectModel?: (model: string) => void;
}

export function ActionPanel({
  mode = "supervised", soundEnabled = true, onToggleSound, gameStatus = "paused",
  onTogglePlayPause, onRestart, isRecording = false, isRecordingPaused = false,
  onToggleRecord, onForward, showVisualize = false, onVisualize,
  soundDisabled = false, trainDisabled = false, recordDisabled = false,
  tries = 1, repeat = true, onToggleRepeat, rlConfig, onSaveRLConfig,
  selectedModel, onSelectModel,
}: ActionPanelProps) {
  const [hidden, setHidden] = useState(false), [isConfigOpen, setIsConfigOpen] = useState(false);
  const timer = useActionPanelTimer(isRecording, isRecordingPaused);
  const handlePlayToggle = () => (gameStatus === "crashed" ? onRestart ?? onTogglePlayPause : onTogglePlayPause)?.();

  useActionPanelShortcuts({
    onToggleRecord: recordDisabled ? undefined : onToggleRecord, onTogglePlayPause: handlePlayToggle,
    onToggleSound: soundDisabled ? undefined : onToggleSound, onForward: trainDisabled ? undefined : onForward,
    onToggleCollapse: () => setHidden((h) => !h), onVisualize, showVisualize,
  });

  if (hidden) return null;
  const isRotating = isRecording && !isRecordingPaused, isRL = mode === "reinforcement";

  return (
    <TooltipProvider delayDuration={150}>
      <div className="action-panel fixed bottom-10 bg-black/95 text-white rounded-l-[50%] rounded-r-[30px] flex items-center scale-y-80 pointer-events-auto select-none z-50">
        <div className="flex gap-2 items-center bg-black rounded-full border border-border/20 scale-y-120">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="p-2">
                {isRL ? (
                  <button type="button" onClick={() => setIsConfigOpen(true)} className="rounded-full border border-border/20 p-3 hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center">
                    <div className="size-8 flex items-center justify-center"><Cog strokeWidth={1.5} className="size-7 text-white" /></div>
                  </button>
                ) : (
                  <button type="button" disabled={recordDisabled} onClick={recordDisabled ? undefined : onToggleRecord} className={`rounded-full border border-border/20 p-3 transition-colors ${recordDisabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}>
                    <motion.div animate={isRotating ? { rotate: 360 } : { rotate: 0 }} transition={isRotating ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }} className="flex items-center justify-center">
                      <Aperture strokeWidth={1.5} fill="white" className="size-8 stroke-black" />
                    </motion.div>
                  </button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">{isRL ? "Configure RL Parameters" : recordDisabled ? "Recording unavailable" : isRecording ? "Pause" : "Record"} {!isRL && <Kbd>R</Kbd>}</TooltipContent>
          </Tooltip>
          {isRL ? (
            <ReinforcementActionBar gameStatus={gameStatus} soundEnabled={soundEnabled} soundDisabled={soundDisabled} tries={tries} repeat={repeat} selectedModel={selectedModel} onSelectModel={onSelectModel} onPlayToggle={handlePlayToggle} onToggleSound={onToggleSound} onToggleRepeat={onToggleRepeat} onVisualize={onVisualize} onForward={onForward} />
          ) : mode === "autoplay" ? (
            <AutoplayActionBar timer={timer} isRecording={isRecording} isRecordingPaused={isRecordingPaused} gameStatus={gameStatus} soundEnabled={soundEnabled} soundDisabled={soundDisabled} showVisualize={showVisualize} onPlayToggle={handlePlayToggle} onToggleSound={onToggleSound} onVisualize={onVisualize} />
          ) : (
            <ImitationActionBar timer={timer} isRecording={isRecording} isRecordingPaused={isRecordingPaused} gameStatus={gameStatus} soundEnabled={soundEnabled} soundDisabled={soundDisabled} trainDisabled={trainDisabled} onPlayToggle={handlePlayToggle} onToggleSound={onToggleSound} onForward={onForward} />
          )}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={() => setHidden(true)} className="cursor-pointer text-white flex items-center justify-center pl-1 pr-3"><X className="size-5" /></button>
          </TooltipTrigger>
          <TooltipContent side="right">Close Panel <Kbd>C</Kbd></TooltipContent>
        </Tooltip>
      </div>
      {rlConfig && onSaveRLConfig && <RLConfigModal isOpen={isConfigOpen} onClose={() => setIsConfigOpen(false)} config={rlConfig} onSave={onSaveRLConfig} />}
    </TooltipProvider>
  );
}
export default ActionPanel;
