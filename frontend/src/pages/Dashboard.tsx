import { useEffect } from "react";
import { ModelCard, GameplayCard, PlaybackCard } from "../components/dashboard/BentoCards";
import { useDashboardStore } from "../stores/dashboardStore";
import { navigateTo } from "../utils/navigation";
import Header from "../components/Header";
import { Header2 } from "../components/Header2";

export function Dashboard({ isLocal = false }: { isLocal?: boolean }) {
  const items = useDashboardStore((s) => (isLocal ? s.localItems : s.privateItems));
  const loaded = useDashboardStore((s) => (isLocal ? s.localLoaded : s.privateLoaded));
  const fetchDashboard = useDashboardStore((s) => s.fetchDashboard);

  useEffect(() => {
    fetchDashboard(isLocal);
  }, [isLocal, fetchDashboard]);

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
