import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { GameSample, TrainResult } from "../types/train";
import { ALL_FEATURES } from "../components/train/featureList";
import { TrimGameplayStep } from "../components/train/TrimGameplayStep";
import { ModelSelectStep, SupportedModelType } from "../components/train/ModelSelectStep";
import { FeatureSelectStep } from "../components/train/FeatureSelectStep";
import { TrainResultCard } from "../components/train/TrainResultCard";
import { getPrivateGameplay, trainPrivateModel } from "../services/privateApi";

export function TrainPage() {
  const [samples, setSamples] = useState<GameSample[]>([]);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
  const [modelType, setModelType] = useState<SupportedModelType>("decision_tree");
  const [features, setFeatures] = useState<string[]>(ALL_FEATURES.map((f) => f.id));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrainResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("dino_local_samples");
    const parsed: GameSample[] = raw ? JSON.parse(raw) : [];
    if (parsed.length) { setSamples(parsed); setTrimRange([0, parsed.length]); return; }
    const q = new URLSearchParams(window.location.search).get("gameplay");
    if (q) {
      getPrivateGameplay(q).then((d) => {
        if (d?.samples) { setSamples(d.samples); setTrimRange([0, d.samples.length]); }
      }).catch(() => {});
    }
  }, []);

  const nav = (url: string) => {
    window.history.pushState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleTrain = async () => {
    if (!samples.length) return;
    setLoading(true); setError(null);
    try {
      const data = await trainPrivateModel({
        samples: samples.slice(trimRange[0], trimRange[1]),
        model_type: modelType, selected_features: features,
      });
      setResult(data);
    } catch (err: any) { setError(err?.message || String(err)); }
    finally { setLoading(false); }
  };

  if (!samples.length) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-6">
        <div className="max-w-sm w-full border border-border rounded-xl bg-card p-6 text-center space-y-4">
          <h2 className="text-lg font-medium">No Gameplay Data</h2>
          <p className="text-xs text-muted-foreground">Record a session on /try-web or choose a saved run from your dashboard.</p>
          <div className="flex gap-2">
            <button onClick={() => nav("/try-web")} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium cursor-pointer">/try-web</button>
            <button onClick={() => nav("/dashboard")} className="flex-1 py-2 rounded-lg border border-border bg-secondary text-secondary-foreground text-xs font-medium cursor-pointer">Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const activeCount = trimRange[1] - trimRange[0];
  return (
    <div className="dark min-h-screen bg-background text-foreground px-4 py-8 md:py-12 flex flex-col items-center">
      <div className="max-w-2xl w-full flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <button onClick={() => nav("/dashboard")} className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer">
            <ArrowLeft className="size-3.5" /> Dashboard
          </button>
          <span className="text-xs font-mono text-muted-foreground">{samples.length} frames</span>
        </div>

        <TrimGameplayStep samples={samples} trimRange={trimRange} onChange={setTrimRange} />
        <ModelSelectStep modelType={modelType} onChange={setModelType} />
        <FeatureSelectStep selected={features} onChange={setFeatures} />

        {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">{error}</div>}

        <button
          type="button" onClick={handleTrain} disabled={loading || activeCount < 10 || features.length === 0}
          className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          <span>{loading ? "Training..." : `Train ${modelType.replace("_", " ")} (${activeCount} frames)`}</span>
        </button>

        {result && <TrainResultCard result={result} onNavigate={nav} />}
      </div>
    </div>
  );
}
export default TrainPage;
