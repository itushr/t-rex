import type { FlappyEngine } from "../../flappybird/flappyEngine";

export interface FlappyController {
  play: () => void;
  pause: () => void;
  restart: () => void;
  jump: () => void;
}

export function createFlappyController(engine: FlappyEngine | null): FlappyController {
  return {
    play: () => {
      if (engine?.state) engine.state.paused = false;
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
