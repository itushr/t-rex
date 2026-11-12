import { readObstacles } from "./dinoFeatureExtractor";

export interface GameSample {
  obstacle1_x: number; obstacle1_y: number; obstacle1_type: string; obstacle1_size: number;
  obstacle2_x: number; obstacle2_y: number; obstacle2_type: string; obstacle2_size: number;
  speed: number; jumping: number; ducking: number; time_to_impact: number;
  action: "jump" | "duck" | "none";
}

export class GameRecorder {
  private samples: GameSample[] = [];
  private active = false;
  private paused = false;
  private intervalId: number | null = null;
  private duckHeld = false;

  start() {
    this.active = true; this.paused = false;
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
  getSamples(): GameSample[] { return [...this.samples]; }
  clear() { this.samples = []; }

  private snapshot(runner: any, action: "jump" | "duck" | "none"): GameSample | null {
    if (!runner?.tRex || !runner?.horizon) return null;
    const [obs1, obs2] = readObstacles(runner);
    const speed = Number(runner.currentSpeed) || 0;
    const dist = obs1.x;
    const tti = dist > 0 && speed > 0 ? Number((dist / speed).toFixed(3)) : -1;
    return {
      obstacle1_x: dist, obstacle1_y: obs1.y, obstacle1_type: obs1.type, obstacle1_size: obs1.size,
      obstacle2_x: obs2.x, obstacle2_y: obs2.y, obstacle2_type: obs2.type, obstacle2_size: obs2.size,
      speed, jumping: Number(Boolean(runner.tRex.jumping)), ducking: Number(Boolean(runner.tRex.ducking)),
      time_to_impact: tti, action,
    };
  }

  recordKey(runner: any, key: "jump" | "duck") {
    if (!this.active || this.paused || !runner?.playing || runner?.paused || runner?.crashed) return;
    if (key === "duck") this.duckHeld = true;
    const s = this.snapshot(runner, key);
    if (s) this.samples.push(s);
  }

  releaseKey(key: "jump" | "duck") {
    if (key === "duck") this.duckHeld = false;
  }

  private startInterval() {
    if (this.intervalId !== null) clearInterval(this.intervalId);
    this.intervalId = window.setInterval(() => {
      if (!this.active || this.paused) return;
      const r = (window as any).Runner?.instance_;
      if (!r?.playing || r?.paused || r?.crashed) return;
      const s = this.snapshot(r, this.duckHeld ? "duck" : "none");
      if (s) this.samples.push(s);
    }, 50);
  }

  stop() {
    this.active = false; this.paused = false;
    if (this.intervalId !== null) { clearInterval(this.intervalId); this.intervalId = null; }
  }
}
