import { useState } from "react";
import { Cpu } from "lucide-react";
import { DinoSimulation, SimState } from "./DinoSimulation";
import { TreeTelemetryViz } from "./TreeTelemetryViz";

export function DemoBox() {
  const [state, setState] = useState<SimState>({ action: "NONE", dist: 550, speed: 6.5 });

  return (
    <div className="w-full h-full flex flex-col justify-between p-6 sm:p-8 text-zinc-900 select-none">
      {/* Top status bar */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100/80 border border-zinc-200/60 text-xs font-medium text-zinc-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Realtime Decision Tree Autoplay</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
          <Cpu className="w-3.5 h-3.5" />
          <span>ONNX WebAssembly</span>
        </div>
      </div>

      {/* Main interactive simulation */}
      <div className="flex-1 flex flex-col justify-center gap-6 my-auto">
        <DinoSimulation onUpdate={setState} />
        <TreeTelemetryViz state={state} />
      </div>

      {/* Bottom minimalist legend */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium pt-3 border-t border-zinc-100">
        <span>Laser rangefinder scans obstacles</span>
        <span>Decision tree activates leaf path</span>
        <span>Action executes with zero latency</span>
      </div>
    </div>
  );
}
export default DemoBox;
