import { create } from "zustand";
import { fetchPrivateDashboard, fetchLocalDashboard } from "../services/privateApi";
import { useAuthStore } from "./authStore";

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

interface DashboardState {
  privateItems: any[];
  localItems: any[];
  privateLoaded: boolean;
  localLoaded: boolean;
  fetchDashboard: (isLocal?: boolean, force?: boolean) => Promise<void>;
  invalidate: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  privateItems: [],
  localItems: [],
  privateLoaded: false,
  localLoaded: false,

  invalidate: () => set({ privateLoaded: false, localLoaded: false }),

  fetchDashboard: async (isLocal = false, force = false) => {
    const s = get();
    if ((isLocal ? s.localLoaded : s.privateLoaded) && !force) return;

    if (isLocal) {
      try {
        const d = await fetchLocalDashboard();
        const items = arrangeBento(
          d.models.map((x: any) => ({ ...x, kind: "model", id: `m_${x.name}` })),
          d.gameplays.map((x: any) => ({ ...x, kind: "gameplay", id: `g_${x.name}` })),
          d.playbacks.map((x: any) => ({ ...x, kind: "playback", id: `p_${x.name}` }))
        );
        set({ localItems: items, localLoaded: true });
      } catch {
        set({ localItems: [], localLoaded: true });
      }
      return;
    }

    const token = useAuthStore.getState().token;
    if (!token) {
      set({ privateItems: [], privateLoaded: true });
      return;
    }

    try {
      const d = await fetchPrivateDashboard();
      if (d.token && d.user_id) useAuthStore.getState().setSession(d.token, d.user_id);
      const items = arrangeBento(
        d.models.map((x: any) => ({ ...x, kind: "model", id: `m_${x.name}` })),
        d.gameplays.map((x: any) => ({ ...x, kind: "gameplay", id: `g_${x.name}` })),
        d.playbacks.map((x: any) => ({ ...x, kind: "playback", id: `p_${x.name}` }))
      );
      set({ privateItems: items, privateLoaded: true });
    } catch (err: any) {
      if (err.message === "UNAUTHORIZED") useAuthStore.getState().clearSession();
      set({ privateItems: [], privateLoaded: true });
    }
  },
}));
