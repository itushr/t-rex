import { Layers, Sparkles, ArrowRight } from "lucide-react";

export function EnsembleCard() {
  return (
    <div className="rounded-3xl p-6 bg-white border border-zinc-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5 mb-4">
          <Layers className="w-4 h-4 text-zinc-700" />
          Model Architecture
        </span>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Ensemble Forests</h3>
        <p className="text-xs text-zinc-600 mb-4">
          Estimator trees cast independent votes across Jump, Duck, and None actions.
        </p>
      </div>
      <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-2xl border border-zinc-200 font-mono text-[11px] text-zinc-700">
        <span className="px-2 py-0.5 rounded bg-zinc-200 text-zinc-800 font-bold">5 Trees</span>
        <span>&rarr; Consensus: JUMP</span>
      </div>
    </div>
  );
}

export function ExplainableCard() {
  return (
    <div className="md:col-span-2 rounded-3xl p-6 bg-white border border-zinc-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-zinc-700" />
            Explainable AI (XAI)
          </span>
          <a href="/model-visualize" className="text-xs font-semibold text-zinc-900 hover:text-zinc-600 inline-flex items-center gap-1">
            Visualizer Studio <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">Full Interpretability at Every Frame</h3>
        <p className="text-xs text-zinc-600 max-w-lg mb-4">
          Inspect Gini impurity scores, split rules, and sample paths for every action without black-box opacity.
        </p>
      </div>
      <div className="p-2.5 bg-zinc-50 rounded-2xl border border-zinc-200 flex flex-wrap items-center gap-2 font-mono text-[11px] text-zinc-600">
        <span className="bg-white px-2 py-0.5 rounded-lg border border-zinc-200">dist_x &le; 138.5</span>
        <span className="bg-white px-2 py-0.5 rounded-lg border border-zinc-200">Gini: 0.042</span>
        <span className="bg-white px-2 py-0.5 rounded-lg border border-zinc-200">Samples: 1,842</span>
        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200 font-bold">Conf: 99.4%</span>
      </div>
    </div>
  );
}