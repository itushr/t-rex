import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { GameSample, TrainResult } from "../types/train";
import { ALL_FEATURES } from "../components/train/featureList";
import { TrimGameplayStep } from "../components/train/TrimGameplayStep";
import { FeatureSelectStep } from "../components/train/FeatureSelectStep";
import { TrainResultCard } from "../components/train/TrainResultCard";

export function TrainPage() {
  const [samples, setSamples] = useState<GameSample[]>([]);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0]);
  const [features, setFeatures] = useState<string[]>(ALL_FEATURES.map((f) => f.id));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrainResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("dino_local_samples");
    const parsed: GameSample[] = raw ? JSON.parse(raw) : [];
    setSamples(parsed);
    setTrimRange([0, parsed.length]);
  }, []);

  const nav = (url: string) => {
    window.history.pushState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  const handleTrain = async () => {
    if (!samples.length) return;
    setLoading(true);
    setError(null);
    try {
      const trimmed = samples.slice(trimRange[0], trimRange[1]);
      const res = await fetch("/api/train/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ samples: trimmed, model_type: "decision_tree", selected_features: features }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Training failed");
      setResult(data);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!samples.length) {
    return (
      <div className="min-h-screen bg-[#F7F4ED] text-black flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#DDD6CB] rounded-2xl p-8 text-center space-y-4">
          <span className="text-xs font-mono uppercase text-[#6E6962]">No Data Recorded</span>
          <h1 className="text-2xl font-medium tracking-tight">Capture Gameplay First</h1>
          <p className="text-sm text-[#6E6962]">Record a session on /web using the camera icon in action bar.</p>
          <button onClick={() => nav("/web")} className="w-full py-3 px-6 rounded-full bg-black text-[#F7F4ED] font-medium text-sm hover:bg-zinc-800 cursor-pointer">
            Launch /web Runner
          </button>
        </div>
      </div>
    );
  }

  const activeCount = trimRange[1] - trimRange[0];
  return (
    <div className="min-h-screen bg-[#F7F4ED] text-black px-4 py-12 md:py-16 flex flex-col items-center">
      <div className="max-w-3xl w-full flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button onClick={() => nav("/web")} className="text-xs font-mono text-[#6E6962] hover:text-black flex items-center gap-1 cursor-pointer">
              <ArrowLeft className="size-3.5" /> Back to /web
            </button>
            <span className="text-xs font-mono text-[#6E6962]">{samples.length} Raw Frames</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight mt-1">Train Runner Intelligence</h1>
          <p className="text-sm text-[#6E6962]">Trim captured frames, customize sensory inputs, and compile an in-memory decision tree.</p>
        </div>
        <TrimGameplayStep samples={samples} trimRange={trimRange} onChange={setTrimRange} />
        <FeatureSelectStep selected={features} onChange={setFeatures} />
        {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-mono">{error}</div>}
        <button
          type="button" onClick={handleTrain} disabled={loading || activeCount < 10 || features.length === 0}
          className="w-full py-4 px-8 rounded-full bg-black text-[#F7F4ED] font-medium text-base hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          {loading ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
          <span>{loading ? "Compiling Model..." : `Train Model (${activeCount} frames, ${features.length} inputs)`}</span>
        </button>
        {result && <TrainResultCard result={result} onNavigate={nav} />}
      </div>
    </div>
  );
}
export default TrainPage;
