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

export function CircleNode({ data }: NodeProps) {
  const d = (data || {}) as Record<string, any>;
  const isHub = d.variant === "hub";
  return (
    <div
      className="w-7 h-7 rounded-full border-[1.5px] border-zinc-900 bg-white relative transition-transform"
      style={{ animation: `${isHub ? "pulseHub" : "pulseTrees"} var(--pred-dur, 1s) infinite ease-in-out` }}
    >
      <Handle type="target" position={Position.Left} className="!w-1 !h-1 !bg-zinc-800 !border-0" />
      <Handle type="source" position={Position.Right} className="!w-1 !h-1 !bg-zinc-800 !border-0" />
    </div>
  );
}

export function ActionLabelNode({ data }: NodeProps) {
  const d = (data || {}) as Record<string, any>;
  return (
    <div
      className="font-mono text-[13px] text-zinc-900 select-none py-1 relative"
      style={{ animation: "pulseAction var(--pred-dur, 1s) infinite ease-in-out" }}
    >
      <Handle type="target" position={Position.Left} className="!w-1 !h-1 !bg-zinc-800 !border-0" />
      <span>{d.action}</span>
    </div>
  );
}
