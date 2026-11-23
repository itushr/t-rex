import { ComponentType, lazy, LazyExoticComponent, RefObject } from "react";
import { GameAdapter } from "../games/types";
import { FeatureOption } from "../types/train";
import type { GameStatus } from "../game/useGameRunnerControls";
import { trexAdapter, TREX_FEATURES, useDinoRL, OnnxDinoAutoplay } from "../games/t-rex";
import { flappyAdapter, FLAPPY_FEATURES, useFlappyRL, OnnxFlappyAutoplay } from "../games/flappy-bird";

export interface GameDefinition {
  id: string; name: string; thumbnail: string; description: string; icon?: string;
  isAvailable: boolean; hasSound: boolean; hasRecorder: boolean; hasController: boolean;
  aliases?: string[]; availableModels: string[] | null; supportedModels: string[];
  default_model: string; default_features: string[];
  gameComponent?: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  adapter: GameAdapter<any>; features: FeatureOption[];
  useRL: (engineRef: RefObject<any>, gameStatus: GameStatus, restart: () => void) => any;
  createAutoplay: () => any;
}

export const SUPPORTED_GAMES: GameDefinition[] = [
  {
    id: "t-rex", name: "Chrome T-Rex Runner", thumbnail: "/dino.svg",
    description: "Classic offline browser runner obstacle avoidance game",
    icon: "dino", isAvailable: true, hasSound: true, hasRecorder: true, hasController: true,
    aliases: ["trex", "dino"], availableModels: ["decision_tree", "random_forest", "q_learning"],
    supportedModels: ["decision_tree", "random_forest", "q_learning"],
    default_model: "decision_tree",
    default_features: ["obstacle1_x", "obstacle1_y", "obstacle1_size", "obstacle1_type", "speed"],
    gameComponent: lazy(() => import("../games/t-rex/game")), adapter: trexAdapter, features: TREX_FEATURES,
    useRL: (_ref, status, restart) => {
      const dino = useDinoRL(status, restart);
      return {
        tries: dino.tries, repeat: dino.repeat, setRepeat: dino.setRepeat,
        config: dino.config, updateConfig: dino.updateConfig,
        getQTableEntries: dino.getQTableEntries, getRawQTable: dino.getRawQTable,
        getEpsilon: dino.getEpsilon, actions: ["none", "jump", "duck"],
      };
    },
    createAutoplay: () => new OnnxDinoAutoplay(),
  },
  {
    id: "flappy-bird", name: "Flappy Bird", thumbnail: "/games/flappy-bird/flappybird.png",
    description: "Classic flapping bird pipe navigation game",
    icon: "bird", isAvailable: true, hasSound: true, hasRecorder: true, hasController: true,
    aliases: ["flappybird", "flappy-brird"], availableModels: ["decision_tree", "random_forest", "q_learning"],
    supportedModels: ["decision_tree", "random_forest", "q_learning"],
    default_model: "decision_tree",
    default_features: ["bird_y", "bird_vy", "pipe1_dist", "pipe1_top", "pipe1_bottom"],
    gameComponent: lazy(() => import("../games/flappy-bird/game")), adapter: flappyAdapter, features: FLAPPY_FEATURES,
    useRL: (ref, status, restart) => {
      const flappy = useFlappyRL(ref, status, restart);
      return {
        tries: flappy.tries, repeat: flappy.repeat, setRepeat: flappy.setRepeat,
        config: flappy.config, updateConfig: flappy.updateConfig,
        getQTableEntries: flappy.getQTableEntries, getRawQTable: flappy.getRawQTable,
        getEpsilon: flappy.getEpsilon, actions: ["jump", "none"],
        stateHeader: "State (pipe_dist | gap_offset | vy)",
      };
    },
    createAutoplay: () => new OnnxFlappyAutoplay(),
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
