import { FeatureOption } from "../../types/train";

export const FLAPPY_FEATURES: FeatureOption[] = [
  { id: "bird_y", label: "Bird Altitude", desc: "Current Y position of the bird", category: "Bird State" },
  { id: "bird_vy", label: "Bird Velocity", desc: "Vertical velocity (up/down)", category: "Bird State" },
  { id: "pipe1_dist", label: "Pipe 1 Distance", desc: "Horizontal distance to nearest pipe", category: "Upcoming Pipe" },
  { id: "pipe1_top", label: "Gap Top", desc: "Bottom Y of the upper pipe", category: "Upcoming Pipe" },
  { id: "pipe1_bottom", label: "Gap Bottom", desc: "Top Y of the lower pipe", category: "Upcoming Pipe" },
  { id: "dist_to_gap_top", label: "Dist to Gap Top", desc: "Vertical clearance from upper pipe", category: "Calculated" },
  { id: "dist_to_gap_bottom", label: "Dist to Gap Bottom", desc: "Vertical clearance from lower pipe", category: "Calculated" },
  { id: "pipe2_dist", label: "Pipe 2 Distance", desc: "Distance to 2nd upcoming pipe", category: "Next Pipe" },
  { id: "pipe2_top", label: "Pipe 2 Gap Top", desc: "Upper pipe boundary of 2nd pipe", category: "Next Pipe" },
  { id: "pipe2_bottom", label: "Pipe 2 Gap Bottom", desc: "Lower pipe boundary of 2nd pipe", category: "Next Pipe" },
];
