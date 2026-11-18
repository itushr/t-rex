export function CdpVsWebBentoHeader() {
  return (
    <div className="w-full bg-zinc-50 rounded-2xl p-3.5 border border-zinc-200 font-mono text-[11px] text-zinc-700">
      <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-2 border-b border-zinc-200 mb-2.5">
        <span>RUNTIME COMPARISON</span>
        <span className="text-zinc-600 font-bold">DUAL ENGINE</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-900 font-bold mb-1">
            <span>Chrome CDP</span>
            <span className="text-[10px] text-purple-600 bg-purple-50 px-1 rounded">Native 9222</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-tight">
            Directly binds to Chrome DevTools Protocol to capture real human playthroughs and test native gameplay.
          </p>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between text-zinc-900 font-bold mb-1">
            <span>ONNX WASM</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded">&lt;1.5ms Latency</span>
          </div>
          <p className="text-[10px] text-zinc-500 leading-tight">
            Compiled browser inference engine. Runs trained Random Forests & Decision Trees 100% client-side.
          </p>
        </div>
      </div>
    </div>
  );
}
export default CdpVsWebBentoHeader;