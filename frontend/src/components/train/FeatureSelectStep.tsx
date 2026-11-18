import { Check } from "lucide-react";
import { ALL_FEATURES } from "./featureList";
import { FeatureOption } from "../../types/train";

interface Props {
  selected: string[];
  features?: FeatureOption[];
  onChange: (features: string[]) => void;
}

export function FeatureSelectStep({ selected, features = ALL_FEATURES, onChange }: Props) {
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length <= 1) return;
      onChange(selected.filter((f) => f !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
        <span>Inputs</span>
      </div>
      <div className="rounded-xl flex flex-wrap justify-between gap-2 h-full min-h-24">
        {features.map((feat) => {
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
