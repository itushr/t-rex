import { Trash, ChevronsRight, DiagramFlowVertical, Cog, Lock, Clock4 } from "lucide-react";
import { navigateTo } from "../../utils/navigation";
import { timeAgo } from "../../utils/time";

export function ModelCard({ model }: { model: any }) {
  const feats = model.features || [];
  return (
    <div className="min-w-0 border-2 border-border rounded-xl text-card-foreground p-1 col-span-1 sm:col-span-2 row-span-1 sm:row-span-3">
      <div className="bg-card rounded-xl shadow-sm h-full p-5 flex flex-col justify-between hover:border-muted-foreground/40 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <button className="cursor-pointer">
              <Cog className="size-5" />
            </button>
            <span className="text-xs text-foreground/80">
              Model #1
            </span>
          </div>
          <div className="flex justify-center items-center gap-3">
            <div className="flex items-center gap-1 text-foreground/80">
              <Lock className="size-3" />
              <span className="text-xs">Private</span>
            </div>
            <div className="flex items-center gap-1 text-foreground/80">
              <Clock4 className="size-3" />
              <span className="text-xs">{timeAgo(model.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-5 items-center justify-center">
            <img src="/dino.svg" className="h-10" />
            <div style={{ fontFamily: "'Press Start 2P', monospace" }}>
              <div>T-Rex</div>
              <div>Random Forest</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GameplayCard({ gameplay }: { gameplay: any }) {
  return (
    <div className="min-w-0 border-2 border-border rounded-xl text-card-foreground p-1 col-span-1 sm:col-span-2 row-span-1 sm:row-span-2">
      <div className="bg-card rounded-xl shadow-sm h-full p-5 flex flex-col justify-between hover:border-muted-foreground/40 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <button className="cursor-pointer">
              <Cog className="size-5" />
            </button>
            <span className="text-xs text-foreground/80">
              Gameplay #1
            </span>
          </div>
          <div className="flex justify-center items-center gap-3">
            <div className="flex items-center gap-1 text-foreground/80">
              <Lock className="size-3" />
              <span className="text-xs">Private</span>
            </div>
            <div className="flex items-center gap-1 text-foreground/80">
              <Clock4 className="size-3" />
              <span className="text-xs">{timeAgo(gameplay.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-5 items-center justify-center">
            <img src="/dino.svg" className="h-10" />
            <div style={{ fontFamily: "'Press Start 2P', monospace" }}>
              <div>T-Rex</div>
              <div>Random Forest</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlaybackCard({ playback }: { playback: any }) {
  const name = playback.filename || playback.name;
  return (
    <div className="min-w-0 border-2 border-border rounded-xl text-card-foreground p-1 col-span-1 sm:col-span-2 row-span-1 sm:row-span-2">
      <div className="bg-card rounded-xl shadow-sm h-full p-5 flex flex-col justify-between hover:border-muted-foreground/40 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <button className="cursor-pointer">
              <Cog className="size-5" />
            </button>
            <span className="text-xs text-foreground/80">
              Autoplay #1
            </span>
          </div>
          <div className="flex justify-center items-center gap-3">
            <div className="flex items-center gap-1 text-foreground/80">
              <Lock className="size-3" />
              <span className="text-xs">Private</span>
            </div>
            <div className="flex items-center gap-1 text-foreground/80">
              <Clock4 className="size-3" />
              <span className="text-xs">{timeAgo(playback.timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-5 items-center justify-center">
            <img src="/dino.svg" className="h-10" />
            <div style={{ fontFamily: "'Press Start 2P', monospace" }}>
              <div>T-Rex</div>
              <div>Random Forest</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
