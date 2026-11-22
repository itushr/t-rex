import { RefObject } from "react";
import { useDinoRL } from "./t-rex/rl/useDinoRL";
import { useFlappyRL } from "./flappy-bird/rl/useFlappyRL";
import { normalizeGameId } from "../constants/games";
import type { GameStatus } from "../game/useGameRunnerControls";

export interface GameRLResult {
  tries: number; repeat: boolean; setRepeat: (r: boolean | ((p: boolean) => boolean)) => void;
  config: any; updateConfig: (cfg: any) => void;
  getQTableEntries: () => any[]; getRawQTable: () => any; getEpsilon: () => number;
  actions: string[]; stateHeader?: string;
}

export function useGameRL(gameId: string, engineRef: RefObject<any>, gameStatus: GameStatus, restart: () => void): GameRLResult {
  const norm = normalizeGameId(gameId);
  const dinoRL = useDinoRL(gameStatus, restart);
  const flappyRL = useFlappyRL(engineRef, gameStatus, restart);

  if (norm === "flappy-bird") {
    return {
      tries: flappyRL.tries, repeat: flappyRL.repeat, setRepeat: flappyRL.setRepeat,
      config: flappyRL.config, updateConfig: flappyRL.updateConfig,
      getQTableEntries: flappyRL.getQTableEntries, getRawQTable: flappyRL.getRawQTable,
      getEpsilon: flappyRL.getEpsilon, actions: ["jump", "none"],
      stateHeader: "State (pipe_dist | gap_offset | vy)",
    };
  }

  return {
    tries: dinoRL.tries, repeat: dinoRL.repeat, setRepeat: dinoRL.setRepeat,
    config: dinoRL.config, updateConfig: dinoRL.updateConfig,
    getQTableEntries: dinoRL.getQTableEntries, getRawQTable: dinoRL.getRawQTable,
    getEpsilon: dinoRL.getEpsilon, actions: ["none", "jump", "duck"],
  };
}
