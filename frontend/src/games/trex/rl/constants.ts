import type { DinoAction, RLConfig } from "./types";

export interface FeatureMeta {
  key: string;
  label: string;
}

export const AVAILABLE_FEATURES: FeatureMeta[] = [
  { key: "speed", label: "Game Speed" },
  { key: "obstacle1_x", label: "Obstacle Distance" },
  { key: "obstacle1_y", label: "Obstacle Height (Y)" },
  { key: "obstacle1_size", label: "Obstacle Size" },
  { key: "obstacle2_x", label: "Next Obstacle Dist" },
  { key: "jumping", label: "Dino Jumping" },
  { key: "ducking", label: "Dino Ducking" },
];

export const AVAILABLE_ACTIONS: { key: DinoAction; label: string }[] = [
  { key: "jump", label: "Jump" },
  { key: "duck", label: "Duck" },
  { key: "none", label: "None (Run)" },
];

export const DEFAULT_RL_CONFIG: RLConfig = {
  features: ["speed", "obstacle1_x", "obstacle1_y", "obstacle1_size", "jumping", "ducking"],
  rewards: {
    survive: 0.1,
    jump_penalty: -0.5,
    clear_obstacle: 5.0,
    crash_penalty: -10.0,
  },
  enabledRewards: {
    survive: true,
    jump_penalty: true,
    clear_obstacle: true,
    crash_penalty: true,
  },
  actions: ["jump", "duck", "none"],
};
