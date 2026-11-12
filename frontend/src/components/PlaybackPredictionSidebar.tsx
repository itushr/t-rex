import React, { useRef, useEffect } from "react";
import { PlaybackMetaStep } from "../types/playback";

interface Props {
  modelType: string;
  steps: PlaybackMetaStep[];
  activeStepNo: number;
  onSelectStep: (stepNo: number) => void;
}

export const PlaybackPredictionSidebar: React.FC<Props> = ({
  modelType, steps, activeStepNo, onSelectStep,
}) => {
  const activeRowRef = useRef<HTMLTableRowElement | null>(null);

  useEffect(() => {
    activeRowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeStepNo]);

  const isRf = modelType === "random_forest";

  return (
    <div className="w-120 min-w-105 max-w-135 bg-bg-panel border-r border-border flex flex-col h-full z-10">
      <div className="p-2.5 border-b border-border flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider">Predictions</span>
        <span className="text-[11px] font-mono text-muted-foreground">Step {activeStepNo} / {steps.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-accent">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-background border-b border-border z-5">
            {isRf ? (
              <tr className="text-left text-muted-foreground text-[10px] uppercase font-mono">
                <th className="p-2">#</th>
                <th className="p-2 text-center">p(jump)</th>
                <th className="p-2 text-center">p(duck)</th>
                <th className="p-2 text-center">p(none)</th>
                <th className="p-2 text-center">action</th>
              </tr>
            ) : (
              <tr className="text-left text-muted-foreground text-[10px] uppercase font-mono">
                <th className="p-2">#</th>
                <th className="p-2">obstacle1</th>
                <th className="p-2 text-center">speed</th>
                <th className="p-2 text-center">action</th>
              </tr>
            )}
          </thead>
          <tbody>
            {steps.map((s) => {
              const isSelected = s.step === activeStepNo;
              const act = s.action.toLowerCase();
              const badge = act === "jump" ? "bg-jump/20 text-jump border-jump" :
                act === "duck" ? "bg-duck/20 text-duck border-duck" : "bg-none/20 text-muted-foreground border-border";

              return (
                <tr
                  key={s.step}
                  ref={isSelected ? activeRowRef : null}
                  onClick={() => onSelectStep(s.step)}
                  className={`border-b border-border cursor-pointer transition-colors ${
                    isSelected ? "bg-accent border-l-2 border-l-accent" : "hover:bg-card"
                  }`}
                >
                  <td className="p-2 font-mono text-muted-foreground">{s.step}</td>
                  {isRf ? (
                    <>
                      <td className="p-2 text-center font-mono">{Math.round((s.p_jump ?? 0) * 100)}%</td>
                      <td className="p-2 text-center font-mono">{Math.round((s.p_duck ?? 0) * 100)}%</td>
                      <td className="p-2 text-center font-mono">{Math.round((s.p_none ?? 0) * 100)}%</td>
                    </>
                  ) : (
                    <>
                      <td className="p-2 truncate max-w-36">{s.obstacle1}</td>
                      <td className="p-2 text-center font-mono">{s.speed}</td>
                    </>
                  )}
                  <td className="p-2 text-center">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${badge}`}>
                      {act}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
