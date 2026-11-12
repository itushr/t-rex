import { useEffect, useState } from "react";
import { CheckCircle, Cpu, Eye, Play, Sparkles } from "lucide-react";

interface TrainResult {
  accuracy: number;
  samples: number;
  actions: string[];
}

export function TrainPage() {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<TrainResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("dino_local_samples");
    const samples = raw ? JSON.parse(raw) : [];
    if (!samples.length) {
      setError("No recorded samples found. Play and record in /web first.");
      setLoading(false);
      return;
    }
    fetch("/api/train/local", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ samples, model_type: "decision_tree" }),
    })
      .then((r) => r.ok ? r.json() : r.json().then((d) => Promise.reject(d.detail || "Training failed")))
      .then((data) => { setResult(data); setLoading(false); })
      .catch((err) => { setError(String(err)); setLoading(false); });
  }, []);

  const nav = (url: string) => {
    window.history.pushState(null, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#161b22] border border-border/20 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
        <div className="size-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5 text-cyan-400">
          <Sparkles className="size-8 animate-pulse" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Model Training</h1>
        {loading && <p className="text-zinc-400">Training Decision Tree on recorded game data...</p>}
        {error && (
          <div className="text-rose-400 text-sm mb-4">
            <p>{error}</p>
            <button onClick={() => nav("/web")} className="mt-4 px-4 py-2 bg-zinc-800 rounded-lg text-white">Back to /web</button>
          </div>
        )}
        {result && (
          <div className="w-full mt-2">
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold mb-6">
              <CheckCircle className="size-5" /> In-Memory Model Trained (local.onnx)
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
              <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-500 uppercase">Accuracy</span>
                <p className="text-xl font-bold text-white">{result.accuracy}%</p>
              </div>
              <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <span className="text-xs text-zinc-500 uppercase">Samples</span>
                <p className="text-xl font-bold text-white">{result.samples}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => nav("/visualize/modal/local")}
                className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-cyan-600/20"
              >
                <Eye className="size-5" /> Visualize Model
              </button>
              <button
                onClick={() => nav("/try-web/autoplay/local")}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-600/20"
              >
                <Play className="size-5" /> Start Autoplay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default TrainPage;
