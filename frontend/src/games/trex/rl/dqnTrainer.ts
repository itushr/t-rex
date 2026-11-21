import { DQNModelPair } from "./dqnModel";
import { ReplayBuffer } from "./replayBuffer";
import type { DinoAction, RLConfig, Transition } from "./types";

export class DQNTrainer {
  public models: DQNModelPair;
  public replay: ReplayBuffer;
  public epsilon = 1.0;
  public minEpsilon = 0.05;
  public decay = 0.995;
  public gamma = 0.95;
  public batchSize = 32;
  public config: RLConfig;
  private isTraining = false;

  constructor(config: RLConfig) {
    this.config = config;
    this.models = new DQNModelPair(config.features.length, config.actions.length);
    this.replay = new ReplayBuffer(5000);
  }

  selectAction(state: number[]): { action: DinoAction; actionIdx: number } {
    if (Math.random() < this.epsilon) {
      const idx = Math.floor(Math.random() * this.config.actions.length);
      return { action: this.config.actions[idx], actionIdx: idx };
    }
    const qValues = this.models.predict(state);
    let bestIdx = 0;
    let maxQ = -Infinity;
    for (let i = 0; i < qValues.length; i++) {
      if (qValues[i] > maxQ) {
        maxQ = qValues[i];
        bestIdx = i;
      }
    }
    return { action: this.config.actions[bestIdx], actionIdx: bestIdx };
  }

  storeTransition(t: Transition): void {
    this.replay.push(t);
  }

  async trainStep(): Promise<void> {
    if (this.isTraining || this.replay.length < this.batchSize) return;
    this.isTraining = true;
    try {
      const batch = this.replay.sample(this.batchSize);
      const states = batch.map((b) => b.state);
      const nextStates = batch.map((b) => b.nextState);
      const currentQs = states.map((s) => this.models.predict(s));
      const nextTargetQs = this.models.predictTargets(nextStates);

      const targets = currentQs.map((qRow, i) => {
        const t = batch[i];
        const copy = [...qRow];
        const maxNextQ = Math.max(...nextTargetQs[i]);
        copy[t.actionIdx] = t.done ? t.reward : t.reward + this.gamma * maxNextQ;
        return copy;
      });

      await this.models.trainBatch(states, targets);
    } catch {
      /* ignore concurrent or dropped fit */
    } finally {
      this.isTraining = false;
    }
  }

  onEpisodeEnd(): void {
    this.epsilon = Math.max(this.minEpsilon, this.epsilon * this.decay);
    this.models.syncTarget();
  }

  reconfigure(config: RLConfig): void {
    this.config = config;
    this.models.dispose();
    this.models = new DQNModelPair(config.features.length, config.actions.length);
    this.replay.clear();
    this.epsilon = 1.0;
  }

  dispose(): void {
    this.models.dispose();
  }
}
