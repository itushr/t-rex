import { useEffect, useRef, useState, useCallback } from "react";
import { QLearningAgent } from "../../../models/q-network";
import { DEFAULT_RL_CONFIG } from "./constants";
import { extractDinoRLState, serializeDinoState, DinoRLState } from "./state";
import { dispatchDinoAction, getValidActions } from "./dinoActuator";
import { calcStepReward, calcCrashPenalty } from "./rewardHelper";
import { NStepBuffer } from "./nStepBuffer";
import type { DinoAction, RLConfig } from "./types";

export function useDinoRL(gameStatus: "playing" | "paused" | "crashed", restart: () => void) {
  const [tries, setTries] = useState(1);
  const [repeat, setRepeat] = useState(true);
  const [config, setConfig] = useState<RLConfig>(DEFAULT_RL_CONFIG);
  const agentRef = useRef<QLearningAgent<DinoRLState, DinoAction>>(
    new QLearningAgent({ actions: DEFAULT_RL_CONFIG.actions, alpha: DEFAULT_RL_CONFIG.alpha, gamma: DEFAULT_RL_CONFIG.gamma, serializeState: serializeDinoState })
  );
  const bufferRef = useRef(new NStepBuffer<DinoRLState, DinoAction>(10, DEFAULT_RL_CONFIG.gamma));
  const prevStateRef = useRef<DinoRLState | null>(null);
  const prevActionRef = useRef<DinoAction | null>(null);
  const restartTimerRef = useRef<any>(null);
  const crashedHandledRef = useRef(false);

  const updateConfig = useCallback((cfg: RLConfig) => {
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
      const runner = (window as any).Runner?.instance_;
      if (!runner?.tRex) return;
      const currState = extractDinoRLState(runner);

      if (runner.crashed) {
        if (!crashedHandledRef.current) {
          crashedHandledRef.current = true;
          const pen = calcCrashPenalty(config);
          const updates = buffer.flushTerminal(pen, true);
          for (const u of updates) agent.updateQ(u.state, u.action, u.target);
          agent.onEpisodeEnd();
          prevStateRef.current = null; prevActionRef.current = null;
          if (repeat && !restartTimerRef.current) {
            restartTimerRef.current = setTimeout(() => {
              restartTimerRef.current = null; crashedHandledRef.current = false; setTries((t) => t + 1);
              const r = (window as any).Runner?.instance_;
              if (r) { r.restart?.(); r.playing = true; r.paused = false; r.time = performance.now(); r.tRex?.startJump?.(r.currentSpeed); r.update?.(); } else { restart(); }
            }, 300);
          }
        }
        return;
      }
      crashedHandledRef.current = false;
      if (!runner.playing || runner.paused) return;

      const dinoX = Number(runner.tRex.xPos) || 50;
      let cleared = false;
      for (const obs of runner.horizon?.obstacles || []) {
        const trailing = Number(obs.xPos) + (Number(obs.width) || 20);
        if (trailing < dinoX && !(obs as any)._cleared) {
          (obs as any)._cleared = true;
          cleared = true;
        }
      }

      if (prevStateRef.current && prevActionRef.current) {
        const r = calcStepReward(prevStateRef.current.dino_motion, prevActionRef.current, cleared, config);
        const validNow = getValidActions(runner);
        const popped = buffer.add({ state: prevStateRef.current, action: prevActionRef.current, reward: r, nextState: currState, nextValidActions: validNow, done: false });
        if (popped) {
          const maxNext = agent.getMaxQ(currState, validNow);
          agent.updateQ(popped.state, popped.action, buffer.computeReturn(popped, maxNext));
        }
      }

      const valid = getValidActions(runner);
      const allowed = valid.filter((a) => config.actions.includes(a));
      const action = agent.selectAction(currState, allowed.length > 0 ? allowed : valid);
      dispatchDinoAction(runner, action);
      prevStateRef.current = currState;
      prevActionRef.current = action;
    }, 50);

    return () => { clearInterval(interval); if (restartTimerRef.current) clearTimeout(restartTimerRef.current); };
  }, [config, repeat, restart]);

  return { tries, repeat, setRepeat, config, updateConfig, getQTableEntries, getRawQTable, getEpsilon };
}
