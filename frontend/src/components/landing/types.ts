export type DinoAction = "jump" | "duck" | "none";

export interface SimState {
  action: DinoAction;
  votes: DinoAction[];
  dist: number;
  speed: number;
  obsType: "small" | "large" | "bird" | "none";
}
