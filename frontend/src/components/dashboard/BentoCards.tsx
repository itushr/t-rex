import { Play, Eye, Flame, Film, Sparkles } from "lucide-react";
import { navigateTo } from "../../utils/navigation";
import { timeAgo } from "../../utils/time";

export function ModelCard({ model }: { model: any }) {
  const feats = model.features || [];
  return (
    <div className="bento-card type-1 p-5 flex flex-col justify-between hover:border-[#3f3f46] transition-colors">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-emerald-400" />
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Model</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">{timeAgo(model.timestamp)}</span>
        </div>
        <h3 className="font-semibold text-base text-zinc-100 truncate mt-1">{model.name}</h3>
        <p className="text-xs text-zinc-400 font-mono">{feats.length} sensory features • {model.model_type}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1">
          {feats.slice(0, 4).map((f: string) => (
            <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">{f}</span>
          ))}
          {feats.length > 4 && <span className="text-[10px] font-mono px-1.5 py-0.5 text-zinc-500">+{feats.length - 4}</span>}
        </div>
        <div className="flex gap-2 pt-2 border-t border-[#27272a]">
          <button onClick={() => navigateTo(`/try-web/autoplay/private/${model.name}`)} className="flex-1 py-2 rounded-lg bg-white text-black text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-zinc-200 transition-colors cursor-pointer">
            <Play className="size-3 fill-current" /> Autoplay
          </button>
          <button onClick={() => navigateTo(`/visualize/model/private/${model.name}`)} className="flex-1 py-2 rounded-lg border border-[#27272a] bg-zinc-900 text-zinc-300 text-xs font-medium flex items-center justify-center gap-1.5 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer">
            <Eye className="size-3" /> Tree
          </button>
        </div>
      </div>
    </div>
  );
}

export function GameplayCard({ gameplay }: { gameplay: any }) {
  return (
    <div className="bento-card type-2 p-4 flex flex-col justify-between hover:border-[#3f3f46] transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="size-4 text-cyan-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Gameplay Run</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">{timeAgo(gameplay.timestamp)}</span>
      </div>
      <div>
        <h4 className="font-medium text-sm text-zinc-200 truncate">{gameplay.name}</h4>
        <span className="text-[11px] font-mono text-zinc-500">{Math.round((gameplay.size_bytes || 0) / 1024)} KB CSV</span>
      </div>
      <div className="pt-2 border-t border-[#27272a]">
        <button onClick={() => navigateTo(`/train?gameplay=${gameplay.name}`)} className="w-full py-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-cyan-300 text-xs font-medium hover:bg-cyan-900/40 transition-colors cursor-pointer">
          Train Model →
        </button>
      </div>
    </div>
  );
}

export function PlaybackCard({ playback }: { playback: any }) {
  const name = playback.filename || playback.name;
  return (
    <div onClick={() => navigateTo(`/visualize/playback/private/${name}`)} className="bento-card type-3 p-4 flex flex-col justify-between hover:border-[#3f3f46] transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-amber-400" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase">{playback.model_type || "bot"}</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">{timeAgo(playback.timestamp)}</span>
      </div>
      <div>
        <h4 className="font-medium text-xs text-zinc-200 truncate">{playback.model_name || playback.name}</h4>
        <p className="text-[10px] font-mono text-zinc-500">{playback.total_steps || 0} steps • {playback.duration || 0}s</p>
      </div>
    </div>
  );
}
