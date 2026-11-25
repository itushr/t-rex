import { Header } from "../components/Header";
import { SUPPORTED_GAMES } from "../constants/games";

function GameCard({ href, title, img }: { href: string; title: string; img: string }) {
  return (
    <a
      href={href}
      className="w-full sm:w-72 border-2 border-border rounded-xl text-card-foreground p-1 hover:border-muted-foreground/40 transition-all hover:scale-[1.02] cursor-pointer block"
    >
      <div className="bg-card rounded-xl shadow-sm p-8 flex items-center justify-center gap-5">
        <img src={img} className="h-12 w-12 object-contain" alt={title} />
        <div style={{ fontFamily: "'Press Start 2P', monospace" }} className="text-sm font-bold text-foreground">
          {title}
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
            <GameCard key={g.id} href={`/try-web/immitation/${g.id}`} title={g.name} img={g.thumbnail} />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row-reverse flex-wrap gap-6 items-center justify-center w-full">
          {games.map((g) => (
            <GameCard key={g.id} href={`/try-web/reinforcement/${g.id}`} title={g.name} img={g.thumbnail} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default TryWeb;
