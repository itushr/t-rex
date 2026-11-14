import { useEffect, useState } from "react";
import { Gamepad2, Brain, Terminal, Layers } from "lucide-react";
import { ensureGuestToken } from "../services/guestAuth";
import { listPrivateGameplays, listPrivateModels, listPrivatePlaybacks } from "../services/privateApi";
import { ModelCard, GameplayCard, PlaybackCard, ActionCard } from "../components/dashboard/BentoCards";

const BENTO_LAYOUT = [1, 3, 2, 3, 1, 2, 3, 3, 2, 3, 1, 3];

export function PrivateDashboardV2Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
        })
        .finally(() => setLoading(false));
    });
  }, []);

  const actions = [
    { label: "Play & Record", sub: "/try-web", icon: Gamepad2, to: "/try-web" },
    { label: "Train Model", sub: "/train", icon: Brain, to: "/train" },
    { label: "Local Driver", sub: "/dashboard/local", icon: Terminal, to: "/dashboard/local" },
    { label: "Classic View", sub: "/dashboard", icon: Layers, to: "/dashboard" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] p-5 sm:p-10">
      <div className="bento-container">
        <main className="bento-grid">
          {items.map((it, idx) => {
            const type = BENTO_LAYOUT[idx % BENTO_LAYOUT.length];
            if (it.kind === "model") return <ModelCard key={it.id} model={it} type={type} />;
            if (it.kind === "gameplay") return <GameplayCard key={it.id} gameplay={it} type={type} />;
            return <PlaybackCard key={it.id} playback={it} type={type} />;
          })}
          {actions.map((act, aIdx) => (
            <ActionCard
              key={act.label}
              label={act.label}
              sub={act.sub}
              icon={act.icon}
              to={act.to}
              type={BENTO_LAYOUT[(items.length + aIdx) % BENTO_LAYOUT.length]}
            />
          ))}
          {loading && (
            <div className="bento-card type-2 p-4 flex items-center justify-center font-mono text-xs text-zinc-500">
              Loading workspace...
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default PrivateDashboardV2Page;
