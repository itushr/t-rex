export function DecisionTreeOverlay({ activeAction = "RUN" }: { activeAction?: "JUMP" | "DUCK" | "RUN" }) {
  const isJump = activeAction === "JUMP", isDuck = activeAction === "DUCK";
  const isRun = activeAction === "RUN", isNear = isJump || isDuck;

  return (
    <div className="absolute right-3 sm:right-8 top-1/2 -translate-y-1/2 pointer-events-none select-none z-10">
      <svg width="320" height="200" viewBox="0 0 320 200" className="overflow-visible drop-shadow-2xs">
        {/* Connecting branch links */}
        <g fill="none">
          {/* Root to Node 1 (dist <= 115) */}
          <path
            d="M 160 42 C 160 62, 82 62, 82 82"
            stroke={isNear ? "#18181b" : "#d4d4d8"}
            strokeWidth={isNear ? 2 : 1.5}
          />
          <text x="115" y="60" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-mono fill-zinc-500 font-bold">&le;</text>

          {/* Root to Run (dist > 115) */}
          <path
            d="M 160 42 C 160 62, 244 62, 244 82"
            stroke={isRun ? "#18181b" : "#d4d4d8"}
            strokeWidth={isRun ? 2 : 1.5}
          />
          <text x="208" y="60" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-mono fill-zinc-500 font-bold">&gt;</text>

          {/* Node 1 to Jump */}
          <path
            d="M 82 112 C 82 131, 48 131, 48 150"
            stroke={isJump ? "#18181b" : "#d4d4d8"}
            strokeWidth={isJump ? 2 : 1.5}
          />
          <text x="60" y="130" textAnchor="middle" dominantBaseline="central" className="text-[9px] font-mono fill-zinc-400 font-bold">N</text>

          {/* Node 1 to Duck */}
          <path
            d="M 82 112 C 82 131, 132 131, 132 150"
            stroke={isDuck ? "#18181b" : "#d4d4d8"}
            strokeWidth={isDuck ? 2 : 1.5}
          />
          <text x="114" y="130" textAnchor="middle" dominantBaseline="central" className="text-[9px] font-mono fill-zinc-400 font-bold">Y</text>
        </g>

        {/* Root Node - always highlighted for all predictions */}
        <g transform="translate(115, 10)">
          <rect width="90" height="32" rx="4" fill="#18181b" stroke="#18181b" strokeWidth={1.5} />
          <text x="45" y="16" textAnchor="middle" dominantBaseline="central" className="text-xs font-mono font-medium fill-white">
            dist &lt; 115
          </text>
        </g>

        {/* Node 1: bird? */}
        <g transform="translate(44, 82)">
          <rect width="76" height="30" rx="4" fill={isNear ? "#18181b" : "#ffffff"} stroke="#18181b" strokeWidth={1.5} />
          <text x="38" y="15" textAnchor="middle" dominantBaseline="central" className={`text-xs font-mono font-medium ${isNear ? "fill-white" : "fill-zinc-900"}`}>
            bird?
          </text>
        </g>

        {/* Leaf: Run */}
        <g transform="translate(212, 82)">
          <rect width="64" height="30" rx="4" fill={isRun ? "#18181b" : "#ffffff"} stroke="#18181b" strokeWidth={1.5} />
          <text x="32" y="15" textAnchor="middle" dominantBaseline="central" className={`text-xs font-mono font-bold ${isRun ? "fill-white" : "fill-zinc-900"}`}>
            Run
          </text>
        </g>

        {/* Leaf: Jump */}
        <g transform="translate(16, 150)">
          <rect width="64" height="30" rx="4" fill={isJump ? "#18181b" : "#ffffff"} stroke="#18181b" strokeWidth={1.5} />
          <text x="32" y="15" textAnchor="middle" dominantBaseline="central" className={`text-xs font-mono font-bold ${isJump ? "fill-white" : "fill-zinc-900"}`}>
            Jump
          </text>
        </g>

        {/* Leaf: Duck */}
        <g transform="translate(100, 150)">
          <rect width="64" height="30" rx="4" fill={isDuck ? "#18181b" : "#ffffff"} stroke="#18181b" strokeWidth={1.5} />
          <text x="32" y="15" textAnchor="middle" dominantBaseline="central" className={`text-xs font-mono font-bold ${isDuck ? "fill-white" : "fill-zinc-900"}`}>
            Duck
          </text>
        </g>
      </svg>
    </div>
  );
}
export default DecisionTreeOverlay;
