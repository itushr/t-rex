import { authFetch } from "./guestAuth";

export async function listPrivateGameplays(): Promise<any[]> {
  const r = await authFetch("/api/private/gameplays");
  return r.ok ? r.json() : [];
}

export async function savePrivateGameplay(samples: any[], name?: string): Promise<any> {
  const r = await authFetch("/api/private/gameplays", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, samples }),
  });
  if (!r.ok) throw new Error("Failed to save gameplay");
  return r.json();
}

export async function getPrivateGameplay(name: string): Promise<any> {
  const r = await authFetch(`/api/private/gameplays/${name}`);
  if (!r.ok) throw new Error("Failed to fetch gameplay");
  return r.json();
}

export async function trainPrivateModel(payload: any): Promise<any> {
  const r = await authFetch("/api/private/models/train", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.detail || "Training failed");
  return data;
}

export async function listPrivateModels(): Promise<any[]> {
  const r = await authFetch("/api/private/models");
  return r.ok ? r.json() : [];
}

export async function getPrivateModelInfo(name: string): Promise<any> {
  const r = await authFetch(`/api/private/models/${name}/info`);
  if (!r.ok) throw new Error(`Model info error: ${name}`);
  return r.json();
}

export async function getPrivateModelSingleTree(name: string, idx: number): Promise<any> {
  const r = await authFetch(`/api/private/models/${name}/tree/${idx}`);
  if (!r.ok) throw new Error(`Model tree error: ${name} tree ${idx}`);
  return r.json();
}

export async function listPrivatePlaybacks(): Promise<any[]> {
  const r = await authFetch("/api/private/playbacks");
  return r.ok ? r.json() : [];
}

export async function savePrivatePlayback(model_name: string, steps: any[], playback_name?: string): Promise<any> {
  const r = await authFetch("/api/private/playbacks", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_name, steps, playback_name }),
  });
  if (!r.ok) throw new Error("Failed to save playback");
  return r.json();
}

export async function getPrivatePlaybackMeta(name: string): Promise<any> {
  const r = await authFetch(`/api/private/playbacks/${name}/meta`);
  if (!r.ok) throw new Error("Playback meta error");
  return r.json();
}

export async function getPrivatePlaybackStep(name: string, stepNo: number): Promise<any> {
  const r = await authFetch(`/api/private/playbacks/${name}/step/${stepNo}`);
  if (!r.ok) throw new Error("Playback step error");
  return r.json();
}
