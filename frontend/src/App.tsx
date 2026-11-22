import { useState, useEffect, lazy, Suspense } from "react";
import { parseRoute } from "./router/routeParser";
import { RouteInfo } from "./router/types";

const Home = lazy(() => import("./pages/Home"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Setup = lazy(() => import("./pages/Setup"));
const TryWeb = lazy(() => import("./pages/TryWeb"));
const Game = lazy(() => import("./pages/Game"));
const Autoplay = lazy(() => import("./pages/Autoplay"));
const Visualizer = lazy(() => import("./pages/Visualizer"));
const Train = lazy(() => import("./pages/Train"));
const Play = lazy(() => import("./pages/Play"));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function RouteView({ route }: { route: RouteInfo }) {
  if (route.type === "dashboard") return <Dashboard isLocal={route.isLocal} />;
  if (route.type === "setup") return <Setup />;
  if (route.type === "try-web") return <TryWeb />;
  if (route.type === "train") return <Train gameId={route.gameId} />;
  if (route.type === "play") return <Play gameId={route.gameId} />;
  if (route.type === "game") return <Game gameId={route.gameId} mode={route.mode} />;
  if (route.type === "autoplay" && route.modelName) {
    return <Autoplay gameId={route.gameId} modelName={route.modelName} isPrivate={route.isLocal === false} />;
  }
  if (route.type === "visualizer" && route.vizMode && route.name) {
    return <Visualizer mode={route.vizMode} name={route.name} isPrivate={Boolean(route.isLocal === false)} />;
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
