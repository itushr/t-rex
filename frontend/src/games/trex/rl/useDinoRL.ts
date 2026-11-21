import { useEffect, useRef, useState, useCallback } from "react";
import { QLearningAgent } from "../../../rl/qlearning";
import { DEFAULT_RL_CONFIG } from "./constants";
import { extractDinoRLState, serializeDinoState, DinoRLState } from "./state";
import { dispatchDinoAction } from "./dinoActuator";
import { calcStepReward, calcCrashPenalty } from "./rewardHelper";
import type { DinoAction, RLConfig } from "./types";

export function useDinoRL(gameStatus: "playing" | "paused" | "crashed", restart: () => void) {
  const [tries, setTries] = useState(1);
  const [repeat, setRepeat] = useState(true);
  const [config, setConfig] = useState<RLConfig>(DEFAULT_RL_CONFIG);
  const agentRef = useRef<QLearningAgent<DinoRLState, DinoAction>>(
    new QLearningAgent({ actions: DEFAULT_RL_CONFIG.actions, serializeState: serializeDinoState })
  );
  const pendingJump = useRef<{ state: DinoRLState; passed: boolean } | null>(null);
  const pendingDuck = useRef<{ state: DinoRLState; passed: boolean } | null>(null);
  const wasJumping = useRef(false);
  const lastObsX = useRef(999);
  const restartTimerRef = useRef<any>(null);
  const crashedHandledRef = useRef(false);

  const updateConfig = useCallback((cfg: RLConfig) => {
    setConfig(cfg); agentRef.current.actions = cfg.actions;
  }, []);

  const getQTableEntries = useCallback(() => agentRef.current.getTableEntries(), []);
  const getRawQTable = useCallback(() => agentRef.current.getRawTable(), []);
  const getEpsilon = useCallback(() => agentRef.current.epsilon, []);

  useEffect(() => {
    const agent = agentRef.current;
    const interval = setInterval(() => {
      const runner = (window as any).Runner?.instance_;
      if (!runner?.tRex) return;
      const rex = runner.tRex, currState = extractDinoRLState(runner);

      if (runner.crashed) {
        if (!crashedHandledRef.current) {
          crashedHandledRef.current = true;
          const pen = calcCrashPenalty(config);
          if (pendingJump.current) { console.log(pen); agent.update(pendingJump.current.state, "jump", pen, currState, true); pendingJump.current = null; }
          if (pendingDuck.current) { console.log(pen); agent.update(pendingDuck.current.state, "duck", pen, currState, true); pendingDuck.current = null; }
          wasJumping.current = false; agent.onEpisodeEnd();
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

      const firstObs = runner.horizon?.obstacles?.[0];
      const ox = firstObs ? Number(firstObs.xPos) : 999;
      if ((firstObs && ox < 50 && ox > -100) || (lastObsX.current < 80 && ox > 150)) {
        if (pendingJump.current) pendingJump.current.passed = true;
        if (pendingDuck.current) pendingDuck.current.passed = true;
      }
      lastObsX.current = ox;

      if (wasJumping.current && !rex.jumping) {
        wasJumping.current = false;
        if (pendingJump.current) {
          const rew = calcStepReward(pendingJump.current.passed, config);
          console.log(rew); agent.update(pendingJump.current.state, "jump", rew, currState, false); pendingJump.current = null;
        }
      }
      if (rex.jumping) { wasJumping.current = true; return; }

      const action = agent.selectAction(currState);
      if (rex.ducking) {
        if (action === "jump") {
          if (pendingDuck.current) {
            const rew = calcStepReward(pendingDuck.current.passed, config);
            console.log(rew); agent.update(pendingDuck.current.state, "duck", rew, currState, false); pendingDuck.current = null;
          }
          dispatchDinoAction(runner, "jump");
          wasJumping.current = true; pendingJump.current = { state: currState, passed: false };
        }
      } else {
        if (action === "jump") {
          dispatchDinoAction(runner, "jump");
          wasJumping.current = true; pendingJump.current = { state: currState, passed: false };
        } else if (action === "duck") {
          dispatchDinoAction(runner, "duck"); pendingDuck.current = { state: currState, passed: false };
        }
      }
    }, 50);

    return () => { clearInterval(interval); if (restartTimerRef.current) clearTimeout(restartTimerRef.current); };
  }, [config, repeat, restart]);

  return { tries, repeat, setRepeat, config, updateConfig, getQTableEntries, getRawQTable, getEpsilon };
}
