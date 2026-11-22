import { X, Cpu } from "lucide-react";
import type { QTableEntry } from "../../models/q-network";

interface QTableModalProps {
  isOpen: boolean; onClose: () => void; entries: QTableEntry<any>[];
  epsilon: number; actions?: string[]; stateHeader?: string;
}

export function QTableModal({ isOpen, onClose, entries, epsilon, actions, stateHeader }: QTableModalProps) {
  if (!isOpen) return null;
  const acts = actions ?? ["jump", "duck", "none"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#0f0f11] text-white border border-neutral-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden scale-y-125">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-emerald-400" />
            <h3 className="font-semibold text-sm tracking-wide">Q-Table Visualizer</h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
            <span>States: <strong className="text-white">{entries.length}</strong></span>
            <span>ε: <strong className="text-white">{(epsilon * 100).toFixed(1)}%</strong></span>
            <button type="button" onClick={onClose} className="p-1 text-neutral-400 hover:text-white cursor-pointer"><X className="size-4" /></button>
          </div>
        </div>

        <div className="p-4 max-h-80 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 font-mono">
              Q-Table is currently empty. Run the game to record state transitions!
            </div>
          ) : (
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
          )}
        </div>

        <div className="flex justify-end px-5 py-3 border-t border-neutral-800 bg-[#09090b]">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 cursor-pointer">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default QTableModal;
