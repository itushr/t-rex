import { Terminal, Play, GitBranch, Video, Sparkles, ExternalLink } from "lucide-react";

export function LandingFooter({ onSetupClick }: { onSetupClick: () => void }) {
  return (
    <footer className="w-full border-t border-zinc-200 bg-white/70 backdrop-blur-md mt-20">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono font-bold text-sm text-zinc-900 tracking-tight">T-REX AI ENGINE</span>
            <span className="px-2 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-mono text-zinc-600">v2.0</span>
          </div>
          <p className="text-xs text-zinc-500 text-center md:text-left max-w-sm">
            Explainable Machine Learning & Ensemble Decision Trees for the Chrome Dinosaur Game.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-zinc-600">
          <a href="/try-web" className="hover:text-zinc-900 flex items-center gap-1.5 transition-colors">
            <Play className="w-3.5 h-3.5" />
            <span>Try Web</span>
          </a>
          <a href="/train" className="hover:text-zinc-900 flex items-center gap-1.5 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Train Studio</span>
          </a>
          <a href="/model-visualize" className="hover:text-zinc-900 flex items-center gap-1.5 transition-colors">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Model Visualizer</span>
          </a>
          <a href="/playback" className="hover:text-zinc-900 flex items-center gap-1.5 transition-colors">
            <Video className="w-3.5 h-3.5" />
            <span>Playback</span>
          </a>
          <button onClick={onSetupClick} className="hover:text-zinc-900 flex items-center gap-1.5 transition-colors cursor-pointer">
            <Terminal className="w-3.5 h-3.5" />
            <span>Setup Guide</span>
          </button>
          <a
            href="https://github.com/itushr/t-rex"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-900 flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
      <div className="border-t border-zinc-100 py-4 text-center text-[11px] text-zinc-400 font-mono">
        Open Source &bull; Interpretable AI &bull; Chrome DevTools Protocol &bull; React Flow
      </div>
    </footer>
  );
}
export default LandingFooter;