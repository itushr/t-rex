const TOKEN_KEY = "dino_guest_token";
const USER_KEY = "dino_guest_user_id";

let refreshPromise: Promise<{ token: string; userId: string }> | null = null;

export function getGuestToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getGuestUserId(): string | null {
  return localStorage.getItem(USER_KEY);
}

export function clearGuestSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function createNewGuestSession(): Promise<{ token: string; userId: string }> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    clearGuestSession();
    const res = await fetch("/api/auth/guest", { method: "POST" });
    if (!res.ok) throw new Error("Failed to initialize guest session");
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, data.user_id);
    return { token: data.token, userId: data.user_id };
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

export async function ensureGuestToken(): Promise<{ token: string; userId: string }> {
  const existingToken = getGuestToken();
  const existingUser = getGuestUserId();
  if (existingToken && existingUser) {
    try {
      const check = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${existingToken}` },
      });
      if (check.ok) return { token: existingToken, userId: existingUser };
    } catch {
      // Network error, proceed to refresh
    }
  }
  return createNewGuestSession();
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
