import { useState } from "react";
import { SetupModal } from "./landing/SetupModal";

interface HeaderProps {
  onSetupClick?: () => void;
}

export function Header({ onSetupClick }: HeaderProps) {
  const [internalSetupOpen, setInternalSetupOpen] = useState(false);
  const path = typeof window !== "undefined" ? window.location.pathname : "";

  const handleSetup = () => {
    if (onSetupClick) {
      onSetupClick();
    } else {
      setInternalSetupOpen(true);
    }
  };

  return (
    <>
      <header className="bg-background w-full mx-auto max-w-3xl h-14 rounded-xl border border-border px-5 flex items-center justify-between shadow-2xs">
        <a href="/" className="flex items-center gap-2.5 font-bold text-sm tracking-tight hover:opacity-85 transition-opacity">
          <img src="/dino.svg" className="w-6 opacity-70" />
        </a>

        <nav className="flex items-center gap-5 sm:gap-6">
          <a
            href="/try-web"
            className={`text-xs sm:text-sm font-medium transition-colors hover:text-foreground ${
              path === "/try-web" ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
          >
            Try Web
          </a>
          <button
            onClick={handleSetup}
            className="text-xs sm:text-sm font-medium transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Setup
          </button>
          <a
            href="/dashboard"
            className={`text-xs sm:text-sm font-medium transition-colors hover:text-foreground ${
              path.startsWith("/dashboard") ? "text-foreground font-semibold" : "text-muted-foreground"
            }`}
          >
            Dashboard
          </a>
        </nav>
      </header>

      <SetupModal open={internalSetupOpen} onClose={() => setInternalSetupOpen(false)} />
    </>
  );
}
export default Header;
