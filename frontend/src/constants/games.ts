export interface GameDefinition {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  icon?: string;
  isAvailable: boolean;
  hasSound: boolean;
  hasRecorder: boolean;
  availableModels: string[] | null;
  supportedModels?: string[];
  gameName?: string;
  thumbnailImage?: string;
  recorderImplemented?: boolean;
  models?: string[] | null;
  soundAvailable?: boolean;
}

export const SUPPORTED_GAMES: GameDefinition[] = [
  {
    id: "trex",
    name: "Chrome T-Rex Runner",
    gameName: "Chrome T-Rex Runner",
    thumbnail: "/dino.svg",
    thumbnailImage: "/dino.svg",
    description: "Classic offline browser runner obstacle avoidance game",
    icon: "dino",
    isAvailable: true,
    hasSound: true,
    soundAvailable: true,
    hasRecorder: true,
    recorderImplemented: true,
    availableModels: ["decision_tree", "random_forest"],
    models: ["decision_tree", "random_forest"],
    supportedModels: ["decision_tree", "random_forest"],
  },
  {
    id: "flappy-bird",
    name: "Flappy Bird",
    gameName: "Flappy Bird",
    thumbnail: "/games/flappybird/flappybird.png",
    thumbnailImage: "/games/flappybird/flappybird.png",
    description: "Classic flapping bird pipe navigation game",
    icon: "bird",
    isAvailable: true,
    hasSound: false,
    soundAvailable: false,
    hasRecorder: true,
    recorderImplemented: true,
    availableModels: ["decision_tree", "random_forest"],
    models: ["decision_tree", "random_forest"],
    supportedModels: ["decision_tree", "random_forest"],
  },
];

export const DEFAULT_GAME_ID = "trex";

export function getGameDefinition(id: string): GameDefinition | undefined {
  const norm = id === "dino" ? "trex" : id === "flappy-brird" ? "flappy-bird" : id;
  return SUPPORTED_GAMES.find((g) => g.id === norm);
}

export function isValidGameId(id: string): boolean {
  return SUPPORTED_GAMES.some((g) => g.id === id && g.isAvailable);
}
