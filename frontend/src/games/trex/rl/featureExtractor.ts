import { readObstacles } from "../featureExtractor";

export function extractNormalizedRLFeatures(runner: any, selectedFeatures: string[]): number[] {
  if (!runner?.tRex) return new Array(selectedFeatures.length).fill(0);
  const [obs1, obs2] = readObstacles(runner);
  const speed = Number(runner.currentSpeed) || 0;

  const featureMap: Record<string, number> = {
    speed: Math.min(1, Math.max(0, speed / 15)),
    obstacle1_x: obs1.x > 0 ? Math.min(1, obs1.x / 600) : 1,
    obstacle1_y: obs1.y > 0 ? Math.min(1, obs1.y / 150) : 0,
    obstacle1_size: Math.min(1, (obs1.size || 1) / 3),
    obstacle2_x: obs2.x > 0 ? Math.min(1, obs2.x / 1000) : 1,
    jumping: runner.tRex.jumping ? 1 : 0,
    ducking: runner.tRex.ducking ? 1 : 0,
  };

  return selectedFeatures.map((f) => featureMap[f] ?? 0);
}
