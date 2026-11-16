import { Play, Sparkles, Brain, ArrowRight, Activity, Cpu } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary selection:text-primary-foreground">
      <header className="border-b border-border/60 backdrop-blur px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5 font-bold tracking-tight text-lg">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-black">
            TR
          </div>
          <span>T-Rex AI Studio</span>
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
            Dashboard
          </a>
          <a href="/try-web" className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
            Play & Record
          </a>
          <a href="/train" className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1">
            Train
          </a>
          <a
            href="/dashboard"
            className="ml-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
          >
            Launch Studio <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-foreground" />
          <span>Autonomous Dino ML Intelligence & Telemetry</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15] mb-6">
          Record human gameplay. <br />
          <span className="text-muted-foreground">Train AI that jumps for you.</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          End-to-end browser machine learning studio. Collect raw telemetry, train Decision Trees &amp;
          Random Forests, inspect decision paths step-by-step, and autoplay live in WebAssembly.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all shadow-sm"
          >
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="/try-web"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card font-medium text-sm hover:bg-muted/50 transition-colors"
          >
            <Play className="w-4 h-4 fill-foreground" /> Play &amp; Record Run
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur">
            <Activity className="w-5 h-5 text-muted-foreground mb-2" />
            <h2 className="text-sm font-semibold mb-1">Telemetry Recorder</h2>
            <p className="text-xs text-muted-foreground">Millisecond-precise speed, obstacle distances, and human actions.</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur">
            <Brain className="w-5 h-5 text-muted-foreground mb-2" />
            <h2 className="text-sm font-semibold mb-1">Tree &amp; Forest Models</h2>
            <p className="text-xs text-muted-foreground">Interactive visualizers detailing node splits, leaf paths, and voting.</p>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card/60 backdrop-blur">
            <Cpu className="w-5 h-5 text-muted-foreground mb-2" />
            <h2 className="text-sm font-semibold mb-1">ONNX Web Runner</h2>
            <p className="text-xs text-muted-foreground">Real-time in-browser neural &amp; tree inference with zero backend latency.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        T-Rex ML Intelligence Engine • Scalable PostgreSQL &amp; Cloud Storage
      </footer>
    </div>
  );
}
export default LandingPage;