interface HeaderProps {
  onSetupClick?: () => void;
}

export function Header({ onSetupClick: _unused }: HeaderProps = {}) {
  const path = typeof window !== "undefined" ? window.location.pathname : "";

  return (
    <header className="bg-card w-full mx-auto max-w-3xl h-14 rounded-xl border border-border px-5 flex items-center justify-between shadow-sm">
      <a href="/" className="flex items-center gap-2.5 font-bold text-sm tracking-tight hover:opacity-85 transition-opacity">
        <img src="/dino.svg" className="w-6 opacity-70" alt="Logo" />
      </a>

      <nav className="flex items-center gap-5 sm:gap-6">
        <a
          href="/try-web"
          className={`text-xs sm:text-sm font-medium transition-colors hover:text-foreground ${
            path.startsWith("/try-web") ? "text-foreground font-semibold" : "text-muted-foreground"
          }`}
        >
          Try Web
        </a>
        <a
          href="/setup"
          className={`text-xs sm:text-sm font-medium transition-colors hover:text-foreground ${
            path === "/setup" ? "text-foreground font-semibold" : "text-muted-foreground"
          }`}
        >
          Setup
        </a>
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
  );
}

export default Header;
