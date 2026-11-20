import { Header } from "../components/Header";

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

export function TryWebSelectPage() {
  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-10 flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-8 max-w-3xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center w-full">
          <GameCard href="/try-web/dino" title="T-Rex" img="/dino.svg" />
          <GameCard href="/try-web/flappy-bird" title="Flappy Bird" img="/games/flappybird/flappybird.png" />
        </div>
      </div>
    </div>
  );
}

export default TryWebSelectPage;
