import { Cog, Lock, HardDrive, Clock4 } from "lucide-react";
import { timeAgo } from "../../utils/time";

function CardShell({
  title, subtitle = "T-Rex", modelType = "Random Forest",
  timestamp, rowSpan, badge = "Private", onClick,
}: {
  title: string; subtitle?: string; modelType?: string;
  timestamp: any; rowSpan: string; badge?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`min-w-0 border-2 border-border rounded-xl text-card-foreground p-1 col-span-1 sm:col-span-2 ${rowSpan} ${
        onClick ? "cursor-pointer transition-all hover:scale-[1.01]" : ""
      }`}
    >
      <div className="bg-card rounded-xl shadow-sm h-full p-5 flex flex-col justify-between hover:border-muted-foreground/40 transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <button className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Cog className="size-5" />
            </button>
            <span className="text-xs text-foreground/80 truncate max-w-40">{title}</span>
          </div>
          <div className="flex justify-center items-center gap-3">
            <div className="flex items-center gap-1 text-foreground/80">
              {badge === "Local" ? <HardDrive className="size-3" /> : <Lock className="size-3" />}
              <span className="text-xs">{badge}</span>
            </div>
            <div className="flex items-center gap-1 text-foreground/80">
              <Clock4 className="size-3" /><span className="text-xs">{timeAgo(timestamp)}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center py-4">
          <div className="flex gap-5 items-center justify-center">
            <img src="/dino.svg" className="h-10 w-10 object-contain" alt="Dino" />
            <div style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-xs sm:text-sm">
              <div>{subtitle}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">{modelType}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModelCard({ model, isLocal, onClick }: { model: any; isLocal?: boolean; onClick?: () => void }) {
  return (
    <CardShell
      title={model.name || "Model #1"}
      modelType={model.model_type?.replace(/_/g, " ") || "Decision Tree"}
      timestamp={model.timestamp || model.created_at || model.modified}
      rowSpan="row-span-1 sm:row-span-3"
      badge={isLocal ? "Local" : "Private"}
      onClick={onClick}
    />
  );
}

export function GameplayCard({ gameplay, isLocal, onClick }: { gameplay: any; isLocal?: boolean; onClick?: () => void }) {
  return (
    <CardShell
      title={gameplay.name || "Gameplay #1"}
      modelType="Gameplay"
      timestamp={gameplay.timestamp || gameplay.created_at || gameplay.modified}
      rowSpan="row-span-1 sm:row-span-2"
      badge={isLocal ? "Local" : "Private"}
      onClick={onClick}
    />
  );
}

export function PlaybackCard({ playback, isLocal, onClick }: { playback: any; isLocal?: boolean; onClick?: () => void }) {
  return (
    <CardShell
      title={playback.filename || playback.name || "Autoplay #1"}
      modelType={playback.model_type?.replace(/_/g, " ") || "Autoplay"}
      timestamp={playback.timestamp || playback.created_at || playback.modified}
      rowSpan="row-span-1 sm:row-span-2"
      badge={isLocal ? "Local" : "Private"}
      onClick={onClick}
    />
  );
}
