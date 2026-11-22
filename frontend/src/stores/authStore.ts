import { create } from "zustand";

interface AuthState {
  token: string | null;
  userId: string | null;
  isValidated: boolean;
  lastChecked: number;
  setSession: (token: string, userId: string) => void;
  clearSession: () => void;
  ensureToken: () => Promise<{ token: string; userId: string }>;
}

const TOKEN_KEY = "dino_guest_token";
const USER_KEY = "dino_guest_user_id";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (typeof payload.exp === "number") return payload.exp * 1000 <= Date.now();
    return false;
  } catch {
    return false;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  userId: localStorage.getItem(USER_KEY),
  isValidated: false,
  lastChecked: 0,

  setSession: (token: string, userId: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, userId);
    set({ token, userId, isValidated: true, lastChecked: Date.now() });
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, userId: null, isValidated: false, lastChecked: 0 });
  },

  ensureToken: async () => {
    const { token, userId, isValidated, lastChecked } = get();
    const now = Date.now();
    if (token && userId && !isTokenExpired(token)) {
      if (isValidated && now - lastChecked < CACHE_TTL_MS) return { token, userId };
      try {
        const check = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        if (check.ok) {
          set({ isValidated: true, lastChecked: now });
          return { token, userId };
        }
        if (check.status !== 401) {
          // Server error or non-auth issue: preserve current session
          return { token, userId };
        }
      } catch {
        // Network error: preserve existing credentials
        return { token, userId };
      }
    }

    get().clearSession();
    const res = await fetch("/api/auth/guest", { method: "POST" });
    if (!res.ok) throw new Error("Failed to initialize guest session");
    const data = await res.json();
    get().setSession(data.token, data.user_id);
    return { token: data.token, userId: data.user_id };
  },
}));
