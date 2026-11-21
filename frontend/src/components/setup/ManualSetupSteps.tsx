import { Fragment } from "react";
import { CodeCard } from "./CodeCard";
import type { ManualStep } from "./setupData";

function renderFormattedDesc(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="font-mono text-[12px] sm:text-[13px] px-1.5 py-0.5 rounded bg-muted text-foreground border border-border"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function ManualSetupSteps({ steps }: { steps: ManualStep[] }) {
  return (
    <div className="relative">
      <div className="absolute left-[7px] top-2.5 bottom-6 w-px bg-neutral-200 dark:bg-neutral-800" />
      <div className="flex flex-col space-y-8 sm:space-y-10">
        {steps.map((step, idx) => (
          <div key={idx} className="relative pl-7 sm:pl-8">
            <div className="absolute left-0 top-1 size-3.5 sm:size-4 rounded-full border-2 border-neutral-300 dark:border-neutral-700 bg-card z-10" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1.5">{step.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              {renderFormattedDesc(step.desc)}
            </p>
            <CodeCard title="Terminal" code={step.cmd} isCommand />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManualSetupSteps;
