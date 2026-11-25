import { useState, useRef, useCallback, Suspense, useMemo } from "react";
import { getGameDefinition } from "../constants/games";
import { getModelVisualizerType } from "../constants/models";
import { ActionPanel } from "../components/ActionPanel";
import { QTableModal } from "../models/q-learning";
import { GameNotFound } from "../components/GameNotFound";
import { savePrivateQTableModel } from "../services/privateApi";
import { navigateTo } from "../utils/navigation";
import type { GameStatus } from "../game/useGameRunnerControls";

export function Reinforcement({ gameId = "t-rex" }: { gameId?: string }) {
  const def = useMemo(() => getGameDefinition(gameId), [gameId]);
  const [gameStatus, setGameStatus] = useState<GameStatus>("paused");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isQTableOpen, setIsQTableOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("q_learning");
  const unmuted = useRef(false), ctrlRef = useRef<any>(null), engRef = useRef<any>(null);

  const toggleSound = useCallback(() => { unmuted.current = true; setSoundEnabled((p) => !p); }, []);
  const handleStatusChange = useCallback((s: GameStatus) => {
    setGameStatus(s);
    if (!unmuted.current && s === "playing") { unmuted.current = true; setSoundEnabled(true); }
  }, []);

  const handlePlayToggle = useCallback(() => {
    if (gameStatus === "crashed") ctrlRef.current?.restart?.();
    else if (gameStatus === "playing") ctrlRef.current?.pause?.();
    else {
      if (!unmuted.current) { unmuted.current = true; setSoundEnabled(true); }
      ctrlRef.current?.play?.();
    }
  }, [gameStatus]);

  const handleRestart = useCallback(() => ctrlRef.current?.restart?.(), []);
  const rl = def?.useRL(engRef, gameStatus, handleRestart);

  const handleSaveQTable = useCallback(async () => {
    if (!rl) return;
    try {
      await savePrivateQTableModel({
        game_id: def?.id || gameId, q_table: rl.getRawQTable(), actions: rl.actions, tries: rl.tries,
      });
      navigateTo("/dashboard");
    } catch (err: any) { alert(`Save failed: ${err.message}`); }
  }, [rl, def, gameId]);

  const handleVisualize = useCallback(() => {
    if (getModelVisualizerType(selectedModel) === "modal") setIsQTableOpen(true);
    else navigateTo(`/visualize/model/${selectedModel}`);
  }, [selectedModel]);

  if (!def) return <GameNotFound />;
  const GameComponent = def.gameComponent;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <Suspense fallback={<div className="text-muted-foreground text-xs">Loading game...</div>}>
        {GameComponent && (
          <GameComponent interactive={false} soundEnabled={soundEnabled}
            onReady={(c: any) => { ctrlRef.current = c; }} onEngineInstance={(e: any) => { engRef.current = e; }}
            onRunnerInstance={(r: any) => { engRef.current = r; }} onStatusChange={handleStatusChange} />
        )}
      </Suspense>
      <ActionPanel mode="reinforcement" soundEnabled={soundEnabled} onToggleSound={toggleSound}
        gameStatus={gameStatus} onTogglePlayPause={handlePlayToggle} onRestart={handleRestart}
        soundDisabled={!def.hasSound} tries={rl?.tries ?? 1} repeat={rl?.repeat ?? true}
        onToggleRepeat={() => rl?.setRepeat((p: boolean) => !p)} rlConfig={rl?.config}
        onSaveRLConfig={rl?.updateConfig} showVisualize={true} onVisualize={handleVisualize}
        selectedModel={selectedModel} onSelectModel={setSelectedModel} onForward={handleSaveQTable} />
      {isQTableOpen && rl && (
        <QTableModal isOpen={isQTableOpen} onClose={() => setIsQTableOpen(false)}
          entries={rl.getQTableEntries()} epsilon={rl.getEpsilon()} actions={rl.actions} stateHeader={rl.stateHeader} />
      )}
    </div>
  );
}

export default Reinforcement;
