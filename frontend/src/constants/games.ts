export interface GameDefinition {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isAvailable: boolean;
  supportedModels: string[];
}

export const SUPPORTED_GAMES: GameDefinition[] = [
  {
    id: "trex",
    name: "Chrome T-Rex Runner",
    description: "Classic offline browser runner obstacle avoidance game",
    icon: "dino",
    isAvailable: true,
    supportedModels: ["decision_tree", "random_forest"],
  },
];

export const DEFAULT_GAME_ID = "trex";

export function getGameDefinition(id: string): GameDefinition | undefined {
  return SUPPORTED_GAMES.find((g) => g.id === id);
}

export function isValidGameId(id: string): boolean {
  return SUPPORTED_GAMES.some((g) => g.id === id && g.isAvailable);
}
