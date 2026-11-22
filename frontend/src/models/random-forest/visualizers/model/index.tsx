import { useEffect, useState } from "react";
import { fetchModelInfo, fetchModelSingleTree } from "@/services/api";
import { getPrivateModelInfo, getPrivateModelSingleTree } from "@/services/privateApi";
import type { ModelInfo } from "@/types/model";
import type { TreeNode } from "@/types/tree";
import { TreeViewer } from "@/components/visualizer/TreeViewer";
import { NodeModal } from "@/components/visualizer/NodeModal";
import { ForestSelector } from "../ForestSelector";

export interface ModelVisualizerProps {
  modelName: string;
  isPrivate?: boolean;
}

export function RandomForestModelVisualizer({ modelName, isPrivate = false }: ModelVisualizerProps) {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [selectedTree, setSelectedTree] = useState<number | null>(null);
  const [inspected, setInspected] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);

  const getInfo = isPrivate ? getPrivateModelInfo : fetchModelInfo;
  const getTree = isPrivate ? getPrivateModelSingleTree : fetchModelSingleTree;

  useEffect(() => {
    getInfo(modelName).then((res: ModelInfo) => { setInfo(res); setLoading(false); });
  }, [modelName, isPrivate]);

  useEffect(() => {
    if (selectedTree === null) return;
    setLoading(true);
    getTree(modelName, selectedTree).then((t: any) => { setTree(t.tree); setLoading(false); });
  }, [modelName, selectedTree, isPrivate]);

  const nEstimators = info?.n_estimators || 0;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden text-foreground bg-background">
      <header className="border-b border-border px-4 py-2.5 flex items-center justify-between flex-wrap gap-3 bg-background z-20">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">{modelName}</span>
          <span className="border border-border rounded px-2 py-0.5 text-xs text-muted-foreground uppercase">Random Forest</span>
          {isPrivate && <span className="bg-primary text-primary-foreground rounded px-2 py-0.5 text-xs font-mono">Private</span>}
          <span className="text-xs text-muted-foreground">{nEstimators} Estimators</span>
          {selectedTree !== null && <span className="text-xs font-mono font-medium text-primary">Tree #{selectedTree + 1}</span>}
        </div>
        {selectedTree !== null && (
          <button onClick={() => setSelectedTree(null)} className="border border-border rounded px-2.5 py-1 text-xs hover:bg-card cursor-pointer">
            ← Back to Overview
          </button>
        )}
      </header>
      {selectedTree !== null && nEstimators > 1 && (
        <div className="px-4 py-2 border-b border-border bg-card/40">
          <ForestSelector nEstimators={nEstimators} activeTreeIndex={selectedTree} onSelectTree={(idx) => setSelectedTree(idx)} />
        </div>
      )}
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Loading tree...</div>
        ) : selectedTree === null ? (
          <div className="p-6 max-w-2xl mx-auto overflow-y-auto h-full">
            <div className="border border-border rounded bg-card overflow-hidden">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-background text-muted-foreground text-[10px] uppercase font-mono text-left">
                    <th className="p-2.5 w-16">#</th><th className="p-2.5">Estimator</th><th className="p-2.5 w-24 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: nEstimators }).map((_, i) => (
                    <tr key={i} className="border-b border-border hover:bg-accent/40 transition-colors">
                      <td className="p-2.5 font-mono text-muted-foreground">#{i + 1}</td>
                      <td className="p-2.5 font-medium">Estimator #{i + 1}</td>
                      <td className="p-2.5 text-right">
                        <button onClick={() => setSelectedTree(i)} className="border border-border rounded px-2.5 py-1 text-xs hover:bg-card cursor-pointer">View Tree</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-full w-full relative">
            <TreeViewer tree={tree} onSelectNode={(node: TreeNode) => setInspected(node)} />
            <NodeModal node={inspected} onClose={() => setInspected(null)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default RandomForestModelVisualizer;
