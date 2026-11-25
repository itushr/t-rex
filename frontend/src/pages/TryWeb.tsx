import { Header } from "../components/Header";
import { SUPPORTED_GAMES } from "../constants/games";
import { navigateTo } from "../utils/navigation";

function GameCard({
  href,
  title,
  mode,
  img,
}: {
  href: string;
  title: string;
  mode: string;
  img: string;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigateTo(href);
      }}
      className="w-full sm:w-72 border-2 border-border rounded-xl text-card-foreground p-1 hover:border-muted-foreground/40 transition-all hover:scale-[1.02] cursor-pointer block"
    >
      <div className="bg-card rounded-xl shadow-sm p-8 flex items-center justify-center gap-5">
        <img src={img} className="h-12 w-12 object-contain" alt={title} />
        <div style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-xs sm:text-sm">
          <div className="font-bold text-foreground whitespace-nowrap">{title}</div>
          <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">{mode}</div>
        </div>
      </div>
    </a>
  );
}

export function TryWeb() {
  const games = SUPPORTED_GAMES.filter((g) => g.isAvailable);

  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-10 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-3xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row flex-wrap gap-6 items-center justify-center w-full">
          {games.map((g) => (
            <GameCard key={g.id} href={`/try-web/immitation/${g.id}`} title={g.name} mode="immitation" img={g.thumbnail} />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row-reverse flex-wrap gap-6 items-center justify-center w-full">
          {games.map((g) => (
            <GameCard key={g.id} href={`/try-web/reinforcement/${g.id}`} title={g.name} mode="reinforcement" img={g.thumbnail} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TryWeb;
