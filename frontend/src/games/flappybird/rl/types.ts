export type FlappyAction = "none" | "jump";

export interface FlappyRewardConfig {
  survive: number;
  jump_tax: number;
  clear_pipe: number;
  crash_penalty: number;
  in_gap_bonus: number;
}

export interface FlappyRLConfig {
  alpha: number;
  gamma: number;
  rewards: FlappyRewardConfig;
  enabledRewards: Record<keyof FlappyRewardConfig, boolean>;
  actions: FlappyAction[];
  stateDefs?: { key: string; label: string; desc: string; type: string }[];
  availableActions?: { key: FlappyAction; label: string }[];
}
