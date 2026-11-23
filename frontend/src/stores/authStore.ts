import { create } from "zustand";

interface AuthState {
  token: string | null;
  userId: string | null;
  setSession: (token: string, userId: string) => void;
  clearSession: () => void;
  ensureToken: () => Promise<{ token: string; userId: string }>;
}

const TOKEN_KEY = "dino_guest_token";
const USER_KEY = "dino_guest_user_id";

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

  setSession: (token: string, userId: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, userId);
    set({ token, userId });
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, userId: null });
  },

  ensureToken: async () => {
    const { token, userId } = get();
    if (token && userId && !isTokenExpired(token)) {
      return { token, userId };
    }
    get().clearSession();
    const res = await fetch("/api/auth/guest", { method: "POST" });
    if (!res.ok) throw new Error("Failed to initialize guest session");
    const data = await res.json();
    get().setSession(data.token, data.user_id);
    return { token: data.token, userId: data.user_id };
  },
}));
