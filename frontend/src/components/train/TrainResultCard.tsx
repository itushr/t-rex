import { CheckCircle2, Eye, Play } from "lucide-react";
import { TrainResult } from "../../types/train";

interface Props {
  result: TrainResult;
  onNavigate: (url: string) => void;
}

export function TrainResultCard({ result, onNavigate }: Props) {
  return (
    <div className="bg-white border border-[#DDD6CB] rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DDD6CB] pb-4">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="size-5 text-black" />
          <h2 className="text-xl font-medium tracking-tight text-black">Model Compiled Successfully</h2>
        </div>
        <span className="text-xs font-mono px-3 py-1 bg-black text-[#F7F4ED] rounded-full self-start sm:self-auto">
          {result.model_name}.onnx
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-3 bg-[#F7F4ED]/60 rounded-xl border border-[#DDD6CB]/60">
          <span className="text-[11px] font-mono uppercase text-[#6E6962]">Accuracy</span>
          <p className="text-xl font-mono font-medium text-black mt-0.5">{result.accuracy}%</p>
        </div>
        <div className="p-3 bg-[#F7F4ED]/60 rounded-xl border border-[#DDD6CB]/60">
          <span className="text-[11px] font-mono uppercase text-[#6E6962]">Trained Frames</span>
          <p className="text-xl font-mono font-medium text-black mt-0.5">{result.samples}</p>
        </div>
        <div className="p-3 bg-[#F7F4ED]/60 rounded-xl border border-[#DDD6CB]/60">
          <span className="text-[11px] font-mono uppercase text-[#6E6962]">Inputs</span>
          <p className="text-xl font-mono font-medium text-black mt-0.5">{result.features.length}</p>
        </div>
        <div className="p-3 bg-[#F7F4ED]/60 rounded-xl border border-[#DDD6CB]/60">
          <span className="text-[11px] font-mono uppercase text-[#6E6962]">Actions</span>
          <p className="text-sm font-mono font-medium text-black mt-1 capitalize">{result.actions.join(", ")}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs font-mono text-[#6E6962] mr-1 self-center">Sensory inputs:</span>
        {result.features.map((f) => (
          <span key={f} className="text-[11px] font-mono px-2 py-0.5 bg-[#F7F4ED] text-black border border-[#DDD6CB] rounded-full">
            {f}
          </span>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={() => onNavigate(`/visualize/model/private/${result.model_name}`)}
          className="flex-1 py-3 px-6 rounded-full border border-[#DDD6CB] bg-white text-black font-medium text-sm flex items-center justify-center gap-2 hover:border-black transition-colors cursor-pointer"
        >
          <Eye className="size-4" />
          <span>Visualize Model</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate(`/try-web/autoplay/private/${result.model_name}`)}
          className="flex-1 py-3 px-6 rounded-full bg-black text-[#F7F4ED] font-medium text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors shadow-sm cursor-pointer"
        >
          <Play className="size-4 fill-current" />
          <span>Start Autoplay</span>
        </button>
      </div>
    </div>
  );
}
