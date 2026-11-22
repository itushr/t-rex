import { useState, useEffect, lazy, Suspense } from "react";
import { parseRoute } from "./router/routeParser";
import { RouteInfo } from "./router/types";

const Home = lazy(() => import("./pages/Home"));
const PrivateDashboardV2Page = lazy(() => import("./pages/PrivateDashboardV2Page"));
const VisualizerIndexPage = lazy(() => import("./pages/VisualizerIndexPage"));
const TrainPage = lazy(() => import("./pages/TrainPage"));
const TryWebAutoplayPage = lazy(() => import("./pages/TryWebAutoplayPage"));
const FlappyBirdAutoplayPage = lazy(() => import("./pages/FlappyBirdAutoplayPage"));
const WebRunnerPage = lazy(() => import("./pages/WebRunnerPage"));
const FlappyBirdPage = lazy(() => import("./pages/FlappyBirdPage"));
const TryWebSelectPage = lazy(() => import("./pages/TryWebSelectPage"));
const GameNotFoundPage = lazy(() => import("./pages/GameNotFoundPage"));
const SetupPage = lazy(() => import("./pages/SetupPage"));
const ModelVisualizePage = lazy(() => import("./pages/ModelVisualizePage"));
const PlaybackVisualizePage = lazy(() => import("./pages/PlaybackVisualizePage"));
const DinoReinforcePage = lazy(() => import("./pages/DinoReinforcePage"));
const FlappyReinforcePage = lazy(() => import("./pages/FlappyReinforcePage"));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function RouteView({ route }: { route: RouteInfo }) {
  if (route.type === "landing" || route.type === "landing2") return <Home />;
  if (route.type === "setup") return <SetupPage />;
  if (route.type === "reinforce") {
    if (route.gameId === "flappybird" || route.gameId === "flappy-bird") return <FlappyReinforcePage />;
    return <DinoReinforcePage />;
  }
  if (route.type === "dashboard") return <PrivateDashboardV2Page />;
  if (route.type === "dashboard-local") return <VisualizerIndexPage />;
  if (route.type === "train") return <TrainPage gameId={route.gameId} />;
  if (route.type === "autoplay" && route.modelName) {
    if (route.gameId === "flappy-bird" || route.gameId === "flappy-brird") {
      return <FlappyBirdAutoplayPage modelName={route.modelName} isPrivate={route.isPrivate} />;
    }
    return <TryWebAutoplayPage modelName={route.modelName} isPrivate={route.isPrivate} />;
  }
  if (route.type === "try-web") {
    if (!route.gameId) return <TryWebSelectPage />;
    if (route.gameId === "dino" || route.gameId === "trex") return <WebRunnerPage />;
    if (route.gameId === "flappy-bird" || route.gameId === "flappy-brird") return <FlappyBirdPage />;
    return <GameNotFoundPage />;
  }
  if (route.type === "model-viz" && route.modelName) {
    return <ModelVisualizePage modelName={route.modelName} treeIndex={route.treeIndex} isPrivate={route.isPrivate} />;
  }
  if (route.type === "playback-viz" && route.playbackName) {
    return <PlaybackVisualizePage playbackName={route.playbackName} predictionStep={route.predictionStep} treeNo={route.treeNo} isPrivate={route.isPrivate} />;
  }
  return <Home />;
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
