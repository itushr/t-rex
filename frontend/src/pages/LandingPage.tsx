import { useState } from "react";
import Header from "../components/Header";
import { DemoBox } from "../components/landing/DemoBox";
import { SetupModal } from "../components/landing/SetupModal";
import { HeroActionButtons } from "../components/landing/HeroActionButtons";
import { LandingStats } from "../components/landing/LandingStats";
import { LandingBentoGrid } from "../components/landing/LandingBentoGrid";
import { LandingWorkflow } from "../components/landing/LandingWorkflow";
import { LandingFooter } from "../components/landing/LandingFooter";

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
        <div className="w-full max-w-6xl h-auto min-h-135 bg-white mt-56 mx-auto rounded-4xl border border-zinc-200 shadow-2xl overflow-hidden">
          <DemoBox />
        </div>

        {/* Buttons with arrow annotations & explanations */}
        <HeroActionButtons onSetupClick={() => setSetupOpen(true)} />
      </main>

      {/* Aceternity & React Bits inspired landing sections */}
      <LandingStats />
      <LandingBentoGrid />
      <LandingWorkflow />
      <LandingFooter onSetupClick={() => setSetupOpen(true)} />

      <SetupModal open={setupOpen} onClose={() => setSetupOpen(false)} />
    </div>
  );
}
export default LandingPage;