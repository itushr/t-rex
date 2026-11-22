export interface DecisionTreeNode {
  id: number;
  feature?: string;
  threshold?: number;
  value?: number[];
  left?: DecisionTreeNode | null;
  right?: DecisionTreeNode | null;
  isLeaf?: boolean;
}

export function predictTree(node: DecisionTreeNode, features: Record<string, number>): number[] | null {
  if (!node) return null;
  if (node.isLeaf || (!node.left && !node.right)) return node.value || null;
  if (node.feature && typeof node.threshold === "number") {
    const val = features[node.feature] ?? 0;
    if (val <= node.threshold) {
      return node.left ? predictTree(node.left, features) : node.value || null;
    }
    return node.right ? predictTree(node.right, features) : node.value || null;
  }
  return node.value || null;
}
