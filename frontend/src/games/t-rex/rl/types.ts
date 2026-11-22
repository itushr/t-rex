export type DinoAction = "jump" | "duck" | "none";

export interface RewardConfig {
  survive: number;
  jump_tax: number;
  duck_tax: number;
  duck_hold_tax: number;
  clear_obstacle: number;
  crash_penalty: number;
}

export interface RLConfig {
  alpha: number;
  gamma: number;
  rewards: RewardConfig;
  enabledRewards: Record<keyof RewardConfig, boolean>;
  actions: DinoAction[];
  stateDefs?: { key: string; label: string; desc: string; type: string }[];
  availableActions?: { key: any; label: string }[];
}
