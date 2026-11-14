import { useEffect, useState } from "react";
import { ensureGuestToken } from "../services/guestAuth";
import { listPrivateGameplays, listPrivateModels, listPrivatePlaybacks } from "../services/privateApi";
import { ModelCard, GameplayCard, PlaybackCard } from "../components/dashboard/BentoCards";

export function PrivateDashboardV2Page() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    ensureGuestToken().then(() => {
      Promise.all([listPrivateModels(), listPrivateGameplays(), listPrivatePlaybacks()])
        .then(([md, gp, pb]) => {
          const unified = [
            ...md.map((m: any) => ({ ...m, kind: "model", id: `m_${m.name}` })),
            ...gp.map((g: any) => ({ ...g, kind: "gameplay", id: `g_${g.name}` })),
            ...pb.map((p: any) => ({ ...p, kind: "playback", id: `p_${p.filename || p.name}` })),
          ];
          unified.sort((a, b) => Number(b.timestamp || b.modified || 0) - Number(a.timestamp || a.modified || 0));
          setItems(unified);
        });
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] p-5 sm:p-10">
      <div className="bento-container">
        <main className="bento-grid">
          {items.map((it) => {
            if (it.kind === "model") return <ModelCard key={it.id} model={it} />;
            if (it.kind === "gameplay") return <GameplayCard key={it.id} gameplay={it} />;
            return <PlaybackCard key={it.id} playback={it} />;
          })}
        </main>
      </div>
    </div>
  );
}
export default PrivateDashboardV2Page;
