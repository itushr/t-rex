export { DinoGame } from "./game";
export { TRexSounds, playJumpSound, playGameOverSound, playScoreSound } from "./sounds";
export { createTRexController, dispatchDinoAction, getValidActions } from "./controller";
export type { TRexController } from "./controller";
export { extractFeatureVector, readObstacles, TREX_FEATURES, extractCurrentFeatures } from "./recorder";
export { trexAdapter } from "./adapter";
export { useDinoRL } from "./rl/useDinoRL";
export { OnnxDinoAutoplay } from "./autoplay/onnxAutoplay";
