import { GameAdapter } from "./types";
import { FeatureOption } from "../types/train";
import { getGameDefinition, SUPPORTED_GAMES } from "../constants/games";
import { getModelDefinition } from "../constants/models";

export * from "./types";

export function getGameAdapter<T = Record<string, any>>(gameId = ""): GameAdapter<T> {
  const def = getGameDefinition(gameId) || SUPPORTED_GAMES[0];
  return def.adapter as GameAdapter<T>;
}

export function getGameFeatures(gameId = ""): FeatureOption[] {
  const def = getGameDefinition(gameId) || SUPPORTED_GAMES[0];
  return def.features || [];
}

export function getDefaultFeatures(gameId = ""): string[] {
  const def = getGameDefinition(gameId) || SUPPORTED_GAMES[0];
  return def.default_features || def.features?.map((f) => f.id) || [];
}

export function getDefaultModel(gameId = ""): string {
  const def = getGameDefinition(gameId) || SUPPORTED_GAMES[0];
  return def.default_model || "decision_tree";
}

export function getGameTrainModels(gameId = ""): readonly string[] {
  const def = getGameDefinition(gameId) || SUPPORTED_GAMES[0];
  return (def.supportedModels || []).filter((mId) => {
    const m = getModelDefinition(mId);
    return m?.type === "supervised" || m?.type === "unsupervised";
  });
}
