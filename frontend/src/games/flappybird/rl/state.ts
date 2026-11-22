import { FlappyEngine } from "../flappyEngine";

export type HBucket = "imminent" | "close" | "mid" | "far";
export type VBucket = "high" | "above" | "centered" | "below" | "low";
export type VyBucket = "rising" | "gliding" | "falling";

export interface FlappyRLState {
  h_bucket: HBucket;
  v_bucket: VBucket;
  vy_bucket: VyBucket;
}

export function extractFlappyRLState(engine: FlappyEngine): FlappyRLState {
  if (!engine?.state?.bird) {
    return { h_bucket: "far", v_bucket: "centered", vy_bucket: "gliding" };
  }
  const s = Math.max(0.6, engine.height / 600);
  const b = engine.state.bird;
  const pw = 64 * s;
  const upcoming = engine.state.pipes.filter((p) => p.x + pw >= b.x).sort((a, c) => a.x - c.x);
  const p1 = upcoming[0];

  let h_bucket: HBucket = "far";
  let v_bucket: VBucket = "centered";

  if (p1) {
    const hDist = (p1.x - b.x) / s;
    if (hDist < 60) h_bucket = "imminent";
    else if (hDist < 160) h_bucket = "close";
    else if (hDist < 280) h_bucket = "mid";

    const gapCenter = (p1.topY + p1.height + p1.bottomY) / 2;
    const vDist = (b.y - gapCenter) / s;
    if (vDist < -70) v_bucket = "high";
    else if (vDist < -20) v_bucket = "above";
    else if (vDist <= 20) v_bucket = "centered";
    else if (vDist <= 70) v_bucket = "below";
    else v_bucket = "low";
  } else {
    const screenCenter = engine.height / 2;
    const vDist = (b.y - screenCenter) / s;
    if (vDist < -70) v_bucket = "high";
    else if (vDist > 70) v_bucket = "low";
  }

  const normVy = b.vy / s;
  let vy_bucket: VyBucket = "gliding";
  if (normVy < -2.0) vy_bucket = "rising";
  else if (normVy > 2.0) vy_bucket = "falling";

  return { h_bucket, v_bucket, vy_bucket };
}

export function serializeFlappyState(s: FlappyRLState): string {
  return `${s.h_bucket}|${s.v_bucket}|${s.vy_bucket}`;
}
