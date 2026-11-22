import { useState } from "react";
import { X, Check, Lock } from "lucide-react";
import { FIXED_DINO_STATES, AVAILABLE_ACTIONS } from "../../games/t-rex/rl/constants";
import type { DinoAction, RLConfig, RewardConfig } from "../../games/t-rex/rl/types";

interface Props {
  isOpen: boolean; onClose: () => void; config: RLConfig; onSave: (config: RLConfig) => void;
}

export function RLConfigModal({ isOpen, onClose, config, onSave }: Props) {
  const [tab, setTab] = useState<"parameters" | "rewards" | "actions" | "states">("parameters");
  const [draft, setDraft] = useState<RLConfig>(config);
  if (!isOpen) return null;

  const states = config.stateDefs ?? FIXED_DINO_STATES;
  const actions = (config.availableActions as { key: DinoAction; label: string }[]) ?? AVAILABLE_ACTIONS;

  const toggleAction = (act: DinoAction) => {
    if (draft.actions.includes(act) && draft.actions.length <= 1) return;
    const next = draft.actions.includes(act) ? draft.actions.filter((a) => a !== act) : [...draft.actions, act];
    setDraft({ ...draft, actions: next });
  };

  const toggleReward = (k: keyof RewardConfig) => {
    setDraft({ ...draft, enabledRewards: { ...draft.enabledRewards, [k]: !draft.enabledRewards[k] } });
  };

  const updateReward = (k: keyof RewardConfig, val: number) => {
    setDraft({ ...draft, rewards: { ...draft.rewards, [k]: val } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#0f0f11] text-white border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scale-y-125">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h3 className="font-semibold text-sm tracking-wide">Q-Network RL Configuration</h3>
          <button type="button" onClick={onClose} className="p-1 text-neutral-400 hover:text-white cursor-pointer"><X className="size-4" /></button>
        </div>
        <div className="flex border-b border-neutral-800 bg-[#09090b] text-xs">
          {(["parameters", "rewards", "actions", "states"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`flex-1 py-2.5 font-medium capitalize transition-colors cursor-pointer ${tab === t ? "text-white border-b-2 border-white" : "text-neutral-400 hover:text-neutral-200"}`}>{t}</button>
          ))}
        </div>
        <div className="p-5 max-h-64 overflow-y-auto space-y-2.5 text-xs">
          {tab === "parameters" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/60 border border-neutral-800">
                <div className="flex flex-col gap-0.5"><span className="font-mono text-white">Learning Rate (α)</span><span className="text-[10px] text-neutral-400">Step size for Q updates</span></div>
                <input type="number" step="0.01" min="0.01" max="1" value={draft.alpha} onChange={(e) => setDraft({ ...draft, alpha: Math.max(0.01, parseFloat(e.target.value) || 0.01) })} className="w-20 px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-right font-mono text-xs text-white focus:outline-none focus:border-white" />
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/60 border border-neutral-800">
                <div className="flex flex-col gap-0.5"><span className="font-mono text-white">Discount Factor (γ)</span><span className="text-[10px] text-neutral-400">Future reward discount</span></div>
                <input type="number" step="0.01" min="0" max="0.99" value={draft.gamma} onChange={(e) => setDraft({ ...draft, gamma: Math.min(0.99, Math.max(0, parseFloat(e.target.value) || 0)) })} className="w-20 px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-right font-mono text-xs text-white focus:outline-none focus:border-white" />
              </div>
            </div>
          )}
          {tab === "rewards" && (Object.keys(draft.rewards) as (keyof RewardConfig)[]).map((k) => (
            <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 hover:bg-neutral-800/50">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <input type="checkbox" checked={draft.enabledRewards[k]} onChange={() => toggleReward(k)} className="rounded accent-white size-3.5" />
                <span className="font-mono capitalize">{String(k).replace(/_/g, " ")}</span>
              </label>
              <input type="number" step="any" value={draft.rewards[k]} onChange={(e) => updateReward(k, parseFloat(e.target.value) || 0)} className="w-20 px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-right font-mono text-xs text-white focus:outline-none focus:border-white" />
            </div>
          ))}
          {tab === "actions" && actions.map((a) => (
            <label key={a.key} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-pointer hover:bg-neutral-800/50">
              <input type="checkbox" checked={draft.actions.includes(a.key)} onChange={() => toggleAction(a.key)} className="rounded accent-white size-3.5" />
              <span className="font-mono">{a.label}</span>
            </label>
          ))}
          {tab === "states" && states.map((s) => (
            <div key={s.key} className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900/40 border border-neutral-800/80">
              <div className="flex flex-col gap-0.5"><span className="font-mono font-semibold text-white">{s.label}</span><span className="text-[10px] text-neutral-400">{s.desc}</span></div>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700"><Lock className="size-2.5 text-neutral-400" /> Non-editable</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-neutral-800 bg-[#09090b]">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-neutral-300 hover:bg-neutral-800 cursor-pointer">Cancel</button>
          <button type="button" onClick={() => { onSave(draft); onClose(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 cursor-pointer"><Check className="size-3.5" /> Apply</button>
        </div>
      </div>
    </div>
  );
}

export default RLConfigModal;
