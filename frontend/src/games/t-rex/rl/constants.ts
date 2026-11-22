import type { DinoAction, RLConfig } from "./types";

export interface StateDef {
  key: string;
  label: string;
  desc: string;
  type: string;
}

export const FIXED_DINO_STATES: StateDef[] = [
  { key: "dino_motion", label: "dino_motion", desc: "ground / ducking / jump_up (vy<0) / jump_down (vy>=0)", type: "categorical" },
  { key: "tti_bucket", label: "tti_bucket", desc: "none / far / mid / close / imminent (speed-scaled TTI)", type: "categorical" },
  { key: "obst_type", label: "obst_type", desc: "cactus / bird_low / bird_mid / bird_high / none", type: "categorical" },
];

export const AVAILABLE_ACTIONS: { key: DinoAction; label: string }[] = [
  { key: "jump", label: "Jump" },
  { key: "duck", label: "Duck" },
  { key: "none", label: "None (Run)" },
];

export const DEFAULT_RL_CONFIG: RLConfig = {
  alpha: 0.15,
  gamma: 0.95,
  rewards: {
    survive: 0.10,
    jump_tax: 0.05,
    duck_tax: 0.05,
    duck_hold_tax: 0.02,
    clear_obstacle: 1.00,
    crash_penalty: -10.0,
  },
  enabledRewards: {
    survive: true,
    jump_tax: true,
    duck_tax: true,
    duck_hold_tax: true,
    clear_obstacle: true,
    crash_penalty: true,
  },
  actions: ["jump", "duck", "none"],
};
