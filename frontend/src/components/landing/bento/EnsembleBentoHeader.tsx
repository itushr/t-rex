export function EnsembleBentoHeader() {
  const votes = [
    { id: "T1", act: "JUMP", conf: "94%" },
    { id: "T2", act: "JUMP", conf: "89%" },
    { id: "T3", act: "DUCK", conf: "52%" },
    { id: "T4", act: "JUMP", conf: "91%" },
    { id: "T5", act: "JUMP", conf: "96%" },
  ];

  return (
    <div className="w-full bg-zinc-950 rounded-2xl p-3.5 border border-zinc-800 font-mono text-[11px] text-zinc-100">
      <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-2 border-b border-zinc-800 mb-2.5">
        <span>RANDOM FOREST VOTING</span>
        <span className="text-emerald-400 font-bold">4 / 5 MAJORITY</span>
      </div>

      <div className="flex items-center justify-between gap-1 mb-3">
        {votes.map((v) => (
          <div key={v.id} className="flex-1 bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg text-center">
            <span className="text-[9px] text-zinc-500 block">{v.id}</span>
            <span className={`text-[10px] font-bold ${v.act === "JUMP" ? "text-emerald-400" : "text-amber-400"}`}>
              {v.act}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-[11px]">
        <span className="text-zinc-400 font-semibold">Consensus Output:</span>
        <span className="font-bold text-white px-2 py-0.5 rounded bg-emerald-700/80">JUMP (80% AGREEMENT)</span>
      </div>
    </div>
  );
}
export default EnsembleBentoHeader;