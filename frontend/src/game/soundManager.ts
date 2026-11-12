class SoundManager {
  private enabled = true;
  private currentScoreNode: AudioBufferSourceNode | null = null;

  setSoundEnabled(val: boolean): void {
    this.enabled = val;
    const win = window as any;
    if (win.Runner) win.Runner.soundEnabled = val;
    if (win.Runner?.instance_) win.Runner.instance_.soundEnabled = val;

    if (!val) {
      this.stopScore();
      document.querySelectorAll<HTMLAudioElement>("#audio-resources audio").forEach((el) => {
        el.muted = true;
        el.pause();
        el.currentTime = 0;
      });
      const ctx = win.Runner?.instance_?.audioContext;
      if (ctx?.state === "running") ctx.suspend().catch(() => {});
    } else {
      document.querySelectorAll<HTMLAudioElement>("#audio-resources audio").forEach((el) => {
        el.muted = false;
      });
      const ctx = win.Runner?.instance_?.audioContext;
      if (ctx?.state === "suspended") ctx.resume().catch(() => {});
    }
  }

  isSoundEnabled(): boolean {
    return this.enabled;
  }

  stopScore(): void {
    if (this.currentScoreNode) {
      try { this.currentScoreNode.stop(); } catch {}
      this.currentScoreNode = null;
    }
    const el = document.getElementById("offline-sound-reached") as HTMLAudioElement | null;
    if (el) { el.pause(); el.currentTime = 0; }
  }

  play(type: "jump" | "score" | "hit", buffer?: any, runner?: any): void {
    if (!this.enabled) return;
    const r = runner || (window as any).Runner?.instance_;
    if (!r) return;

    if (type === "score" && (!r.playing || r.crashed || r.paused)) return;

    const ctx = r.audioContext as AudioContext | undefined;
    const buf = buffer || (r.soundFx && (type === "jump" ? r.soundFx.BUTTON_PRESS : type === "score" ? r.soundFx.SCORE : r.soundFx.HIT));

    if (buf && ctx) {
      try {
        if (ctx.state === "suspended") ctx.resume().catch(() => {});
        const node = ctx.createBufferSource();
        node.buffer = buf;
        node.connect(ctx.destination);
        node.start(0);
        if (type === "score") this.currentScoreNode = node;
        return;
      } catch {}
    }

    const soundId = type === "jump" ? "offline-sound-press" : type === "score" ? "offline-sound-reached" : "offline-sound-hit";
    const el = document.getElementById(soundId) as HTMLAudioElement | null;
    if (el) {
      el.muted = false;
      el.currentTime = 0;
      el.play().catch(() => {});
    }
  }
}

export const soundManager = new SoundManager();
(window as any).soundManager = soundManager;
