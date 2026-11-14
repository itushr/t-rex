import { FeatureOption } from "../../types/train";

export const ALL_FEATURES: FeatureOption[] = [
  { id: "obstacle1_x", label: "Obs 1 Distance", desc: "X distance to hazard", category: "Obstacle 1" },
  { id: "obstacle1_y", label: "Obs 1 Height", desc: "Y altitude of hazard", category: "Obstacle 1" },
  { id: "obstacle1_size", label: "Obs 1 Size", desc: "Obstacle cluster width", category: "Obstacle 1" },
  { id: "obstacle1_type", label: "Obs 1 Type", desc: "Cactus or Bird variant", category: "Obstacle 1" },
  { id: "obstacle2_x", label: "Obs 2 Distance", desc: "X distance to 2nd hazard", category: "Obstacle 2" },
  { id: "obstacle2_y", label: "Obs 2 Height", desc: "Y altitude of 2nd hazard", category: "Obstacle 2" },
  { id: "obstacle2_size", label: "Obs 2 Size", desc: "2nd obstacle cluster width", category: "Obstacle 2" },
  { id: "obstacle2_type", label: "Obs 2 Type", desc: "2nd hazard variant", category: "Obstacle 2" },
  { id: "speed", label: "Runner Speed", desc: "Current game velocity", category: "Dino State" },
  { id: "jumping", label: "Jumping", desc: "In-air state boolean", category: "Dino State" },
  { id: "ducking", label: "Ducking", desc: "Crouching state boolean", category: "Dino State" },
  { id: "time_to_impact", label: "Time to Impact", desc: "Distance / speed ratio", category: "Calculated" },
];

export const CATEGORIES = ["Obstacle 1", "Obstacle 2", "Dino State", "Calculated"] as const;
