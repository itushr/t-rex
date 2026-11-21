import * as tf from "@tensorflow/tfjs";

export function createDQNNetwork(inputDim: number, outputDim: number): tf.Sequential {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [inputDim], units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: 32, activation: "relu" }));
  model.add(tf.layers.dense({ units: outputDim, activation: "linear" }));
  model.compile({ optimizer: tf.train.adam(0.001), loss: "meanSquaredError" });
  return model;
}

export class DQNModelPair {
  public policyNet: tf.Sequential;
  public targetNet: tf.Sequential;
  public inputDim: number;
  public outputDim: number;

  constructor(inputDim: number, outputDim: number) {
    this.inputDim = inputDim;
    this.outputDim = outputDim;
    this.policyNet = createDQNNetwork(inputDim, outputDim);
    this.targetNet = createDQNNetwork(inputDim, outputDim);
    this.syncTarget();
  }

  syncTarget(): void {
    const weights = this.policyNet.getWeights();
    this.targetNet.setWeights(weights);
  }

  predict(state: number[]): number[] {
    return tf.tidy(() => {
      const tensor = tf.tensor2d([state], [1, this.inputDim]);
      const out = this.policyNet.predict(tensor) as tf.Tensor;
      return Array.from(out.dataSync());
    });
  }

  async trainBatch(states: number[][], targets: number[][]): Promise<void> {
    const statesTensor = tf.tensor2d(states);
    const targetsTensor = tf.tensor2d(targets);
    try {
      await this.policyNet.fit(statesTensor, targetsTensor, { epochs: 1, verbose: 0 });
    } finally {
      tf.dispose([statesTensor, targetsTensor]);
    }
  }

  predictTargets(states: number[][]): number[][] {
    return tf.tidy(() => {
      const tensor = tf.tensor2d(states);
      const out = this.targetNet.predict(tensor) as tf.Tensor;
      const data = out.dataSync();
      const res: number[][] = [];
      for (let i = 0; i < states.length; i++) {
        res.push(Array.from(data.slice(i * this.outputDim, (i + 1) * this.outputDim)));
      }
      return res;
    });
  }

  dispose(): void {
    this.policyNet.dispose();
    this.targetNet.dispose();
  }
}
