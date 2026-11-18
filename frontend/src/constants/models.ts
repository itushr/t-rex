export interface ModelDefinition {
  id: string;
  name: string;
  category: "tree" | "ensemble" | "neural";
  description: string;
  supportsVisualization: boolean;
  defaultParams: Record<string, number | string | boolean>;
}

export const GLOBAL_MODELS: ModelDefinition[] = [
  {
    id: "decision_tree",
    name: "Decision Tree",
    category: "tree",
    description: "Interpretable single tree decision model with SVG path extraction",
    supportsVisualization: true,
    defaultParams: { max_depth: 5, criterion: "gini" },
  },
  {
    id: "random_forest",
    name: "Random Forest",
    category: "ensemble",
    description: "Ensemble of decision trees voting on predictions",
    supportsVisualization: true,
    defaultParams: { n_estimators: 10, max_depth: 5 },
  },
];

export function getModelDefinition(id: string): ModelDefinition | undefined {
  return GLOBAL_MODELS.find((m) => m.id === id);
}
