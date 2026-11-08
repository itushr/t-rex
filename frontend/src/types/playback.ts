import { TreeNode, TreeGraphData } from "./tree";

export interface ObstacleData {
  type: string;
  x: number;
  y: number;
  size: number;
}

export interface CompactRuleStep {
  node_id: number;
  feature?: string;
  thresh?: number;
  actual?: number;
  branch?: string;
  ok?: boolean;
  samples?: number;
  pred?: string;
  is_leaf?: boolean;
}

export interface TreePathResult {
  tree_index: number;
  predicted_action: string;
  node_ids: number[];
  leaf_id: number;
  steps: CompactRuleStep[];
}

export interface PlaybackStep {
  step: number;
  time: number;
  speed: number;
  time_to_impact?: number;
  jumping: boolean;
  ducking: boolean;
  obs1: ObstacleData;
  obs2: ObstacleData;
  action: string;
  executed?: string;
  model_type?: string;
  votes?: Record<string, number>;
  trees?: TreePathResult[];
  path?: number[];
  leaf_id?: number;
  steps?: CompactRuleStep[];
}

export interface PlaybackSession {
  filename?: string;
  model_name: string;
  model_type: string;
  n_estimators: number;
  recorded_at: string;
  duration: number;
  total_steps: number;
  crashed: boolean;
  forest?: TreeGraphData;
  tree?: TreeNode;
  records: PlaybackStep[];
}
