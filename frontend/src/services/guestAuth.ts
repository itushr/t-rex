import { useAuthStore } from "../stores/authStore";

export function getGuestToken(): string | null {
  return useAuthStore.getState().token;
}

export function getGuestUserId(): string | null {
  return useAuthStore.getState().userId;
}

export function clearGuestSession(): void {
  useAuthStore.getState().clearSession();
}

export async function createNewGuestSession(): Promise<{ token: string; userId: string }> {
  useAuthStore.getState().clearSession();
  const res = await fetch("/api/auth/guest", { method: "POST" });
  if (!res.ok) throw new Error("Failed to initialize guest session");
  const data = await res.json();
  useAuthStore.getState().setSession(data.token, data.user_id);
  return { token: data.token, userId: data.user_id };
}

export async function ensureGuestToken(): Promise<{ token: string; userId: string }> {
  return useAuthStore.getState().ensureToken();
}

export function authHeaders(): Record<string, string> {
  const token = getGuestToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const { token } = await ensureGuestToken();
  const headers = new Headers(init?.headers || {});
  headers.set("Authorization", `Bearer ${token}`);

  let res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    const fresh = await createNewGuestSession();
    headers.set("Authorization", `Bearer ${fresh.token}`);
    res = await fetch(url, { ...init, headers });
  }
  return res;
}
