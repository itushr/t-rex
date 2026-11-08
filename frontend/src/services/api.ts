import { ModelSummary, GameplaySummary } from "../types/model";
import { PlaybackSession } from "../types/playback";

const API_BASE = "";

export async function fetchPlaybacks(): Promise<PlaybackSession[]> {
  const res = await fetch(`${API_BASE}/api/playbacks`);
  if (!res.ok) throw new Error("Failed to fetch playback list");
  return res.json();
}

export async function fetchPlaybackDetail(filename: string): Promise<PlaybackSession> {
  const res = await fetch(`${API_BASE}/api/playbacks/${filename}`);
  if (!res.ok) throw new Error(`Failed to load playback ${filename}`);
  return res.json();
}

export async function fetchModels(): Promise<ModelSummary[]> {
  const res = await fetch(`${API_BASE}/api/models`);
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}

export async function fetchModelGraph(name: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/models/${name}/graph`);
  if (!res.ok) throw new Error(`Failed to load graph for ${name}`);
  return res.json();
}

export async function fetchGameplays(): Promise<GameplaySummary[]> {
  const res = await fetch(`${API_BASE}/api/gameplays`);
  if (!res.ok) throw new Error("Failed to fetch gameplays");
  return res.json();
}
