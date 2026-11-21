import type { Transition } from "./types";

export class ReplayBuffer {
  private buffer: Transition[] = [];
  private capacity: number;

  constructor(capacity = 5000) {
    this.capacity = capacity;
  }

  push(transition: Transition): void {
    if (this.buffer.length >= this.capacity) {
      this.buffer.shift();
    }
    this.buffer.push(transition);
  }

  sample(batchSize: number): Transition[] {
    const size = Math.min(batchSize, this.buffer.length);
    const sampled: Transition[] = [];
    const used = new Set<number>();
    while (sampled.length < size) {
      const idx = Math.floor(Math.random() * this.buffer.length);
      if (!used.has(idx)) {
        used.add(idx);
        sampled.push(this.buffer[idx]);
      }
    }
    return sampled;
  }

  get length(): number {
    return this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
  }
}
