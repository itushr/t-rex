export interface Pipe {
  x: number;
  topY: number;
  bottomY: number;
  width: number;
  height: number;
  passed: boolean;
}

export interface Bird {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
}

export interface FlappyState {
  bird: Bird;
  pipes: Pipe[];
  score: number;
  bestScore: number;
  started: boolean;
  paused: boolean;
  over: boolean;
}
