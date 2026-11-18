import { Play, Terminal, ArrowUpRight } from "lucide-react";

export function HeroActionButtons({ onSetupClick }: { onSetupClick: () => void }) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 mb-16 px-4">
      <div className="flex items-center justify-center gap-4 relative z-10">
        <a
          href="/try-web"
          className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Try Web</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
        </a>
        <button
          onClick={onSetupClick}
          className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl border border-zinc-300 bg-white/90 text-zinc-800 text-sm font-semibold hover:bg-zinc-50 hover:border-zinc-400 transition-all shadow-2xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-zinc-600 group-hover:text-zinc-900 transition-colors" />
          <span>Setup</span>
        </button>
      </div>

      {/* Explanatory Annotations with arrows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-w-xl mx-auto">
        {/* Try Web annotation */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <svg className="w-10 h-7 text-zinc-500 mb-1 hidden md:block" viewBox="0 0 50 35" fill="none">
            <path d="M12 30 C 15 12, 32 10, 44 6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <polyline points="36 4, 46 6, 42 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="bg-white/80 border border-zinc-200/90 rounded-xl px-3 py-1.5 shadow-2xs backdrop-blur-xs max-w-[240px]">
            <p className="font-mono text-[11px] font-semibold text-zinc-900">Zero-install Browser AI</p>
            <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">Test pre-trained models live in your browser via ONNX Web.</p>
          </div>
        </div>

        {/* Setup annotation */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <svg className="w-10 h-7 text-zinc-500 mb-1 hidden md:block" viewBox="0 0 50 35" fill="none">
            <path d="M38 30 C 35 12, 18 10, 6 6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <polyline points="14 4, 4 6, 8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="bg-white/80 border border-zinc-200/90 rounded-xl px-3 py-1.5 shadow-2xs backdrop-blur-xs max-w-[240px]">
            <p className="font-mono text-[11px] font-semibold text-zinc-900">Local Python Driver</p>
            <p className="text-[11px] text-zinc-500 leading-tight mt-0.5">Connect to Chrome via CDP to record data & train custom AI.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HeroActionButtons;