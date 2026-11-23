import { GameAdapter } from "../games/types";
import { getGameAdapter } from "../games";

export type GameSample = Record<string, any>;

export class GameRecorder<TSample = GameSample> {
  private samples: TSample[] = [];
  private active = false;
  private paused = false;
  private intervalId: number | null = null;
  private heldAction: string | null = null;
  private adapter: GameAdapter<TSample>;

  constructor(adapter?: GameAdapter<TSample>) {
    this.adapter = adapter || (getGameAdapter() as unknown as GameAdapter<TSample>);
  }

  start() {
    this.active = true;
    this.paused = false;
    this.startInterval();
  }

  pause() { this.paused = true; }
  resume() { if (this.active) this.paused = false; }
  toggle() {
    if (!this.active) this.start();
    else if (!this.paused) this.pause();
    else this.resume();
  }

  isRecording() { return this.active; }
  isPaused() { return this.paused; }
  getSamples(): TSample[] { return [...this.samples]; }
  clear() { this.samples = []; }

  recordKey(runner: any, action: string) {
    if (!this.active || this.paused || !this.adapter.isGameRunning(runner)) return;
    if (action === "duck") this.heldAction = "duck";
    const s = this.adapter.snapshot(runner, action);
    if (s) this.samples.push(s);
  }

  releaseKey(action: string) {
    if (this.heldAction === action) this.heldAction = null;
  }

  private startInterval() {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.intervalId = window.setInterval(() => {
      if (!this.active || this.paused) return;
      const runner = this.adapter.getRunnerInstance();
      if (!this.adapter.isGameRunning(runner)) return;
      const s = this.adapter.snapshot(runner, this.heldAction || "none");
      if (s) this.samples.push(s);
    }, 50);
  }

  stop() {
    this.active = false;
    this.paused = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
