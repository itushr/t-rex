import { useEffect, useState } from "react";
import { ensureGuestToken } from "../services/guestAuth";
import { listPrivateGameplays, listPrivateModels, listPrivatePlaybacks } from "../services/privateApi";
import { ModelCard, GameplayCard, PlaybackCard } from "../components/dashboard/BentoCards";
import { navigateTo } from "../utils/navigation";
import Header from "../components/Header";

const BENTO_PATTERN = [1, 3, 2, 3, 1, 2, 3, 3, 2, 3, 1, 3];

function arrangeBento(models: any[], gameplays: any[], playbacks: any[]): any[] {
  const m = [...models].sort((a, b) => Number(b.timestamp || b.modified || 0) - Number(a.timestamp || a.modified || 0));
  const g = [...gameplays].sort((a, b) => Number(b.timestamp || b.modified || 0) - Number(a.timestamp || a.modified || 0));
  const p = [...playbacks].sort((a, b) => Number(b.timestamp || b.modified || 0) - Number(a.timestamp || a.modified || 0));

  const result: any[] = [];
  let patIdx = 0;

  while (m.length > 0 || g.length > 0 || p.length > 0) {
    const target = BENTO_PATTERN[patIdx % BENTO_PATTERN.length];
    let picked: any = null;

    if (target === 1 && m.length > 0) picked = m.shift();
    else if (target === 2 && g.length > 0) picked = g.shift();
    else if (target === 3 && p.length > 0) picked = p.shift();
    else {
      const candidates = [m[0], g[0], p[0]].filter(Boolean);
      candidates.sort((a, b) => Number(b.timestamp || b.modified || 0) - Number(a.timestamp || a.modified || 0));
      picked = candidates[0];
      if (picked === m[0]) m.shift();
      else if (picked === g[0]) g.shift();
      else p.shift();
    }

    if (picked) result.push(picked);
    patIdx++;
  }

  return result;
}

export function PrivateDashboardV2Page() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    ensureGuestToken().then(() => {
      Promise.all([listPrivateModels(), listPrivateGameplays(), listPrivatePlaybacks()])
        .then(([md, gp, pb]) => {
          const mList = md.map((m: any) => ({ ...m, kind: "model", id: `m_${m.name}` }));
          const gList = gp.map((g: any) => ({ ...g, kind: "gameplay", id: `g_${g.name}` }));
          const pList = pb.map((p: any) => ({ ...p, kind: "playback", id: `p_${p.filename || p.name}` }));
          setItems(arrangeBento(mList, gList, pList));
        });
    });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-10">
      <Header />

      <div className="mt-20 max-w-275 mx-auto">
        <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-25 grid-flow-row-dense gap-2">
          {items.map((it) => {
            if (it.kind === "model") {
              const url = it.game_id === "flappy-bird" ? `/autoplay/flappy-bird/private/${it.name}` : `/try-web/autoplay/private/${it.name}`;
              return <ModelCard key={it.id} model={it} onClick={() => navigateTo(url)} />;
            }
            if (it.kind === "gameplay") {
              const url = it.game_id === "flappy-bird" ? `/train/flappy-bird?gameplay=${it.name}` : `/train?gameplay=${it.name}`;
              return <GameplayCard key={it.id} gameplay={it} onClick={() => navigateTo(url)} />;
            }
            if (it.kind === "playback") {
              return <PlaybackCard key={it.id} playback={it} onClick={() => navigateTo(`/visualize/playback/private/${it.filename || it.name}`)} />;
            }
          })}
        </main>
      </div>
    </div>
  );
}
export default PrivateDashboardV2Page;
