import type { FlappyEngine } from "../game/flappyEngine";

export interface FlappyController {
  play: () => void;
  pause: () => void;
  restart: () => void;
  jump: () => void;
}

export function createFlappyController(engine: FlappyEngine | null): FlappyController {
  return {
    play: () => {
      if (engine?.state) {
        if (engine.state.over) {
          engine.restart();
          engine.jump();
        } else {
          engine.state.paused = false;
          if (!engine.state.started) engine.jump();
        }
      }
    },
    pause: () => {
      if (engine?.state) engine.state.paused = true;
    },
    restart: () => {
      engine?.restart();
      engine?.jump();
    },
    jump: () => engine?.jump(),
  };
}
