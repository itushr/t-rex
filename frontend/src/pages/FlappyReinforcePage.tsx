import { useEffect, useRef, useState, useCallback } from "react";
import { FlappyEngine } from "../games/flappybird/flappyEngine";
import { FlappyRenderer } from "../games/flappybird/flappyRenderer";
import { ActionPanel } from "../components/ActionPanel";
import { QTableModal } from "../components/actionpanel/QTableModal";
import { useFlappyRL } from "../games/flappybird/rl/useFlappyRL";
import { savePrivateQTableModel } from "../services/privateApi";
import { navigateTo } from "../utils/navigation";
import type { GameStatus } from "../game/useGameRunnerControls";

export function FlappyReinforcePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FlappyEngine | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>("paused");
  const [isQTableOpen, setIsQTableOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const syncStatus = useCallback((next: GameStatus) => setGameStatus(next), []);
  const handleRestart = useCallback(() => {
    engineRef.current?.restart(); engineRef.current?.jump(); syncStatus("playing");
  }, [syncStatus]);
  const handleTogglePlayPause = useCallback(() => {
    engineRef.current?.togglePlayPause();
    if (engineRef.current) syncStatus(engineRef.current.getStatus());
  }, [syncStatus]);

  const { tries, repeat, setRepeat, config, updateConfig, getQTableEntries, getRawQTable, getEpsilon } =
    useFlappyRL(engineRef, gameStatus, handleRestart);

  const handleForward = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await savePrivateQTableModel({
        model_name: `q_table_flappy_${Date.now()}`, game_id: "flappy-bird",
        q_table: getRawQTable(), actions: ["jump", "none"], tries,
      });
      navigateTo("/dashboard");
    } catch { setSaving(false); }
  };

  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#dfd593";
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
    canvas.width = w; canvas.height = h;
    const engine = new FlappyEngine(w, h), renderer = new FlappyRenderer();
    engineRef.current = engine; (window as any).flappyEngine = engine;

    const syncSize = () => {
      const nw = canvas.clientWidth || window.innerWidth, nh = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== nw || canvas.height !== nh) { canvas.width = nw; canvas.height = nh; engine.resize(nw, nh); }
    };
    window.addEventListener("resize", syncSize);

    let animId: number;
    const loop = (t: number) => {
      syncSize(); engine.update(t); syncStatus(engine.getStatus());
      renderer.render(ctx, engine.state, canvas.width, canvas.height);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      document.body.style.backgroundColor = prevBg;
      (window as any).flappyEngine = null;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", syncSize);
    };
  }, [syncStatus]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-sky-400 flex flex-col items-center">
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
      <ActionPanel
        mode="reinforcement" soundEnabled={false} gameStatus={gameStatus}
        onTogglePlayPause={handleTogglePlayPause} onRestart={handleRestart}
        tries={tries} repeat={repeat} onToggleRepeat={() => setRepeat((r) => !r)}
        rlConfig={config as any} onSaveRLConfig={updateConfig as any}
        showVisualize={true} onVisualize={() => setIsQTableOpen(true)} onForward={handleForward}
      />
      <QTableModal
        isOpen={isQTableOpen} onClose={() => setIsQTableOpen(false)}
        entries={getQTableEntries()} epsilon={getEpsilon()}
        actions={["jump", "none"]} stateHeader="State (pipe_dist | gap_offset | vy)"
      />
    </div>
  );
}

export default FlappyReinforcePage;
