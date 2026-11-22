export { DinoGame } from "./game";
export { TRexSounds, playJumpSound, playGameOverSound, playScoreSound } from "./sounds";
export { createTRexController, dispatchDinoAction, getValidActions } from "./controller";
export type { TRexController } from "./controller";
export { extractFeatureVector, readObstacles, TREX_FEATURES } from "./recorder";
