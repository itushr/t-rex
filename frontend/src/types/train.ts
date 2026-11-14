export interface GameSample {
  speed?: number;
  obstacle1_x?: number;
  obstacle1_y?: number;
  obstacle1_size?: number;
  obstacle1_type?: string;
  obstacle2_x?: number;
  obstacle2_y?: number;
  obstacle2_size?: number;
  obstacle2_type?: string;
  jumping?: number | boolean;
  ducking?: number | boolean;
  time_to_impact?: number;
  action?: string;
  [key: string]: any;
}

export interface FeatureOption {
  id: string;
  label: string;
  desc: string;
  category: "Obstacle 1" | "Obstacle 2" | "Dino State" | "Calculated";
}

export interface TrainResult {
  accuracy: number;
  samples: number;
  features: string[];
  actions: string[];
  model_name: string;
}
