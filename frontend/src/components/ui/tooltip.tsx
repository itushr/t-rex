import React, { createContext, useContext, useState } from "react";

interface TooltipContextType {
  open: boolean;
  setOpen: (o: boolean) => void;
}
const TooltipContext = createContext<TooltipContextType>({ open: false, setOpen: () => {} });

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div
        className="relative inline-flex items-center justify-center"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({ children, render }: { children?: React.ReactNode; render?: React.ReactNode }) {
  return <>{render || children}</>;
}

export function TooltipContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { open } = useContext(TooltipContext);
  if (!open) return null;
  return (
    <div
      className={`absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700/80 text-white text-[11px] font-medium shadow-2xl whitespace-nowrap pointer-events-none ${className}`}
    >
      {children}
    </div>
  );
}
