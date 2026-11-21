export type DinoAction = "jump" | "duck" | "none";

export interface RewardConfig {
  survive: number;
  jump_penalty: number;
  clear_obstacle: number;
  crash_penalty: number;
}

export interface RLConfig {
  rewards: RewardConfig;
  enabledRewards: Record<keyof RewardConfig, boolean>;
  actions: DinoAction[];
}
