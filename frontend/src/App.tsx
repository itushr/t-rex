import { useState, useEffect, lazy, Suspense } from "react";
import { parseRoute } from "./router/routeParser";
import { RouteInfo } from "./router/types";

const LandingPage = lazy(() => import("./pages/LandingPage"));
const LandingPage2 = lazy(() => import("./pages/LandingPage2"));
const PrivateDashboardV2Page = lazy(() => import("./pages/PrivateDashboardV2Page"));
const VisualizerIndexPage = lazy(() => import("./pages/VisualizerIndexPage"));
const TrainPage = lazy(() => import("./pages/TrainPage"));
const TryWebAutoplayPage = lazy(() => import("./pages/TryWebAutoplayPage"));
const WebRunnerPage = lazy(() => import("./pages/WebRunnerPage"));
const ModelVisualizePage = lazy(() => import("./pages/ModelVisualizePage"));
const PlaybackVisualizePage = lazy(() => import("./pages/PlaybackVisualizePage"));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function RouteView({ route }: { route: RouteInfo }) {
  if (route.type === "landing2") return <LandingPage2 />;
  if (route.type === "landing") return <LandingPage />;
  if (route.type === "dashboard") return <PrivateDashboardV2Page />;
  if (route.type === "dashboard-local") return <VisualizerIndexPage />;
  if (route.type === "train") return <TrainPage gameId={route.gameId} />;
  if (route.type === "autoplay" && route.modelName) {
    return <TryWebAutoplayPage modelName={route.modelName} isPrivate={route.isPrivate} />;
  }
  if (route.type === "try-web") return <WebRunnerPage />;
  if (route.type === "model-viz" && route.modelName) {
    return <ModelVisualizePage modelName={route.modelName} treeIndex={route.treeIndex} isPrivate={route.isPrivate} />;
  }
  if (route.type === "playback-viz" && route.playbackName) {
    return <PlaybackVisualizePage playbackName={route.playbackName} predictionStep={route.predictionStep} treeNo={route.treeNo} isPrivate={route.isPrivate} />;
  }
  return <LandingPage />;
}

export function App() {
  const [route, setRoute] = useState<RouteInfo>(() => parseRoute());

  useEffect(() => {
    const handlePop = () => setRoute(parseRoute());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <RouteView route={route} />
    </Suspense>
  );
}

export default App;
