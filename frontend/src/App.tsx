import { useState, useEffect } from "react";
import { WebRunnerPage } from "./pages/WebRunnerPage";
import { TryWebAutoplayPage } from "./pages/TryWebAutoplayPage";
import { ModelVisualizePage } from "./pages/ModelVisualizePage";
import { PlaybackVisualizePage } from "./pages/PlaybackVisualizePage";
import { VisualizerIndexPage } from "./pages/VisualizerIndexPage";
import { TrainPage } from "./pages/TrainPage";

interface RouteInfo {
  type: "web" | "try-web" | "model-viz" | "playback-viz" | "train" | "index";
  modelName?: string;
  treeIndex?: number;
  playbackName?: string;
  predictionStep?: number;
  treeNo?: number;
}

function parseRoute(): RouteInfo {
  const p = window.location.pathname;
  if (p === "/web") return { type: "web" };
  if (p === "/train") return { type: "train" };

  const tryWeb = p.match(/^\/try-web\/autoplay\/(.+?)\/?$/);
  if (tryWeb) return { type: "try-web", modelName: decodeURIComponent(tryWeb[1]).replace(/^\[|\]$/g, "") };

  const mTree = p.match(/^\/visualize\/mod(?:el|al)?\/([^/]+)\/tree\/(\d+)\/?$/);
  if (mTree) return { type: "model-viz", modelName: decodeURIComponent(mTree[1]), treeIndex: parseInt(mTree[2], 10) };

  const mRoot = p.match(/^\/visualize\/mod(?:el|al)?\/([^/]+)\/?$/);
  if (mRoot) return { type: "model-viz", modelName: decodeURIComponent(mRoot[1]) };

  const pTree = p.match(/^\/visualize\/playback\/([^/]+)\/prediction\/(\d+)\/tree\/(\d+)\/?$/);
  if (pTree) {
    return {
      type: "playback-viz", playbackName: decodeURIComponent(pTree[1]),
      predictionStep: parseInt(pTree[2], 10), treeNo: parseInt(pTree[3], 10),
    };
  }

  const pStep = p.match(/^\/visualize\/playback\/([^/]+)\/prediction\/(\d+)\/?$/);
  if (pStep) {
    return { type: "playback-viz", playbackName: decodeURIComponent(pStep[1]), predictionStep: parseInt(pStep[2], 10) };
  }

  const pRoot = p.match(/^\/visualize\/playback\/([^/]+)\/?$/);
  if (pRoot) return { type: "playback-viz", playbackName: decodeURIComponent(pRoot[1]), predictionStep: 1 };

  return { type: "index" };
}

export function App() {
  const [route, setRoute] = useState<RouteInfo>(parseRoute);

  useEffect(() => {
    const handlePop = () => setRoute(parseRoute());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  if (route.type === "train") return <TrainPage />;
  if (route.type === "try-web" && route.modelName) return <TryWebAutoplayPage modelName={route.modelName} />;
  if (route.type === "web") return <WebRunnerPage />;
  if (route.type === "model-viz" && route.modelName) {
    return <ModelVisualizePage modelName={route.modelName} treeIndex={route.treeIndex} />;
  }
  if (route.type === "playback-viz" && route.playbackName) {
    return (
      <PlaybackVisualizePage
        playbackName={route.playbackName}
        predictionStep={route.predictionStep}
        treeNo={route.treeNo}
      />
    );
  }
  return <VisualizerIndexPage />;
}

export default App;
