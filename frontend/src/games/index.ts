import { GameAdapter } from "./types";
import { trexAdapter } from "./trex/adapter";

export * from "./types";
export { trexAdapter } from "./trex/adapter";

const GAME_ADAPTERS: Record<string, GameAdapter<any>> = {
  trex: trexAdapter,
};

export function getGameAdapter<T = Record<string, any>>(gameId: string): GameAdapter<T> {
  const adapter = GAME_ADAPTERS[gameId] || GAME_ADAPTERS.trex;
  return adapter as GameAdapter<T>;
}
