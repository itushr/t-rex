import { extractFlappyFeatures } from "../../flappybird/adapter";
import { FLAPPY_FEATURES } from "../../flappybird/features";

export { extractFlappyFeatures, FLAPPY_FEATURES };

export function extractCurrentFeatures(engine: any) {
  if (!engine) return null;
  return extractFlappyFeatures(engine);
}
