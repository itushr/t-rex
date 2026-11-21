import type { DinoAction } from "./types";

export function dispatchDinoAction(runner: any, action: DinoAction): void {
  if (!runner?.tRex) return;
  const rex = runner.tRex;
  if (action === "jump") {
    if (rex.ducking && typeof rex.setDuck === "function") rex.setDuck(false);
    if (!rex.jumping && typeof rex.startJump === "function") {
      rex.startJump(runner.currentSpeed);
      runner.playSound?.(runner.soundFx?.BUTTON_PRESS || "BUTTON_PRESS");
    }
  } else if (action === "duck") {
    if (!rex.ducking && !rex.jumping && typeof rex.setDuck === "function") rex.setDuck(true);
  } else {
    if (rex.ducking && typeof rex.setDuck === "function") rex.setDuck(false);
  }
}
