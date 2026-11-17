import { GitFork } from "lucide-react";

export function DecisionTreeOverlay({ activeAction = "RUN" }: { activeAction?: "JUMP" | "DUCK" | "RUN" }) {
  const isJump = activeAction === "JUMP";
  const isDuck = activeAction === "DUCK";
  const isRun = activeAction === "RUN";

  return (
    <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-white/92 backdrop-blur-md border border-zinc-200/90 shadow-xl rounded-2xl p-3.5 w-56 sm:w-64 select-none pointer-events-none">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          <GitFork className="w-3.5 h-3.5 text-zinc-700" />
          <span>Decision Tree</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-400">Depth: 2</span>
      </div>

      {/* Tree Visualization */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        {/* Root Node */}
        <div className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] font-semibold transition-all ${
          !isRun ? "bg-zinc-900 text-white border-zinc-900 shadow-xs" : "bg-zinc-50 text-zinc-700 border-zinc-200"
        }`}>
          dist &le; 115px
        </div>

        {/* Level 1 Connectors */}
        <div className="flex justify-between w-full px-3 text-[9px] font-semibold text-zinc-400">
          <span>&larr; True</span>
          <span>False &rarr;</span>
        </div>

        {/* Level 1 & Leaf Nodes */}
        <div className="flex items-start justify-between w-full gap-2 pt-0.5">
          {/* Left Branch: Obstacle Detection */}
          <div className="flex flex-col items-center gap-1.5 flex-1">
            <div className={`px-2 py-0.5 rounded-md border font-mono text-[10px] font-medium transition-all ${
              isDuck || isJump ? "bg-zinc-100 border-zinc-300 text-zinc-800" : "bg-zinc-50/50 border-zinc-200/60 text-zinc-400"
            }`}>
              is_bird?
            </div>
            <div className="flex gap-1.5 mt-0.5">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                isJump ? "bg-emerald-500 text-white border-emerald-500 scale-105 shadow-xs" : "bg-zinc-50 text-zinc-400 border-zinc-200/60"
              }`}>
                JUMP
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                isDuck ? "bg-blue-500 text-white border-blue-500 scale-105 shadow-xs" : "bg-zinc-50 text-zinc-400 border-zinc-200/60"
              }`}>
                DUCK
              </span>
            </div>
          </div>

          {/* Right Branch: Clear Path */}
          <div className="flex flex-col items-center gap-1.5 pt-3">
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-all ${
              isRun ? "bg-zinc-800 text-white border-zinc-800 shadow-2xs" : "bg-zinc-50 text-zinc-400 border-zinc-200/60"
            }`}>
              RUN
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-[9px] text-zinc-400">
        <span>Trained on Telemetry</span>
        <span className="font-mono text-emerald-600 font-semibold">&bull; Active</span>
      </div>
    </div>
  );
}
export default DecisionTreeOverlay;
