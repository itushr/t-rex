import { readObstacles } from "../featureExtractor";

export interface DinoRLState {
  is_obst_close: boolean;
  obst_type: string;
  obst_y: number;
}

export function extractDinoRLState(runner: any): DinoRLState {
  if (!runner?.tRex) {
    return { is_obst_close: false, obst_type: "none", obst_y: 0 };
  }
  const [obs1] = readObstacles(runner);
  const speed = Number(runner.currentSpeed) || 0;
  const dist = obs1.x;
  const tti = dist > 0 && speed > 0 ? dist / speed : -1;

  const isClose = Boolean(dist > 0 && tti > 0 && tti <= 18);
  const type = dist > 0 ? String(obs1.type) : "none";
  const y = dist > 0 ? Math.round(Number(obs1.y) || 0) : 0;

  return { is_obst_close: isClose, obst_type: type, obst_y: y };
}

export function serializeDinoState(s: DinoRLState): string {
  return `${s.is_obst_close ? "close" : "far"}|${s.obst_type}|${s.obst_y}`;
}
