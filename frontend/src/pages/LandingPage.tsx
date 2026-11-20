import { useState } from "react";
import Header from "../components/Header";
import { DemoBox } from "../components/landing/DemoBox";
import { SetupModal } from "../components/landing/SetupModal";
import { CTA } from "../components/landing/CTA";

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

      <main className="py-10 text-center">
        <img src="/heading.png" className="w-lg mx-auto translate-y-20 translate-x-20" alt="T-Rex AI" />

        {/* Demonstration White Box */}
        <div className="w-full max-w-6xl h-auto min-h-135 bg-card shadow-sm mt-40 mx-auto rounded-4xl overflow-hidden">
          <DemoBox />
        </div>

        <div className="bg-background mt-20 py-20 text-2xl text-center">
          Explore machine learning through games. 
          <br />
          Experiment with algorithms, train different models, 
          <br />
          and discover how they learn to play.
        </div>

        {/* CTA Section */}
        <CTA onSetupClick={() => setSetupOpen(true)} />
      </main>

      <SetupModal open={setupOpen} onClose={() => setSetupOpen(false)} />
    </div>
  );
}
export default LandingPage;
