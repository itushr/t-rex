import { GLOBAL_MODELS } from "@/constants/models";

interface ModelSelectorProps {
  selectedModel?: string;
  onSelectModel?: (modelId: string) => void;
  allowedModels?: string[];
}

export function ModelSelector({ selectedModel, onSelectModel, allowedModels }: ModelSelectorProps) {
  const models = GLOBAL_MODELS.filter((m) =>
    allowedModels ? allowedModels.includes(m.id) : m.category === "reinforcement" || m.id === "q_learning"
  );
  if (models.length <= 1) return null;

  return (
    <select
      value={selectedModel || models[0]?.id}
      onChange={(e) => onSelectModel?.(e.target.value)}
      className="bg-neutral-900 text-white text-xs px-2.5 py-1.5 rounded-md border border-neutral-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
    >
      {models.map((m) => (
        <option key={m.id} value={m.id}>
          {m.name}
        </option>
      ))}
    </select>
  );
}
export default ModelSelector;
