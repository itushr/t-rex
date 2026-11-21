export const FLAPPY_SUPPORTED_MODELS = ["decision_tree", "random_forest"];

export const FLAPPY_NUMERIC_FEATURES = [
  "bird_y",
  "bird_vy",
  "pipe1_dist",
  "pipe1_top",
  "pipe1_bottom",
  "dist_to_gap_top",
  "dist_to_gap_bottom",
  "pipe2_dist",
  "pipe2_top",
  "pipe2_bottom",
] as const;

export const FLAPPY_CATEGORICAL_FEATURES = [] as const;

export const FLAPPY_VALID_ACTIONS = ["none", "jump"] as const;

export const FLAPPY_FEATURE_CONFIGS = [
  { key: "bird_y", label: "Bird Y", group: "bird" },
  { key: "bird_vy", label: "Bird Velocity", group: "bird" },
  { key: "pipe1_dist", label: "Pipe 1 Distance", group: "pipe1" },
  { key: "pipe1_top", label: "Pipe 1 Gap Top", group: "pipe1" },
  { key: "pipe1_bottom", label: "Pipe 1 Gap Bottom", group: "pipe1" },
  { key: "dist_to_gap_top", label: "Dist to Gap Top", group: "pipe1" },
  { key: "dist_to_gap_bottom", label: "Dist to Gap Bottom", group: "pipe1" },
  { key: "pipe2_dist", label: "Pipe 2 Distance", group: "pipe2" },
  { key: "pipe2_top", label: "Pipe 2 Gap Top", group: "pipe2" },
  { key: "pipe2_bottom", label: "Pipe 2 Gap Bottom", group: "pipe2" },
] as const;
