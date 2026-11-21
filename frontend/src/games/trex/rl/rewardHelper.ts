import type { RLConfig } from "./types";

export function calcStepReward(passed: boolean, cfg: RLConfig): number {
  return passed
    ? (cfg.enabledRewards.clear_obstacle ? cfg.rewards.clear_obstacle : 5)
    : (cfg.enabledRewards.jump_penalty ? cfg.rewards.jump_penalty : -1);
}

export function calcCrashPenalty(cfg: RLConfig): number {
  return cfg.enabledRewards.crash_penalty ? cfg.rewards.crash_penalty : -10;
}
