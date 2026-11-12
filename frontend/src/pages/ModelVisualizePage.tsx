import { useEffect, useState } from "react";
import { fetchModelInfo, fetchModelSingleTree } from "../services/api";
import { ModelInfo } from "../types/model";
import { TreeNode } from "../types/tree";
import { TreeViewer } from "../components/TreeViewer";
import { NodeModal } from "../components/NodeModal";
import { DinoIcon } from "../components/DinoIcon";
import { navigateTo } from "../utils/navigation";

export function ModelVisualizePage({ modelName, treeIndex }: { modelName: string; treeIndex?: number }) {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [inspected, setInspected] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModelInfo(modelName).then((res) => {
      setInfo(res);
      if (res.model_type === "decision_tree") {
        fetchModelSingleTree(modelName, 0).then((t) => { setTree(t.tree); setLoading(false); });
      } else { setLoading(false); }
    });
  }, [modelName]);

  useEffect(() => {
    if (!info || info.model_type !== "random_forest" || !treeIndex) return;
    setLoading(true);
    fetchModelSingleTree(modelName, treeIndex - 1).then((t) => { setTree(t.tree); setLoading(false); });
  }, [modelName, info, treeIndex]);

  const isForestList = info?.model_type === "random_forest" && !treeIndex;

  return (
    <div className="visualizer-theme flex flex-col h-screen w-screen overflow-hidden text-foreground bg-background">
      <header className="border-b border-border px-2 py-2.5 flex items-center justify-between flex-wrap gap-3 z-30 bg-background text-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <DinoIcon />
            <span className="font-semibold text-sm">{modelName}</span>
          </span>
          <span className="border border-border rounded px-2 py-0.5 text-xs text-muted-foreground uppercase">{info?.model_type ?? ""}</span>
          {treeIndex && <span className="text-xs font-mono font-medium">Tree #{treeIndex} of {info?.n_estimators}</span>}
        </div>
        {treeIndex && info?.model_type === "random_forest" && (
          <button
            onClick={() => navigateTo(`/visualize/model/${modelName}`)}
            className="border border-border rounded px-2.5 py-1 text-xs hover:bg-card cursor-pointer transition-colors"
          >
            ← Back to Trees
          </button>
        )}
      </header>

      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Loading model tree...</div>
        ) : isForestList ? (
          <div className="p-6 max-w-2xl mx-auto overflow-y-auto h-full">
            <div className="border border-border rounded bg-card overflow-hidden">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-background text-muted-foreground text-[10px] uppercase font-mono text-left">
                    <th className="p-2.5 w-16">SR</th>
                    <th className="p-2.5">Tree</th>
                    <th className="p-2.5 w-24 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: info.n_estimators }).map((_, i) => (
                    <tr key={i} className="border-b border-border hover:bg-accent/40 transition-colors">
                      <td className="p-2.5 font-mono text-muted-foreground">#{i + 1}</td>
                      <td className="p-2.5 font-medium">Estimator {i + 1}</td>
                      <td className="p-2.5 text-right">
                        <button
                          onClick={() => navigateTo(`/visualize/model/${modelName}/tree/${i + 1}`)}
                          className="border border-border rounded px-2.5 py-1 text-xs hover:bg-card cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-full w-full relative">
            <TreeViewer tree={tree} onSelectNode={(node) => setInspected(node)} />
            <NodeModal node={inspected} onClose={() => setInspected(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
