import React from "react";

export interface TimelineEntry {
  title: string;
  step: string;
  content: React.ReactNode;
}

export function Timeline({ data }: { data: TimelineEntry[] }) {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-14">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-2">
          End-To-End Pipeline
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-900">
          From Gameplay Pixels to Autoplay
        </h2>
        <p className="text-xs md:text-sm text-zinc-600 mt-2">
          How raw Chrome DevTools sessions become trained, verifiable ensemble models.
        </p>
      </div>

      <div className="relative border-l border-zinc-200 ml-4 md:ml-32 space-y-12">
        {data.map((item, index) => (
          <div key={index} className="relative pl-6 md:pl-10">
            {/* Aceternity timeline node */}
            <div className="absolute -left-[17px] top-1.5 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-zinc-900 flex items-center justify-center shadow-xs">
                <span className="font-mono text-[10px] font-bold text-zinc-900">{item.step}</span>
              </div>
            </div>

            {/* Content header */}
            <div className="mb-3">
              <h3 className="text-lg md:text-xl font-bold text-zinc-900">{item.title}</h3>
            </div>

            {/* Content body */}
            <div className="text-zinc-600 text-xs md:text-sm leading-relaxed max-w-3xl">
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Timeline;