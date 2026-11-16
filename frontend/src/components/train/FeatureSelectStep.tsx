import { Check } from "lucide-react";
import { ALL_FEATURES } from "./featureList";

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
        <span>Inputs</span>
        {/* <div className="flex items-center gap-2">
          <button type="button" onClick={selectAll} className="hover:text-foreground cursor-pointer underline">All</button>
          <span>•</span>
          <button type="button" onClick={selectCore} className="hover:text-foreground cursor-pointer underline">Core 4</button>
          <span>•</span>
          <span>{selected.length}/{ALL_FEATURES.length}</span>
        </div> */}
      </div>
      <div className="rounded-xl flex flex-wrap justify-between gap-2 h-full min-h-24">
        {ALL_FEATURES.map((feat) => {
          const isChecked = selected.includes(feat.id);
          return (
            <button
              key={feat.id}
              type="button"
              onClick={() => toggle(feat.id)}
              className={`px-2.5 py-1 rounded-full font-mono transition-all flex items-center gap-2 cursor-pointer ${
                isChecked
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground border border-border hover:border-foreground/30 hover:text-foreground"
              }`}
              title={feat.desc}
            >
              {isChecked && <Check className="size-4" />}
              <span>{feat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default FeatureSelectStep;
