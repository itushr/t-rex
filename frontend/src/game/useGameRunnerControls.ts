import { useCallback, useEffect, useState } from "react";

export type GameStatus = "playing" | "paused" | "crashed";

export function useGameRunnerControls() {
  const [gameStatus, setGameStatus] = useState<GameStatus>("paused");

  useEffect(() => {
    const check = () => {
      const r = (window as any).Runner?.instance_;
      if (!r) { setGameStatus("paused"); return; }
      if (r.crashed) { setGameStatus("crashed"); return; }
      if (r.playing && !r.paused) { setGameStatus("playing"); return; }
      setGameStatus("paused");
    };
    const id = setInterval(check, 50);
    return () => clearInterval(id);
  }, []);

  const togglePlayPause = useCallback(() => {
    const r = (window as any).Runner?.instance_;
    if (!r) return;
    if (r.crashed) {
      r.paused = false;
      r.restart?.();
      r.paused = false;
      setGameStatus("playing");
      return;
    }
    if (r.playing && !r.paused) {
      r.stop?.();
      setGameStatus("paused");
    } else {
      if (r.paused || r.runningTime > 0) {
        if (typeof r.play === "function") r.play();
        else {
          r.playing = true; r.paused = false; r.time = performance.now();
          if (r.raqId) { cancelAnimationFrame(r.raqId); r.raqId = 0; }
          r.updatePending = false; r.update?.();
        }
      } else {
        r.loadSounds?.();
        r.playing = true; r.activated = true; r.paused = false;
        r.time = performance.now();
        if (r.raqId) { cancelAnimationFrame(r.raqId); r.raqId = 0; }
        r.updatePending = false; r.update?.();
        r.tRex?.startJump?.(r.currentSpeed);
        r.playSound?.(r.soundFx?.BUTTON_PRESS || "BUTTON_PRESS");
      }
      setGameStatus("playing");
    }
  }, []);

  const restart = useCallback(() => {
    const r = (window as any).Runner?.instance_;
    if (!r) return;
    r.paused = false;
    r.restart?.();
    r.paused = false;
    setGameStatus("playing");
  }, []);

  return { gameStatus, togglePlayPause, restart };
}
