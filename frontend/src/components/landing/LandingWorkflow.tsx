import { Terminal, Database, BrainCircuit, PlayCircle } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Capture Telemetry",
    desc: "Record live Chrome dinosaur jumps, ducks, and obstacle positions via DevTools CDP at 60 FPS.",
    icon: Terminal,
  },
  {
    step: "02",
    title: "Extract & Clean",
    desc: "Transform spatial vectors into 4 core features (distX, distY, type, speed) and trim dead gameplay frames.",
    icon: Database,
  },
  {
    step: "03",
    title: "Train Ensembles",
    desc: "Fit Decision Trees & Random Forests with optimal Gini depth, or train neural networks converted to ONNX.",
    icon: BrainCircuit,
  },
  {
    step: "04",
    title: "Autoplay & Explain",
    desc: "Deploy models live with sub-millisecond edge execution and transparent visual decision path tracking.",
    icon: PlayCircle,
  },
];

export function LandingWorkflow() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900">
          The 4-Step Pipeline
        </h2>
        <p className="text-xs md:text-sm text-zinc-500 mt-2">
          From human gameplay recording to autonomous machine learning autopilot
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="relative p-5 rounded-3xl bg-zinc-50/80 border border-zinc-200 hover:border-zinc-300 hover:bg-white transition-all shadow-2xs hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">
                    {s.step}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shadow-2xs group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-zinc-900 mb-2">{s.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export default LandingWorkflow;