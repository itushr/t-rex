import { CheckCircle2, Eye, Play } from "lucide-react";
import { TrainResult } from "../../types/train";

interface Props {
  result: TrainResult;
  onNavigate: (url: string) => void;
}

export function TrainResultCard({ result, onNavigate }: Props) {
  return (
    <div className="border border-border rounded-xl bg-card p-5 flex flex-col gap-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-primary" />
          <span className="font-medium text-sm text-foreground">Model Compiled</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">{result.model_name}.onnx</span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2.5 bg-muted/40 rounded-lg border border-border">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">Accuracy</span>
          <p className="text-base font-mono font-medium text-foreground mt-0.5">{result.accuracy}%</p>
        </div>
        <div className="p-2.5 bg-muted/40 rounded-lg border border-border">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">Frames</span>
          <p className="text-base font-mono font-medium text-foreground mt-0.5">{result.samples}</p>
        </div>
        <div className="p-2.5 bg-muted/40 rounded-lg border border-border">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">Inputs</span>
          <p className="text-base font-mono font-medium text-foreground mt-0.5">{result.features.length}</p>
        </div>
        <div className="p-2.5 bg-muted/40 rounded-lg border border-border">
          <span className="text-[10px] font-mono uppercase text-muted-foreground">Actions</span>
          <p className="text-xs font-mono font-medium text-foreground mt-1 capitalize truncate">{result.actions.join(", ")}</p>
        </div>
      </div>

      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onNavigate(`/visualize/model/private/${result.model_name}`)}
          className="flex-1 py-2 px-4 rounded-lg border border-border bg-secondary text-secondary-foreground font-medium text-xs flex items-center justify-center gap-1.5 hover:bg-muted transition-colors cursor-pointer"
        >
          <Eye className="size-3.5" />
          <span>Visualize Tree</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate(`/try-web/autoplay/private/${result.model_name}`)}
          className="flex-1 py-2 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
        >
          <Play className="size-3.5 fill-current" />
          <span>Start Autoplay</span>
        </button>
      </div>
    </div>
  );
}
export default TrainResultCard;
