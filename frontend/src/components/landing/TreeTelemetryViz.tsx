import { GitFork, ArrowRight, Zap, CheckCircle2 } from "lucide-react";
import { SimState } from "./DinoSimulation";

export function TreeTelemetryViz({ state }: { state: SimState }) {
  const isTriggered = state.dist < 125 && state.dist > 0;
  const isJump = state.action === "JUMP";
  const isDuck = state.action === "DUCK";

  return (
    <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-zinc-50/50 rounded-2xl border border-zinc-200/80">
      {/* 1. Raw Telemetry */}
      <div className="flex flex-col gap-2 min-w-[170px] text-left">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Telemetry</span>
        </div>
        <div className="flex gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-xs flex-1">
            <div className="text-[10px] text-zinc-400 font-medium">Distance</div>
            <div className="text-sm font-bold font-mono text-zinc-800">{state.dist}px</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-xs flex-1">
            <div className="text-[10px] text-zinc-400 font-medium">Speed</div>
            <div className="text-sm font-bold font-mono text-zinc-800">{state.speed}</div>
          </div>
        </div>
      </div>

      <ArrowRight className="w-4 h-4 text-zinc-300 hidden md:block shrink-0" />

      {/* 2. Visual Decision Tree Path */}
      <div className="flex-1 flex items-center justify-center gap-3">
        <div className={`px-3 py-2 rounded-xl text-xs font-mono font-medium border transition-all ${
          isTriggered ? "bg-zinc-900 text-white border-zinc-900 shadow-sm" : "bg-white text-zinc-600 border-zinc-200"
        }`}>
          dist &lt; 120
        </div>
        <span className="text-zinc-300 font-mono text-xs">➔</span>
        <div className="flex flex-col gap-1.5">
          <div className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
            isJump ? "bg-emerald-500 text-white border-emerald-500 scale-105 shadow-sm" : "bg-white text-zinc-400 border-zinc-200/60"
          }`}>
            JUMP
          </div>
          <div className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
            isDuck ? "bg-blue-500 text-white border-blue-500 scale-105 shadow-sm" : "bg-white text-zinc-400 border-zinc-200/60"
          }`}>
            DUCK
          </div>
        </div>
      </div>

      <ArrowRight className="w-4 h-4 text-zinc-300 hidden md:block shrink-0" />

      {/* 3. Output Trigger Badge */}
      <div className="min-w-[170px] text-right flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Action</span>
        </div>
        <div className={`px-4 py-2 rounded-xl font-mono text-xs font-bold tracking-wide transition-all border ${
          state.action === "JUMP"
            ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
            : state.action === "DUCK"
            ? "bg-blue-50 border-blue-300 text-blue-700 shadow-xs"
            : "bg-white border-zinc-200 text-zinc-500"
        }`}>
          {state.action === "NONE" ? "RUNNING" : state.action}
        </div>
      </div>
    </div>
  );
}
