import { RouteInfo } from "./types";

export function parseRoute(path = window.location.pathname): RouteInfo {
  if (path === "" || path === "/") return { type: "landing" };
  if (path === "/setup") return { type: "setup" };
  if (path === "/dashboard/local") return { type: "dashboard", isLocal: true };
  if (path === "/dashboard") return { type: "dashboard", isLocal: false };

  const vizModel = path.match(/^\/visualizer\/model\/([^/]+)\/?$/);
  if (vizModel) return { type: "visualizer", vizMode: "model", name: decodeURIComponent(vizModel[1]) };

  const vizPlayback = path.match(/^\/visualizer\/playback\/([^/]+)\/?$/);
  if (vizPlayback) return { type: "visualizer", vizMode: "playback", name: decodeURIComponent(vizPlayback[1]) };

  const vizOldModel = path.match(/^\/(?:try-web\/visualize|visualize)\/(?:model\/)?(?:private\/)?([^/]+)(?:\/tree\/\d+)?\/?$/);
  if (vizOldModel) return { type: "visualizer", vizMode: "model", name: decodeURIComponent(vizOldModel[1]) };

  const vizOldPb = path.match(/^\/(?:try-web\/visualize|visualize)\/playback\/(?:private\/)?([^/]+)/);
  if (vizOldPb) return { type: "visualizer", vizMode: "playback", name: decodeURIComponent(vizOldPb[1]) };

  const autoMatch = path.match(/^\/(?:try-web\/)?autoplay\/([^/]+)\/(?:private\/|local\/)?([^/]+)\/?$/);
  if (autoMatch) return { type: "autoplay", gameId: autoMatch[1], modelName: decodeURIComponent(autoMatch[2]) };

  const trainMatch = path.match(/^\/(?:try-web\/)?t(?:rain|ain)(?:\/([a-zA-Z0-9_-]+))?\/?$/);
  if (trainMatch) return { type: "train", gameId: trainMatch[1] };

  const rlMatch = path.match(/^\/try-web\/reinforce(?:ment)?(?:\/([a-zA-Z0-9_-]+))?\/?$/);
  if (rlMatch) return { type: "game", mode: "reinforcement", gameId: rlMatch[1] };

  const imMatch = path.match(/^\/try-web\/immitation(?:\/([a-zA-Z0-9_-]+))?\/?$/);
  if (imMatch) return { type: "game", mode: "imitation", gameId: imMatch[1] };

  if (path === "/try-web") return { type: "try-web" };

  const tryGame = path.match(/^\/try-web\/([a-zA-Z0-9_-]+)\/?$/);
  if (tryGame) return { type: "game", mode: "imitation", gameId: tryGame[1] };

  return { type: "landing" };
}
