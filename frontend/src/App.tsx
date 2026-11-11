import { useState, useEffect } from "react";
import { VisualizerPage } from "./pages/VisualizerPage";
import { WebRunnerPage } from "./pages/WebRunnerPage";
import { TryWebAutoplayPage } from "./pages/TryWebAutoplayPage";

interface RouteInfo {
  type: "visualize" | "web" | "try-web";
  modelName?: string;
}

function parseRoute(): RouteInfo {
  const path = window.location.pathname;
  if (path === "/web") return { type: "web" };

  const match = path.match(/^\/try-web\/autoplay\/(.+?)\/?$/);
  if (match) {
    const raw = decodeURIComponent(match[1]);
    const cleaned = raw.replace(/^\[|\]$/g, "");
    return { type: "try-web", modelName: cleaned };
  }
  return { type: "visualize" };
}

export function App() {
  const [routeInfo, setRouteInfo] = useState<RouteInfo>(parseRoute);

  useEffect(() => {
    const handlePop = () => setRouteInfo(parseRoute());
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  if (routeInfo.type === "try-web" && routeInfo.modelName) {
    return <TryWebAutoplayPage modelName={routeInfo.modelName} />;
  }

  if (routeInfo.type === "web") {
    return <WebRunnerPage />;
  }

  return <VisualizerPage />;
}

export default App;
