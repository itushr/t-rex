import { GameAdapter } from "./types";
import { trexAdapter } from "./t-rex/adapter";
import { TREX_FEATURES } from "./t-rex/recorder/features";
import { flappyAdapter } from "./flappy-bird/adapter";
import { FLAPPY_FEATURES } from "./flappy-bird/recorder/features";
import { FeatureOption } from "../types/train";
import { normalizeGameId, SUPPORTED_GAMES } from "../constants/games";

export * from "./types";
export { trexAdapter } from "./t-rex/adapter";
export { flappyAdapter } from "./flappy-bird/adapter";

const GAME_ADAPTERS: Record<string, GameAdapter<any>> = {
  "t-rex": trexAdapter,
  "flappy-bird": flappyAdapter,
};

const GAME_FEATURES: Record<string, FeatureOption[]> = {
  "t-rex": TREX_FEATURES,
  "flappy-bird": FLAPPY_FEATURES,
};

export function getGameAdapter<T = Record<string, any>>(gameId: string): GameAdapter<T> {
  const norm = normalizeGameId(gameId);
  const adapter = GAME_ADAPTERS[norm] || GAME_ADAPTERS[SUPPORTED_GAMES[0]?.id];
  return adapter as GameAdapter<T>;
}

export function getGameFeatures(gameId: string): FeatureOption[] {
  const norm = normalizeGameId(gameId);
  return GAME_FEATURES[norm] || GAME_FEATURES[SUPPORTED_GAMES[0]?.id] || [];
}

export function getGameModels(gameId: string): readonly string[] {
  const norm = normalizeGameId(gameId);
  const def = SUPPORTED_GAMES.find((g) => g.id === norm);
  return def?.supportedModels || [];
}
