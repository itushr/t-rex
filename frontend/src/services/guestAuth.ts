const TOKEN_KEY = "dino_guest_token";
const USER_KEY = "dino_guest_user_id";

export function getGuestToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getGuestUserId(): string | null {
  return localStorage.getItem(USER_KEY);
}

export async function ensureGuestToken(): Promise<{ token: string; userId: string }> {
  const existingToken = getGuestToken();
  const existingUser = getGuestUserId();
  if (existingToken && existingUser) {
    return { token: existingToken, userId: existingUser };
  }

  const res = await fetch("/api/auth/guest", { method: "POST" });
  if (!res.ok) throw new Error("Failed to initialize guest session");
  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, data.user_id);
  return { token: data.token, userId: data.user_id };
}

export function clearGuestSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getGuestToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function authFetch(url: string, init?: RequestInit): Promise<Response> {
  const { token } = await ensureGuestToken();
  const headers = new Headers(init?.headers || {});
  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(url, { ...init, headers });
}
