import { Header } from "../components/Header";
import { Timeline } from "../components/ui/timeline";
import { CodeCard } from "../components/setup/CodeCard";
import { PROMPT_SETUP_TEXT, TIMELINE_DATA } from "../components/setup/setupData";

function SetupNavCard({ title, desc, targetId }: { title: string; desc: string; targetId: string }) {
  const handleClick = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      onClick={handleClick}
      className="w-full sm:w-80 border-2 border-border rounded-xl text-card-foreground p-1 hover:border-muted-foreground/40 transition-all hover:scale-[1.02] cursor-pointer"
    >
      <div className="bg-card rounded-xl shadow-sm p-6 flex flex-col justify-between h-full">
        <h3 className="font-bold text-base text-foreground mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

export function SetupPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-10 flex flex-col">
      <Header />

      <main className="max-w-4xl mx-auto w-full mt-10 flex flex-col gap-14 pb-24">
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full">
          <SetupNavCard
            title="Using prompt"
            desc="paste a setup prompt into any aget"
            targetId="using-prompt"
          />
          <SetupNavCard
            title="Manual setup"
            desc="setups manually using terminal commands"
            targetId="manual-setup"
          />
        </div>

        <section id="using-prompt" className="scroll-mt-24">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">Using prompt</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-3">
            Paste this setup prompt into any agent:
          </p>
          <CodeCard title="Prompt" code={PROMPT_SETUP_TEXT} />
        </section>

        <section id="manual-setup" className="scroll-mt-24">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-foreground">Manual setup</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-6">
            Your agent can do this for you. To do it yourself, or to check what it did:
          </p>
          <Timeline data={TIMELINE_DATA} />
        </section>
      </main>
    </div>
  );
}

export default SetupPage;
