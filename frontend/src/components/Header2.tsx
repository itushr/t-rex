import { MouseEvent } from "react";
import { navigateTo } from "../utils/navigation";

function navClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  e.preventDefault();
  navigateTo(href);
}

export function Header2() {
  return (
    <header className="bg-card w-full mx-auto max-w-3xl h-14 rounded-xl border border-border px-5 flex items-center justify-between shadow-sm">
      <a
        href="/dashboard/local"
        onClick={(e) => navClick(e, "/dashboard/local")}
        className="flex items-center gap-2.5 font-bold text-sm tracking-tight hover:opacity-85 transition-opacity"
      >
        <img src="/dino.svg" className="w-6 opacity-70" alt="Logo" />
      </a>

      <nav className="flex items-center gap-5 sm:gap-6">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-xs sm:text-sm font-medium transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Gameplays
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-xs sm:text-sm font-medium transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Models
        </a>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-xs sm:text-sm font-medium transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
        >
          Autoplays
        </a>
      </nav>
    </header>
  );
}

export default Header2;
