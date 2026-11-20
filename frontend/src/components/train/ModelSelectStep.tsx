import { Check } from "lucide-react";
import { getModelDefinition } from "../../constants/models";

export type SupportedModelType = string;

interface Props {
  modelType: string;
  models?: readonly string[];
  onChange: (t: any) => void;
}

const DEFAULT_MODELS = ["decision_tree", "random_forest"];

export function ModelSelectStep({ modelType, models = DEFAULT_MODELS, onChange }: Props) {
  const modelOptions = models.map((id) => {
    const def = getModelDefinition(id);
    return { id, label: def ? def.name : id.replace("_", " ") };
  });

  return (
    <div className="w-full h-fit border-2 border-border rounded-xl text-card-foreground p-1 block">
      <div className="h-full bg-card rounded-xl shadow-sm p-8 flex">
        <div className="flex flex-col gap-2.5 w-full">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
            <span>Model</span>
          </div>
          <div className="flex flex-col flex-wrap content-start gap-2 h-full min-h-24">
            {modelOptions.map((m) => {
              const isSelected = modelType === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChange(m.id)}
                  className={`py-1 rounded-full font-mono transition-all flex items-center gap-2 cursor-pointer ${isSelected
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
      </div>
    </div>
  );
}
export default ModelSelectStep;
