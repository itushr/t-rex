import { useEffect, useRef, useState, useCallback, RefObject } from "react";
import { QLearningAgent, NStepBuffer } from "../../../models/q-learning";
import { DEFAULT_FLAPPY_RL_CONFIG } from "./constants";
import { extractFlappyRLState, serializeFlappyState, FlappyRLState } from "./state";
import { calcFlappyStepReward, calcFlappyCrashPenalty } from "./rewardHelper";
import { FlappyEngine } from "../game/flappyEngine";
import type { FlappyAction, FlappyRLConfig } from "./types";

export function useFlappyRL(engineRef: RefObject<FlappyEngine | null>, gameStatus: string, restart: () => void) {
  const [tries, setTries] = useState(1);
  const [repeat, setRepeat] = useState(true);
  const [config, setConfig] = useState<FlappyRLConfig>(DEFAULT_FLAPPY_RL_CONFIG);
  const agentRef = useRef<QLearningAgent<FlappyRLState, FlappyAction>>(
    new QLearningAgent({ actions: DEFAULT_FLAPPY_RL_CONFIG.actions, alpha: DEFAULT_FLAPPY_RL_CONFIG.alpha, gamma: DEFAULT_FLAPPY_RL_CONFIG.gamma, serializeState: serializeFlappyState })
  );
  const bufferRef = useRef(new NStepBuffer<FlappyRLState, FlappyAction>(8, DEFAULT_FLAPPY_RL_CONFIG.gamma));
  const prevStateRef = useRef<FlappyRLState | null>(null);
  const prevActionRef = useRef<FlappyAction | null>(null);
  const lastScoreRef = useRef(0);
  const restartTimerRef = useRef<any>(null);
  const crashedHandledRef = useRef(false);
  const gameStatusRef = useRef(gameStatus);
  gameStatusRef.current = gameStatus;

  const updateConfig = useCallback((cfg: FlappyRLConfig) => {
    setConfig(cfg);
    agentRef.current.actions = cfg.actions;
    agentRef.current.alpha = cfg.alpha;
    agentRef.current.gamma = cfg.gamma;
    bufferRef.current.gamma = cfg.gamma;
  }, []);

  const getQTableEntries = useCallback(() => agentRef.current.getTableEntries(), []);
  const getRawQTable = useCallback(() => agentRef.current.getRawTable(), []);
  const getEpsilon = useCallback(() => agentRef.current.epsilon, []);

  useEffect(() => {
    const agent = agentRef.current, buffer = bufferRef.current;
    const interval = setInterval(() => {
      const engine = engineRef.current;
      if (!engine?.state?.bird) return;

      if (engine.state.over) {
        if (!crashedHandledRef.current) {
          crashedHandledRef.current = true;
          const pen = calcFlappyCrashPenalty(config);
          const updates = buffer.flushTerminal(pen, true);
          for (const u of updates) agent.updateQ(u.state, u.action, u.target);
          agent.onEpisodeEnd();
          prevStateRef.current = null; prevActionRef.current = null;
          if (repeat && !restartTimerRef.current) {
            restartTimerRef.current = setTimeout(() => {
              restartTimerRef.current = null; crashedHandledRef.current = false; setTries((t) => t + 1);
              lastScoreRef.current = 0; restart();
            }, 300);
          }
        }
        return;
      }
      crashedHandledRef.current = false;
      if (gameStatusRef.current !== "playing" || !engine.state.started || engine.state.paused) return;

      const currScore = Math.floor(engine.state.score);
      const passed = currScore > lastScoreRef.current;
      lastScoreRef.current = currScore;

      const currState = extractFlappyRLState(engine);
      if (prevStateRef.current && prevActionRef.current) {
        const r = calcFlappyStepReward(prevStateRef.current, prevActionRef.current, passed, config);
        const popped = buffer.add({ state: prevStateRef.current, action: prevActionRef.current, reward: r, nextState: currState, nextValidActions: ["jump", "none"], done: false });
        if (popped) {
          const maxNext = agent.getMaxQ(currState, ["jump", "none"]);
          agent.updateQ(popped.state, popped.action, buffer.computeReturn(popped, maxNext));
        }
      }

      const action = agent.selectAction(currState, config.actions);
      if (action === "jump") engine.jump();
      prevStateRef.current = currState;
      prevActionRef.current = action;
    }, 45);

    return () => { clearInterval(interval); if (restartTimerRef.current) clearTimeout(restartTimerRef.current); };
  }, [config, repeat, restart, engineRef]);

  return { tries, repeat, setRepeat, config, updateConfig, getQTableEntries, getRawQTable, getEpsilon };
}
