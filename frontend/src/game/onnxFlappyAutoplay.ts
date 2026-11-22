import * as ort from "onnxruntime-web";
import { authFetch } from "../services/guestAuth";
import { FlappyEngine } from "../games/flappybird/flappyEngine";
import { extractFlappyFeatures } from "../games/flappybird/adapter";
import { extractFlappyRLState, serializeFlappyState } from "../games/flappybird/rl/state";

ort.env.wasm.wasmPaths = "/ort/";

export interface FlappyAutoplayStep {
  time: number; bird_y: number; bird_vy: number; pipe1_dist: number;
  pipe1_top: number; pipe1_bottom: number; action: string; score: number; crashed: boolean;
}

export class OnnxFlappyAutoplay {
  private session: ort.InferenceSession | null = null;
  private qTable: Record<string, Record<string, number>> | null = null;
  private features: string[] = [];
  private intervalId: number | null = null;
  private active = false; private isBusy = false;
  private startTime = 0;
  public onStep?: (step: FlappyAutoplayStep) => void;

  async init(modelName: string, isPrivate = false): Promise<boolean> {
    try {
      const pfx = isPrivate ? "/api/private/onnx/models" : "/api/onnx/models";
      const metaRes = isPrivate ? await authFetch(`${pfx}/${modelName}/meta`) : await fetch(`${pfx}/${modelName}/meta`);
      if (!metaRes.ok) return false;
      const meta = await metaRes.json();
      this.features = meta.features || [];
      if (meta.model_type === "q_table") { this.qTable = meta.q_table || {}; return true; }
      const modelRes = isPrivate ? await authFetch(`${pfx}/${modelName}`) : await fetch(`${pfx}/${modelName}`);
      if (!modelRes.ok) return false;
      this.session = await ort.InferenceSession.create(await modelRes.arrayBuffer());
      return true;
    } catch { return false; }
  }

  start(engineGetter: () => FlappyEngine | null): void {
    if (this.active || (!this.session && !this.qTable)) return;
    this.active = true; this.startTime = Date.now();
    this.intervalId = window.setInterval(async () => {
      const engine = engineGetter();
      if (!engine || (!this.session && !this.qTable) || this.isBusy) return;
      if (!engine.state.started || engine.state.paused || engine.state.over) return;

      this.isBusy = true;
      try {
        const raw = extractFlappyFeatures(engine);
        let action = "none";
        if (this.qTable) {
          const qvals = this.qTable[serializeFlappyState(extractFlappyRLState(engine))];
          if (qvals) {
            let maxQ = -Infinity;
            for (const [a, q] of Object.entries(qvals)) { if (q > maxQ) { maxQ = q; action = a; } }
          }
        } else if (this.session) {
          const vec = new Float32Array(this.features.map((f) => Number((raw as any)[f] ?? 0.0)));
          const tensor = new ort.Tensor("float32", vec, [1, vec.length]);
          const results = await this.session.run({ [this.session.inputNames[0]]: tensor });
          action = String(results[this.session.outputNames[0]].data[0]).toLowerCase();
        }
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
