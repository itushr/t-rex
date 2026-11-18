import { Activity, Cpu, Layers, Sparkles, ArrowRight } from "lucide-react";

export function TelemetryCard() {
  return (
    <div className="md:col-span-2 rounded-3xl p-6 bg-white border border-zinc-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-zinc-700" />
            Telemetric Feature Ingestion
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600">60 Hz Loop</span>
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Live 4-D Feature Engineering</h3>
        <p className="text-xs text-zinc-600 max-w-md mb-6">
          Extracts spatial telemetry: distance to obstacle, height, creature type, and velocity.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-50 p-3 rounded-2xl border border-zinc-100 font-mono text-xs">
        <div className="bg-white p-2 rounded-xl border border-zinc-200">
          <span className="text-[10px] text-zinc-400 block">obs_distx</span>
          <span className="font-bold text-zinc-800">142 px</span>
        </div>
        <div className="bg-white p-2 rounded-xl border border-zinc-200">
          <span className="text-[10px] text-zinc-400 block">obs_disty</span>
          <span className="font-bold text-zinc-800">24 px</span>
        </div>
        <div className="bg-white p-2 rounded-xl border border-zinc-200">
          <span className="text-[10px] text-zinc-400 block">obs_type</span>
          <span className="font-bold text-zinc-800">CACTUS</span>
        </div>
        <div className="bg-white p-2 rounded-xl border border-zinc-200">
          <span className="text-[10px] text-zinc-400 block">speed</span>
          <span className="font-bold text-zinc-800">9.8 px/f</span>
        </div>
      </div>
    </div>
  );
}

export function EdgeRuntimeCard() {
  return (
    <div className="rounded-3xl p-6 bg-white border border-zinc-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-4">
          <Cpu className="w-4 h-4 text-zinc-700" />
          Client Edge Engine
        </span>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">ONNX Web Runtime</h3>
        <p className="text-xs text-zinc-600 mb-4">Zero server hops with sub-2ms WebAssembly inference.</p>
      </div>
      <div className="p-3 bg-zinc-950 text-white rounded-2xl font-mono text-xs border border-zinc-800">
        <div className="flex justify-between text-zinc-400 text-[10px] pb-1 border-b border-zinc-800 mb-1">
          <span>ORT-WASM</span>
          <span className="text-emerald-400">&lt; 1.5ms</span>
        </div>
        <p className="text-zinc-300 text-[11px] truncate">session.run(&#123; input: tensor &#125;)</p>
      </div>
    </div>
  );
}