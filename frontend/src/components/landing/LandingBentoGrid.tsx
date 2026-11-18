import { Activity, GitBranch, Layers, Cpu } from "lucide-react";
import { BentoGrid, BentoGridItem } from "./aceternity/BentoGrid";
import { TelemetryBentoHeader } from "./bento/TelemetryBentoHeader";
import { TreeLogicBentoHeader } from "./bento/TreeLogicBentoHeader";
import { EnsembleBentoHeader } from "./bento/EnsembleBentoHeader";
import { CdpVsWebBentoHeader } from "./bento/CdpVsWebBentoHeader";

export function LandingBentoGrid() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-14">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-2">
          Architecture & ML Engine
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
          How T-Rex AI Actually Works
        </h2>
        <p className="text-xs md:text-sm text-zinc-600 mt-2">
          No black boxes. Direct engine telemetry, transparent decision trees, and zero-latency client inference.
        </p>
      </div>

      <BentoGrid>
        <BentoGridItem
          className="md:col-span-2"
          header={<TelemetryBentoHeader />}
          icon={<Activity className="w-4 h-4 text-zinc-800" />}
          title="60Hz Engine Telemetry & Spatial Extraction"
          description="Directly hooks into the Chrome Runner loop to extract horizontal distance (obs_distx), altitude clearance (obs_disty), obstacle classification, and canvas velocity at 60 FPS."
        />

        <BentoGridItem
          className="md:col-span-1"
          header={<TreeLogicBentoHeader />}
          icon={<GitBranch className="w-4 h-4 text-zinc-800" />}
          title="Explainable Decision Tree Splits"
          description="Every action traces back to deterministic mathematical rules with exact split boundaries, sample counts, and Gini purity metrics."
        />

        <BentoGridItem
          className="md:col-span-1"
          header={<EnsembleBentoHeader />}
          icon={<Layers className="w-4 h-4 text-zinc-800" />}
          title="Random Forest Consensus Voting"
          description="Independent decision trees cast votes across Jump, Duck, and None states, taking the consensus majority action to prevent edge-case mispredictions."
        />

        <BentoGridItem
          className="md:col-span-2"
          header={<CdpVsWebBentoHeader />}
          icon={<Cpu className="w-4 h-4 text-zinc-800" />}
          title="Dual Engine: Chrome CDP + ONNX WebAssembly"
          description="Capture training data from native Chrome (chrome://dino) via DevTools Protocol, train models with Python, and run sub-millisecond autoplay via browser WebAssembly."
        />
      </BentoGrid>
    </section>
  );
}
export default LandingBentoGrid;