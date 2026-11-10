import { useState, useEffect } from "react";
import { VisualizerPage } from "./pages/VisualizerPage";
import { WebRunnerPage } from "./pages/WebRunnerPage";

export function App() {
  const [route, setRoute] = useState<string>(() => {
    return window.location.pathname === "/web" ? "/web" : "/visualize";
  });

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname === "/web" ? "/web" : "/visualize");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  if (route === "/web") {
    return <WebRunnerPage />;
  }

  return <VisualizerPage />;
}

export default App;
