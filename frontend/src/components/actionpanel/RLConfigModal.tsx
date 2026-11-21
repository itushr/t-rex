import { useState } from "react";
import { X, Check } from "lucide-react";
import { AVAILABLE_FEATURES, AVAILABLE_ACTIONS } from "../../games/trex/rl/constants";
import type { DinoAction, RLConfig, RewardConfig } from "../../games/trex/rl/types";

interface RLConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RLConfig;
  onSave: (config: RLConfig) => void;
}

export function RLConfigModal({ isOpen, onClose, config, onSave }: RLConfigModalProps) {
  const [tab, setTab] = useState<"features" | "rewards" | "actions">("features");
  const [draft, setDraft] = useState<RLConfig>(config);

  if (!isOpen) return null;

  const toggleFeature = (feat: string) => {
    const has = draft.features.includes(feat);
    if (has && draft.features.length <= 1) return;
    const next = has ? draft.features.filter((f) => f !== feat) : [...draft.features, feat];
    setDraft({ ...draft, features: next });
  };

  const toggleAction = (act: DinoAction) => {
    const has = draft.actions.includes(act);
    if (has && draft.actions.length <= 1) return;
    const next = has ? draft.actions.filter((a) => a !== act) : [...draft.actions, act];
    setDraft({ ...draft, actions: next });
  };

  const toggleReward = (key: keyof RewardConfig) => {
    setDraft({ ...draft, enabledRewards: { ...draft.enabledRewards, [key]: !draft.enabledRewards[key] } });
  };

  const updateRewardValue = (key: keyof RewardConfig, val: number) => {
    setDraft({ ...draft, rewards: { ...draft.rewards, [key]: val } });
  };

  const handleApply = () => {
    onSave(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-[#0f0f11] text-white border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scale-y-125">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <h3 className="font-semibold text-sm tracking-wide">DQN RL Configuration</h3>
          <button type="button" onClick={onClose} className="p-1 text-neutral-400 hover:text-white cursor-pointer"><X className="size-4" /></button>
        </div>

        <div className="flex border-b border-neutral-800 bg-[#09090b] text-xs">
          {(["features", "rewards", "actions"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`flex-1 py-2.5 font-medium capitalize transition-colors cursor-pointer ${tab === t ? "text-white border-b-2 border-white" : "text-neutral-400 hover:text-neutral-200"}`}>{t}</button>
          ))}
        </div>

        <div className="p-5 max-h-64 overflow-y-auto space-y-2.5 text-xs">
          {tab === "features" && AVAILABLE_FEATURES.map((f) => (
            <label key={f.key} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-pointer hover:bg-neutral-800/50">
              <input type="checkbox" checked={draft.features.includes(f.key)} onChange={() => toggleFeature(f.key)} className="rounded accent-white size-3.5" />
              <span className="font-mono">{f.label}</span>
            </label>
          ))}

          {tab === "rewards" && (Object.keys(draft.rewards) as (keyof RewardConfig)[]).map((k) => (
            <div key={k} className="flex items-center justify-between p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 hover:bg-neutral-800/50">
              <label className="flex items-center gap-3 cursor-pointer flex-1">
                <input type="checkbox" checked={draft.enabledRewards[k]} onChange={() => toggleReward(k)} className="rounded accent-white size-3.5" />
                <span className="font-mono capitalize">{k.replace("_", " ")}</span>
              </label>
              <input
                type="number" step="any" value={draft.rewards[k]}
                onChange={(e) => updateRewardValue(k, parseFloat(e.target.value) || 0)}
                className="w-20 px-2 py-1 rounded bg-neutral-800 border border-neutral-700 text-right font-mono text-xs text-white focus:outline-none focus:border-white"
              />
            </div>
          ))}

          {tab === "actions" && AVAILABLE_ACTIONS.map((a) => (
            <label key={a.key} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-pointer hover:bg-neutral-800/50">
              <input type="checkbox" checked={draft.actions.includes(a.key)} onChange={() => toggleAction(a.key)} className="rounded accent-white size-3.5" />
              <span className="font-mono">{a.label}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-neutral-800 bg-[#09090b]">
          <button type="button" onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs text-neutral-300 hover:bg-neutral-800 cursor-pointer">Cancel</button>
          <button type="button" onClick={handleApply} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-neutral-200 cursor-pointer"><Check className="size-3.5" /> Apply</button>
        </div>
      </div>
    </div>
  );
}

export default RLConfigModal;
