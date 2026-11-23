import { useEffect, useState, useRef } from "react";
import { fetchPrivateDashboard, fetchLocalDashboard } from "../services/privateApi";
import { useAuthStore } from "../stores/authStore";
import { ModelCard, GameplayCard, PlaybackCard } from "../components/dashboard/BentoCards";
import { navigateTo } from "../utils/navigation";
import Header from "../components/Header";
import { Header2 } from "../components/Header2";

const BENTO = [1, 3, 2, 3, 1, 2, 3, 3, 2, 3, 1, 3];

function arrangeBento(m: any[], g: any[], p: any[]): any[] {
  const [ms, gs, ps] = [[...m], [...g], [...p]];
  const res: any[] = [];
  let pat = 0;
  while (ms.length > 0 || gs.length > 0 || ps.length > 0) {
    const t = BENTO[pat % BENTO.length];
    let picked: any = null;
    if (t === 1 && ms.length) picked = ms.shift();
    else if (t === 2 && gs.length) picked = gs.shift();
    else if (t === 3 && ps.length) picked = ps.shift();
    else picked = ms.shift() || gs.shift() || ps.shift();
    if (picked) res.push(picked);
    pat++;
  }
  return res;
}

export function Dashboard({ isLocal = false }: { isLocal?: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const fetchedRef = useRef(false);
  const token = useAuthStore((s) => s.token);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setSession = useAuthStore((s) => s.setSession);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    if (isLocal) {
      fetchLocalDashboard().then((d) => {
        setItems(arrangeBento(d.models.map((x: any) => ({ ...x, kind: "model", id: `m_${x.name}` })),
          d.gameplays.map((x: any) => ({ ...x, kind: "gameplay", id: `g_${x.name}` })),
          d.playbacks.map((x: any) => ({ ...x, kind: "playback", id: `p_${x.name}` }))));
      }).catch(() => setItems([])).finally(() => setLoaded(true));
      return;
    }
    if (!token) { setLoaded(true); return; }
    fetchPrivateDashboard().then((d) => {
      if (d.token && d.user_id) setSession(d.token, d.user_id);
      setItems(arrangeBento(d.models.map((x: any) => ({ ...x, kind: "model", id: `m_${x.name}` })),
        d.gameplays.map((x: any) => ({ ...x, kind: "gameplay", id: `g_${x.name}` })),
        d.playbacks.map((x: any) => ({ ...x, kind: "playback", id: `p_${x.name}` }))));
    }).catch((err) => {
      if (err.message === "UNAUTHORIZED") clearSession();
      setItems([]);
    }).finally(() => setLoaded(true));
  }, [isLocal, token, clearSession, setSession]);

  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-10">
      {isLocal ? <Header2 /> : <Header />}
      <div className="mt-20 max-w-275 mx-auto">
        {loaded && items.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg">You have no data</p>
            <p className="text-xs mt-2 text-muted-foreground/60">Play a game or train a model to get started</p>
          </div>
        ) : (
          <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-25 grid-flow-row-dense gap-2">
            {items.map((it) => {
              const sr = it.sr_no || it.name;
              if (it.kind === "model") {
                const u = isLocal ? `/visualizer/model/local/${sr}` : `/try-web/autoplay/${it.game_id || "t-rex"}/private/${sr}`;
                return <ModelCard key={it.id} model={it} isLocal={isLocal} onClick={() => navigateTo(u)} />;
              }
              if (it.kind === "gameplay") {
                const u = `/try-web/train?gameplay=${sr}&game=${it.game_id || "t-rex"}`;
                return <GameplayCard key={it.id} gameplay={it} onClick={() => navigateTo(u)} />;
              }
              const u = isLocal ? `/visualizer/playback/local/${sr}` : `/visualize/playback/private/${sr}`;
              return <PlaybackCard key={it.id} playback={it} isLocal={isLocal} onClick={() => navigateTo(u)} />;
            })}
          </main>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
