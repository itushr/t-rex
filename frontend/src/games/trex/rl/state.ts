import { readObstacles } from "../featureExtractor";

export type DinoMotion = "ground" | "ducking" | "jump_up" | "jump_down";

export interface DinoRLState {
  dino_motion: DinoMotion;
  tti_bucket: string;
  obst_type: string;
}

export function extractDinoRLState(runner: any): DinoRLState {
  if (!runner?.tRex) {
    return { dino_motion: "ground", tti_bucket: "none", obst_type: "none" };
  }
  const rex = runner.tRex;
  let motion: DinoMotion = "ground";
  if (rex.jumping) {
    motion = (rex.jumpVelocity ?? 0) < 0 ? "jump_up" : "jump_down";
  } else if (rex.ducking) {
    motion = "ducking";
  }

  const [obs1] = readObstacles(runner);
  const dinoX = Number(rex.xPos) || 50;
  const speed = Number(runner.currentSpeed) || 0;
  const dist = obs1.x > 0 ? obs1.x - dinoX : -1;
  const tti = dist > 0 && speed > 0 ? dist / speed : -1;

  let ttiBucket = "none";
  if (tti > 0 && dist <= 500) {
    if (tti > 24) ttiBucket = "far";
    else if (tti > 16) ttiBucket = "mid";
    else if (tti > 9) ttiBucket = "close";
    else ttiBucket = "imminent";
  }

  let obstType = "none";
  if (dist > 0 && tti > 0 && tti <= 35) {
    const raw = String(obs1.type);
    if (raw.includes("PTERODACTYL") || raw.includes("BIRD")) {
      obstType = obs1.y < 60 ? "bird_high" : obs1.y < 85 ? "bird_mid" : "bird_low";
    } else {
      obstType = "cactus";
    }
  }

  return { dino_motion: motion, tti_bucket: ttiBucket, obst_type: obstType };
}

export function serializeDinoState(s: DinoRLState): string {
  return `${s.dino_motion}|${s.tti_bucket}|${s.obst_type}`;
}
