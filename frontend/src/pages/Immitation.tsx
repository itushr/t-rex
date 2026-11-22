import { useState, useRef, useCallback, Suspense } from "react";
import { getGameDefinition } from "../constants/games";
import { ActionPanel } from "../components/ActionPanel";
import { GameNotFound } from "../components/GameNotFound";
import { useWebGameRecorder } from "../game/useWebGameRecorder";
import type { GameStatus } from "../game/useGameRunnerControls";

export interface ImmitationProps {
  gameId?: string;
}

export function Immitation({ gameId = "t-rex" }: ImmitationProps) {
  const def = getGameDefinition(gameId);
  const [gameStatus, setGameStatus] = useState<GameStatus>("paused");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const hasAutoUnmutedRef = useRef(false);
  const controllerRef = useRef<any>(null);

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
  const rec = useWebGameRecorder(gameStatus, def?.id || gameId);

  if (!def) return <GameNotFound />;
  const GameComponent = def.gameComponent;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <Suspense fallback={<div className="text-muted-foreground text-xs">Loading game...</div>}>
        {GameComponent && (
          <GameComponent
            interactive={true}
            soundEnabled={soundEnabled}
            onStatusChange={handleStatusChange}
            onReady={(c: any) => { controllerRef.current = c; }}
          />
        )}
      </Suspense>
      <ActionPanel
        mode="imitation"
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        gameStatus={gameStatus}
        onTogglePlayPause={handlePlayToggle}
        onRestart={handleRestart}
        soundDisabled={!def.hasSound}
        recordDisabled={!def.hasRecorder}
        trainDisabled={!rec.isRecording || def.availableModels === null}
        isRecording={rec.isRecording}
        isRecordingPaused={rec.isRecordingPaused}
        onToggleRecord={rec.toggleRecord}
        onForward={rec.forwardToTrain}
      />
    </div>
  );
}

export default Immitation;
