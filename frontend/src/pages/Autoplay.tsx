import { useEffect, useRef, useState, useCallback, Suspense } from "react";
import { getGameDefinition, normalizeGameId } from "../constants/games";
import { ActionPanel } from "../components/ActionPanel";
import { GameNotFoundPage } from "./GameNotFoundPage";
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
  const controllerRef = useRef<any>(null), engineRef = useRef<any>(null);
  const dinoAutoplay = useRef(new OnnxDinoAutoplay());
  const flappyAutoplay = useRef(new OnnxFlappyAutoplay());

  const rec = useAutoplayPlaybackRecorder(gameStatus, dinoAutoplay.current, modelName, isPrivate);

  const handlePlayToggle = useCallback(() => {
    if (gameStatus === "crashed") controllerRef.current?.restart?.();
    else if (gameStatus === "playing") controllerRef.current?.pause?.();
    else controllerRef.current?.play?.();
  }, [gameStatus]);

  useEffect(() => {
    let active = true;
    if (normId === "flappy-bird") {
      flappyAutoplay.current.init(modelName, isPrivate).then((ok) => {
        if (ok && active) {
          controllerRef.current?.restart?.();
          setGameStatus("playing");
          flappyAutoplay.current.start(() => engineRef.current);
        }
      });
      return () => { active = false; flappyAutoplay.current.stop(); };
    }
    dinoAutoplay.current.init(modelName, isPrivate).then((ok) => {
      if (ok && active) dinoAutoplay.current.start();
    });
    return () => { active = false; dinoAutoplay.current.stop(); };
  }, [normId, modelName, isPrivate]);

  if (!def) return <GameNotFoundPage />;
  const GameComponent = def.gameComponent;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background">
      <Suspense fallback={<div className="text-muted-foreground text-xs">Loading game...</div>}>
        {GameComponent && (
          <GameComponent
            interactive={false} soundEnabled={soundEnabled}
            onStatusChange={setGameStatus} onReady={(c: any) => { controllerRef.current = c; }}
            onEngineInstance={(e: any) => { engineRef.current = e; }}
            onRunnerInstance={(r: any) => { engineRef.current = r; }}
          />
        )}
      </Suspense>
      <ActionPanel
        mode="autoplay" soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled((p) => !p)}
        gameStatus={gameStatus} onTogglePlayPause={handlePlayToggle} onRestart={() => controllerRef.current?.restart?.()}
        soundDisabled={!def.hasSound} isRecording={rec.isRecording} isRecordingPaused={rec.isRecordingPaused}
        onToggleRecord={rec.toggleRecord} showVisualize={true} onVisualize={rec.visualizePlayback}
      />
    </div>
  );
}
export default Autoplay;
