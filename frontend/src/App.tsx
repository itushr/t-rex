import { useState, useEffect } from "react";
import { WebRunnerPage } from "./pages/WebRunnerPage";
import { TryWebAutoplayPage } from "./pages/TryWebAutoplayPage";
import { ModelVisualizePage } from "./pages/ModelVisualizePage";
import { PlaybackVisualizePage } from "./pages/PlaybackVisualizePage";
import { VisualizerIndexPage } from "./pages/VisualizerIndexPage";
import { TrainPage } from "./pages/TrainPage";
import { PrivateDashboardPage } from "./pages/PrivateDashboardPage";
import { PrivateDashboardV2Page } from "./pages/PrivateDashboardV2Page";

interface RouteInfo {
  type: "dashboard" | "dashboard-v2" | "dashboard-local" | "try-web" | "train" | "autoplay" | "model-viz" | "playback-viz";
  modelName?: string; isPrivate?: boolean; treeIndex?: number;
  playbackName?: string; predictionStep?: number; treeNo?: number;
}

function parseRoute(): RouteInfo {
  const p = window.location.pathname;
  if (p === "/dashboardv2") return { type: "dashboard-v2" };
  if (p === "/" || p === "/dashboard") return { type: "dashboard" };
  if (p === "/dashboard/local") return { type: "dashboard-local" };
  if (p === "/try-web" || p === "/web") return { type: "try-web" };
  if (p === "/train") return { type: "train" };

  const autoP = p.match(/^\/try-web\/autoplay\/private\/([^/]+)\/?$/);
  if (autoP) return { type: "autoplay", modelName: decodeURIComponent(autoP[1]), isPrivate: true };
  const autoN = p.match(/^\/try-web\/autoplay\/([^/]+)\/?$/);
  if (autoN) return { type: "autoplay", modelName: decodeURIComponent(autoN[1]), isPrivate: false };

  const mTreeP = p.match(/^\/(?:try-web\/visualize\/private\/model|visualize\/mod(?:el|al)?\/private)\/([^/]+)\/tree\/(\d+)\/?$/);
  if (mTreeP) return { type: "model-viz", isPrivate: true, modelName: decodeURIComponent(mTreeP[1]), treeIndex: parseInt(mTreeP[2], 10) };
  const mTreeN = p.match(/^\/visualize\/mod(?:el|al)?\/([^/]+)\/tree\/(\d+)\/?$/);
  if (mTreeN) return { type: "model-viz", isPrivate: false, modelName: decodeURIComponent(mTreeN[1]), treeIndex: parseInt(mTreeN[2], 10) };

  const mP = p.match(/^\/(?:try-web\/visualize\/private\/(?:model\/)?|visualize\/mod(?:el|al)?\/private\/)([^/]+)\/?$/);
  if (mP) return { type: "model-viz", isPrivate: true, modelName: decodeURIComponent(mP[1]) };
  const mN = p.match(/^\/visualize\/mod(?:el|al)?\/([^/]+)\/?$/);
  if (mN) return { type: "model-viz", isPrivate: false, modelName: decodeURIComponent(mN[1]) };

  const pbTreeP = p.match(/^\/(?:try-web\/visualize\/private\/playback|visualize\/playback\/private)\/([^/]+)\/prediction\/(\d+)\/tree\/(\d+)\/?$/);
  if (pbTreeP) return { type: "playback-viz", isPrivate: true, playbackName: decodeURIComponent(pbTreeP[1]), predictionStep: parseInt(pbTreeP[2], 10), treeNo: parseInt(pbTreeP[3], 10) };
  const pbTreeN = p.match(/^\/visualize\/playback\/([^/]+)\/prediction\/(\d+)\/tree\/(\d+)\/?$/);
  if (pbTreeN) return { type: "playback-viz", isPrivate: false, playbackName: decodeURIComponent(pbTreeN[1]), predictionStep: parseInt(pbTreeN[2], 10), treeNo: parseInt(pbTreeN[3], 10) };

  const pbStepP = p.match(/^\/(?:try-web\/visualize\/private\/playback|visualize\/playback\/private)\/([^/]+)\/prediction\/(\d+)\/?$/);
  if (pbStepP) return { type: "playback-viz", isPrivate: true, playbackName: decodeURIComponent(pbStepP[1]), predictionStep: parseInt(pbStepP[2], 10) };
  const pbStepN = p.match(/^\/visualize\/playback\/([^/]+)\/prediction\/(\d+)\/?$/);
  if (pbStepN) return { type: "playback-viz", isPrivate: false, playbackName: decodeURIComponent(pbStepN[1]), predictionStep: parseInt(pbStepN[2], 10) };

  const pbP = p.match(/^\/(?:try-web\/visualize\/private\/playback\/|visualize\/playback\/private\/)([^/]+)\/?$/);
  if (pbP) return { type: "playback-viz", isPrivate: true, playbackName: decodeURIComponent(pbP[1]), predictionStep: 1 };
  const pbN = p.match(/^\/visualize\/playback\/([^/]+)\/?$/);
  if (pbN) return { type: "playback-viz", isPrivate: false, playbackName: decodeURIComponent(pbN[1]), predictionStep: 1 };

  return { type: "dashboard" };
}

export function App() {
  const [route, setRoute] = useState<RouteInfo>(parseRoute);

  useEffect(() => {
    const handlePop = () => setRoute(parseRoute());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  if (route.type === "dashboard-local") return <VisualizerIndexPage />;
  if (route.type === "train") return <TrainPage />;
  if (route.type === "autoplay" && route.modelName) return <TryWebAutoplayPage modelName={route.modelName} isPrivate={route.isPrivate} />;
  if (route.type === "try-web") return <WebRunnerPage />;
  if (route.type === "model-viz" && route.modelName) {
    return <ModelVisualizePage modelName={route.modelName} treeIndex={route.treeIndex} isPrivate={route.isPrivate} />;
  }
  if (route.type === "playback-viz" && route.playbackName) {
    return <PlaybackVisualizePage playbackName={route.playbackName} predictionStep={route.predictionStep} treeNo={route.treeNo} isPrivate={route.isPrivate} />;
  }
  if (route.type === "dashboard-v2") return <PrivateDashboardV2Page />;
  return <PrivateDashboardPage />;
}
export default App;
