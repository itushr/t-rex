import { Check } from "lucide-react";

export type SupportedModelType = "decision_tree" | "random_forest";

interface Props {
  modelType: SupportedModelType;
  onChange: (t: SupportedModelType) => void;
}

const MODELS: { id: SupportedModelType; label: string }[] = [
  { id: "decision_tree", label: "Decision Tree" },
  { id: "random_forest", label: "Random Forest" },
];

export function ModelSelectStep({ modelType, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
        <span>Model</span>
        <span className="capitalize">{modelType.replace("_", " ")}</span>
      </div>
      <div className="p-3 rounded-xl border border-border bg-card flex flex-wrap content-start gap-1.5 h-full min-h-[96px]">
        {MODELS.map((m) => {
          const isSelected = modelType === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1 cursor-pointer ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground border border-border hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {isSelected && <Check className="size-3" />}
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default ModelSelectStep;
