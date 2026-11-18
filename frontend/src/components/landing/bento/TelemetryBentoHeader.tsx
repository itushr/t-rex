export function TelemetryBentoHeader() {
  return (
    <div className="w-full bg-zinc-950 rounded-2xl p-4 border border-zinc-800 text-zinc-100 font-mono text-xs overflow-hidden relative">
      <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-2 border-b border-zinc-800 mb-3">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>CDP TELEMETRY STREAM &bull; 60Hz</span>
        </span>
        <span className="text-zinc-500">Runner.instance_</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
        <div className="bg-zinc-900/90 p-2 rounded-xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400">obs_distx</div>
          <div className="text-sm font-bold text-emerald-400">138.4 px</div>
          <div className="text-[9px] text-zinc-500">Horizontal delta</div>
        </div>

        <div className="bg-zinc-900/90 p-2 rounded-xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400">obs_disty</div>
          <div className="text-sm font-bold text-blue-400">18.0 px</div>
          <div className="text-[9px] text-zinc-500">Obstacle altitude</div>
        </div>

        <div className="bg-zinc-900/90 p-2 rounded-xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400">obs_type</div>
          <div className="text-sm font-bold text-amber-400">BIRD_MID</div>
          <div className="text-[9px] text-zinc-500">Obstacle class</div>
        </div>

        <div className="bg-zinc-900/90 p-2 rounded-xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400">speed</div>
          <div className="text-sm font-bold text-purple-400">9.6 px/f</div>
          <div className="text-[9px] text-zinc-500">Canvas velocity</div>
        </div>
      </div>
    </div>
  );
}
export default TelemetryBentoHeader;