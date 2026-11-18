export const TREX_SUPPORTED_MODELS = ["decision_tree", "random_forest"];

export const TREX_NUMERIC_FEATURES = [
  "speed",
  "obstacle_distance",
  "obstacle_width",
  "obstacle_y",
  "obstacle_gap",
  "obstacle2_distance",
  "obstacle2_width",
  "obstacle2_y",
] as const;

export const TREX_CATEGORICAL_FEATURES = ["obstacle_type", "obstacle2_type"] as const;

export const TREX_VALID_ACTIONS = ["JUMP", "DUCK", "NONE"] as const;

export const TREX_FEATURE_CONFIGS = [
  { key: "speed", label: "Speed", group: "dino" },
  { key: "obstacle_distance", label: "Obstacle Distance", group: "obs1" },
  { key: "obstacle_width", label: "Obstacle Width", group: "obs1" },
  { key: "obstacle_y", label: "Obstacle Height/Y", group: "obs1" },
  { key: "obstacle_type", label: "Obstacle Type", group: "obs1" },
  { key: "obstacle_gap", label: "Obstacle Gap", group: "obs1" },
  { key: "obstacle2_distance", label: "Obstacle 2 Distance", group: "obs2" },
  { key: "obstacle2_width", label: "Obstacle 2 Width", group: "obs2" },
  { key: "obstacle2_y", label: "Obstacle 2 Height/Y", group: "obs2" },
  { key: "obstacle2_type", label: "Obstacle 2 Type", group: "obs2" },
] as const;
