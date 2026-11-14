import { Check, GitFork, Network } from "lucide-react";

export type SupportedModelType = "decision_tree" | "random_forest";

interface Props {
  modelType: SupportedModelType;
  onChange: (t: SupportedModelType) => void;
}

const MODELS = [
  {
    id: "decision_tree" as const,
    name: "Decision Tree",
    badge: "Interpretable",
    desc: "Single transparent tree. Instant training, explicit branch thresholds.",
    icon: GitFork,
  },
  {
    id: "random_forest" as const,
    name: "Random Forest",
    badge: "10 Estimators",
    desc: "Ensemble forest. Higher generalization across speed spikes & bird patterns.",
    icon: Network,
  },
];

export function ModelSelectStep({ modelType, onChange }: Props) {
  return (
    <div className="bg-white border border-[#DDD6CB] rounded-2xl p-6 md:p-8 flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DDD6CB] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6E6962]">Step 02</span>
          <h2 className="text-xl font-medium tracking-tight text-black mt-1">Select Architecture</h2>
        </div>
        <span className="text-xs font-mono text-[#6E6962] self-start sm:self-auto capitalize">
          Active: {modelType.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODELS.map((m) => {
          const isSelected = modelType === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`p-5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? "border-black ring-1 ring-black bg-[#F7F4ED]/40"
                  : "border-[#DDD6CB] hover:border-black/60 bg-white"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg ${isSelected ? "bg-black text-[#F7F4ED]" : "bg-[#F7F4ED] text-black"}`}>
                    <Icon className="size-4" />
                  </div>
                  <span className="font-medium text-sm text-black">{m.name}</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  isSelected ? "bg-black text-[#F7F4ED] border-black" : "bg-[#F7F4ED] text-[#6E6962] border-[#DDD6CB]"
                }`}>
                  {m.badge}
                </span>
              </div>
              <p className="text-xs text-[#6E6962] leading-relaxed">{m.desc}</p>
              {isSelected && (
                <div className="flex items-center gap-1 text-[11px] font-mono text-black font-medium mt-1">
                  <Check className="size-3" /> Selected Model
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
