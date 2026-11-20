import { useEffect, useRef, useState, useCallback } from "react";
import { FlappyEngine } from "../games/flappybird/flappyEngine";
import { FlappyRenderer } from "../games/flappybird/flappyRenderer";
import { ActionPanel } from "../components/ActionPanel";
import { getGameDefinition } from "../constants/games";
import type { GameStatus } from "../game/useGameRunnerControls";

export function FlappyBirdPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FlappyEngine | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("paused");
  const statusRef = useRef<GameStatus>("paused");
  const def = getGameDefinition("flappy-bird");

  const syncStatus = (next: GameStatus) => {
    if (next !== statusRef.current) { statusRef.current = next; setGameStatus(next); }
  };

  const handleTogglePlayPause = useCallback(() => {
    engineRef.current?.togglePlayPause();
    if (engineRef.current) syncStatus(engineRef.current.getStatus());
  }, []);

  const handleRestart = useCallback(() => {
    engineRef.current?.restart(); engineRef.current?.jump();
    syncStatus("playing");
  }, []);

  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#dfd593";
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = w; canvas.height = h;

    const engine = new FlappyEngine(w, h);
    const renderer = new FlappyRenderer();
    engineRef.current = engine;

    const syncSize = () => {
      const nw = canvas.clientWidth || window.innerWidth;
      const nh = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== nw || canvas.height !== nh) {
        canvas.width = nw; canvas.height = nh; engine.resize(nw, nh);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault(); engine.jump(); syncStatus("playing");
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest(".action-panel")) return;
      engine.jump(); syncStatus("playing");
    };

    window.addEventListener("resize", syncSize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);

    let animId: number;
    const loop = (t: number) => {
      syncSize(); engine.update(t); syncStatus(engine.getStatus());
      renderer.render(ctx, engine.state, canvas.width, canvas.height);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      document.body.style.backgroundColor = prevBg;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", syncSize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-sky-400 flex flex-col items-center">
      <canvas ref={canvasRef} className="block w-full h-full cursor-pointer touch-none" />
      <ActionPanel
        gameStatus={gameStatus} onTogglePlayPause={handleTogglePlayPause}
        onRestart={handleRestart} soundDisabled={!def?.hasSound}
        trainDisabled={def?.availableModels === null} recordDisabled={!def?.hasRecorder}
        soundEnabled={false}
      />
    </div>
  );
}

export default FlappyBirdPage;
