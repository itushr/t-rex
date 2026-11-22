import { dispatchDinoAction, getValidActions } from "../rl/dinoActuator";

export { dispatchDinoAction, getValidActions };

export interface TRexController {
  play: () => void;
  pause: () => void;
  restart: () => void;
  jump: () => void;
  duck: () => void;
  stand: () => void;
}

export function createTRexController(runnerInstance: any): TRexController {
  return {
    play: () => {
      if (runnerInstance?.crashed) {
        runnerInstance.restart?.();
      } else if (runnerInstance?.paused || runnerInstance?.runningTime > 0) {
        runnerInstance?.play?.();
      } else if (runnerInstance) {
        runnerInstance.loadSounds?.();
        runnerInstance.playing = true;
        runnerInstance.activated = true;
        runnerInstance.paused = false;
        runnerInstance.time = performance.now();
        if (runnerInstance.raqId) {
          cancelAnimationFrame(runnerInstance.raqId);
          runnerInstance.raqId = 0;
        }
        runnerInstance.updatePending = false;
        runnerInstance.update?.();
        runnerInstance.tRex?.startJump?.(runnerInstance.currentSpeed);
        runnerInstance.playSound?.(runnerInstance.soundFx?.BUTTON_PRESS || "BUTTON_PRESS");
      }
    },
    pause: () => runnerInstance?.stop?.(),
    restart: () => runnerInstance?.restart?.(),
    jump: () => dispatchDinoAction(runnerInstance, "jump"),
    duck: () => dispatchDinoAction(runnerInstance, "duck"),
    stand: () => dispatchDinoAction(runnerInstance, "none"),
  };
}
