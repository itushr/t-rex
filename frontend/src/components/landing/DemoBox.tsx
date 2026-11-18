import { useState } from "react";
import { DinoSimulation } from "./DinoSimulation";
import { RandomForestOverlay } from "./RandomForestOverlay";
import { SimState } from "./types";

export function DemoBox() {
  const [simState, setSimState] = useState<SimState>();

  return (
    <div className="w-full h-full min-h-125 flex flex-col justify-between p-4 sm:p-6 text-zinc-900 select-none">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2.5 px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
        </div>
        <div className="text-[11px] font-mono text-zinc-400">
          Random Forest Ensemble • React Flow
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 py-4 px-2">
        <div className="w-full lg:w-[57%] flex items-center justify-center">
          <DinoSimulation onStateChange={setSimState} />
        </div>
        <div className="w-full lg:w-[43%] flex items-center justify-center">
          <RandomForestOverlay state={simState} />
        </div>
      </div>
    </div>
  );
}
export default DemoBox;
