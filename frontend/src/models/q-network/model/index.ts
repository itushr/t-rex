export * from "./qlearning";
export * from "./nStepBuffer";

import type { QTableEntry } from "./qlearning";

export interface QPolicySummary {
  totalStates: number;
  averageMaxQ: number;
  epsilon: number;
  actionCounts: Record<string, number>;
}

export function summarizeQTable(entries: QTableEntry<string>[], epsilon = 0.05): QPolicySummary {
  const actionCounts: Record<string, number> = {};
  let sumMaxQ = 0;

  for (const e of entries) {
    sumMaxQ += e.bestValue;
    actionCounts[e.bestAction] = (actionCounts[e.bestAction] || 0) + 1;
  }

  return {
    totalStates: entries.length,
    averageMaxQ: entries.length > 0 ? Number((sumMaxQ / entries.length).toFixed(4)) : 0,
    epsilon,
    actionCounts,
  };
}
