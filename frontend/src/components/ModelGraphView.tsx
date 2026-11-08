import React, { useState, useEffect } from "react";
import { fetchModels, fetchModelGraph } from "../services/api";
import { ModelSummary } from "../types/model";
import { TreeNode } from "../types/tree";
import { TreeViewer } from "./TreeViewer";
import { ForestSelector } from "./ForestSelector";
import { NodeModal } from "./NodeModal";

export const ModelGraphView: React.FC = () => {
  const [models, setModels] = useState<ModelSummary[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [graphData, setGraphData] = useState<any>(null);
  const [activeTreeIndex, setActiveTreeIndex] = useState<number>(0);
  const [inspectedNode, setInspectedNode] = useState<TreeNode | null>(null);

  useEffect(() => {
    fetchModels().then((data) => {
      setModels(data);
      if (data.length > 0) setSelectedModel(data[0].name);
    });
  }, []);

  useEffect(() => {
    if (!selectedModel) return;
    fetchModelGraph(selectedModel).then((data) => {
      setGraphData(data);
      setActiveTreeIndex(0);
    });
  }, [selectedModel]);

  const currentTree: TreeNode | null = graphData?.graph?.trees?.[activeTreeIndex] ?? null;
  const nEstimators = graphData?.graph?.n_estimators ?? 1;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-bg-primary">
      <div className="p-3 bg-bg-panel border-b border-border-default flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs text-text-muted">Select model:</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-bg-card border border-border-default text-text-primary text-xs rounded px-2.5 py-1 outline-none"
          >
            {models.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name} ({m.model_type})
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs font-mono-code text-text-dim">
          {graphData?.features?.length ?? 0} features | {nEstimators} tree{nEstimators > 1 ? "s" : ""}
        </span>
      </div>

      {nEstimators > 1 && (
        <div className="px-3 py-2 bg-bg-panel border-b border-border-default">
          <ForestSelector
            nEstimators={nEstimators}
            activeTreeIndex={activeTreeIndex}
            onSelectTree={(idx) => setActiveTreeIndex(idx)}
          />
        </div>
      )}

      <div className="relative flex-1 overflow-hidden">
        <TreeViewer
          tree={currentTree}
          titleBadge={nEstimators > 1 ? `Tree ${activeTreeIndex + 1} of ${nEstimators}` : "Decision tree"}
          onSelectNode={(node) => setInspectedNode(node)}
        />
        <NodeModal node={inspectedNode} onClose={() => setInspectedNode(null)} />
      </div>
    </div>
  );
};
