import { GameAdapter } from "../types";
import {
  TREX_SUPPORTED_MODELS,
  TREX_NUMERIC_FEATURES,
  TREX_CATEGORICAL_FEATURES,
  TREX_VALID_ACTIONS,
  TREX_FEATURE_CONFIGS,
} from "./constants";
import { readObstacles } from "./recorder/featureExtractor";

export interface TrexSample {
  obstacle1_x: number; obstacle1_y: number; obstacle1_type: string; obstacle1_size: number;
  obstacle2_x: number; obstacle2_y: number; obstacle2_type: string; obstacle2_size: number;
  speed: number; jumping: number; ducking: number; time_to_impact: number;
  action: "jump" | "duck" | "none";
}

export const trexAdapter: GameAdapter<TrexSample> = {
  id: "trex",
  name: "Chrome Dino T-Rex",
  supportedModels: TREX_SUPPORTED_MODELS,
  numericFeatures: TREX_NUMERIC_FEATURES,
  categoricalFeatures: TREX_CATEGORICAL_FEATURES,
  validActions: TREX_VALID_ACTIONS,
  featureConfigs: TREX_FEATURE_CONFIGS,
  getRunnerInstance: () => (typeof window !== "undefined" ? (window as any).Runner?.instance_ : null),
  isGameRunning: (r) => Boolean(r?.playing && !r?.paused && !r?.crashed),
  isGamePaused: (r) => Boolean(r?.paused),
  isGameCrashed: (r) => Boolean(r?.crashed),
  restartGame: (r) => r?.restart?.(),
  pauseGame: (r) => r?.stop?.(),
  resumeGame: (r) => r?.play?.(),
  mapKeyEventToAction: (e) => {
    if (e.code === "Space" || e.code === "ArrowUp") return "jump";
    if (e.code === "ArrowDown") return "duck";
    return null;
  },
  snapshot: (runner, action) => {
    if (!runner?.tRex || !runner?.horizon) return null;
    const [obs1, obs2] = readObstacles(runner);
    const speed = Number(runner.currentSpeed) || 0;
    const dist = obs1.x;
    const tti = dist > 0 && speed > 0 ? Number((dist / speed).toFixed(3)) : -1;
    return {
      obstacle1_x: dist, obstacle1_y: obs1.y, obstacle1_type: obs1.type, obstacle1_size: obs1.size,
      obstacle2_x: obs2.x, obstacle2_y: obs2.y, obstacle2_type: obs2.type, obstacle2_size: obs2.size,
      speed, jumping: Number(Boolean(runner.tRex.jumping)), ducking: Number(Boolean(runner.tRex.ducking)),
      time_to_impact: tti, action: (action as "jump" | "duck" | "none") || "none",
    };
  },
};
