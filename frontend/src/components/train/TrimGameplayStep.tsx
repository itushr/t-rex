import { useRef, useState } from "react";
import { GameSample } from "../../types/train";

interface Props {
  samples: GameSample[];
  trimRange: [number, number];
  onChange: (range: [number, number]) => void;
}

const BARS = 64;

export function TrimGameplayStep({ samples, trimRange, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"start" | "end" | null>(null);
  const total = samples.length;
  const [start, end] = trimRange;

  const active = samples.slice(start, end);
  const jumps = active.filter((s) => s.action === "jump").length;
  const ducks = active.filter((s) => s.action === "duck").length;
  const nones = active.length - jumps - ducks;

  const barData = Array.from({ length: BARS }, (_, i) => {
    const sIdx = Math.floor((i * total) / BARS);
    const eIdx = Math.max(sIdx + 1, Math.floor(((i + 1) * total) / BARS));
    const slice = samples.slice(sIdx, eIdx);
    const h = slice.some((s) => s.action === "jump") ? 88 : slice.some((s) => s.action === "duck") ? 54 : 18;
    return { h, inRange: sIdx >= start && sIdx <= end };
  });

  const updateFromPointer = (e: React.PointerEvent) => {
    if (!dragging || !containerRef.current || total === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.round(pct * total);
    if (dragging === "start") onChange([Math.min(idx, end - 10), end]);
    else onChange([start, Math.max(idx, start + 10)]);
  };

  const startPct = total ? (start / total) * 100 : 0;
  const endPct = total ? (end / total) * 100 : 100;

  return (
    <div className="w-full border-2 border-border rounded-xl text-card-foreground p-1 block">
      <div className="bg-card rounded-xl shadow-sm p-8 flex items-center justify-center gap-5">
        <div className="flex-1 flex flex-col gap-2">
          <div
            ref={containerRef}
            onPointerMove={updateFromPointer}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
            className="relative h-20 bg-muted/40 border border-border rounded-xl flex items-center px-2 select-none overflow touch-none"
          >
            <div className="absolute inset-0 flex items-center justify-between px-3 pointer-events-none">
              {barData.map((b, i) => (
                <div key={i} style={{ height: `${b.h}%` }} className={`w-1 rounded-full ${b.inRange ? "bg-primary" : "bg-muted-foreground/25"}`} />
              ))}
            </div>
            <div style={{ left: `${startPct}%`, width: `${Math.max(0, endPct - startPct)}%` }} className="absolute inset-y-0 bg-primary/15 border-y-2 border-primary rounded-md pointer-events-none">
              {/* <div className="absolute top-0 bottom-0 left-1/2 w-[1.5px] bg-foreground/50" /> */}
            </div>
            <div onPointerDown={(e) => { e.stopPropagation(); setDragging("start"); }} style={{ left: `calc(${startPct}% - 6px)` }} className="absolute inset-y-1 w-3 bg-primary rounded-l-md cursor-ew-resize z-20 flex items-center justify-center shadow">
              <div className="w-[1.5px] h-3 bg-primary-foreground/90 rounded-full" />
            </div>
            <div onPointerDown={(e) => { e.stopPropagation(); setDragging("end"); }} style={{ left: `calc(${endPct}% - 6px)` }} className="absolute inset-y-1 w-3 bg-primary rounded-r-md cursor-ew-resize z-20 flex items-center justify-center shadow">
              <div className="w-[1.5px] h-3 bg-primary-foreground/90 rounded-full" />
            </div>
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground px-1">
            <span>{active.length} / {total} frames</span>
            <div className="flex items-center gap-3">
              <span><span>{jumps}</span> jump</span>
              <span><span>{ducks}</span> duck</span>
              <span><span>{nones}</span> none</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default TrimGameplayStep;
