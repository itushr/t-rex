import { extractFeatureVector, readObstacles } from "../../trex/featureExtractor";
import { TREX_FEATURES } from "../../trex/features";

export { extractFeatureVector, readObstacles, TREX_FEATURES };

export function extractCurrentFeatures(runner: any, expectedFeatures: string[]) {
  if (!runner) return null;
  return extractFeatureVector(runner, expectedFeatures);
}
