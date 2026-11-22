import { useEffect, useState } from "react";
import { fetchModelInfo } from "@/services/api";
import { getPrivateModelInfo } from "@/services/privateApi";
import type { ModelInfo } from "@/types/model";
import { summarizeQTable, QTableEntry } from "../../model";

export interface QLearningModelVisualizerProps {
  modelName: string;
  isPrivate?: boolean;
}

export function QLearningModelVisualizer({ modelName, isPrivate = false }: QLearningModelVisualizerProps) {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetcher = isPrivate ? getPrivateModelInfo : fetchModelInfo;
    fetcher(modelName).then((res: any) => {
      setInfo(res);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [modelName, isPrivate]);

  const rawEntries: QTableEntry<string>[] = (info as any)?.qtable_entries || (info as any)?.entries || [];
  const entries = rawEntries.filter((e) => e.stateKey?.toLowerCase().includes(filter.toLowerCase()));
  const summary = summarizeQTable(rawEntries);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden text-foreground bg-background">
      <header className="border-b border-border px-4 py-2.5 flex items-center justify-between flex-wrap gap-3 bg-background z-20">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">{modelName}</span>
          <span className="border border-border rounded px-2 py-0.5 text-xs text-muted-foreground uppercase">Q-Learning Policy</span>
          {isPrivate && <span className="bg-primary text-primary-foreground rounded px-2 py-0.5 text-xs font-mono">Private</span>}
          <span className="text-xs text-muted-foreground">{summary.totalStates} States</span>
        </div>
        <input
          type="text" placeholder="Filter states..." value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-card border border-border rounded px-2.5 py-1 text-xs outline-none focus:border-primary w-48 font-mono"
        />
      </header>
      <div className="flex-1 overflow-auto p-4 max-w-4xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-xs text-muted-foreground">Loading Q-Learning policy...</div>
        ) : entries.length === 0 ? (
          <div className="border border-dashed border-border rounded p-8 text-center text-xs text-muted-foreground">
            No policy entries found matching "{filter}".
          </div>
        ) : (
          <div className="border border-border rounded bg-card overflow-hidden">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-background text-muted-foreground text-[10px] uppercase font-mono text-left">
                  <th className="p-2.5">State Representation</th>
                  <th className="p-2.5">Best Action</th>
                  <th className="p-2.5 text-right">Max Q</th>
                  <th className="p-2.5 text-right">Action Q-Values</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-accent/40 transition-colors">
                    <td className="p-2.5 font-mono text-primary">{e.stateKey}</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded font-mono font-semibold bg-primary/20 text-primary border border-primary/40 uppercase">
                        {e.bestAction}
                      </span>
                    </td>
                    <td className="p-2.5 font-mono text-right font-medium">{e.bestValue?.toFixed(3)}</td>
                    <td className="p-2.5 font-mono text-right text-muted-foreground">
                      {Object.entries(e.values || {}).map(([act, val]) => `${act}: ${(val as number).toFixed(2)}`).join(" | ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default QLearningModelVisualizer;
