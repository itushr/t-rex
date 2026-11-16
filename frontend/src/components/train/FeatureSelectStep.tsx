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
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
        <span>Sensory Inputs</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={selectAll} className="hover:text-foreground cursor-pointer underline">All</button>
          <span>•</span>
          <button type="button" onClick={selectCore} className="hover:text-foreground cursor-pointer underline">Core 4</button>
          <span>•</span>
          <span>{selected.length}/{ALL_FEATURES.length} active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => {
          const catFeatures = ALL_FEATURES.filter((f) => f.category === cat);
          return (
            <div key={cat} className="p-3 rounded-xl border border-border bg-card flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase text-muted-foreground tracking-wider">{cat}</span>
              <div className="flex flex-wrap gap-1.5">
                {catFeatures.map((feat) => {
                  const isChecked = selected.includes(feat.id);
                  return (
                    <button
                      key={feat.id}
                      type="button"
                      onClick={() => toggle(feat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                        isChecked
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted text-muted-foreground border border-border hover:border-foreground/30 hover:text-foreground"
                      }`}
                      title={feat.desc}
                    >
                      {isChecked && <Check className="size-3" />}
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
export default FeatureSelectStep;
