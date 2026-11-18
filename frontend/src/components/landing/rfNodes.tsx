import { Handle, Position, NodeProps } from "@xyflow/react";

export function InputFlowNode({ data }: NodeProps) {
  const d = (data || {}) as Record<string, any>;
  return (
    <div className="px-3 py-2 rounded-lg bg-zinc-900 text-white border border-zinc-800 shadow-md font-mono text-[11px] min-w-[115px]">
      <Handle type="source" position={Position.Right} className="!bg-zinc-400 !w-2 !h-2" />
      <div className="font-semibold text-zinc-400 text-[10px] tracking-wider uppercase mb-1">Inputs</div>
      <div className="space-y-0.5 text-zinc-300 text-[10px]">
        <div>dist: <span className="text-white font-bold">{d.dist ?? "--"}</span></div>
        <div>speed: <span className="text-white font-bold">{d.speed ?? "--"}</span></div>
        <div>obs: <span className="text-white font-bold">{d.obsType ?? "none"}</span></div>
      </div>
    </div>
  );
}

export function TreeFlowNode({ data }: NodeProps) {
  const d = (data || {}) as Record<string, any>;
  const active = Boolean(d.active);
  const act = String(d.action || "RUN");
  return (
    <div className={`px-2.5 py-1.5 rounded-lg border font-mono text-[10px] min-w-[120px] transition-all duration-150 shadow-sm ${
      active
        ? "bg-zinc-900 text-white border-zinc-700 ring-2 ring-zinc-500 shadow-md"
        : "bg-white text-zinc-800 border-zinc-200"
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-zinc-400 !w-2 !h-2" />
      <div className="flex items-center justify-between gap-1 mb-0.5">
        <span className="font-bold text-[10px] text-zinc-400">{d.label || "Tree"}</span>
        <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold ${
          act === "JUMP" ? "bg-emerald-500/20 text-emerald-400"
          : act === "DUCK" ? "bg-amber-500/20 text-amber-400"
          : "bg-zinc-200 text-zinc-700"
        }`}>{act}</span>
      </div>
      <div className="text-[9px] text-zinc-400 truncate max-w-[105px]">{d.rule || "eval()"}</div>
      <Handle type="source" position={Position.Right} className="!bg-zinc-400 !w-2 !h-2" />
    </div>
  );
}

export function ActionFlowNode({ data }: NodeProps) {
  const d = (data || {}) as Record<string, any>;
  const act = String(d.action || "RUN");
  const isWinner = Boolean(d.active);
  return (
    <div className={`px-3 py-1.5 rounded-lg border font-mono text-[10px] min-w-[80px] text-center transition-all duration-150 ${
      isWinner
        ? act === "JUMP" ? "bg-emerald-600 text-white border-emerald-500 shadow-md scale-105"
          : act === "DUCK" ? "bg-amber-600 text-white border-amber-500 shadow-md scale-105"
          : "bg-zinc-900 text-white border-zinc-700 shadow-md"
        : "bg-white text-zinc-400 border-zinc-200 opacity-60"
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-zinc-400 !w-2 !h-2" />
      <div className="text-[8px] uppercase tracking-wider text-zinc-400">Action</div>
      <div className="font-bold text-xs">{act}</div>
    </div>
  );
}
