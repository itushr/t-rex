import { CodeCard } from "./CodeCard";
import type { ManualStep } from "./setupData";

export function ManualSetupSteps({ steps }: { steps: ManualStep[] }) {
  return (
    <div className="flex flex-col">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={idx} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <div className="size-4 my-0.5 rounded-full border border-border bg-card flex items-center justify-center shrink-0 z-10" />
              {!isLast && <div className="w-px flex-1 bg-border my-1" />}
            </div>

            <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
              <h3 className="text-sm sm:text-base font-semibold text-foreground -mt-0.5 mb-1">{step.title}</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">{step.desc}</p>
              <CodeCard title="Terminal" code={step.cmd} isCommand />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ManualSetupSteps;
