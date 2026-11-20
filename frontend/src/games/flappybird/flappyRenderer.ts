import { FlappyState } from "./types";

export class FlappyRenderer {
  private bg = new Image();
  private bird = new Image();
  private topPipe = new Image();
  private botPipe = new Image();

  constructor() {
    this.bg.src = "/games/flappybird/flappybirdbg.png";
    this.bird.src = "/games/flappybird/flappybird.png";
    this.topPipe.src = "/games/flappybird/toppipe.png";
    this.botPipe.src = "/games/flappybird/bottompipe.png";
  }

  public render(ctx: CanvasRenderingContext2D, s: FlappyState, w: number, h: number): void {
    ctx.clearRect(0, 0, w, h);
    const bgW = h * (360 / 640);
    for (let x = 0; x < w; x += bgW) ctx.drawImage(this.bg, x, 0, bgW + 1, h);

    for (const p of s.pipes) {
      ctx.drawImage(this.topPipe, p.x, p.topY, p.width, p.height);
      ctx.drawImage(this.botPipe, p.x, p.bottomY, p.width, p.height);
    }

    const b = s.bird;
    ctx.save();
    ctx.translate(b.x + b.width / 2, b.y + b.height / 2);
    ctx.rotate(Math.min(Math.PI / 4, Math.max(-Math.PI / 4, b.vy * 0.05)));
    ctx.drawImage(this.bird, -b.width / 2, -b.height / 2, b.width, b.height);
    ctx.restore();

    this.renderText(ctx, s, w, h);
  }

  private renderText(ctx: CanvasRenderingContext2D, s: FlappyState, w: number, h: number): void {
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 4;

    if (!s.started && !s.over) {
      ctx.font = `bold ${Math.max(22, Math.round(h * 0.045))}px 'Press Start 2P', system-ui, sans-serif`;
      ctx.strokeText("Press SPACE or UP ARROW to start", w / 2, h * 0.4);
      ctx.fillText("Press SPACE or UP ARROW to start", w / 2, h * 0.4);
    } else if (s.paused && !s.over) {
      ctx.font = `bold ${Math.max(26, Math.round(h * 0.06))}px 'Press Start 2P', system-ui, sans-serif`;
      ctx.strokeText("PAUSED", w / 2, h * 0.38);
      ctx.fillText("PAUSED", w / 2, h * 0.38);
      ctx.font = `bold ${Math.max(16, Math.round(h * 0.03))}px system-ui, sans-serif`;
      ctx.strokeText("Press P or SPACE to resume", w / 2, h * 0.46);
      ctx.fillText("Press P or SPACE to resume", w / 2, h * 0.46);
    }

    if (s.over) {
      ctx.font = `bold ${Math.max(26, Math.round(h * 0.06))}px 'Press Start 2P', system-ui, sans-serif`;
      ctx.strokeText("GAME OVER", w / 2, h * 0.38);
      ctx.fillText("GAME OVER", w / 2, h * 0.38);

      ctx.font = `bold ${Math.max(18, Math.round(h * 0.035))}px system-ui, sans-serif`;
      const scoreTxt = `Score: ${s.score}   Best: ${s.bestScore}`;
      ctx.strokeText(scoreTxt, w / 2, h * 0.46);
      ctx.fillText(scoreTxt, w / 2, h * 0.46);

      ctx.font = `bold ${Math.max(16, Math.round(h * 0.03))}px system-ui, sans-serif`;
      ctx.strokeText("Press SPACE or UP ARROW to restart", w / 2, h * 0.54);
      ctx.fillText("Press SPACE or UP ARROW to restart", w / 2, h * 0.54);
    }

    ctx.font = `bold ${Math.max(24, Math.round(h * 0.05))}px 'Press Start 2P', system-ui, sans-serif`;
    ctx.strokeText(`${s.score}`, w / 2, h * 0.12);
    ctx.fillText(`${s.score}`, w / 2, h * 0.12);
  }
}
