import { Cpu, Sparkles } from "lucide-react";
import { DinoSimulation } from "./DinoSimulation";

export function DemoBox() {
  return (
    <div className="w-full h-full min-h-[460px] flex flex-col justify-between p-6 sm:p-8 text-zinc-900 select-none">
      {/* Top minimal status bar */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/60 text-xs font-medium text-zinc-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Autonomous AI Runner • 60 FPS</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
          <Cpu className="w-3.5 h-3.5" />
          <span>ONNX WebAssembly</span>
        </div>
      </div>

      {/* Large game canvas */}
      <div className="flex-1 flex items-center justify-center py-4">
        <DinoSimulation />
      </div>

      {/* Bottom minimal caption */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium pt-2 border-t border-zinc-100">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>T-Rex AI Studio in-browser neural &amp; tree inference</span>
        </div>
        <span>Press Space or Up Arrow to jump</span>
      </div>
    </div>
  );
}
export default DemoBox;
