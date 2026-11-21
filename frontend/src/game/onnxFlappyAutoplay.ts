import * as ort from "onnxruntime-web";
import { authFetch } from "../services/guestAuth";
import { FlappyEngine } from "../games/flappybird/flappyEngine";
import { extractFlappyFeatures } from "../games/flappybird/adapter";

ort.env.wasm.wasmPaths = "/ort/";

export interface FlappyAutoplayStep {
  time: number; bird_y: number; bird_vy: number; pipe1_dist: number;
  pipe1_top: number; pipe1_bottom: number; action: string; score: number; crashed: boolean;
}

export class OnnxFlappyAutoplay {
  private session: ort.InferenceSession | null = null;
  private features: string[] = [];
  private intervalId: number | null = null;
  private active = false;
  private isBusy = false;
  private startTime = 0;
  public onStep?: (step: FlappyAutoplayStep) => void;

  async init(modelName: string, isPrivate = false): Promise<boolean> {
    try {
      const pfx = isPrivate ? "/api/private/onnx/models" : "/api/onnx/models";
      const metaRes = isPrivate ? await authFetch(`${pfx}/${modelName}/meta`) : await fetch(`${pfx}/${modelName}/meta`);
      if (!metaRes.ok) return false;
      const meta = await metaRes.json();
      this.features = meta.features || [];
      const modelRes = isPrivate ? await authFetch(`${pfx}/${modelName}`) : await fetch(`${pfx}/${modelName}`);
      if (!modelRes.ok) return false;
      const buffer = await modelRes.arrayBuffer();
      this.session = await ort.InferenceSession.create(buffer);
      return true;
    } catch (err) {
      console.error("Flappy ONNX session error:", err);
      return false;
    }
  }

  start(engineGetter: () => FlappyEngine | null): void {
    if (this.active || !this.session) return;
    this.active = true;
    this.startTime = Date.now();
    this.intervalId = window.setInterval(async () => {
      const engine = engineGetter();
      if (!engine || !this.session || this.isBusy) return;
      if (!engine.state.started || engine.state.paused || engine.state.over) return;

      this.isBusy = true;
      try {
        const raw = extractFlappyFeatures(engine);
        const vec = new Float32Array(this.features.map((f) => Number((raw as any)[f] ?? 0.0)));
        const tensor = new ort.Tensor("float32", vec, [1, vec.length]);
        const results = await this.session.run({ [this.session.inputNames[0]]: tensor });
        const action = String(results[this.session.outputNames[0]].data[0]).toLowerCase();

        if (action === "jump") engine.jump();
        if (this.onStep) {
          this.onStep({
            time: Number(((Date.now() - this.startTime) / 1000).toFixed(2)),
            bird_y: raw.bird_y, bird_vy: raw.bird_vy, pipe1_dist: raw.pipe1_dist,
            pipe1_top: raw.pipe1_top, pipe1_bottom: raw.pipe1_bottom,
            action, score: engine.state.score, crashed: engine.state.over,
          });
        }
      } catch { /* drop */ } finally { this.isBusy = false; }
    }, 45);
  }

  stop(): void {
    this.active = false;
    if (this.intervalId !== null) { clearInterval(this.intervalId); this.intervalId = null; }
  }
}
