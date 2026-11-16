import { Check } from "lucide-react";

export type SupportedModelType = "decision_tree" | "random_forest";

interface Props {
  modelType: SupportedModelType;
  onChange: (t: SupportedModelType) => void;
}

const MODELS: { id: SupportedModelType; label: string }[] = [
  { id: "decision_tree", label: "Decision Tree Clasifier" },
  { id: "random_forest", label: "Random Forest Classifier" },
];

export function ModelSelectStep({ modelType, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
        <span>Model</span>
        {/* <span className="capitalize">{modelType.replace("_", " ")}</span> */}
      </div>
      <div className="flex flex-col flex-wrap content-start gap-2 h-full min-h-24">
        {MODELS.map((m) => {
          const isSelected = modelType === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`py-1 rounded-full font-mono transition-all flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? "px-2.5 bg-primary text-primary-foreground shadow-sm"
                  : "px-3 bg-muted text-muted-foreground border border-border hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {isSelected && <Check className="size-4" />}
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default ModelSelectStep;
