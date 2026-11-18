import { Timeline, TimelineEntry } from "./aceternity/Timeline";
import { Terminal, Scissors, BrainCircuit, Play } from "lucide-react";

const DATA: TimelineEntry[] = [
  {
    step: "01",
    title: "Record Gameplay via Chrome CDP or Web",
    content: (
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2">
        <p>
          Play the game manually. The local Python driver hooks into native Chrome (<span className="font-mono font-semibold">chrome://dino</span>) via DevTools Protocol port 9222, logging 60 snapshots per second of obstacle bounds, dino jumping states, and canvas speeds.
        </p>
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-150">
          <Terminal className="w-3.5 h-3.5 text-zinc-700" />
          <span>python backend/driver/main.py --mode record</span>
        </div>
      </div>
    ),
  },
  {
    step: "02",
    title: "Interactive Session Trimming & Feature Selection",
    content: (
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2">
        <p>
          In the <a href="/train" className="font-semibold text-zinc-900 underline hover:text-zinc-600">Train Studio</a>, scrub recorded sessions with a visual timeline to cut idle starting delay and crash frames. Choose which features (<span className="font-mono">obs_distx</span>, <span className="font-mono">obs_disty</span>, <span className="font-mono">speed</span>) to feed into the training matrix.
        </p>
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-150">
          <Scissors className="w-3.5 h-3.5 text-zinc-700" />
          <span>Trimmed: frames 140 to 1,980 &bull; Features: [dist_x, dist_y, speed]</span>
        </div>
      </div>
    ),
  },
  {
    step: "03",
    title: "Train Decision Trees & Export to ONNX",
    content: (
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2">
        <p>
          Fit transparent Decision Trees or Random Forest ensembles. Control max depth and tree estimators, review cross-validation accuracy, and export the trained model directly into <span className="font-mono">.onnx</span> for instant client-side execution.
        </p>
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-150">
          <BrainCircuit className="w-3.5 h-3.5 text-zinc-700" />
          <span>RandomForest(n_estimators=5, max_depth=6) &rarr; model.onnx</span>
        </div>
      </div>
    ),
  },
  {
    step: "04",
    title: "Autoplay & Frame-by-Frame Playback Debugger",
    content: (
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-2">
        <p>
          Deploy models directly inside <a href="/try-web" className="font-semibold text-zinc-900 underline hover:text-zinc-600">Try Web</a> or the Chrome CDP runner. Inspect decisions in the <a href="/playback" className="font-semibold text-zinc-900 underline hover:text-zinc-600">Playback Studio</a>, scrubbing frame-by-frame to see which exact tree branch triggered each jump.
        </p>
        <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 bg-zinc-50 p-2 rounded-lg border border-zinc-150">
          <Play className="w-3.5 h-3.5 text-zinc-700" />
          <span>Frame 842: Tree #3 fired JUMP (threshold: dist_x &le; 138.5)</span>
        </div>
      </div>
    ),
  },
];

export function LandingTimeline() {
  return (
    <section className="w-full bg-zinc-50/50 border-t border-zinc-200/70">
      <Timeline data={DATA} />
    </section>
  );
}
export default LandingTimeline;