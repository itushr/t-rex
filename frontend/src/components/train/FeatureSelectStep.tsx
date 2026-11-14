import { Check } from "lucide-react";
import { ALL_FEATURES, CATEGORIES } from "./featureList";

interface Props {
  selected: string[];
  onChange: (features: string[]) => void;
}

export function FeatureSelectStep({ selected, onChange }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length <= 1) return;
      onChange(selected.filter((f) => f !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectAll = () => onChange(ALL_FEATURES.map((f) => f.id));
  const selectCore = () => onChange(["obstacle1_x", "speed", "jumping", "time_to_impact"]);

  return (
    <div className="bg-white border border-[#DDD6CB] rounded-2xl p-6 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD6CB] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6E6962]">Step 03</span>
          <h2 className="text-xl font-medium tracking-tight text-black mt-1">Select Input Features</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs px-3 py-1.5 rounded-full border border-[#DDD6CB] bg-[#F7F4ED] text-black hover:border-black transition-colors"
          >
            All ({ALL_FEATURES.length})
          </button>
          <button
            type="button"
            onClick={selectCore}
            className="text-xs px-3 py-1.5 rounded-full border border-[#DDD6CB] bg-[#F7F4ED] text-black hover:border-black transition-colors"
          >
            Core 4
          </button>
          <span className="text-xs font-mono text-[#6E6962] ml-2">
            {selected.length}/{ALL_FEATURES.length} Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CATEGORIES.map((cat) => {
          const catFeatures = ALL_FEATURES.filter((f) => f.category === cat);
          return (
            <div key={cat} className="p-4 rounded-xl border border-[#DDD6CB]/60 bg-[#F7F4ED]/50 flex flex-col gap-3">
              <span className="text-xs font-mono uppercase text-[#6E6962] tracking-wider">{cat}</span>
              <div className="flex flex-wrap gap-2">
                {catFeatures.map((feat) => {
                  const isChecked = selected.includes(feat.id);
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => toggle(feat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                        isChecked
                          ? "bg-black text-[#F7F4ED] shadow-sm"
                          : "bg-white text-[#6E6962] border border-[#DDD6CB] hover:border-black hover:text-black"
                      }`}
                      title={feat.desc}
                    >
                      {isChecked && <Check className="size-3 stroke-[2.5]" />}
                      <span>{feat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
