import { useEffect, useRef, useCallback } from "react";
import { FlappyEngine } from "./flappyEngine";
import { FlappyRenderer } from "./flappyRenderer";
import { FlappySounds } from "../sounds";
import { createFlappyController, FlappyController } from "../controller";
import type { GameStatus } from "../../../game/useGameRunnerControls";

export interface FlappyGameProps {
  interactive?: boolean;
  soundEnabled?: boolean;
  onStatusChange?: (status: GameStatus) => void;
  onReady?: (controller: FlappyController) => void;
  onEngineInstance?: (engine: FlappyEngine) => void;
  sounds?: { playJumpSound?: () => void; playGameOverSound?: () => void; playScoreSound?: () => void };
}

export function FlappyGame({
  interactive = true, soundEnabled = false, onStatusChange, onReady, onEngineInstance, sounds,
}: FlappyGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FlappyEngine | null>(null);
  const statusRef = useRef<GameStatus>("paused");
  const onReadyRef = useRef(onReady), onEngineInstanceRef = useRef(onEngineInstance);
  const onStatusChangeRef = useRef(onStatusChange), soundEnabledRef = useRef(soundEnabled), soundsRef = useRef(sounds);

  onReadyRef.current = onReady; onEngineInstanceRef.current = onEngineInstance;
  onStatusChangeRef.current = onStatusChange; soundEnabledRef.current = soundEnabled; soundsRef.current = sounds;

  const syncStatus = useCallback((next: GameStatus) => {
    if (next !== statusRef.current) {
      statusRef.current = next;
      onStatusChangeRef.current?.(next);
      if (soundEnabledRef.current && next === "crashed") (soundsRef.current?.playGameOverSound ?? FlappySounds.playGameOverSound)();
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    canvas.width = w; canvas.height = h;

    const engine = new FlappyEngine(w, h), renderer = new FlappyRenderer();
    engineRef.current = engine;
    (window as any).flappyEngine = engine;
    engine.onJump = () => { if (soundEnabledRef.current) (soundsRef.current?.playJumpSound ?? FlappySounds.playJumpSound)(); };
    engine.onScore = () => { if (soundEnabledRef.current) (soundsRef.current?.playScoreSound ?? FlappySounds.playScoreSound)(); };
    onReadyRef.current?.(createFlappyController(engine));
    onEngineInstanceRef.current?.(engine);

    const syncSize = () => {
      const nw = canvas.clientWidth || window.innerWidth, nh = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== nw || canvas.height !== nh) {
        canvas.width = nw; canvas.height = nh; engine.resize(nw, nh);
      }
    };

    const handleJump = () => {
      if (!interactive) return;
      if (engine.state.over) { engine.restart(); engine.jump(); syncStatus("playing"); }
      else { engine.jump(); syncStatus("playing"); }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === "Space" || e.code === "ArrowUp") && interactive) { e.preventDefault(); handleJump(); }
    };
    const handlePointerDown = (e: PointerEvent) => {
      if (interactive && !(e.target as HTMLElement)?.closest(".action-panel")) handleJump();
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
      (window as any).flappyEngine = null; cancelAnimationFrame(animId);
      window.removeEventListener("resize", syncSize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [interactive, syncStatus]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-sky-400 flex flex-col items-center">
      <canvas ref={canvasRef} className={`block w-full h-full ${interactive ? "cursor-pointer touch-none" : "pointer-events-none"}`} />
    </div>
  );
}

export default FlappyGame;
