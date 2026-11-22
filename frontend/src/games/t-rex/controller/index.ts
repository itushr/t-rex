import { dispatchDinoAction, getValidActions } from "../../trex/rl/dinoActuator";

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
    play: () => runnerInstance?.play?.(),
    pause: () => runnerInstance?.stop?.(),
    restart: () => runnerInstance?.restart?.(),
    jump: () => dispatchDinoAction(runnerInstance, "jump"),
    duck: () => dispatchDinoAction(runnerInstance, "duck"),
    stand: () => dispatchDinoAction(runnerInstance, "none"),
  };
}
