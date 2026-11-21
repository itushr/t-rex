import type { DinoAction, RLConfig } from "./types";

export interface StateDef {
  key: string;
  label: string;
  desc: string;
  type: string;
}

export const FIXED_DINO_STATES: StateDef[] = [
  { key: "is_obst_close", label: "is_obst_close", desc: "TTI <= 18 danger window", type: "boolean" },
  { key: "obst_type", label: "obst_type", desc: "CACTUS_SMALL / LARGE / PTERODACTYL", type: "categorical" },
  { key: "obst_y", label: "obst_y", desc: "Obstacle Y elevation level", type: "numeric" },
];

export const AVAILABLE_ACTIONS: { key: DinoAction; label: string }[] = [
  { key: "jump", label: "Jump" },
  { key: "duck", label: "Duck" },
  { key: "none", label: "None (Run)" },
];

export const DEFAULT_RL_CONFIG: RLConfig = {
  rewards: {
    survive: 0.0,
    jump_penalty: -1.0,
    clear_obstacle: 5.0,
    crash_penalty: -10.0,
  },
  enabledRewards: {
    survive: false,
    jump_penalty: true,
    clear_obstacle: true,
    crash_penalty: true,
  },
  actions: ["jump", "duck", "none"],
};
