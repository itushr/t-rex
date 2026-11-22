import { Suspense } from "react";
import { getGameDefinition } from "../constants/games";
import { GameNotFound } from "../components/GameNotFound";

export interface PlayProps {
  gameId?: string;
}

export function Play({ gameId = "t-rex" }: PlayProps) {
  const def = getGameDefinition(gameId);

  if (!def) return <GameNotFound />;
  const GameComponent = def.gameComponent;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-background flex flex-col items-center justify-center">
      <Suspense fallback={<div className="text-muted-foreground text-xs">Loading game...</div>}>
        {GameComponent && (
          <GameComponent
            interactive={true}
            soundEnabled={false}
          />
        )}
      </Suspense>
    </div>
  );
}

export default Play;
