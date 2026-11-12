import React from "react";
import { PlaybackTreeTableRow } from "../types/playback";

interface Props {
  trees: PlaybackTreeTableRow[];
  onSelectTree: (treeNo: number) => void;
}

export const PlaybackTreesTable: React.FC<Props> = ({ trees, onSelectTree }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 max-w-4xl mx-auto h-full text-foreground">
      <div className="border border-border rounded bg-card overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {trees.map((t) => {
              const act = t.action.toLowerCase();
              const badge =
                act === "jump"
                  ? "bg-jump/20 text-jump border-jump"
                  : act === "duck"
                  ? "bg-duck/20 text-duck border-duck"
                  : "bg-none/20 text-muted-foreground border-border";

              return (
                <tr
                  key={t.sr}
                  onClick={() => onSelectTree(t.sr)}
                  className="border-b border-border hover:bg-accent/40 transition-colors cursor-pointer"
                >
                  <td className="p-2.5 font-mono text-muted-foreground w-14">
                    #{t.sr}
                  </td>
                  <td className="p-2.5 truncate max-w-40 font-mono">
                    {t.obstacle1}
                  </td>
                  <td className="p-2.5 font-mono text-center w-24">
                    {t.speed}
                  </td>
                  <td className="p-2.5 text-center w-28">
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${badge}`}>
                      {act}
                    </span>
                  </td>
                  <td className="p-2.5 text-right w-24">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTree(t.sr);
                      }}
                      className="border border-border rounded px-2.5 py-1 text-xs hover:bg-card cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
