export interface RouteInfo {
  type: "landing" | "landing2" | "dashboard" | "dashboard-local" | "try-web" | "train" | "autoplay" | "model-viz" | "playback-viz" | "setup" | "reinforce";
  gameId?: string;
  modelName?: string;
  isPrivate?: boolean;
  treeIndex?: number;
  playbackName?: string;
  predictionStep?: number;
  treeNo?: number;
}
