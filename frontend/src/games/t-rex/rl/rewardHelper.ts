import type { DinoAction, RLConfig } from "./types";
import type { DinoMotion } from "./state";

export function calcStepReward(
  motion: DinoMotion,
  action: DinoAction,
  cleared: boolean,
  cfg: RLConfig
): number {
  const { rewards, enabledRewards } = cfg;
  let reward = enabledRewards.survive ? rewards.survive : 0.10;

  if (motion === "ground") {
    if (action === "jump") reward -= enabledRewards.jump_tax ? rewards.jump_tax : 0.05;
    else if (action === "duck") reward -= enabledRewards.duck_tax ? rewards.duck_tax : 0.05;
  } else if (motion === "ducking") {
    if (action === "duck") reward -= enabledRewards.duck_hold_tax ? rewards.duck_hold_tax : 0.02;
    else if (action === "jump") reward -= enabledRewards.jump_tax ? rewards.jump_tax : 0.05;
  } else if (motion === "jump_up" || motion === "jump_down") {
    if (action === "duck") reward -= enabledRewards.duck_hold_tax ? rewards.duck_hold_tax : 0.02;
    else if (action === "jump") reward -= 0.15;
  }

  if (cleared && enabledRewards.clear_obstacle) {
    reward += rewards.clear_obstacle;
  }

  return Number(reward.toFixed(4));
}

export function calcCrashPenalty(cfg: RLConfig): number {
  return cfg.enabledRewards.crash_penalty ? cfg.rewards.crash_penalty : -10.0;
}
