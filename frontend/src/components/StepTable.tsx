import React, { useState, useMemo } from "react";
import { PlaybackStep } from "../types/playback";

interface StepTableProps {
  records: PlaybackStep[];
  currentIndex: number;
  onSelectIndex: (idx: number) => void;
}

export const StepTable: React.FC<StepTableProps> = ({ records, currentIndex, onSelectIndex }) => {
  const [filterAction, setFilterAction] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    return records
      .map((r, originalIndex) => ({ r, originalIndex }))
      .filter(({ r }) => {
        if (filterAction !== "all" && r.action.toLowerCase() !== filterAction) return false;
        if (search) {
          const q = search.toLowerCase();
          const match = String(r.step).includes(q) || r.obs1.type.toLowerCase().includes(q) || r.action.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      });
  }, [records, filterAction, search]);

  return (
    <div className="w-[480px] min-w-[420px] max-w-[540px] bg-bg-panel border-r border-border-default flex flex-col h-full z-10">
      <div className="p-2.5 border-b border-border-default flex items-center justify-between gap-2">
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="bg-bg-card border border-border-default text-text-primary text-xs rounded px-2 py-1 outline-none"
        >
          <option value="all">All actions</option>
          <option value="jump">Jump only</option>
          <option value="duck">Duck only</option>
          <option value="none">None only</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="bg-bg-card border border-border-default text-text-primary text-xs rounded px-2.5 py-1 outline-none w-32"
        />
        <span className="text-[11px] font-mono-code text-text-muted">{filtered.length} / {records.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 bg-bg-card border-b border-border-default z-5">
            <tr className="text-left text-text-muted text-[10px] uppercase font-mono-code">
              <th className="p-2">#</th>
              <th className="p-2">Time</th>
              <th className="p-2">Action</th>
              <th className="p-2">Obstacle 1</th>
              <th className="p-2">TTI</th>
              <th className="p-2">Speed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(({ r, originalIndex }) => {
              const isSelected = originalIndex === currentIndex;
              return (
                <tr
                  key={`step-${r.step}`}
                  onClick={() => onSelectIndex(originalIndex)}
                  className={`border-b border-border-subtle cursor-pointer transition-colors ${
                    isSelected ? "bg-accent/15 border-l-2 border-l-accent" : "hover:bg-bg-card/50"
                  }`}
                >
                  <td className="p-2 font-mono-code text-text-muted">{r.step}</td>
                  <td className="p-2 font-mono-code">{r.time.toFixed(2)}s</td>
                  <td className="p-2">
                    <span className={`text-[10px] font-mono-code font-bold px-1.5 py-0.5 rounded border uppercase ${
                      r.action === "jump" ? "bg-jump/20 text-jump border-jump" :
                      r.action === "duck" ? "bg-duck/20 text-duck border-duck" :
                      "bg-none/20 text-text-dim border-border-default"
                    }`}>
                      {r.action}
                    </span>
                  </td>
                  <td className="p-2 truncate max-w-[120px]">{r.obs1.type !== "none" ? `${r.obs1.type} (${r.obs1.x.toFixed(0)}px)` : "None"}</td>
                  <td className="p-2 font-mono-code text-text-dim">{r.time_to_impact && r.time_to_impact > 0 ? r.time_to_impact.toFixed(1) : "—"}</td>
                  <td className="p-2 font-mono-code">{r.speed.toFixed(1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
