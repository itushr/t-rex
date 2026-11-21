import { GameAdapter } from "./types";
import { trexAdapter } from "./trex/adapter";
import { TREX_FEATURES } from "./trex/features";
import { flappyAdapter } from "./flappybird/adapter";
import { FLAPPY_FEATURES } from "./flappybird/features";
import { FeatureOption } from "../types/train";

export * from "./types";
export { trexAdapter } from "./trex/adapter";
export { flappyAdapter } from "./flappybird/adapter";

const GAME_ADAPTERS: Record<string, GameAdapter<any>> = {
  trex: trexAdapter,
  dino: trexAdapter,
  "flappy-bird": flappyAdapter,
  flappybird: flappyAdapter,
};

const GAME_FEATURES: Record<string, FeatureOption[]> = {
  trex: TREX_FEATURES,
  dino: TREX_FEATURES,
  "flappy-bird": FLAPPY_FEATURES,
  flappybird: FLAPPY_FEATURES,
};

export function getGameAdapter<T = Record<string, any>>(gameId: string): GameAdapter<T> {
  const adapter = GAME_ADAPTERS[gameId] || GAME_ADAPTERS.trex;
  return adapter as GameAdapter<T>;
}

export function getGameFeatures(gameId: string): FeatureOption[] {
  return GAME_FEATURES[gameId] || GAME_FEATURES.trex;
}

export function getGameModels(gameId: string): readonly string[] {
  return getGameAdapter(gameId).supportedModels;
}
