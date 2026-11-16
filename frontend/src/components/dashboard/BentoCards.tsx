import { Trash, ChevronsRight, DiagramFlowVertical } from "lucide-react";
import { navigateTo } from "../../utils/navigation";
import { timeAgo } from "../../utils/time";

export function ModelCard({ model }: { model: any }) {
  const feats = model.features || [];
  return (
    <div className="min-w-0 border border-border rounded-sm bg-card text-card-foreground p-5 flex flex-col justify-between hover:border-muted-foreground/40 transition-colors col-span-1 sm:col-span-2 row-span-1 sm:row-span-2">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Model</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{timeAgo(model.timestamp)}</span>
        </div>
        <h3 className="font-semibold text-base text-foreground truncate mt-1">{model.name}</h3>
        <p className="text-xs text-muted-foreground font-mono">{feats.length} sensory features • {model.model_type}</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-end gap-2">
          <div className="cursor-pointer text-foreground/70 rounded-xs hover:text-foreground px-2.5 py-2 border border-border"><Trash className="size-4" /></div>
          <div className="cursor-pointer text-foreground/70 rounded-xs hover:text-foreground px-2.5 py-2 border border-border"
            onClick={() => navigateTo(`/visualize/model/private/${model.name}`)}
          >
            <DiagramFlowVertical className="size-4" />
          </div>
          <div className="cursor-pointer text-foreground/70 rounded-xs hover:text-foreground px-2.5 py-2 border border-border"
            onClick={() => navigateTo(`/try-web/autoplay/private/${model.name}`)}
          >
            <ChevronsRight className="size-4 scale-125" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameplayCard({ gameplay }: { gameplay: any }) {
  return (
    <div className="min-w-0 border border-border rounded-sm bg-card text-card-foreground p-4 flex flex-col justify-between hover:border-muted-foreground/40 transition-colors col-span-1 sm:col-span-2 row-span-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tracking-wider text-muted-foreground">GAMEPLAY (played by you)</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">{timeAgo(gameplay.timestamp)}</span>
      </div>
      <div>
        <h4 className="font-medium text-sm text-foreground truncate">{gameplay.name}</h4>
        <span className="text-[11px] font-mono text-muted-foreground">{Math.round((gameplay.size_bytes || 0) / 1024)} KB CSV</span>
      </div>
      <div className="flex justify-end gap-2">
        <div className="cursor-pointer text-foreground/70 rounded-xs hover:text-foreground px-2.5 py-2 border border-border"><Trash className="size-4" /></div>
        <div className="cursor-pointer text-foreground/70 rounded-xs hover:text-foreground px-2.5 py-2 border border-border"
          onClick={() => navigateTo(`/train?gameplay=${gameplay.name}`)}
        >
          <ChevronsRight className="size-4 scale-125" />
        </div>
      </div>
    </div>
  );
}

export function PlaybackCard({ playback }: { playback: any }) {
  const name = playback.filename || playback.name;
  return (
    <div
      onClick={() => navigateTo(`/visualize/playback/private/${name}`)}
      className="min-w-0 border border-border rounded-sm bg-card text-card-foreground p-4 flex flex-col justify-between hover:border-muted-foreground/40 transition-colors cursor-pointer col-span-1 row-span-1"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* <span className="text-[10px] font-mono text-muted-foreground uppercase">{playback.model_type || "unknown"}</span> */}
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Playback</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{timeAgo(playback.timestamp)}</span>
        </div>
        <div className="mt-3">
          <h4 className="font-medium text-xs text-foreground truncate">{playback.model_name || playback.name}</h4>
          <p className="text-[10px] font-mono text-muted-foreground">{playback.total_steps || 0} steps • {playback.duration || 0}s</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <div className="cursor-pointer text-foreground/70 rounded-xs hover:text-foreground px-2.5 py-2 border border-border"><Trash className="size-4" /></div>
        <div className="cursor-pointer text-foreground/70 rounded-xs hover:text-foreground px-2.5 py-2 border border-border"
          onClick={() => navigateTo(`/visualize/playback/private/${name}`)}
        >
          <DiagramFlowVertical className="size-4" />
        </div>
      </div>
    </div>
  );
}
