import type { DinoAction } from "./types";

export function dispatchDinoAction(runner: any, action: DinoAction): void {
  if (!runner?.tRex) return;
  const rex = runner.tRex;

  if (action === "jump") {
    if (rex.ducking && typeof rex.setDuck === "function") {
      rex.speedDrop = false;
      rex.setDuck(false);
    }
    if (!rex.jumping && typeof rex.startJump === "function") {
      rex.startJump(runner.currentSpeed);
      runner.playSound?.(runner.soundFx?.BUTTON_PRESS || "BUTTON_PRESS");
    }
  } else if (action === "duck") {
    if (rex.jumping) {
      if (typeof rex.setSpeedDrop === "function") rex.setSpeedDrop();
    } else if (!rex.ducking && typeof rex.setDuck === "function") {
      rex.setDuck(true);
    }
  } else if (action === "none") {
    if (rex.ducking && typeof rex.setDuck === "function") {
      rex.speedDrop = false;
      rex.setDuck(false);
    }
  }
}

export function getValidActions(runner: any): DinoAction[] {
  if (!runner?.tRex) return ["none", "jump", "duck"];
  if (runner.tRex.jumping) return ["none", "duck"];
  return ["none", "jump", "duck"];
}
