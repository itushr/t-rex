export interface QTableEntry<A extends string = string> {
  stateKey: string;
  values: Record<A, number>;
  bestAction: A;
  bestValue: number;
}

export interface RewardConfig {
  survive: number;
  jump_tax?: number;
  duck_tax?: number;
  duck_hold_tax?: number;
  clear_obstacle?: number;
  clear_pipe?: number;
  crash_penalty: number;
  in_gap_bonus?: number;
  [key: string]: number | undefined;
}

export interface RLConfig<A extends string = string> {
  alpha: number;
  gamma: number;
  rewards: Record<string, number>;
  enabledRewards: Record<string, boolean>;
  actions: A[];
  stateDefs?: { key: string; label: string; desc: string; type: string }[];
  availableActions?: { key: A; label: string }[];
}
