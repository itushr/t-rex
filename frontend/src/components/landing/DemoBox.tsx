import { useState } from "react";
import { DinoSimulation } from "./DinoSimulation";
import { RandomForestOverlay } from "./RandomForestOverlay";
import { SimState } from "./types";

export function DemoBox() {
  const [simState, setSimState] = useState<SimState>();

  return (
    <div className="w-full h-full min-h-130 flex flex-col justify-between p-4 sm:p-6 text-zinc-900 select-none">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-2 px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-4 py-2 px-2">
        <div className="w-full lg:w-[56%] flex items-center justify-center">
          <DinoSimulation onStateChange={setSimState} />
        </div>
        <div className="w-full lg:w-[44%] flex items-center justify-center bg-transparent">
          <RandomForestOverlay state={simState} />
        </div>
      </div>
    </div>
  );
}
export default DemoBox;
