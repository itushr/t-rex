import { useEffect, useState } from "react";
import { fetchModelInfo, fetchModelSingleTree } from "@/services/api";
import { getPrivateModelInfo, getPrivateModelSingleTree } from "@/services/privateApi";
import type { ModelInfo } from "@/types/model";
import type { TreeNode } from "@/types/tree";
import { TreeViewer } from "@/components/visualizer/TreeViewer";
import { NodeModal } from "@/components/visualizer/NodeModal";

export interface ModelVisualizerProps {
  modelName: string;
  isPrivate?: boolean;
}

export function DecisionTreeModelVisualizer({ modelName, isPrivate = false }: ModelVisualizerProps) {
  const [info, setInfo] = useState<ModelInfo | null>(null);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [inspected, setInspected] = useState<TreeNode | null>(null);
  const [loading, setLoading] = useState(true);

  const getInfo = isPrivate ? getPrivateModelInfo : fetchModelInfo;
  const getTree = isPrivate ? getPrivateModelSingleTree : fetchModelSingleTree;

  useEffect(() => {
    getInfo(modelName).then((res: ModelInfo) => {
      setInfo(res);
      getTree(modelName, 0).then((t: any) => {
        setTree(t.tree);
        setLoading(false);
      });
    });
  }, [modelName, isPrivate]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden text-foreground bg-background">
      <header className="border-b border-border px-4 py-2.5 flex items-center justify-between flex-wrap gap-3 bg-background z-20">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-sm">{modelName}</span>
          <span className="border border-border rounded px-2 py-0.5 text-xs text-muted-foreground uppercase">{info?.model_type ?? "decision_tree"}</span>
          {isPrivate && <span className="bg-primary text-primary-foreground rounded px-2 py-0.5 text-xs font-mono">Private</span>}
          {(info as any)?.max_depth && <span className="text-xs text-muted-foreground">Depth: {(info as any).max_depth}</span>}
        </div>
      </header>
      <div className="flex-1 overflow-hidden relative">
        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Loading tree...</div>
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

export default DecisionTreeModelVisualizer;
