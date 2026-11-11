import * as ort from "onnxruntime-web";
import { extractFeatureVector } from "./dinoFeatureExtractor";

ort.env.wasm.wasmPaths = "/ort/";

export class OnnxDinoAutoplay {
  private session: ort.InferenceSession | null = null;
  private features: string[] = [];
  private intervalId: number | null = null;
  private active = false;
  private isBusy = false;
  private restarting = false;

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
      (window as any).__onnxInitError = err?.message || String(err);
      console.error("ONNX session error:", err);
      return false;
    }
  }

  start(): void {
    if (this.active || !this.session) return;
    this.active = true;

    this.intervalId = window.setInterval(async () => {
      const runner = (window as any).Runner?.instance_;
      if (!runner?.tRex || !this.session || this.isBusy) return;

      if (runner.crashed) {
        if (!this.restarting) {
          this.restarting = true;
          setTimeout(() => {
            if (this.active && runner.crashed) { runner.restart?.(); runner.stopListening?.(); }
            this.restarting = false;
          }, 1000);
        }
        return;
      }

      if (runner.paused && typeof runner.play === "function") runner.play();
      if (!runner.playing && !runner.crashed) {
        runner.loadSounds?.(); runner.playing = true;
        runner.update?.(); runner.tRex?.startJump?.(runner.currentSpeed);
      }

      this.isBusy = true;
      try {
        const vec = extractFeatureVector(runner, this.features);
        const tensor = new ort.Tensor("float32", vec, [1, vec.length]);
        const results = await this.session.run({ [this.session.inputNames[0]]: tensor });
        const action = String(results[this.session.outputNames[0]].data[0]).toLowerCase();
        this.act(runner, action);
      } catch { /* frame drop */ } finally {
        this.isBusy = false;
      }
    }, 10);
  }

  private act(runner: any, action: string): void {
    if (!runner?.tRex) return;
    const rex = runner.tRex;
    if (action === "jump") {
      if (rex.ducking && typeof rex.setDuck === "function") rex.setDuck(false);
      if (!rex.jumping && typeof rex.startJump === "function") rex.startJump(runner.currentSpeed);
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
