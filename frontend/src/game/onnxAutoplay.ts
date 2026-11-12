import * as ort from "onnxruntime-web";
import { extractFeatureVector, readObstacles } from "./dinoFeatureExtractor";

ort.env.wasm.wasmPaths = "/ort/";

export interface AutoplayStep {
  time: number; speed: number; jumping: boolean; ducking: boolean;
  obs1: { type: string; x: number; y: number; size: number };
  obs2: { type: string; x: number; y: number; size: number };
  action: string; time_to_impact: number; crashed: boolean;
}

export class OnnxDinoAutoplay {
  private session: ort.InferenceSession | null = null;
  private features: string[] = [];
  private intervalId: number | null = null;
  private active = false;
  private isBusy = false;
  private startTime = 0;
  public onStep?: (step: AutoplayStep) => void;

  async init(modelName: string): Promise<boolean> {
    try {
      const metaRes = await fetch(`/api/onnx/models/${modelName}/meta`);
      if (!metaRes.ok) return false;
      const meta = await metaRes.json();
      this.features = meta.features || [];
      const modelRes = await fetch(`/api/onnx/models/${modelName}`);
      if (!modelRes.ok) return false;
      const buffer = await modelRes.arrayBuffer();
      this.session = await ort.InferenceSession.create(buffer);
      (window as any).__onnxReady = true;
      return true;
    } catch (err: any) {
      console.error("ONNX session error:", err);
      return false;
    }
  }

  start(): void {
    if (this.active || !this.session) return;
    this.active = true;
    this.startTime = Date.now();
    this.intervalId = window.setInterval(async () => {
      const runner = (window as any).Runner?.instance_;
      if (!runner?.tRex || !this.session || this.isBusy) return;
      if (!runner.playing || runner.paused || runner.crashed) return;

      this.isBusy = true;
      try {
        const vec = extractFeatureVector(runner, this.features);
        const tensor = new ort.Tensor("float32", vec, [1, vec.length]);
        const results = await this.session.run({ [this.session.inputNames[0]]: tensor });
        const action = String(results[this.session.outputNames[0]].data[0]).toLowerCase();
        this.act(runner, action);
        if (this.onStep) {
          const [obs1, obs2] = readObstacles(runner);
          const spd = Number(runner.currentSpeed) || 0;
          this.onStep({
            time: Number(((Date.now() - this.startTime) / 1000).toFixed(2)),
            speed: spd, jumping: Boolean(runner.tRex?.jumping), ducking: Boolean(runner.tRex?.ducking),
            obs1, obs2, action, time_to_impact: obs1.x > 0 && spd > 0 ? Number((obs1.x / spd).toFixed(3)) : -1,
            crashed: Boolean(runner.crashed),
          });
        }
      } catch { /* drop */ } finally {
        this.isBusy = false;
      }
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
    } else {
      if (rex.ducking && typeof rex.setDuck === "function") rex.setDuck(false);
    }
  }

  stop(): void {
    this.active = false;
    if (this.intervalId !== null) { clearInterval(this.intervalId); this.intervalId = null; }
  }
}
