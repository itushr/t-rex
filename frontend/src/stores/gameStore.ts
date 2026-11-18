import { create } from "zustand";
import { DEFAULT_GAME_ID } from "../constants/games";

interface GameState {
  activeGameId: string;
  cachedModels: Record<string, { data: any[]; timestamp: number }>;
  cachedPlaybacks: Record<string, { data: any[]; timestamp: number }>;
  setActiveGame: (id: string) => void;
  setCachedModels: (gameId: string, models: any[]) => void;
  getCachedModels: (gameId: string, maxAgeMs?: number) => any[] | null;
  setCachedPlaybacks: (gameId: string, playbacks: any[]) => void;
  getCachedPlaybacks: (gameId: string, maxAgeMs?: number) => any[] | null;
  invalidateCache: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  activeGameId: DEFAULT_GAME_ID,
  cachedModels: {},
  cachedPlaybacks: {},

  setActiveGame: (id: string) => set({ activeGameId: id }),

  setCachedModels: (gameId: string, data: any[]) =>
    set((state) => ({
      cachedModels: { ...state.cachedModels, [gameId]: { data, timestamp: Date.now() } },
    })),

  getCachedModels: (gameId: string, maxAgeMs = 30000) => {
    const entry = get().cachedModels[gameId];
    if (entry && Date.now() - entry.timestamp < maxAgeMs) {
      return entry.data;
    }
    return null;
  },

  setCachedPlaybacks: (gameId: string, data: any[]) =>
    set((state) => ({
      cachedPlaybacks: { ...state.cachedPlaybacks, [gameId]: { data, timestamp: Date.now() } },
    })),

  getCachedPlaybacks: (gameId: string, maxAgeMs = 30000) => {
    const entry = get().cachedPlaybacks[gameId];
    if (entry && Date.now() - entry.timestamp < maxAgeMs) {
      return entry.data;
    }
    return null;
  },

  invalidateCache: () => set({ cachedModels: {}, cachedPlaybacks: {} }),
}));
