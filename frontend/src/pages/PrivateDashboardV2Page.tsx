import { useEffect, useState } from "react";
import { Gamepad2, Brain, Terminal, Layers } from "lucide-react";
import { ensureGuestToken } from "../services/guestAuth";
import { listPrivateGameplays, listPrivateModels, listPrivatePlaybacks } from "../services/privateApi";
import { ModelCard, GameplayCard, PlaybackCard, ActionCard } from "../components/dashboard/BentoCards";

export function PrivateDashboardV2Page() {
  const [models, setModels] = useState<any[]>([]);
  const [gameplays, setGameplays] = useState<any[]>([]);
  const [playbacks, setPlaybacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureGuestToken().then(() => {
      Promise.all([listPrivateModels(), listPrivateGameplays(), listPrivatePlaybacks()])
        .then(([md, gp, pb]) => { setModels(md); setGameplays(gp); setPlaybacks(pb); })
        .finally(() => setLoading(false));
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] p-5 sm:p-10">
      <div className="bento-container">
        <main className="bento-grid">
          <ActionCard label="Play & Record" sub="/try-web" icon={Gamepad2} to="/try-web" type={2} />
          <ActionCard label="Train Model" sub="/train" icon={Brain} to="/train" type={2} />
          {models.map((m) => (
            <ModelCard key={m.name} model={m} />
          ))}
          {gameplays.map((g) => (
            <GameplayCard key={g.name} gameplay={g} />
          ))}
          {playbacks.map((p) => (
            <PlaybackCard key={p.filename || p.name} playback={p} />
          ))}
          <ActionCard label="Local Driver" sub="/dashboard/local" icon={Terminal} to="/dashboard/local" type={3} />
          <ActionCard label="Classic View" sub="/dashboard" icon={Layers} to="/dashboard" type={3} />
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
