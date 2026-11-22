import React from "react";
import type { TreePathResult } from "@/types/playback";

interface Props {
  trees: TreePathResult[];
  onSelectTree: (treeNo: number) => void;
}

export const PlaybackTreesTable: React.FC<Props> = ({ trees, onSelectTree }) => {
  return (
    <div className="p-6 max-w-3xl mx-auto overflow-y-auto h-full">
      <div className="border border-border rounded bg-card overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-background text-muted-foreground text-[10px] uppercase font-mono text-left">
              <th className="p-2.5 w-16">#</th>
              <th className="p-2.5">Estimator</th>
              <th className="p-2.5">Predicted Action</th>
              <th className="p-2.5 w-24 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody>
            {trees.map((t) => (
              <tr key={t.tree_index} className="border-b border-border hover:bg-accent/40 transition-colors">
                <td className="p-2.5 font-mono text-muted-foreground">#{t.tree_index + 1}</td>
                <td className="p-2.5 font-medium">Estimator #{t.tree_index + 1}</td>
                <td className="p-2.5">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded border border-border bg-background">
                    {t.predicted_action || "NONE"}
                  </span>
                </td>
                <td className="p-2.5 text-right">
                  <button onClick={() => onSelectTree(t.tree_index)} className="border border-border rounded px-2.5 py-1 text-xs hover:bg-card cursor-pointer">
                    View Path
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlaybackTreesTable;
