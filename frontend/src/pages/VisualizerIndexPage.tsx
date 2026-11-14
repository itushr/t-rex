import { useEffect, useState } from "react";
import { fetchModels, fetchPlaybacks } from "../services/api";
import { ModelSummary } from "../types/model";
import { PlaybackSession } from "../types/playback";
import { DinoIcon } from "../components/DinoIcon";
import { navigateTo } from "../utils/navigation";

export function VisualizerIndexPage() {
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [playbacks, setPlaybacks] = useState<PlaybackSession[]>([]);

  useEffect(() => {
    fetchModels().then(setModels);
    fetchPlaybacks().then(setPlaybacks);
  }, []);

  return (
    <div className="visualizer-theme min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-4 py-2.5 flex items-center justify-between bg-background">
        <div className="flex items-center gap-3">
          <DinoIcon />
          <span className="font-semibold text-base">T-Rex Visualizer (Driver Local)</span>
        </div>
        <button onClick={() => navigateTo("/dashboard")} className="px-3 py-1 text-xs border border-border rounded hover:bg-card cursor-pointer">
          Private Studio →
        </button>
      </header>

      <div className="p-8 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
        <div>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Models</h2>
          <div className="border border-border rounded bg-card divide-y divide-border overflow-hidden">
            {models.map((m) => (
              <div
                key={m.name}
                onClick={() => navigateTo(`/visualize/model/${m.name}`)}
                className="p-3.5 hover:bg-accent/40 cursor-pointer flex items-center justify-between transition-colors"
              >
                <div>
                  <div className="font-medium text-sm">{m.name}</div>
                  <div className="text-xs text-muted-foreground">{m.model_type} • {m.features_count} features</div>
                </div>
                <span className="text-xs font-mono font-medium">View Tree →</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Playbacks</h2>
          <div className="border border-border rounded bg-card divide-y divide-border overflow-hidden">
            {playbacks.map((p) => {
              const fname = p.filename ?? "";
              return (
                <div
                  key={fname}
                  onClick={() => navigateTo(`/visualize/playback/${fname}`)}
                  className="p-3.5 hover:bg-accent/40 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-medium text-sm">{p.model_name}</div>
                    <div className="text-xs text-muted-foreground">{p.model_type} • {p.total_steps} steps</div>
                  </div>
                  <span className="text-xs font-mono font-medium">Inspect →</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
