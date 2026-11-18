import { Zap, Activity, GitBranch, Cpu } from "lucide-react";

const STATS = [
  { icon: Activity, val: "60 FPS", label: "Real-time CDP Telemetry", desc: "Native Chrome DevTools capture" },
  { icon: Zap, val: "< 2ms", label: "Client-side Inference", desc: "Zero-latency ONNX WebAssembly" },
  { icon: GitBranch, val: "100%", label: "Explainable Decisions", desc: "White-box decision trees & forests" },
  { icon: Cpu, val: "3-Way", label: "Consensus Voting", desc: "Ensemble argmax action selection" },
];

export function LandingStats() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-3xl bg-zinc-900 text-white shadow-xl border border-zinc-800 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex flex-col p-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 backdrop-blur-xs relative group hover:border-zinc-500 transition-colors">
              <div className="flex items-center gap-2 mb-2 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                <Icon className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">{s.label}</span>
              </div>
              <div className="text-2xl md:text-3xl font-extrabold font-mono tracking-tight text-white mb-0.5">
                {s.val}
              </div>
              <p className="text-[11px] text-zinc-400 leading-snug">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export default LandingStats;