export type DinoAction = "JUMP" | "DUCK" | "RUN";

export interface TreeDecision {
  id: string;
  name: string;
  rule: string;
  action: DinoAction;
}

export interface SimState {
  action: DinoAction;
  dist: number;
  speed: number;
  obsType: "small" | "large" | "bird" | "none";
  trees: TreeDecision[];
}
