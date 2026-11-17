import { useState } from "react";
import { DinoSimulation, DinoAction } from "./DinoSimulation";
import { DecisionTreeOverlay } from "./DecisionTreeOverlay";

export function DemoBox() {
  const [action, setAction] = useState<DinoAction>("RUN");

  return (
    <div className="w-full h-full min-h-115 flex flex-col justify-between p-6 sm:p-8 text-zinc-900 select-none">
      {/* Top minimal status bar */}
      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
          <div className="w-3 h-3 rounded-full bg-zinc-200" />
        </div>
      </div>

      {/* Large game canvas with right-side Decision Tree overlay */}
      <div className="flex-1 flex items-center justify-center py-4 relative">
        <DinoSimulation onAction={setAction} />
        <DecisionTreeOverlay activeAction={action} />
      </div>
    </div>
  );
}
export default DemoBox;
