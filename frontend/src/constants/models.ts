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

export function normalizeModelId(id?: string): string {
  if (!id) return "decision_tree";
  const lower = id.toLowerCase().replace(/-/g, "_");
  if (lower === "q_learning" || lower === "q_network" || lower === "qnetwork" || lower === "qlearning") return "q_learning";
  if (lower === "random_forest" || lower === "randomforest") return "random_forest";
  if (lower === "decision_tree" || lower === "decisiontree") return "decision_tree";
  return lower;
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
    modelVisualizer: lazy(() => import("../models/random-forest/visualizers/model")),
    playbackVisualizer: lazy(() => import("../models/random-forest/visualizers/playback")),
  },
  {
    id: "q_learning",
    name: "Q-Learning",
    category: "reinforcement",
    description: "Tabular reinforcement learning policy",
    supportsVisualization: true,
    defaultParams: { alpha: 0.1, gamma: 0.95, epsilon: 0.1 },
    modelVisualizer: lazy(() => import("../models/q-learning/visualizers/model")),
    playbackVisualizer: lazy(() => import("../models/q-learning/visualizers/playback")),
  },
];

export function getModelDefinition(id?: string): ModelDefinition | undefined {
  const norm = normalizeModelId(id);
  return GLOBAL_MODELS.find((m) => m.id === norm) || GLOBAL_MODELS[0];
}

export function getModelVisualizer(id?: string): LazyExoticComponent<ComponentType<any>> | ComponentType<any> | undefined {
  const def = getModelDefinition(id);
  return def?.modelVisualizer;
}

export function getPlaybackVisualizer(id?: string): LazyExoticComponent<ComponentType<any>> | ComponentType<any> | undefined {
  const def = getModelDefinition(id);
  return def?.playbackVisualizer;
}
