export interface QAgentOptions<S, A extends string> {
  actions: A[]; alpha?: number; gamma?: number;
  epsilon?: number; minEpsilon?: number; epsilonDecay?: number;
  serializeState?: (state: S) => string;
}

export interface QTableEntry<A extends string> {
  stateKey: string; values: Record<A, number>; bestAction: A; bestValue: number;
}

export class QLearningAgent<S = any, A extends string = string> {
  public actions: A[]; public alpha: number; public gamma: number;
  public epsilon: number; public minEpsilon: number; public epsilonDecay: number;
  public serializeState: (state: S) => string;
  private qTable = new Map<string, Record<A, number>>();

  constructor(opts: QAgentOptions<S, A>) {
    this.actions = opts.actions; this.alpha = opts.alpha ?? 0.2; this.gamma = opts.gamma ?? 0.9;
    this.epsilon = opts.epsilon ?? 1.0; this.minEpsilon = opts.minEpsilon ?? 0.05;
    this.epsilonDecay = opts.epsilonDecay ?? 0.995;
    this.serializeState = opts.serializeState ?? ((s: S) => JSON.stringify(s));
  }

  getQValues(key: string): Record<A, number> {
    let vals = this.qTable.get(key);
    if (!vals) {
      vals = {} as Record<A, number>;
      for (const a of this.actions) vals[a] = 0;
      this.qTable.set(key, vals);
    }
    return vals;
  }

  predict(state: S): A {
    const vals = this.getQValues(this.serializeState(state));
    let best = this.actions[0], maxV = -Infinity;
    for (const a of this.actions) {
      if ((vals[a] ?? 0) > maxV) { maxV = vals[a]; best = a; }
    }
    return best;
  }

  selectAction(state: S): A {
    if (Math.random() < this.epsilon) {
      return this.actions[Math.floor(Math.random() * this.actions.length)];
    }
    return this.predict(state);
  }

  update(state: S, action: A, reward: number, nextState: S, done = false): number {
    const currVals = this.getQValues(this.serializeState(state));
    const curQ = currVals[action] ?? 0;
    let target = reward;
    if (!done) {
      const nextVals = this.getQValues(this.serializeState(nextState));
      const maxNext = Math.max(...this.actions.map((a) => nextVals[a] ?? 0));
      target = reward + this.gamma * (maxNext === -Infinity ? 0 : maxNext);
    }
    const newQ = curQ + this.alpha * (target - curQ);
    currVals[action] = Number(newQ.toFixed(4));
    return currVals[action];
  }

  onEpisodeEnd(): void {
    this.epsilon = Math.max(this.minEpsilon, this.epsilon * this.epsilonDecay);
  }

  getTableEntries(): QTableEntry<A>[] {
    const res: QTableEntry<A>[] = [];
    for (const [stateKey, values] of this.qTable.entries()) {
      let best = this.actions[0], bestV = -Infinity;
      for (const a of this.actions) {
        if ((values[a] ?? 0) > bestV) { bestV = values[a]; best = a; }
      }
      res.push({ stateKey, values, bestAction: best, bestValue: bestV });
    }
    return res;
  }

  reset(): void {
    this.qTable.clear(); this.epsilon = 1.0;
  }
}
