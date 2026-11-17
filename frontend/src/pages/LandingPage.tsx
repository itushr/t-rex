import { useState } from "react";
import { Play, Terminal } from "lucide-react";
import Header from "../components/Header";
import { DemoBox } from "../components/landing/DemoBox";
import { SetupModal } from "../components/landing/SetupModal";

export function LandingPage() {
  const [setupOpen, setSetupOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground py-10"
      style={{
        backgroundImage: "url('/hero.png')",
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Header onSetupClick={() => setSetupOpen(true)} />

      <main className="px-6 py-10 text-center">
        <img src="/heading.png" className="w-lg mx-auto translate-y-20 translate-x-20" alt="T-Rex AI" />
        
        {/* Demonstration White Box */}
        <div className="w-full max-w-5xl h-auto min-h-130 bg-white mt-56 mx-auto rounded-4xl border border-zinc-200 shadow-2xl overflow-hidden">
          <DemoBox />
        </div>

        {/* Buttons below the white box */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <a
            href="/try-web"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-primary-foreground" />
            <span>Try Web</span>
          </a>
          <button
            onClick={() => setSetupOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted/50 transition-colors shadow-2xs cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span>Setup</span>
          </button>
        </div>
      </main>

      <SetupModal open={setupOpen} onClose={() => setSetupOpen(false)} />
    </div>
  );
}
export default LandingPage;
