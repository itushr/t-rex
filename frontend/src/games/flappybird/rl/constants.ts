import type { FlappyAction, FlappyRLConfig } from "./types";

export const FIXED_FLAPPY_STATES = [
  { key: "h_bucket", label: "h_bucket", desc: "Horizontal distance to gap (imminent / close / mid / far)", type: "categorical" },
  { key: "v_bucket", label: "v_bucket", desc: "Vertical offset from gap center (high / above / centered / below / low)", type: "categorical" },
  { key: "vy_bucket", label: "vy_bucket", desc: "Vertical velocity (rising / gliding / falling)", type: "categorical" },
];

export const AVAILABLE_FLAPPY_ACTIONS: { key: FlappyAction; label: string }[] = [
  { key: "jump", label: "Jump (Flap)" },
  { key: "none", label: "None (Fall)" },
];

export const DEFAULT_FLAPPY_RL_CONFIG: FlappyRLConfig = {
  alpha: 0.15,
  gamma: 0.95,
  rewards: {
    survive: 0.10,
    jump_tax: 0.02,
    clear_pipe: 1.00,
    crash_penalty: -10.0,
    in_gap_bonus: 0.05,
  },
  enabledRewards: {
    survive: true,
    jump_tax: true,
    clear_pipe: true,
    crash_penalty: true,
    in_gap_bonus: true,
  },
  actions: ["jump", "none"],
  stateDefs: FIXED_FLAPPY_STATES,
  availableActions: AVAILABLE_FLAPPY_ACTIONS,
};
