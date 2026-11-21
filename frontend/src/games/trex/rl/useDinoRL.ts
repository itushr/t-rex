import { useEffect, useRef, useState, useCallback } from "react";
import { QLearningAgent } from "../../../rl/qlearning";
import { DEFAULT_RL_CONFIG } from "./constants";
import { extractDinoRLState, serializeDinoState, DinoRLState } from "./state";
import { dispatchDinoAction } from "./dinoActuator";
import type { DinoAction, RLConfig } from "./types";

export function useDinoRL(gameStatus: "playing" | "paused" | "crashed", restart: () => void) {
  const [tries, setTries] = useState(1);
  const [repeat, setRepeat] = useState(true);
  const [config, setConfig] = useState<RLConfig>(DEFAULT_RL_CONFIG);
  const agentRef = useRef<QLearningAgent<DinoRLState, DinoAction>>(
    new QLearningAgent({ actions: DEFAULT_RL_CONFIG.actions, serializeState: serializeDinoState })
  );
  const prevRef = useRef<{ state: DinoRLState; action: DinoAction; lastObsX: number } | null>(null);
  const restartTimerRef = useRef<any>(null);
  const crashedHandledRef = useRef(false);

  const updateConfig = useCallback((nextConfig: RLConfig) => {
    setConfig(nextConfig);
    agentRef.current.actions = nextConfig.actions;
    prevRef.current = null;
  }, []);

  const getQTableEntries = useCallback(() => agentRef.current.getTableEntries(), []);
  const getEpsilon = useCallback(() => agentRef.current.epsilon, []);

  useEffect(() => {
    const agent = agentRef.current;
    const interval = setInterval(() => {
      const runner = (window as any).Runner?.instance_;
      if (!runner?.tRex) return;

      if (runner.crashed) {
        if (!crashedHandledRef.current) {
          crashedHandledRef.current = true;
          if (prevRef.current) {
            const pen = config.enabledRewards.crash_penalty ? config.rewards.crash_penalty : 0;
            if (config.enabledRewards.crash_penalty) console.log(pen);
            agent.update(prevRef.current.state, prevRef.current.action, pen, prevRef.current.state, true);
            prevRef.current = null;
            agent.onEpisodeEnd();
          }
          if (repeat && !restartTimerRef.current) {
            restartTimerRef.current = setTimeout(() => {
              restartTimerRef.current = null; crashedHandledRef.current = false;
              setTries((t) => t + 1);
              const r = (window as any).Runner?.instance_;
              if (r) {
                r.restart?.(); r.playing = true; r.paused = false;
                r.time = performance.now(); r.tRex?.startJump?.(r.currentSpeed); r.update?.();
              } else { restart(); }
            }, 300);
          }
        }
        return;
      }

      crashedHandledRef.current = false;
      if (!runner.playing || runner.paused) return;

      const currState = extractDinoRLState(runner);
      const obsX = runner.horizon?.obstacles?.[0]?.xPos ?? 999;

      if (prevRef.current) {
        let reward = 0;
        if (config.enabledRewards.clear_obstacle && prevRef.current.lastObsX < 50 && obsX > 150) {
          reward = config.rewards.clear_obstacle;
        } else if (config.enabledRewards.jump_penalty && prevRef.current.action === "jump") {
          reward = config.rewards.jump_penalty;
        } else if (config.enabledRewards.survive) {
          reward = config.rewards.survive;
        }
        if (reward !== 0 || config.enabledRewards.survive) console.log(reward);
        agent.update(prevRef.current.state, prevRef.current.action, reward, currState, false);
      }

      const action = agent.selectAction(currState);
      dispatchDinoAction(runner, action);
      prevRef.current = { state: currState, action, lastObsX: obsX };
    }, 50);

    return () => {
      clearInterval(interval);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, [config, repeat, restart]);

  return { tries, repeat, setRepeat, config, updateConfig, getQTableEntries, getEpsilon };
}
