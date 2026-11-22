import { extractFlappyFeatures } from "../adapter";
import { FLAPPY_FEATURES } from "./features";

export { extractFlappyFeatures, FLAPPY_FEATURES };

export function extractCurrentFeatures(engine: any) {
  if (!engine) return null;
  return extractFlappyFeatures(engine);
}
