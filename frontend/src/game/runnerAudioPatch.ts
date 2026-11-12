import { soundManager } from "./soundManager";

export function patchRunner(Runner: any): void {
  if (!Runner || Runner.__audioPatched) return;
  Runner.__audioPatched = true;

  const proto = Runner.prototype;
  const origInit = proto.init;
  proto.init = function () {
    const res = origInit?.apply(this, arguments as any);
    if (this.containerEl) this.containerEl.style.width = this.dimensions.WIDTH + "px";
    this.activated = true;
    this.setArcadeMode?.();
    return res;
  };

  const origUpdate = proto.update;
  proto.update = function () {
    if (this !== Runner.instance_) { this.stop?.(); return; }
    return origUpdate.apply(this, arguments as any);
  };

  const origStop = proto.stop;
  proto.stop = function () {
    this.playing = false; this.paused = true; this.updatePending = false;
    if (this.raqId) { cancelAnimationFrame(this.raqId); this.raqId = 0; }
    soundManager.stopScore();
    return origStop?.apply(this, arguments as any);
  };

  const origRestart = proto.restart;
  proto.restart = function () {
    this.paused = false;
    this.lastCenturyScore = 0;
    soundManager.stopScore();
    const res = origRestart?.apply(this, arguments as any);
    this.paused = false;
    return res;
  };

  const origGameOver = proto.gameOver;
  proto.gameOver = function () {
    soundManager.stopScore();
    return origGameOver?.apply(this, arguments as any);
  };

  proto.playSound = function (soundBuffer: any) {
    if (this !== Runner.instance_) return;
    const isScore = soundBuffer === this.soundFx?.SCORE || soundBuffer === "SCORE";
    const isJump = soundBuffer === this.soundFx?.BUTTON_PRESS || soundBuffer === "BUTTON_PRESS";
    soundManager.play(isJump ? "jump" : isScore ? "score" : "hit", soundBuffer, this);
  };
}
