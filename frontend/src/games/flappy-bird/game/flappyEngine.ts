import { FlappyState, Pipe } from "./types";

export class FlappyEngine {
  public state: FlappyState;
  public width = 800;
  public height = 600;
  public onJump?: () => void;
  public onScore?: () => void;
  private lastPipeTime = 0;

  constructor(w = 800, h = 600) {
    this.width = w; this.height = h;
    const best = Number(localStorage.getItem("flappy_best") || 0);
    this.state = this.createInitialState(best);
  }

  private createInitialState(best = 0): FlappyState {
    const s = Math.max(0.6, this.height / 600);
    return {
      bird: { x: Math.max(60, this.width * 0.18), y: this.height * 0.45, width: 34 * s, height: 24 * s, vy: 0 },
      pipes: [], score: 0, bestScore: best, started: false, paused: false, over: false,
    };
  }

  public resize(w: number, h: number): void {
    this.width = w; this.height = h;
    const s = Math.max(0.6, h / 600);
    this.state.bird.x = Math.max(60, w * 0.18);
    this.state.bird.width = 34 * s; this.state.bird.height = 24 * s;
  }

  public jump(): void {
    if (this.state.over) { this.restart(); return; }
    if (this.state.paused) this.state.paused = false;
    this.state.bird.vy = -7.2 * Math.max(0.6, this.height / 600);
    this.state.started = true;
    this.onJump?.();
  }

  public restart(): void {
    const best = Math.max(this.state.bestScore, Math.floor(this.state.score));
    this.state = this.createInitialState(best);
    this.lastPipeTime = performance.now();
  }

  public togglePlayPause(): void {
    if (this.state.over) { this.restart(); this.jump(); return; }
    if (!this.state.started) { this.jump(); return; }
    this.state.paused = !this.state.paused;
    if (!this.state.paused) this.lastPipeTime = performance.now();
  }

  public getStatus(): "playing" | "paused" | "crashed" {
    if (this.state.over) return "crashed";
    return this.state.started && !this.state.paused ? "playing" : "paused";
  }

  public update(now: number): void {
    if (!this.state.started || this.state.over || this.state.paused) return;
    const s = Math.max(0.6, this.height / 600), b = this.state.bird;
    b.vy += 0.68 * s; b.y += b.vy;
    if (b.y < 0) { b.y = 0; b.vy = 0; }
    if (now - this.lastPipeTime > 1650) { this.spawnPipe(s); this.lastPipeTime = now; }

    const pw = 64 * s, speed = 3.2 * s;
    for (const p of this.state.pipes) {
      p.x -= speed;
      if (!p.passed && b.x > p.x + pw) { p.passed = true; this.state.score += 1; this.onScore?.(); }
      if (this.checkCollision(b, p)) this.endGame();
    }
    this.state.pipes = this.state.pipes.filter((p) => p.x > -pw * 2);
    if (b.y + b.height >= this.height * 0.9) this.endGame();
  }

  private spawnPipe(s: number): void {
    const pw = 64 * s, ph = 512 * s, gap = Math.max(140 * s, this.height * 0.28);
    const minTop = -ph + 60 * s, maxTop = this.height * 0.9 - gap - ph - 60 * s;
    const topY = minTop + Math.random() * (maxTop - minTop);
    this.state.pipes.push({ x: this.width + 10, topY, bottomY: topY + ph + gap, width: pw, height: ph, passed: false });
  }

  private checkCollision(b: FlappyState["bird"], p: Pipe): boolean {
    const px = b.width * 0.15, py = b.height * 0.15;
    if (b.x + b.width - px < p.x || b.x + px > p.x + p.width) return false;
    return b.y + py < p.topY + p.height || b.y + b.height - py > p.bottomY;
  }

  private endGame(): void {
    this.state.over = true;
    const cur = Math.floor(this.state.score);
    if (cur > this.state.bestScore) {
      this.state.bestScore = cur; localStorage.setItem("flappy_best", String(cur));
    }
  }
}
