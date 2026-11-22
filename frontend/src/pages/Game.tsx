import { useState, useRef, useCallback, Suspense } from "react";
import { getGameDefinition } from "../constants/games";
import { ActionPanel } from "../components/ActionPanel";
import { QTableModal } from "../components/actionpanel/QTableModal";
import { GameNotFoundPage } from "./GameNotFoundPage";
import { useWebGameRecorder } from "../game/useWebGameRecorder";
import { useGameRL } from "../games/useGameRL";
import { savePrivateQTableModel } from "../services/privateApi";
import { navigateTo } from "../utils/navigation";
import type { GameStatus } from "../game/useGameRunnerControls";

export function Game({ gameId = "t-rex", mode = "imitation" }: { gameId?: string; mode?: "imitation" | "reinforcement" }) {
  const def = getGameDefinition(gameId);
  const [gameStatus, setGameStatus] = useState<GameStatus>("paused");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isQTableOpen, setIsQTableOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("q_learning");
  const controllerRef = useRef<any>(null), engineRef = useRef<any>(null);

  const handlePlayToggle = useCallback(() => {
    if (gameStatus === "crashed") controllerRef.current?.restart?.();
    else if (gameStatus === "playing") controllerRef.current?.pause?.();
    else controllerRef.current?.play?.();
  }, [gameStatus]);

  const handleRestart = useCallback(() => controllerRef.current?.restart?.(), []);
  const rec = useWebGameRecorder(gameStatus, def?.id || gameId);
  const rl = useGameRL(def?.id || gameId, engineRef, gameStatus, handleRestart);

  if (!def) return <GameNotFoundPage />;
  const GameComponent = def.gameComponent;

  const handleRLSave = async () => {
    try {
      await savePrivateQTableModel({
        model_name: `q_${def.id}_${Date.now()}`, game_id: def.id,
        q_table: rl.getRawQTable(), actions: rl.actions, tries: rl.tries,
      });
      navigateTo("/dashboard");
    } catch {}
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <Suspense fallback={<div className="text-muted-foreground text-xs">Loading game...</div>}>
        {GameComponent && (
          <GameComponent
            interactive={mode === "imitation"} soundEnabled={soundEnabled}
            onStatusChange={setGameStatus} onReady={(c: any) => { controllerRef.current = c; }}
            onEngineInstance={(e: any) => { engineRef.current = e; }}
            onRunnerInstance={(r: any) => { engineRef.current = r; }}
          />
        )}
      </Suspense>
      <ActionPanel
        mode={mode} soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled((p) => !p)}
        gameStatus={gameStatus} onTogglePlayPause={handlePlayToggle} onRestart={handleRestart}
        soundDisabled={!def.hasSound} recordDisabled={!def.hasRecorder}
        trainDisabled={mode === "imitation" && (!rec.isRecording || def.availableModels === null)}
        isRecording={rec.isRecording} isRecordingPaused={rec.isRecordingPaused}
        onToggleRecord={rec.toggleRecord} onForward={mode === "imitation" ? rec.forwardToTrain : handleRLSave}
        tries={rl.tries} repeat={rl.repeat} onToggleRepeat={() => rl.setRepeat((r) => !r)}
        rlConfig={rl.config} onSaveRLConfig={rl.updateConfig}
        showVisualize={mode === "reinforcement"} onVisualize={() => setIsQTableOpen(true)}
        selectedModel={selectedModel} onSelectModel={setSelectedModel}
      />
      {mode === "reinforcement" && (
        <QTableModal
          isOpen={isQTableOpen} onClose={() => setIsQTableOpen(false)}
          entries={rl.getQTableEntries()} epsilon={rl.getEpsilon()}
          actions={rl.actions} stateHeader={rl.stateHeader}
        />
      )}
    </div>
  );
}
export default Game;
