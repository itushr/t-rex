import { GameAdapter } from "./types";
import { trexAdapter } from "./trex/adapter";
import { TREX_FEATURES } from "./trex/features";
import { FeatureOption } from "../types/train";

export * from "./types";
export { trexAdapter } from "./trex/adapter";

const GAME_ADAPTERS: Record<string, GameAdapter<any>> = {
  trex: trexAdapter,
};

const GAME_FEATURES: Record<string, FeatureOption[]> = {
  trex: TREX_FEATURES,
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
