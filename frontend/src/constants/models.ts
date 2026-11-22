import { ComponentType, lazy, LazyExoticComponent } from "react";

export interface ModelDefinition {
  id: string;
  name: string;
  category: "tree" | "ensemble" | "neural" | "reinforcement";
  description: string;
  supportsVisualization: boolean;
  defaultParams: Record<string, number | string | boolean>;
  modelVisualizer?: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
  playbackVisualizer?: LazyExoticComponent<ComponentType<any>> | ComponentType<any>;
}

export const GLOBAL_MODELS: ModelDefinition[] = [
  {
    id: "decision_tree",
    name: "Decision Tree",
    category: "tree",
    description: "Interpretable single tree decision model with SVG path extraction",
    supportsVisualization: true,
    defaultParams: { max_depth: 5, criterion: "gini" },
    modelVisualizer: lazy(() => import("../models/decision-tree/visualizers/model")),
    playbackVisualizer: lazy(() => import("../models/decision-tree/visualizers/playback")),
  },
  {
    id: "random_forest",
    name: "Random Forest",
    category: "ensemble",
    description: "Ensemble of decision trees voting on predictions",
    supportsVisualization: true,
    defaultParams: { n_estimators: 10, max_depth: 5 },
    modelVisualizer: lazy(() => import("../models/decision-tree/visualizers/model")),
    playbackVisualizer: lazy(() => import("../models/decision-tree/visualizers/playback")),
  },
  {
    id: "q_learning",
    name: "Q-Learning / Q-Network",
    category: "reinforcement",
    description: "Tabular and neural reinforcement learning policy",
    supportsVisualization: false,
    defaultParams: { alpha: 0.1, gamma: 0.95, epsilon: 0.1 },
  },
];

export function getModelDefinition(id: string): ModelDefinition | undefined {
  return GLOBAL_MODELS.find((m) => m.id === id);
}

export function getModelVisualizer(id?: string): LazyExoticComponent<ComponentType<any>> | ComponentType<any> | undefined {
  const def = id ? getModelDefinition(id) : GLOBAL_MODELS[0];
  return def?.modelVisualizer;
}

export function getPlaybackVisualizer(id?: string): LazyExoticComponent<ComponentType<any>> | ComponentType<any> | undefined {
  const def = id ? getModelDefinition(id) : GLOBAL_MODELS[0];
  return def?.playbackVisualizer;
}
