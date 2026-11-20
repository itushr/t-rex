import { useEffect, useState } from "react";
import { fetchModels, fetchPlaybacks } from "../services/api";
import { ModelCard, PlaybackCard } from "../components/dashboard/BentoCards";
import { Header2 } from "../components/Header2";
import { navigateTo } from "../utils/navigation";

const BENTO_PATTERN = [1, 3, 3, 1, 3, 1, 3, 3];

function arrangeLocalBento(models: any[], playbacks: any[]): any[] {
  const m = [...models].sort((a, b) => Number(b.timestamp || b.modified || 0) - Number(a.timestamp || a.modified || 0));
  const p = [...playbacks].sort((a, b) => Number(b.timestamp || b.modified || 0) - Number(a.timestamp || a.modified || 0));
  const result: any[] = [];
  let patIdx = 0;

  while (m.length > 0 || p.length > 0) {
    const target = BENTO_PATTERN[patIdx % BENTO_PATTERN.length];
    let picked: any = null;
    if (target === 1 && m.length > 0) picked = m.shift();
    else if (target === 3 && p.length > 0) picked = p.shift();
    else picked = m.shift() || p.shift();

    if (picked) result.push(picked);
    patIdx++;
  }
  return result;
}

export function VisualizerIndexPage() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([fetchModels().catch(() => []), fetchPlaybacks().catch(() => [])])
      .then(([md, pb]) => {
        const mList = md.map((m: any) => ({ ...m, kind: "model", id: `m_${m.name}` }));
        const pList = pb.map((p: any) => ({ ...p, kind: "playback", id: `p_${p.filename || p.name}` }));
        setItems(arrangeLocalBento(mList, pList));
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-10">
      <Header2 />

      <div className="mt-20 max-w-275 mx-auto">
        {items.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm">
            No local models or playbacks recorded yet. Run the driver to start recording!
          </div>
        ) : (
          <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 auto-rows-25 grid-flow-row-dense gap-2">
            {items.map((it) => {
              if (it.kind === "model") {
                return (
                  <ModelCard
                    key={it.id}
                    model={it}
                    isLocal
                    onClick={() => navigateTo(`/visualize/model/${it.name}`)}
                  />
                );
              }
              return (
                <PlaybackCard
                  key={it.id}
                  playback={it}
                  isLocal
                  onClick={() => navigateTo(`/visualize/playback/${it.filename || it.name}`)}
                />
              );
            })}
          </main>
        )}
      </div>
    </div>
  );
}

export default VisualizerIndexPage;
