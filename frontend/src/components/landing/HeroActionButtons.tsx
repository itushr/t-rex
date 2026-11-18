import { Play, Terminal, ArrowUpRight } from "lucide-react";

export function HeroActionButtons({ onSetupClick }: { onSetupClick: () => void }) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-8 mb-20 px-4">
      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 relative z-10">
        <a
          href="/try-web"
          className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Try Web</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
        </a>
        <button
          onClick={onSetupClick}
          className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl border border-zinc-300 bg-white/90 text-zinc-800 text-sm font-semibold hover:bg-zinc-50 hover:border-zinc-400 transition-all shadow-2xs hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
        >
          <Terminal className="w-4 h-4 text-zinc-600 group-hover:text-zinc-900 transition-colors" />
          <span>Setup</span>
        </button>
      </div>

      {/* Explanatory Annotations with Arrows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 max-w-2xl mx-auto">
        {/* Left: Try Web explanation */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right">
          <svg className="w-12 h-8 text-zinc-400 mb-1 hidden md:block" viewBox="0 0 55 35" fill="none">
            <path d="M10 32 C 15 12, 35 12, 48 6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <polyline points="40 4, 50 6, 45 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-3 shadow-xs max-w-[270px]">
            <p className="font-mono text-xs font-bold text-zinc-900">In-Browser Autoplay</p>
            <p className="text-[11px] text-zinc-600 leading-relaxed mt-1">
              Runs pre-trained models live in WebAssembly ONNX Runtime. Zero install, tests directly in your browser canvas.
            </p>
          </div>
        </div>

        {/* Right: Setup explanation */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <svg className="w-12 h-8 text-zinc-400 mb-1 hidden md:block" viewBox="0 0 55 35" fill="none">
            <path d="M45 32 C 40 12, 20 12, 7 6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
            <polyline points="15 4, 5 6, 10 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="bg-white border border-zinc-200/90 rounded-2xl p-3 shadow-xs max-w-[270px]">
            <p className="font-mono text-xs font-bold text-zinc-900">Python CDP Driver</p>
            <p className="text-[11px] text-zinc-600 leading-relaxed mt-1">
              Connects to Chrome (<span className="font-mono">chrome://dino</span>) via DevTools Protocol to capture your human gameplay and train custom AI.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HeroActionButtons;