import * as ort from "onnxruntime-web";
import { extractFeatureVector, readObstacles } from "../recorder/featureExtractor";
import { authFetch } from "../../../services/guestAuth";
import { extractDinoRLState, serializeDinoState } from "../rl/state";

ort.env.wasm.wasmPaths = "/ort/";
(window as any).ort = ort;

export interface AutoplayStep {
  time: number; speed: number; jumping: boolean; ducking: boolean;
  obs1: { type: string; x: number; y: number; size: number };
  obs2: { type: string; x: number; y: number; size: number };
  action: string; time_to_impact: number; crashed: boolean;
}

export class OnnxDinoAutoplay {
  private session: ort.InferenceSession | null = null;
  private features: string[] = [];
  private qTable: Record<string, Record<string, number>> | null = null;
  private intervalId: number | null = null;
  private active = false; private isBusy = false;
  private startTime = 0; private pausedTime = 0; private lastPause = 0;
  public onStep?: (step: AutoplayStep) => void;

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

  start(): void {
    if (this.active || (!this.session && !this.qTable)) return;
    this.active = true; this.startTime = Date.now();
    this.intervalId = window.setInterval(async () => {
      const runner = (window as any).Runner?.instance_;
      if (!runner?.tRex || (!this.session && !this.qTable) || this.isBusy) return;
      if (!runner.playing || runner.paused || runner.crashed) {
        if (runner.paused && !this.lastPause) this.lastPause = Date.now();
        return;
      }
      if (this.lastPause) { this.pausedTime += Date.now() - this.lastPause; this.lastPause = 0; }
      this.isBusy = true;
      try {
        let action = "none";
        if (this.qTable) {
          const qvals = this.qTable[serializeDinoState(extractDinoRLState(runner))];
          if (qvals) {
            let maxQ = -Infinity;
            for (const [a, q] of Object.entries(qvals)) { if (q > maxQ) { maxQ = q; action = a; } }
          }
        } else if (this.session) {
          const vec = extractFeatureVector(runner, this.features);
          const res = await this.session.run({ [this.session.inputNames[0]]: new ort.Tensor("float32", vec, [1, vec.length]) });
          action = String(res[this.session.outputNames[0]].data[0]).toLowerCase();
        }
        this.act(runner, action);
        if (this.onStep) {
          const [obs1, obs2] = readObstacles(runner), spd = Number(runner.currentSpeed) || 0;
          this.onStep({
            time: Number(((Date.now() - this.startTime - this.pausedTime) / 1000).toFixed(2)),
            speed: spd, jumping: Boolean(runner.tRex?.jumping), ducking: Boolean(runner.tRex?.ducking),
            obs1, obs2, action, time_to_impact: obs1.x > 0 && spd > 0 ? Number((obs1.x / spd).toFixed(3)) : -1,
            crashed: Boolean(runner.crashed),
          });
        }
      } catch { /* drop */ } finally { this.isBusy = false; }
    }, 10);
  }

  private act(runner: any, action: string): void {
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
    } else if (!this.qTable && rex.ducking && typeof rex.setDuck === "function") {
      rex.setDuck(false);
    }
  }

  stop(): void {
    this.active = false; this.pausedTime = 0; this.lastPause = 0;
    if (this.intervalId !== null) { clearInterval(this.intervalId); this.intervalId = null; }
  }
}
