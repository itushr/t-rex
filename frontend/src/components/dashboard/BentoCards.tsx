import { Cog, Lock, Clock4 } from "lucide-react";
import { timeAgo } from "../../utils/time";

function CardShell({ title, timestamp, rowSpan }: { title: string; timestamp: any; rowSpan: string }) {
  return (
    <div className={`min-w-0 border-2 border-border rounded-xl text-card-foreground p-1 col-span-1 sm:col-span-2 ${rowSpan}`}>
      <div className="bg-card rounded-xl shadow-sm h-full p-5 flex flex-col justify-between hover:border-muted-foreground/40 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <button className="cursor-pointer"><Cog className="size-5" /></button>
            <span className="text-xs text-foreground/80">{title}</span>
          </div>
          <div className="flex justify-center items-center gap-3">
            <div className="flex items-center gap-1 text-foreground/80">
              <Lock className="size-3" /><span className="text-xs">Private</span>
            </div>
            <div className="flex items-center gap-1 text-foreground/80">
              <Clock4 className="size-3" /><span className="text-xs">{timeAgo(timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-5 items-center justify-center">
            <img src="/dino.svg" className="h-10" alt="Dino" />
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

export function ModelCard({ model }: { model: any }) {
  return <CardShell title="Model #1" timestamp={model.timestamp} rowSpan="row-span-1 sm:row-span-3" />;
}

export function GameplayCard({ gameplay }: { gameplay: any }) {
  return <CardShell title="Gameplay #1" timestamp={gameplay.timestamp} rowSpan="row-span-1 sm:row-span-2" />;
}

export function PlaybackCard({ playback }: { playback: any }) {
  return <CardShell title="Autoplay #1" timestamp={playback.timestamp} rowSpan="row-span-1 sm:row-span-2" />;
}
