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
    this.actions = opts.actions; this.alpha = opts.alpha ?? 0.15; this.gamma = opts.gamma ?? 0.95;
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

  predict(state: S, validActions?: A[]): A {
    const vals = this.getQValues(this.serializeState(state));
    const allowed = validActions && validActions.length > 0 ? validActions : this.actions;
    let best = allowed[0], maxV = -Infinity;
    for (const a of allowed) {
      const v = vals[a] ?? 0;
      if (v > maxV) { maxV = v; best = a; }
    }
    return best;
  }

  selectAction(state: S, validActions?: A[]): A {
    const allowed = validActions && validActions.length > 0 ? validActions : this.actions;
    if (Math.random() < this.epsilon) return allowed[Math.floor(Math.random() * allowed.length)];
    return this.predict(state, allowed);
  }

  getMaxQ(state: S, validActions?: A[]): number {
    const vals = this.getQValues(this.serializeState(state));
    const allowed = validActions && validActions.length > 0 ? validActions : this.actions;
    let maxV = -Infinity;
    for (const a of allowed) {
      const v = vals[a] ?? 0;
      if (v > maxV) maxV = v;
    }
    return maxV === -Infinity ? 0 : maxV;
  }

  updateQ(state: S, action: A, target: number): number {
    const vals = this.getQValues(this.serializeState(state));
    const curQ = vals[action] ?? 0;
    const newQ = curQ + this.alpha * (target - curQ);
    vals[action] = Number(newQ.toFixed(4));
    return vals[action];
  }

  update(state: S, action: A, reward: number, nextState: S, done = false, nextValid?: A[]): number {
    const target = done ? reward : reward + this.gamma * this.getMaxQ(nextState, nextValid);
    return this.updateQ(state, action, target);
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

  getRawTable(): Record<string, Record<A, number>> {
    const obj: Record<string, Record<A, number>> = {};
    for (const [k, v] of this.qTable.entries()) obj[k] = { ...v };
    return obj;
  }

  reset(): void {
    this.qTable.clear(); this.epsilon = 1.0;
  }
}
