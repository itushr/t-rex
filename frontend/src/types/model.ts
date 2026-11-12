export interface ModelSummary {
  name: string;
  filename: string;
  game_id: string;
  model_type: string;
  features_count: number;
  actions: string[];
  size_bytes: number;
  modified: number;
}

export interface ModelInfo {
  model_name: string;
  model_type: string;
  game_id: string;
  n_estimators: number;
  features: string[];
  actions: string[];
}

export interface ModelSingleTreeResponse {
  model_name: string;
  model_type: string;
  tree_index: number;
  n_estimators: number;
  tree: any;
}

export interface GameplaySummary {
  name: string;
  filename: string;
  size_bytes: number;
  modified: number;
}
