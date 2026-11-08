export interface TreeDistribution {
  jump: number;
  duck: number;
  none: number;
  [key: string]: number;
}

export interface TreeNode {
  id: number;
  depth: number;
  is_leaf: boolean;
  samples: number;
  impurity: number;
  prediction: string;
  condition: string;
  feature?: string;
  threshold?: number;
  distribution?: TreeDistribution;
  counts?: Record<string, number>;
  left?: TreeNode;
  right?: TreeNode;
  x?: number;
  y?: number;
}

export interface TreeGraphData {
  model_type: string;
  n_estimators: number;
  trees: TreeNode[];
}
