import { Play, Eye, Flame, Film, Sparkles } from "lucide-react";
import { navigateTo } from "../../utils/navigation";
import { timeAgo } from "../../utils/time";

export function ModelCard({ model }: { model: any }) {
  const feats = model.features || [];
  return (
    <div className="min-w-0 border border-border rounded-[14px] bg-card text-card-foreground p-5 flex flex-col justify-between hover:border-muted-foreground/40 transition-colors col-span-1 sm:col-span-2 row-span-1 sm:row-span-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Model</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{timeAgo(model.timestamp)}</span>
        </div>
        <h3 className="font-semibold text-base text-foreground truncate mt-1">{model.name}</h3>
        <p className="text-xs text-muted-foreground font-mono">{feats.length} sensory features • {model.model_type}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-1">
          {feats.slice(0, 4).map((f: string) => (
            <span key={f} className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">{f}</span>
          ))}
          {feats.length > 4 && <span className="text-[10px] font-mono px-1.5 py-0.5 text-muted-foreground">+{feats.length - 4}</span>}
        </div>
        <div className="flex gap-2 pt-2 border-t border-border">
          <button onClick={() => navigateTo(`/try-web/autoplay/private/${model.name}`)} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer">
            <Play className="size-3 fill-current" /> Autoplay
          </button>
          <button onClick={() => navigateTo(`/visualize/model/private/${model.name}`)} className="flex-1 py-2 rounded-lg border border-border bg-secondary text-secondary-foreground text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-muted transition-colors cursor-pointer">
            <Eye className="size-3" /> Tree
          </button>
        </div>
      </div>
    </div>
  );
}

export function GameplayCard({ gameplay }: { gameplay: any }) {
  return (
    <div className="min-w-0 border border-border rounded-[14px] bg-card text-card-foreground p-4 flex flex-col justify-between hover:border-muted-foreground/40 transition-colors col-span-1 sm:col-span-2 row-span-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="size-4 text-primary" />
          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Gameplay Run</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{timeAgo(gameplay.timestamp)}</span>
      </div>
      <div>
        <h4 className="font-medium text-sm text-foreground truncate">{gameplay.name}</h4>
        <span className="text-[11px] font-mono text-muted-foreground">{Math.round((gameplay.size_bytes || 0) / 1024)} KB CSV</span>
      </div>
      <div className="pt-2 border-t border-border">
        <button onClick={() => navigateTo(`/train?gameplay=${gameplay.name}`)} className="w-full py-1.5 rounded-lg border border-border bg-secondary text-secondary-foreground text-xs font-medium hover:bg-muted transition-colors cursor-pointer">
          Train Model →
        </button>
      </div>
    </div>
  );
}

export function PlaybackCard({ playback }: { playback: any }) {
  const name = playback.filename || playback.name;
  return (
    <div onClick={() => navigateTo(`/visualize/playback/private/${name}`)} className="min-w-0 border border-border rounded-[14px] bg-card text-card-foreground p-4 flex flex-col justify-between hover:border-muted-foreground/40 transition-colors cursor-pointer col-span-1 row-span-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-primary" />
          <span className="text-[10px] font-mono text-muted-foreground uppercase">{playback.model_type || "bot"}</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{timeAgo(playback.timestamp)}</span>
      </div>
      <div>
        <h4 className="font-medium text-xs text-foreground truncate">{playback.model_name || playback.name}</h4>
        <p className="text-[10px] font-mono text-muted-foreground">{playback.total_steps || 0} steps • {playback.duration || 0}s</p>
      </div>
    </div>
  );
}
