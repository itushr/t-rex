import { Header } from "./Header";

export function GameNotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-10 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div
          style={{ fontFamily: "'Press Start 2P', monospace" }}
          className="text-base sm:text-xl text-foreground text-center"
        >
          Game not found
        </div>
      </div>
    </div>
  );
}

export default GameNotFound;
