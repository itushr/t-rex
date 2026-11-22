export interface RouteInfo {
  type: "landing" | "dashboard" | "setup" | "try-web" | "game" | "train" | "autoplay" | "visualizer" | "play";
  isLocal?: boolean;
  gameId?: string;
  mode?: "imitation" | "reinforcement";
  modelName?: string;
  vizMode?: "model" | "playback";
  name?: string;
}
