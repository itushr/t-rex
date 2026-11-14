import { GameSample } from "../../types/train";

interface Props {
  samples: GameSample[];
  trimRange: [number, number];
  onChange: (range: [number, number]) => void;
}

export function TrimGameplayStep({ samples, trimRange, onChange }: Props) {
  const total = samples.length;
  const [start, end] = trimRange;
  const activeSamples = samples.slice(start, end);
  const jumps = activeSamples.filter((s) => s.action === "jump").length;
  const ducks = activeSamples.filter((s) => s.action === "duck").length;
  const nones = activeSamples.length - jumps - ducks;

  const handleStart = (val: number) => {
    const s = Math.max(0, Math.min(val, end - 10));
    onChange([s, end]);
  };

  const handleEnd = (val: number) => {
    const e = Math.min(total, Math.max(val, start + 10));
    onChange([start, e]);
  };

  return (
    <div className="bg-white border border-[#DDD6CB] rounded-2xl p-6 md:p-8 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD6CB] pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6E6962]">Step 01</span>
          <h2 className="text-xl font-medium tracking-tight text-black mt-1">Trim Gameplay Data</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange([0, total])}
            className="text-xs px-3 py-1.5 rounded-full border border-[#DDD6CB] bg-[#F7F4ED] text-black hover:border-black transition-colors"
          >
            All ({total})
          </button>
          <button
            type="button"
            onClick={() => onChange([Math.min(15, Math.floor(total * 0.1)), Math.max(20, total - 10)])}
            className="text-xs px-3 py-1.5 rounded-full border border-[#DDD6CB] bg-[#F7F4ED] text-black hover:border-black transition-colors"
          >
            Trim Edges
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        <div className="p-3 bg-[#F7F4ED]/60 rounded-xl border border-[#DDD6CB]/60">
          <span className="text-[11px] font-mono uppercase text-[#6E6962]">Active Frames</span>
          <p className="text-lg font-mono font-medium text-black mt-0.5">{activeSamples.length} / {total}</p>
        </div>
        <div className="p-3 bg-[#F7F4ED]/60 rounded-xl border border-[#DDD6CB]/60">
          <span className="text-[11px] font-mono uppercase text-[#6E6962]">Jumps / Ducks</span>
          <p className="text-lg font-mono font-medium text-black mt-0.5">{jumps} / {ducks}</p>
        </div>
        <div className="p-3 bg-[#F7F4ED]/60 rounded-xl border border-[#DDD6CB]/60">
          <span className="text-[11px] font-mono uppercase text-[#6E6962]">Running (None)</span>
          <p className="text-lg font-mono font-medium text-black mt-0.5">{nones}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-[#6E6962]">
          <span>Frame {start} (Start)</span>
          <span>Frame {end} (End)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-mono text-[#6E6962] block mb-1">Start Offset</label>
            <input
              type="range" min={0} max={Math.max(0, end - 10)} value={start}
              onChange={(e) => handleStart(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-[#6E6962] block mb-1">End Cutoff</label>
            <input
              type="range" min={Math.min(total, start + 10)} max={total} value={end}
              onChange={(e) => handleEnd(Number(e.target.value))}
              className="w-full accent-black cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
