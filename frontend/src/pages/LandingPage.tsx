import { Play, Sparkles, Brain, ArrowRight, Activity, Cpu } from "lucide-react";
import Navbar from "../components/Navbar";

export function LandingPage() {
  return (
    <div
      className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground py-10"
      style={{
        backgroundImage: "url('/hero.png')", 
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat"
      }}
    >
      <Navbar />

      <main className="px-6 py-10 text-center">
        <img src="/heading.png" className="w-lg mx-auto translate-y-20 translate-x-20" />
        <div className="w-5xl h-200 bg-white mt-56 mx-auto rounded-4xl">
            {/* Demonstration Here */}
        </div>
      </main>
    </div>
  );
}
export default LandingPage;