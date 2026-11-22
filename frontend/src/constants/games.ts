import { ComponentType, lazy, LazyExoticComponent } from "react";

export interface GameDefinition {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  icon?: string;
  isAvailable: boolean;
  hasSound: boolean;
  hasRecorder: boolean;
  hasController: boolean;
  aliases?: string[];
  availableModels: string[] | null;
  supportedModels: string[];
  gameComponent?: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
}

export const SUPPORTED_GAMES: GameDefinition[] = [
  {
    id: "t-rex",
    name: "Chrome T-Rex Runner",
    thumbnail: "/dino.svg",
    description: "Classic offline browser runner obstacle avoidance game",
    icon: "dino",
    isAvailable: true,
    hasSound: true,
    hasRecorder: true,
    hasController: true,
    aliases: ["trex", "dino"],
    availableModels: ["decision_tree", "random_forest", "q_learning"],
    supportedModels: ["decision_tree", "random_forest", "q_learning"],
    gameComponent: lazy(() => import("../games/t-rex/game")),
  },
  {
    id: "flappy-bird",
    name: "Flappy Bird",
    thumbnail: "/games/flappybird/flappybird.png",
    description: "Classic flapping bird pipe navigation game",
    icon: "bird",
    isAvailable: true,
    hasSound: true,
    hasRecorder: true,
    hasController: true,
    aliases: ["flappybird", "flappy-brird"],
    availableModels: ["decision_tree", "random_forest", "q_learning"],
    supportedModels: ["decision_tree", "random_forest", "q_learning"],
    gameComponent: lazy(() => import("../games/flappy-bird/game")),
  },
];

export const DEFAULT_GAME_ID = SUPPORTED_GAMES[0]?.id || "";

export function normalizeGameId(id?: string): string {
  if (!id) return DEFAULT_GAME_ID;
  const match = SUPPORTED_GAMES.find((g) => g.id === id || g.aliases?.includes(id));
  return match ? match.id : id;
}

export function getGameDefinition(id: string): GameDefinition | undefined {
  return SUPPORTED_GAMES.find((g) => g.id === id || g.aliases?.includes(id));
}

export function isValidGameId(id: string): boolean {
  return SUPPORTED_GAMES.some((g) => (g.id === id || g.aliases?.includes(id)) && g.isAvailable);
}
