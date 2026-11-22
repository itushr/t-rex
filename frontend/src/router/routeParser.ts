import { RouteInfo } from "./types";

export function parseRoute(path = window.location.pathname): RouteInfo {
  if (path === "" || path === "/") return { type: "landing" };
  if (path === "/setup") return { type: "setup" };
  if (path === "/dashboard/local") return { type: "dashboard", isLocal: true };
  if (path === "/dashboard") return { type: "dashboard", isLocal: false };

  const vizMatch = path.match(/^\/(?:try-web\/)?visualize(?:r)?\/(model|playback)\/(?:(private|local)\/)?([^/]+)(?:\/tree\/\d+)?\/?$/);
  if (vizMatch) {
    const isLoc = vizMatch[2] === "local";
    return {
      type: "visualizer",
      vizMode: vizMatch[1] as "model" | "playback",
      isLocal: isLoc,
      name: decodeURIComponent(vizMatch[3]),
    };
  }

  const autoMatchWithScope = path.match(/^\/(?:try-web\/)?autoplay\/(?:([a-zA-Z0-9_-]+)\/)?(private|local)\/([^/]+)\/?$/);
  if (autoMatchWithScope) {
    const gid = autoMatchWithScope[1];
    const gameId = gid ? (gid === "trex" ? "t-rex" : gid) : "t-rex";
    return {
      type: "autoplay",
      gameId,
      isLocal: autoMatchWithScope[2] === "local",
      modelName: decodeURIComponent(autoMatchWithScope[3]),
    };
  }

  const autoMatch = path.match(/^\/(?:try-web\/)?autoplay\/(?:([a-zA-Z0-9_-]+)\/)?([^/]+)\/?$/);
  if (autoMatch) {
    const hasGame = Boolean(autoMatch[1]);
    const gid = autoMatch[1];
    const gameId = hasGame ? (gid === "trex" ? "t-rex" : gid) : "t-rex";
    return {
      type: "autoplay",
      gameId,
      isLocal: false,
      modelName: decodeURIComponent(autoMatch[2]),
    };
  }

  const trainMatch = path.match(/^\/(?:try-web\/)?t(?:rain|ain)(?:\/([a-zA-Z0-9_-]+))?\/?$/);
  if (trainMatch) return { type: "train", gameId: trainMatch[1] };

  const playMatch = path.match(/^\/play(?:\/([a-zA-Z0-9_-]+))?\/?$/);
  if (playMatch) return { type: "play", gameId: playMatch[1] || "t-rex" };

  const rlMatch = path.match(/^\/try-web\/reinforce(?:ment)?(?:\/([a-zA-Z0-9_-]+))?\/?$/);
  if (rlMatch) return { type: "reinforcement", gameId: rlMatch[1] || "t-rex" };

  const imMatch = path.match(/^\/try-web\/im+itation(?:\/([a-zA-Z0-9_-]+))?\/?$/);
  if (imMatch) return { type: "immitation", gameId: imMatch[1] || "t-rex" };

  if (path === "/try-web") return { type: "try-web" };

  const tryGame = path.match(/^\/try-web\/([a-zA-Z0-9_-]+)\/?$/);
  if (tryGame) return { type: "immitation", gameId: tryGame[1] };

  return { type: "landing" };
}
