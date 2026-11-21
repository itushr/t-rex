import { useEffect, useRef, useState, useCallback } from "react";
import { DQNTrainer } from "./dqnTrainer";
import { DEFAULT_RL_CONFIG } from "./constants";
import { extractNormalizedRLFeatures } from "./featureExtractor";
import { dispatchDinoAction } from "./dinoActuator";
import type { DinoAction, RLConfig } from "./types";

export function useDinoRL(gameStatus: "playing" | "paused" | "crashed", restart: () => void) {
  const [tries, setTries] = useState(1);
  const [repeat, setRepeat] = useState(true);
  const [config, setConfig] = useState<RLConfig>(DEFAULT_RL_CONFIG);
  const trainerRef = useRef<DQNTrainer>(new DQNTrainer(DEFAULT_RL_CONFIG));
  const prevRef = useRef<{ state: number[]; actionIdx: number; lastObsX: number } | null>(null);
  const restartTimerRef = useRef<any>(null);
  const crashedHandledRef = useRef(false);

  const updateConfig = useCallback((nextConfig: RLConfig) => {
    setConfig(nextConfig);
    trainerRef.current.reconfigure(nextConfig);
    prevRef.current = null;
  }, []);

  useEffect(() => {
    const trainer = trainerRef.current;
    const interval = setInterval(async () => {
      const runner = (window as any).Runner?.instance_;
      if (!runner?.tRex) return;

      if (runner.crashed) {
        if (!crashedHandledRef.current) {
          crashedHandledRef.current = true;
          if (prevRef.current) {
            const penalty = config.enabledRewards.crash_penalty ? config.rewards.crash_penalty : -10;
            console.log(penalty);
            trainer.storeTransition({
              state: prevRef.current.state, actionIdx: prevRef.current.actionIdx,
              reward: penalty, nextState: prevRef.current.state, done: true,
            });
            prevRef.current = null;
            trainer.trainStep().catch(() => {});
            trainer.onEpisodeEnd();
          }
          if (repeat && !restartTimerRef.current) {
            restartTimerRef.current = setTimeout(() => {
              restartTimerRef.current = null;
              crashedHandledRef.current = false;
              setTries((t) => t + 1);
              const r = (window as any).Runner?.instance_;
              if (r) {
                r.restart?.(); r.playing = true; r.paused = false;
                r.time = performance.now(); r.tRex?.startJump?.(r.currentSpeed);
                r.update?.();
              } else { restart(); }
            }, 300);
          }
        }
        return;
      }

      crashedHandledRef.current = false;
      if (!runner.playing || runner.paused) return;

      const currState = extractNormalizedRLFeatures(runner, config.features);
      const obsX = currState[config.features.indexOf("obstacle1_x")] ?? 1;

      if (prevRef.current) {
        let reward = config.enabledRewards.survive ? config.rewards.survive : 0.1;
        if (config.enabledRewards.jump_penalty && prevRef.current.actionIdx === config.actions.indexOf("jump")) {
          reward += config.rewards.jump_penalty;
        }
        if (config.enabledRewards.clear_obstacle && prevRef.current.lastObsX < 0.2 && obsX > 0.5) {
          reward += config.rewards.clear_obstacle;
        }
        console.log(reward);
        trainer.storeTransition({
          state: prevRef.current.state, actionIdx: prevRef.current.actionIdx,
          reward, nextState: currState, done: false,
        });
        await trainer.trainStep();
      }

      const { action, actionIdx } = trainer.selectAction(currState);
      dispatchDinoAction(runner, action);
      prevRef.current = { state: currState, actionIdx, lastObsX: obsX };
    }, 50);

    return () => {
      clearInterval(interval);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, [config, repeat, restart]);

  return { tries, repeat, setRepeat, config, updateConfig };
}
