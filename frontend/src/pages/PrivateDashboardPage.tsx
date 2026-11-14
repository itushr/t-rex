import { useEffect, useState } from "react";
import { Play, Sparkles, Eye, Plus, Terminal } from "lucide-react";
import { ensureGuestToken, getGuestUserId } from "../services/guestAuth";
import { listPrivateGameplays, listPrivateModels, listPrivatePlaybacks } from "../services/privateApi";
import { navigateTo } from "../utils/navigation";

export function PrivateDashboardPage() {
  const [userId, setUserId] = useState<string>("");
  const [gameplays, setGameplays] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [playbacks, setPlaybacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureGuestToken().then(({ userId }) => {
      setUserId(userId);
      Promise.all([listPrivateGameplays(), listPrivateModels(), listPrivatePlaybacks()])
        .then(([gp, md, pb]) => { setGameplays(gp); setModels(md); setPlaybacks(pb); })
        .finally(() => setLoading(false));
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F4ED] text-black px-4 py-8 md:py-12 flex flex-col items-center">
      <div className="max-w-5xl w-full flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DDD6CB] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#6E6962]">Private Workspace</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black text-[#F7F4ED]">{userId}</span>
            </div>
            <h1 className="text-3xl font-medium tracking-tight mt-1">Runner Intelligence Studio</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => navigateTo("/dashboard/local")} className="px-3.5 py-2 rounded-full border border-[#DDD6CB] bg-white text-xs font-medium hover:border-black flex items-center gap-1.5 transition-colors">
              <Terminal className="size-3.5" /> Driver Local
            </button>
            <button onClick={() => navigateTo("/try-web")} className="px-4 py-2 rounded-full bg-black text-[#F7F4ED] text-xs font-medium hover:bg-zinc-800 flex items-center gap-1.5 transition-colors shadow-sm">
              <Plus className="size-3.5" /> Play /try-web
            </button>
          </div>
        </div>

        {loading ? <div className="text-xs font-mono text-[#6E6962] py-12 text-center">Loading workspace...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#DDD6CB] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-black">Gameplays ({gameplays.length})</h2>
                <button onClick={() => navigateTo("/try-web")} className="text-xs font-mono text-[#6E6962] hover:text-black">+ Record</button>
              </div>
              <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto">
                {!gameplays.length ? <p className="text-xs text-[#6E6962]">No runs recorded yet.</p> : gameplays.map((g) => (
                  <div key={g.name} className="p-3 rounded-xl border border-[#DDD6CB]/60 bg-[#F7F4ED]/30 flex flex-col gap-1.5">
                    <span className="font-mono text-xs font-medium truncate">{g.name}</span>
                    <button onClick={() => navigateTo(`/train?gameplay=${g.name}`)} className="text-[11px] font-mono text-black underline text-left hover:text-zinc-600">Train Model →</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#DDD6CB] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-black">Models ({models.length})</h2>
                <button onClick={() => navigateTo("/train")} className="text-xs font-mono text-[#6E6962] hover:text-black">+ Train</button>
              </div>
              <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto">
                {!models.length ? <p className="text-xs text-[#6E6962]">No models trained yet.</p> : models.map((m) => (
                  <div key={m.name} className="p-3 rounded-xl border border-[#DDD6CB]/60 bg-[#F7F4ED]/30 flex flex-col gap-2">
                    <div className="flex items-center justify-between"><span className="font-mono text-xs font-medium truncate">{m.name}</span><span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#DDD6CB]">{m.model_type}</span></div>
                    <div className="flex gap-2">
                      <button onClick={() => navigateTo(`/try-web/autoplay/private/${m.name}`)} className="flex-1 py-1 rounded-full bg-black text-[#F7F4ED] text-[11px] font-mono flex items-center justify-center gap-1 hover:bg-zinc-800"><Play className="size-2.5 fill-current" /> Autoplay</button>
                      <button onClick={() => navigateTo(`/visualize/model/private/${m.name}`)} className="flex-1 py-1 rounded-full border border-[#DDD6CB] text-[11px] font-mono flex items-center justify-center gap-1 hover:border-black"><Eye className="size-2.5" /> Tree</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#DDD6CB] rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-black">Playbacks ({playbacks.length})</h2>
              </div>
              <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto">
                {!playbacks.length ? <p className="text-xs text-[#6E6962]">No playbacks recorded yet.</p> : playbacks.map((p) => (
                  <div key={p.name} onClick={() => navigateTo(`/visualize/playback/private/${p.filename || p.name}`)} className="p-3 rounded-xl border border-[#DDD6CB]/60 bg-[#F7F4ED]/30 cursor-pointer hover:border-black transition-colors flex flex-col gap-1">
                    <span className="font-mono text-xs font-medium truncate">{p.name}</span>
                    <span className="text-[11px] font-mono text-[#6E6962]">{p.total_steps} steps • {p.duration}s</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default PrivateDashboardPage;
