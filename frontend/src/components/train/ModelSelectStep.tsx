import { Check, GitFork, Network } from "lucide-react";

export type SupportedModelType = "decision_tree" | "random_forest";

interface Props {
  modelType: SupportedModelType;
  onChange: (t: SupportedModelType) => void;
}

const MODELS = [
  { id: "decision_tree" as const, name: "Decision Tree", desc: "Single tree, fast & interpretable", icon: GitFork },
  { id: "random_forest" as const, name: "Random Forest", desc: "10-tree ensemble, higher generalization", icon: Network },
];

export function ModelSelectStep({ modelType, onChange }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
        <span>Architecture</span>
        <span className="capitalize">{modelType.replace("_", " ")}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODELS.map((m) => {
          const isSelected = modelType === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? "border-primary bg-primary/10 text-foreground ring-1 ring-primary"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Icon className="size-4" />
                </div>
                <div>
                  <span className="font-medium text-sm text-foreground block">{m.name}</span>
                  <span className="text-xs text-muted-foreground">{m.desc}</span>
                </div>
              </div>
              {isSelected && <Check className="size-4 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default ModelSelectStep;
