import { GameAdapter } from "./types";
import { FeatureOption } from "../types/train";
import { getGameDefinition, SUPPORTED_GAMES } from "../constants/games";

export * from "./types";

export function getGameAdapter<T = Record<string, any>>(gameId = ""): GameAdapter<T> {
  const def = getGameDefinition(gameId) || SUPPORTED_GAMES[0];
  return def.adapter as GameAdapter<T>;
}

export function getGameFeatures(gameId = ""): FeatureOption[] {
  const def = getGameDefinition(gameId) || SUPPORTED_GAMES[0];
  return def.features || [];
}

export function getGameModels(gameId = ""): readonly string[] {
  const def = getGameDefinition(gameId) || SUPPORTED_GAMES[0];
  return def.supportedModels || [];
}
