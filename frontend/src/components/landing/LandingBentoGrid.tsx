import { Sparkles } from "lucide-react";
import { TelemetryCard, EdgeRuntimeCard } from "./BentoCards";
import { EnsembleCard, ExplainableCard } from "./BentoCardsExtra";

export function LandingBentoGrid() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-800 text-xs font-mono font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
          <span>Core Capabilities</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
          From Raw Game Loop to Explainable AI
        </h2>
        <p className="text-sm md:text-base text-zinc-600 mt-2">
          An end-to-end framework to record Chrome T-Rex gameplay, extract features, train ensemble models, and visualize decision paths in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <TelemetryCard />
        <EdgeRuntimeCard />
        <EnsembleCard />
        <ExplainableCard />
      </div>
    </section>
  );
}
export default LandingBentoGrid;