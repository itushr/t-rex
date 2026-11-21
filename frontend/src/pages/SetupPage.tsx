import { useState } from "react";
import { Header } from "../components/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CodeCard } from "../components/setup/CodeCard";
import { ManualSetupSteps } from "../components/setup/ManualSetupSteps";
import { PROMPT_SETUP_TEXT, MANUAL_STEPS } from "../components/setup/setupData";

export function SetupPage() {
  const [tab, setTab] = useState<string>(() => {
    return typeof window !== "undefined" && window.location.hash === "#manual" ? "manual" : "prompt";
  });

  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-10 flex flex-col">
      <Header />

      <main className="max-w-4xl mx-auto w-full mt-10 pb-20 flex flex-col items-center">
        <Tabs value={tab} onValueChange={setTab} className="w-full flex flex-col items-center">
          <TabsList className="grid w-64 grid-cols-2 mb-8">
            <TabsTrigger value="prompt" className="cursor-pointer">Prompt</TabsTrigger>
            <TabsTrigger value="manual" className="cursor-pointer">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="prompt" className="w-full">
            <div className="border-2 border-border rounded-xl text-card-foreground p-1 w-full shadow-xs">
              <div className="bg-card rounded-xl p-6 sm:p-10">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-2">
                  Using prompt
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Paste this setup prompt into any agent:
                </p>
                <CodeCard title="Prompt" code={PROMPT_SETUP_TEXT} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="w-full">
            <div className="border-2 border-border rounded-xl text-card-foreground p-1 w-full shadow-xs">
              <div className="bg-card rounded-xl p-6 sm:p-10">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-2">
                  Set up your project by hand
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Your agent can do this for you. To do it yourself, or to check what it did:
                </p>
                <ManualSetupSteps steps={MANUAL_STEPS} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default SetupPage;
