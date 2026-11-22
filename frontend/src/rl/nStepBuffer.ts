export interface Transition<S, A> {
  state: S;
  action: A;
  reward: number;
  nextState: S;
  nextValidActions: A[];
  done: boolean;
}

export class NStepBuffer<S = any, A extends string = string> {
  private buffer: Transition<S, A>[] = [];
  public n: number;
  public gamma: number;

  constructor(n = 10, gamma = 0.95) {
    this.n = n;
    this.gamma = gamma;
  }

  add(t: Transition<S, A>): Transition<S, A> | null {
    this.buffer.push(t);
    return this.buffer.length >= this.n ? this.buffer.shift()! : null;
  }

  computeReturn(base: Transition<S, A>, bootstrapMaxQ: number): number {
    let G = base.reward;
    let disc = this.gamma;
    for (const t of this.buffer) {
      G += disc * t.reward;
      disc *= this.gamma;
    }
    if (!this.buffer[this.buffer.length - 1]?.done) {
      G += disc * bootstrapMaxQ;
    }
    return Number(G.toFixed(4));
  }

  flushTerminal(crashPenalty: number, dropDeadFrame = true): { state: S; action: A; target: number }[] {
    if (this.buffer.length === 0) return [];
    if (dropDeadFrame && this.buffer.length > 1) this.buffer.pop();
    if (this.buffer.length > 0) {
      this.buffer[this.buffer.length - 1].reward = crashPenalty;
      this.buffer[this.buffer.length - 1].done = true;
    }
    const updates: { state: S; action: A; target: number }[] = [];
    for (let i = 0; i < this.buffer.length; i++) {
      let G = 0, disc = 1;
      for (let k = i; k < this.buffer.length; k++) {
        G += disc * this.buffer[k].reward;
        disc *= this.gamma;
      }
      updates.push({ state: this.buffer[i].state, action: this.buffer[i].action, target: Number(G.toFixed(4)) });
    }
    this.buffer = [];
    return updates;
  }

  clear(): void {
    this.buffer = [];
  }
}
