import { soundManager } from "./soundManager";

function notifyStatus(runner: any) {
  if (!runner?.onStatusChange) return;
  const status = runner.crashed ? "crashed" : (runner.playing && !runner.paused ? "playing" : "paused");
  if (runner._lastStatus !== status) { runner._lastStatus = status; runner.onStatusChange(status); }
}

export function patchRunner(Runner: any): void {
  if (!Runner || Runner.__audioPatched) return;
  Runner.__audioPatched = true;

  const proto = Runner.prototype;
  const origInit = proto.init;
  proto.init = function () {
    const res = origInit?.apply(this, arguments as any);
    if (this.containerEl) this.containerEl.style.width = this.dimensions.WIDTH + "px";
    this.activated = true; this.setArcadeMode?.(); return res;
  };

  const origUpdate = proto.update;
  proto.update = function () {
    if (this !== Runner.instance_) { this.stop?.(); return; }
    notifyStatus(this); return origUpdate.apply(this, arguments as any);
  };

  const origStop = proto.stop;
  proto.stop = function () {
    this.playing = false; this.paused = true; this.updatePending = false;
    if (this.raqId) { cancelAnimationFrame(this.raqId); this.raqId = 0; }
    soundManager.stopScore();
    const res = origStop?.apply(this, arguments as any);
    notifyStatus(this); return res;
  };

  proto.play = function () {
    if (this.crashed) { this.restart(); return; }
    this.playing = true; this.paused = false; this.time = performance.now();
    if (this.raqId) { cancelAnimationFrame(this.raqId); this.raqId = 0; }
    this.updatePending = false; this.update(); notifyStatus(this);
  };

  const origKeyUp = proto.onKeyUp;
  proto.onKeyUp = function (e: any) {
    if (this.crashed) {
      const code = String(e?.keyCode || "");
      const isJump = Boolean(Runner.keycodes?.JUMP?.[code] || Runner.keycodes?.JUMP?.[e?.keyCode] || e?.code === "Space" || e?.code === "ArrowUp");
      const isRestart = Boolean(Runner.keycodes?.RESTART?.[code] || Runner.keycodes?.RESTART?.[e?.keyCode] || e?.code === "Enter");
      const isClick = (e?.button != null && e.button < 2 && (e.target === this.canvas || this.containerEl?.contains(e.target))) || this.isLeftClickOnCanvas?.(e);
      if (isJump || isRestart || isClick) { this.restart(); return; }
      return origKeyUp?.apply(this, arguments as any);
    }
    if (this.paused) {
      const code = String(e?.keyCode || "");
      if (Runner.keycodes?.JUMP?.[code] || Runner.keycodes?.JUMP?.[e?.keyCode] || e?.code === "Space" || e?.code === "ArrowUp") {
        this.play(); return;
      }
    }
    return origKeyUp?.apply(this, arguments as any);
  };

  const origKeyDown = proto.onKeyDown;
  proto.onKeyDown = function (e: any) {
    if (this.crashed || this.paused) return;
    return origKeyDown?.apply(this, arguments as any);
  };

  const origRestart = proto.restart;
  proto.restart = function () {
    this.paused = false; this.crashed = false; this.lastCenturyScore = 0;
    soundManager.stopScore();
    const res = origRestart?.apply(this, arguments as any);
    this.paused = false; this.crashed = false;
    notifyStatus(this);
    return res;
  };

  const origGameOver = proto.gameOver;
  proto.gameOver = function () {
    soundManager.stopScore();
    const res = origGameOver?.apply(this, arguments as any);
    notifyStatus(this); return res;
  };

  const origVis = proto.onVisibilityChange;
  proto.onVisibilityChange = function () {
    if (!this.playing && !this.runningTime) return;
    return origVis?.apply(this, arguments as any);
  };

  proto.playSound = function (soundBuffer: any) {
    if (this !== Runner.instance_) return;
    if (this.soundEnabled === false || Runner.soundEnabled === false || !soundManager.isSoundEnabled()) return;
    const isScore = soundBuffer === "SCORE" || (Boolean(soundBuffer) && soundBuffer === this.soundFx?.SCORE);
    const isJump = soundBuffer === "BUTTON_PRESS" || (Boolean(soundBuffer) && soundBuffer === this.soundFx?.BUTTON_PRESS);
    soundManager.play(isScore ? "score" : isJump ? "jump" : "hit", soundBuffer, this);
  };
}
