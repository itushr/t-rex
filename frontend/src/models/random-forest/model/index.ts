import type { DecisionTreeNode } from "../../decision-tree/model";
import { predictTree } from "../../decision-tree/model";

export function predictForest(
  trees: DecisionTreeNode[],
  features: Record<string, number>
): { prediction: number[] | null; votes: (number[] | null)[] } {
  if (!trees || trees.length === 0) return { prediction: null, votes: [] };
  const votes = trees.map((tree) => predictTree(tree, features));
  const validVotes = votes.filter((v): v is number[] => Array.isArray(v) && v.length > 0);
  if (validVotes.length === 0) return { prediction: null, votes };

  const len = validVotes[0].length;
  const avg = new Array(len).fill(0);
  for (const v of validVotes) {
    for (let i = 0; i < len; i++) {
      avg[i] += v[i];
    }
  }
  for (let i = 0; i < len; i++) {
    avg[i] = Number((avg[i] / validVotes.length).toFixed(4));
  }
  return { prediction: avg, votes };
}
