import React from "react";

export function Kbd({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={`inline-flex items-center justify-center font-mono text-[9px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700/60 rounded px-1.5 py-0.5 leading-none uppercase shadow-2xs ${className}`}
    >
      {children}
    </kbd>
  );
}
export default Kbd;
