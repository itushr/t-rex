import type { QTableEntry } from "@/types/rl";

export interface QTableContentProps {
  entries: QTableEntry<any>[];
  actions?: string[];
  stateHeader?: string;
}

export function QTableContent({ entries, actions, stateHeader }: QTableContentProps) {
  const acts = actions ?? ["jump", "duck", "none"];

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-neutral-400 font-mono">
        Q-Table is currently empty. Run the game to record state transitions!
      </div>
    );
  }

  return (
    <div className="p-4 max-h-80 overflow-y-auto">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400 text-[11px]">
              <th className="py-2 px-3">{stateHeader ?? "State (motion | tti | obstacle)"}</th>
              {acts.map((act) => (<th key={act} className="py-2 px-3 text-right capitalize">{act}</th>))}
              <th className="py-2 px-3 text-center">Best</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60">
            {entries.map((e, idx) => (
              <tr key={idx} className="hover:bg-neutral-900/40">
                <td className="py-2 px-3 font-medium text-white">{e.stateKey}</td>
                {acts.map((act) => {
                  const val = (e.values as any)[act] ?? 0;
                  const isBest = e.bestAction === act;
                  return (
                    <td key={act} className={`py-2 px-3 text-right ${isBest ? "text-emerald-400 font-bold" : "text-neutral-400"}`}>
                      {val.toFixed(2)}
                    </td>
                  );
                })}
                <td className="py-2 px-3 text-center">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {e.bestAction}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default QTableContent;
