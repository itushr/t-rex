export function DecisionTreeOverlay({ activeAction = "RUN" }: { activeAction?: "JUMP" | "DUCK" | "RUN" }) {
  const isJump = activeAction === "JUMP";
  const isDuck = activeAction === "DUCK";
  const isRun = activeAction === "RUN";
  const isNear = isJump || isDuck;

  return (
    <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none select-none z-10">
      <svg width="340" height="230" viewBox="0 0 340 230" className="overflow-visible drop-shadow-xs">
        {/* Links */}
        <g strokeWidth={1.5} fill="none">
          {/* Root to Node 1 (left) */}
          <path
            d="M 170 52 C 170 70, 95 70, 95 88"
            stroke={isNear ? "#18181b" : "#d4d4d8"}
            strokeWidth={isNear ? 2.5 : 1.5}
          />
          <text x="122" y="72" className="text-[10px] font-mono font-bold fill-zinc-500">&le;</text>

          {/* Root to Node 2 (right / NONE) */}
          <path
            d="M 170 52 C 170 70, 255 70, 255 88"
            stroke={isRun ? "#18181b" : "#d4d4d8"}
            strokeWidth={isRun ? 2.5 : 1.5}
          />
          <text x="218" y="72" className="text-[10px] font-mono font-bold fill-zinc-500">&gt;</text>

          {/* Node 1 to Leaf 3 (JUMP) */}
          <path
            d="M 95 128 C 95 146, 50 146, 50 164"
            stroke={isJump ? "#10b981" : "#d4d4d8"}
            strokeWidth={isJump ? 2.5 : 1.5}
          />
          <text x="64" y="148" className="text-[9px] font-mono font-bold fill-zinc-400">0</text>

          {/* Node 1 to Leaf 4 (DUCK) */}
          <path
            d="M 95 128 C 95 146, 145 146, 145 164"
            stroke={isDuck ? "#f59e0b" : "#d4d4d8"}
            strokeWidth={isDuck ? 2.5 : 1.5}
          />
          <text x="124" y="148" className="text-[9px] font-mono font-bold fill-zinc-400">1</text>
        </g>

        {/* Node #0: Root Split */}
        <g transform="translate(110, 10)">
          <rect width="120" height="42" rx="6" fill="#ffffff" stroke={isNear ? "#18181b" : "#e4e4e7"} strokeWidth={isNear ? 2 : 1} />
          <text x="8" y="16" className="text-[9px] font-mono fill-zinc-400 font-semibold">#0 split</text>
          <text x="8" y="32" className="text-[11px] font-semibold fill-zinc-800">dist &le; 115px</text>
        </g>

        {/* Node #1: Is Bird? */}
        <g transform="translate(42, 88)">
          <rect width="106" height="40" rx="6" fill="#ffffff" stroke={isNear ? "#18181b" : "#e4e4e7"} strokeWidth={isNear ? 2 : 1} />
          <text x="8" y="15" className="text-[9px] font-mono fill-zinc-400 font-semibold">#1 split</text>
          <text x="8" y="30" className="text-[11px] font-semibold fill-zinc-800">is_bird == 1</text>
        </g>

        {/* Node #2: Leaf NONE */}
        <g transform="translate(210, 88)">
          <rect width="90" height="40" rx="6" fill={isRun ? "#27272a" : "#ffffff"} stroke={isRun ? "#27272a" : "#e4e4e7"} strokeWidth={isRun ? 2 : 1} />
          <text x="8" y="15" className={`text-[9px] font-mono ${isRun ? "fill-zinc-400" : "fill-zinc-400"}`}>#2 leaf</text>
          <text x="8" y="30" className={`text-[11px] font-bold ${isRun ? "fill-white" : "fill-zinc-600"}`}>NONE</text>
        </g>

        {/* Node #3: Leaf JUMP */}
        <g transform="translate(10, 164)">
          <rect width="82" height="38" rx="6" fill={isJump ? "#10b981" : "#ffffff"} stroke="#10b981" strokeWidth={isJump ? 2.5 : 1.5} />
          <text x="8" y="14" className={`text-[9px] font-mono ${isJump ? "fill-emerald-100" : "fill-zinc-400"}`}>#3 leaf</text>
          <text x="8" y="29" className={`text-[11px] font-bold ${isJump ? "fill-white" : "fill-emerald-600"}`}>JUMP</text>
        </g>

        {/* Node #4: Leaf DUCK */}
        <g transform="translate(106, 164)">
          <rect width="82" height="38" rx="6" fill={isDuck ? "#f59e0b" : "#ffffff"} stroke="#f59e0b" strokeWidth={isDuck ? 2.5 : 1.5} />
          <text x="8" y="14" className={`text-[9px] font-mono ${isDuck ? "fill-amber-100" : "fill-zinc-400"}`}>#4 leaf</text>
          <text x="8" y="29" className={`text-[11px] font-bold ${isDuck ? "fill-white" : "fill-amber-600"}`}>DUCK</text>
        </g>
      </svg>
    </div>
  );
}
export default DecisionTreeOverlay;
