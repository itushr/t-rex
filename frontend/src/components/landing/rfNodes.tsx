import { Handle, Position, NodeProps } from "@xyflow/react";

export function FeatureLabelNode({ data }: NodeProps) {
  const d = (data || {}) as Record<string, any>;
  return (
    <div className="font-mono text-[13px] text-zinc-900 select-none py-1 relative">
      <span>{d.label}</span>
      <Handle type="source" position={Position.Right} className="!w-1 !h-1 !bg-zinc-800 !border-0" />
    </div>
  );
}

export function CircleNode() {
  return (
    <div className="w-7 h-7 rounded-full border-[1.5px] border-zinc-900 bg-white relative">
      <Handle type="target" position={Position.Left} className="!w-1 !h-1 !bg-zinc-800 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-1 !h-1 !bg-zinc-800 !border-0" />
    </div>
  );
}

export function ActionLabelNode({ data }: NodeProps) {
  const d = (data || {}) as Record<string, any>;
  const dur = (d.dur as string) || "1s";
  return (
    <div className="font-mono text-[13px] text-zinc-900 select-none py-1 relative">
      <Handle type="target" position={Position.Left} className="!w-1 !h-1 !bg-zinc-800 !border-0" />
      <span style={{ animation: `rfActionPulse ${dur} linear infinite` }}>
        {d.action}
      </span>
    </div>
  );
}
