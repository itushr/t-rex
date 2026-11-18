import { RouteInfo } from "./types";

export function parseRoute(path = window.location.pathname): RouteInfo {
  if (path === "/") return { type: "landing" };
  if (path === "/dashboard" || path === "/dashboardv2") return { type: "dashboard" };
  if (path === "/dashboard/local") return { type: "dashboard-local" };

  const tryMatch = path.match(/^\/try-web(?:\/([a-zA-Z0-9_-]+))?\/?$/);
  if (tryMatch) return { type: "try-web", gameId: tryMatch[1] || "trex" };
  if (path === "/web") return { type: "try-web", gameId: "trex" };

  const trainMatch = path.match(/^\/train(?:\/([a-zA-Z0-9_-]+))?\/?$/);
  if (trainMatch) return { type: "train", gameId: trainMatch[1] || "trex" };

  const autoNew = path.match(/^\/autoplay\/([a-zA-Z0-9_-]+)\/(private|local)\/([^/]+)\/?$/);
  if (autoNew) return { type: "autoplay", gameId: autoNew[1], isPrivate: autoNew[2] === "private", modelName: decodeURIComponent(autoNew[3]) };
  const autoP = path.match(/^\/try-web\/autoplay\/private\/([^/]+)\/?$/);
  if (autoP) return { type: "autoplay", gameId: "trex", modelName: decodeURIComponent(autoP[1]), isPrivate: true };
  const autoN = path.match(/^\/try-web\/autoplay\/([^/]+)\/?$/);
  if (autoN) return { type: "autoplay", gameId: "trex", modelName: decodeURIComponent(autoN[1]), isPrivate: false };

  const vizNewTree = path.match(/^\/visualizer\/([a-zA-Z0-9_-]+)\/(private|local)\/([^/]+)\/tree\/(\d+)\/?$/);
  if (vizNewTree) return { type: "model-viz", gameId: vizNewTree[1], isPrivate: vizNewTree[2] === "private", modelName: decodeURIComponent(vizNewTree[3]), treeIndex: parseInt(vizNewTree[4], 10) };
  const vizNew = path.match(/^\/visualizer\/([a-zA-Z0-9_-]+)\/(private|local)\/([^/]+)\/?$/);
  if (vizNew) return { type: "model-viz", gameId: vizNew[1], isPrivate: vizNew[2] === "private", modelName: decodeURIComponent(vizNew[3]) };

  const mTreeP = path.match(/^\/(?:try-web\/visualize\/private\/model|visualize\/mod(?:el|al)?\/private)\/([^/]+)\/tree\/(\d+)\/?$/);
  if (mTreeP) return { type: "model-viz", gameId: "trex", isPrivate: true, modelName: decodeURIComponent(mTreeP[1]), treeIndex: parseInt(mTreeP[2], 10) };
  const mTreeN = path.match(/^\/visualize\/mod(?:el|al)?\/([^/]+)\/tree\/(\d+)\/?$/);
  if (mTreeN) return { type: "model-viz", gameId: "trex", isPrivate: false, modelName: decodeURIComponent(mTreeN[1]), treeIndex: parseInt(mTreeN[2], 10) };
  const mP = path.match(/^\/(?:try-web\/visualize\/private\/(?:model\/)?|visualize\/mod(?:el|al)?\/private\/)([^/]+)\/?$/);
  if (mP) return { type: "model-viz", gameId: "trex", isPrivate: true, modelName: decodeURIComponent(mP[1]) };
  const mN = path.match(/^\/visualize\/mod(?:el|al)?\/([^/]+)\/?$/);
  if (mN) return { type: "model-viz", gameId: "trex", isPrivate: false, modelName: decodeURIComponent(mN[1]) };

  const pbTree = path.match(/^\/(?:try-web\/visualize|visualize|visualizer\/[a-zA-Z0-9_-]+)\/playback\/(private\/)?([^/]+)\/prediction\/(\d+)\/tree\/(\d+)\/?$/);
  if (pbTree) return { type: "playback-viz", isPrivate: Boolean(pbTree[1]), playbackName: decodeURIComponent(pbTree[2]), predictionStep: parseInt(pbTree[3], 10), treeNo: parseInt(pbTree[4], 10) };
  const pbStep = path.match(/^\/(?:try-web\/visualize|visualize|visualizer\/[a-zA-Z0-9_-]+)\/playback\/(private\/)?([^/]+)\/prediction\/(\d+)\/?$/);
  if (pbStep) return { type: "playback-viz", isPrivate: Boolean(pbStep[1]), playbackName: decodeURIComponent(pbStep[2]), predictionStep: parseInt(pbStep[3], 10) };
  const pbBase = path.match(/^\/(?:try-web\/visualize|visualize|visualizer\/[a-zA-Z0-9_-]+)\/playback\/(private\/)?([^/]+)\/?$/);
  if (pbBase) return { type: "playback-viz", isPrivate: Boolean(pbBase[1]), playbackName: decodeURIComponent(pbBase[2]), predictionStep: 1 };

  return { type: "landing" };
}
