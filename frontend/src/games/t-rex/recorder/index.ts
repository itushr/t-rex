import { extractFeatureVector, readObstacles } from "./featureExtractor";
import { TREX_FEATURES } from "./features";

export { extractFeatureVector, readObstacles, TREX_FEATURES };

export function extractCurrentFeatures(runner: any, expectedFeatures: string[]) {
  if (!runner) return null;
  return extractFeatureVector(runner, expectedFeatures);
}
