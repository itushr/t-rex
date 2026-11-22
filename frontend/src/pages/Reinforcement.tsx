import { useState, useRef, useCallback, Suspense } from "react";
import { getGameDefinition } from "../constants/games";
import { ActionPanel } from "../components/ActionPanel";
import { QTableModal } from "../components/actionpanel/QTableModal";
import { GameNotFound } from "../components/GameNotFound";
import { useGameRL } from "../games/useGameRL";
import { savePrivateQTableModel } from "../services/privateApi";
import { navigateTo } from "../utils/navigation";
import type { GameStatus } from "../game/useGameRunnerControls";

export interface ReinforcementProps {
  gameId?: string;
}

export function Reinforcement({ gameId = "t-rex" }: ReinforcementProps) {
  const def = getGameDefinition(gameId);
  const [gameStatus, setGameStatus] = useState<GameStatus>("paused");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const hasAutoUnmutedRef = useRef(false);
  const [isQTableOpen, setIsQTableOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("q_learning");
  const controllerRef = useRef<any>(null), engineRef = useRef<any>(null);

  const toggleSound = useCallback(() => {
    hasAutoUnmutedRef.current = true;
    setSoundEnabled((p) => !p);
  }, []);

  const handleStatusChange = useCallback((nextStatus: GameStatus) => {
    setGameStatus(nextStatus);
    if (!hasAutoUnmutedRef.current && nextStatus === "playing") {
      hasAutoUnmutedRef.current = true;
      setSoundEnabled(true);
    }
  }, []);

  const handlePlayToggle = useCallback(() => {
    if (gameStatus === "crashed") controllerRef.current?.restart?.();
    else if (gameStatus === "playing") controllerRef.current?.pause?.();
    else {
      if (!hasAutoUnmutedRef.current) {
        hasAutoUnmutedRef.current = true;
        setSoundEnabled(true);
      }
      controllerRef.current?.play?.();
    }
  }, [gameStatus]);

  const handleRestart = useCallback(() => controllerRef.current?.restart?.(), []);
  const rl = useGameRL(def?.id || gameId, engineRef, gameStatus, handleRestart);

  if (!def) return <GameNotFound />;
  const GameComponent = def.gameComponent;

  const handleRLSave = async () => {
    try {
      await savePrivateQTableModel({
        model_name: `q_${def.id}_${Date.now()}`,
        game_id: def.id,
        q_table: rl.getRawQTable(),
        actions: rl.actions,
        tries: rl.tries,
      });
      navigateTo("/dashboard");
    } catch {}
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <Suspense fallback={<div className="text-muted-foreground text-xs">Loading game...</div>}>
        {GameComponent && (
          <GameComponent
            interactive={false} soundEnabled={soundEnabled}
            onStatusChange={handleStatusChange}
            onReady={(c: any) => { controllerRef.current = c; }}
            onEngineInstance={(e: any) => { engineRef.current = e; }}
            onRunnerInstance={(r: any) => { engineRef.current = r; }}
          />
        )}
      </Suspense>
      <ActionPanel
        mode="reinforcement" soundEnabled={soundEnabled} onToggleSound={toggleSound}
        gameStatus={gameStatus} onTogglePlayPause={handlePlayToggle} onRestart={handleRestart}
        soundDisabled={!def.hasSound} tries={rl.tries} repeat={rl.repeat}
        onToggleRepeat={() => rl.setRepeat((r) => !r)} rlConfig={rl.config}
        onSaveRLConfig={rl.updateConfig} showVisualize={true}
        onVisualize={() => setIsQTableOpen(true)} selectedModel={selectedModel}
        onSelectModel={setSelectedModel} onForward={handleRLSave}
      />
      <QTableModal
        isOpen={isQTableOpen} onClose={() => setIsQTableOpen(false)}
        entries={rl.getQTableEntries()} epsilon={rl.getEpsilon()}
        actions={rl.actions} stateHeader={rl.stateHeader}
      />
    </div>
  );
}

export default Reinforcement;
