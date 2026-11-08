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

export interface GameplaySummary {
  name: string;
  filename: string;
  size_bytes: number;
  modified: number;
}
