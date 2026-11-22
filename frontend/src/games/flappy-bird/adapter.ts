import { GameAdapter } from "../types";
import {
  FLAPPY_SUPPORTED_MODELS,
  FLAPPY_NUMERIC_FEATURES,
  FLAPPY_CATEGORICAL_FEATURES,
  FLAPPY_VALID_ACTIONS,
  FLAPPY_FEATURE_CONFIGS,
} from "./constants";
import { FlappyEngine } from "./game/flappyEngine";

export interface FlappySample {
  bird_y: number; bird_vy: number; pipe1_dist: number; pipe1_top: number; pipe1_bottom: number;
  dist_to_gap_top: number; dist_to_gap_bottom: number; pipe2_dist: number; pipe2_top: number; pipe2_bottom: number;
  action: "jump" | "none";
}

export function extractFlappyFeatures(engine: FlappyEngine) {
  const s = Math.max(0.6, engine.height / 600);
  const b = engine.state.bird;
  const pw = 64 * s;
  const upcoming = engine.state.pipes.filter((p) => p.x + pw >= b.x).sort((a, c) => a.x - c.x);
  const p1 = upcoming[0];
  const p2 = upcoming[1];

  return {
    bird_y: Number((b.y / s).toFixed(2)),
    bird_vy: Number((b.vy / s).toFixed(2)),
    pipe1_dist: p1 ? Number((Math.max(0, p1.x - b.x) / s).toFixed(2)) : 999,
    pipe1_top: p1 ? Number(((p1.topY + p1.height) / s).toFixed(2)) : 0,
    pipe1_bottom: p1 ? Number((p1.bottomY / s).toFixed(2)) : 600,
    dist_to_gap_top: p1 ? Number(((b.y - (p1.topY + p1.height)) / s).toFixed(2)) : 0,
    dist_to_gap_bottom: p1 ? Number(((p1.bottomY - b.y) / s).toFixed(2)) : 0,
    pipe2_dist: p2 ? Number((Math.max(0, p2.x - b.x) / s).toFixed(2)) : 999,
    pipe2_top: p2 ? Number(((p2.topY + p2.height) / s).toFixed(2)) : 0,
    pipe2_bottom: p2 ? Number((p2.bottomY / s).toFixed(2)) : 600,
  };
}

export const flappyAdapter: GameAdapter<FlappySample> = {
  id: "flappy-bird",
  name: "Flappy Bird",
  supportedModels: FLAPPY_SUPPORTED_MODELS,
  numericFeatures: FLAPPY_NUMERIC_FEATURES,
  categoricalFeatures: FLAPPY_CATEGORICAL_FEATURES,
  validActions: FLAPPY_VALID_ACTIONS,
  featureConfigs: FLAPPY_FEATURE_CONFIGS,
  getRunnerInstance: () => (typeof window !== "undefined" ? (window as any).flappyEngine : null),
  isGameRunning: (e) => Boolean(e?.state?.started && !e?.state?.paused && !e?.state?.over),
  isGamePaused: (e) => Boolean(e?.state?.paused),
  isGameCrashed: (e) => Boolean(e?.state?.over),
  restartGame: (e) => { e?.restart(); e?.jump(); },
  pauseGame: (e) => { if (e?.state) e.state.paused = true; },
  resumeGame: (e) => { if (e?.state) e.state.paused = false; },
  mapKeyEventToAction: (e) => ((e.code === "Space" || e.code === "ArrowUp") ? "jump" : null),
  snapshot: (engine, action) => {
    if (!engine?.state?.bird) return null;
    return { ...extractFlappyFeatures(engine), action: action === "jump" ? "jump" : "none" };
  },
};
