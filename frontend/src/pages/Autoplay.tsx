import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { getGameDefinition, normalizeGameId } from "../constants/games";
import { ActionPanel } from "../components/ActionPanel";
import { GameNotFound } from "../components/GameNotFound";
import { OnnxDinoAutoplay } from "../game/onnxAutoplay";
import { OnnxFlappyAutoplay } from "../game/onnxFlappyAutoplay";
import { useAutoplayPlaybackRecorder } from "../game/useAutoplayPlaybackRecorder";
import type { GameStatus } from "../game/useGameRunnerControls";

export function Autoplay({ gameId = "t-rex", modelName, isPrivate = false }: {
  gameId?: string; modelName: string; isPrivate?: boolean;
}) {
  const normId = normalizeGameId(gameId);
  const def = getGameDefinition(normId);
  const [gameStatus, setGameStatus] = useState<GameStatus>("paused");
  const [soundEnabled, setSoundEnabled] = useState(false);
  const hasAutoUnmutedRef = useRef(false);
  const controllerRef = useRef<any>(null), engineRef = useRef<any>(null);
  const dinoAutoplay = useRef(new OnnxDinoAutoplay()), flappyAutoplay = useRef(new OnnxFlappyAutoplay());
  const rec = useAutoplayPlaybackRecorder(gameStatus, dinoAutoplay.current, modelName, isPrivate);

  const toggleSound = useCallback(() => {
    hasAutoUnmutedRef.current = true;
    setSoundEnabled((p) => !p);
  }, []);

  const startAutoplay = useCallback(() => {
    if (normId === "flappy-bird") flappyAutoplay.current.start(() => engineRef.current);
    else dinoAutoplay.current.start();
  }, [normId]);

  const stopAutoplay = useCallback(() => {
    flappyAutoplay.current.stop(); dinoAutoplay.current.stop();
  }, []);

  const handleStatusChange = useCallback((nextStatus: GameStatus) => {
    setGameStatus(nextStatus);
    if (!hasAutoUnmutedRef.current && nextStatus === "playing") {
      hasAutoUnmutedRef.current = true; setSoundEnabled(true);
    }
    if (nextStatus === "playing") startAutoplay(); else stopAutoplay();
  }, [startAutoplay, stopAutoplay]);

  const handlePlayToggle = useCallback(() => {
    if (gameStatus === "crashed") controllerRef.current?.restart?.();
    else if (gameStatus === "playing") controllerRef.current?.pause?.();
    else {
      if (!hasAutoUnmutedRef.current) { hasAutoUnmutedRef.current = true; setSoundEnabled(true); }
      controllerRef.current?.play?.();
    }
  }, [gameStatus]);

  const handleRestart = useCallback(() => controllerRef.current?.restart?.(), []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.code === "Space" || e.code === "ArrowUp") {
        if (gameStatus === "crashed") { e.preventDefault(); handleRestart(); }
        else if (gameStatus === "paused") { e.preventDefault(); handlePlayToggle(); }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameStatus, handleRestart, handlePlayToggle]);

  useEffect(() => {
    if (normId === "flappy-bird") flappyAutoplay.current.init(modelName, isPrivate);
    else dinoAutoplay.current.init(modelName, isPrivate);
    return () => stopAutoplay();
  }, [normId, modelName, isPrivate, stopAutoplay]);

  if (!def) return <GameNotFound />;
  const GameComponent = def.gameComponent;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <Suspense fallback={<div className="text-muted-foreground text-xs">Loading game...</div>}>
        {GameComponent && (
          <GameComponent
            interactive={false} soundEnabled={soundEnabled}
            onStatusChange={handleStatusChange} onReady={(c: any) => { controllerRef.current = c; }}
            onEngineInstance={(e: any) => { engineRef.current = e; }} onRunnerInstance={(r: any) => { engineRef.current = r; }}
          />
        )}
      </Suspense>
      <ActionPanel
        mode="autoplay" soundEnabled={soundEnabled} onToggleSound={toggleSound}
        gameStatus={gameStatus} onTogglePlayPause={handlePlayToggle} onRestart={handleRestart}
        soundDisabled={!def.hasSound} isRecording={rec.isRecording} isRecordingPaused={rec.isRecordingPaused}
        onToggleRecord={rec.toggleRecord} showVisualize={true} onVisualize={rec.visualizePlayback}
      />
    </div>
  );
}

export default Autoplay;
