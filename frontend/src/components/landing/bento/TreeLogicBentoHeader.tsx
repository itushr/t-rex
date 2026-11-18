export function TreeLogicBentoHeader() {
  return (
    <div className="w-full bg-zinc-50 rounded-2xl p-3.5 border border-zinc-200 font-mono text-[11px] text-zinc-700">
      <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-2 border-b border-zinc-200 mb-2">
        <span>EXPLAINABLE SPLIT RULES</span>
        <span className="text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">Gini Impurity</span>
      </div>

      <div className="space-y-1.5">
        <div className="bg-white p-2 rounded-lg border border-zinc-200 flex justify-between items-center">
          <div>
            <span className="text-zinc-500 font-bold">&bull; Split: </span>
            <span className="text-zinc-900 font-semibold">obs_distx &le; 135.0</span>
          </div>
          <span className="text-zinc-400 text-[10px]">gini = 0.48</span>
        </div>

        <div className="ml-3 bg-white p-2 rounded-lg border border-zinc-200 flex justify-between items-center">
          <div>
            <span className="text-zinc-500 font-bold">&rarr; If BIRD: </span>
            <span className="text-amber-800 font-semibold">obs_disty &gt; 25.0</span>
          </div>
          <span className="text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">ACTION: DUCK</span>
        </div>

        <div className="ml-3 bg-white p-2 rounded-lg border border-zinc-200 flex justify-between items-center">
          <div>
            <span className="text-zinc-500 font-bold">&rarr; Else: </span>
            <span className="text-emerald-800 font-semibold">obs_distx &le; 105.0</span>
          </div>
          <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">ACTION: JUMP</span>
        </div>
      </div>
    </div>
  );
}
export default TreeLogicBentoHeader;