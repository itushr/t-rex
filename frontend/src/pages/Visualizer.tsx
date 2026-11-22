import { useEffect, useState, Suspense } from "react";
import { getModelVisualizer, getPlaybackVisualizer } from "../constants/models";
import { fetchModelInfo } from "../services/api";
import { getPrivateModelInfo, getPrivatePlaybackMeta } from "../services/privateApi";
import { fetchPlaybackMeta } from "../services/api";

export interface VisualizerProps {
  mode: "model" | "playback";
  name: string;
  isPrivate?: boolean;
}

export function Visualizer({ mode, name, isPrivate = false }: VisualizerProps) {
  const [modelType, setModelType] = useState<string>("decision_tree");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (mode === "model") {
      const fetcher = isPrivate ? getPrivateModelInfo : fetchModelInfo;
      fetcher(name)
        .then((res: any) => {
          if (active && res?.model_type) setModelType(res.model_type);
        })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
    } else {
      const fetcher = isPrivate ? getPrivatePlaybackMeta : fetchPlaybackMeta;
      fetcher(name)
        .then((res: any) => {
          if (active && res?.model_type) setModelType(res.model_type);
        })
        .catch(() => {})
        .finally(() => { if (active) setLoading(false); });
    }
    return () => { active = false; };
  }, [mode, name, isPrivate]);

  const VisualizerComponent = mode === "model"
    ? getModelVisualizer(modelType)
    : getPlaybackVisualizer(modelType);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground">
        Loading visualizer...
      </div>
    );
  }

  if (!VisualizerComponent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground">
        Visualizer not found for model type: {modelType}
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground">Loading visualizer component...</div>}>
      <VisualizerComponent modelName={name} playbackName={name} isPrivate={isPrivate} />
    </Suspense>
  );
}

export default Visualizer;
