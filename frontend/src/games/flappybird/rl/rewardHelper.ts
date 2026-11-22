import type { FlappyAction, FlappyRLConfig } from "./types";
import type { FlappyRLState } from "./state";

export function calcFlappyStepReward(
  state: FlappyRLState,
  action: FlappyAction,
  passedPipe: boolean,
  cfg: FlappyRLConfig
): number {
  const { rewards, enabledRewards } = cfg;
  let r = enabledRewards.survive ? rewards.survive : 0.10;

  if (action === "jump") {
    r -= enabledRewards.jump_tax ? rewards.jump_tax : 0.02;
    if (state.v_bucket === "high") r -= 0.08;
  }

  if (state.v_bucket === "centered" && enabledRewards.in_gap_bonus) {
    r += rewards.in_gap_bonus;
  }

  if (passedPipe && enabledRewards.clear_pipe) {
    r += rewards.clear_pipe;
  }

  return Number(r.toFixed(4));
}

export function calcFlappyCrashPenalty(cfg: FlappyRLConfig): number {
  return cfg.enabledRewards.crash_penalty ? cfg.rewards.crash_penalty : -10.0;
}
