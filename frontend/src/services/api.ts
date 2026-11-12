import { ModelSummary, ModelInfo, ModelSingleTreeResponse } from "../types/model";
import { PlaybackMetaResponse, PlaybackSession } from "../types/playback";

export async function fetchPlaybacks(): Promise<PlaybackSession[]> {
  const res = await fetch("/api/playbacks");
  if (!res.ok) throw new Error("Failed to fetch playback list");
  return res.json();
}

export async function fetchPlaybackDetail(filename: string): Promise<PlaybackSession> {
  const res = await fetch(`/api/playbacks/${filename}`);
  if (!res.ok) throw new Error(`Failed to load playback ${filename}`);
  return res.json();
}

export async function fetchPlaybackMeta(filename: string): Promise<PlaybackMetaResponse> {
  const res = await fetch(`/api/playbacks/${filename}/meta`);
  if (!res.ok) throw new Error(`Failed to load meta for ${filename}`);
  return res.json();
}

export async function fetchPlaybackStep(filename: string, stepNo: number): Promise<any> {
  const res = await fetch(`/api/playbacks/${filename}/step/${stepNo}`);
  if (!res.ok) throw new Error(`Failed to load step ${stepNo} for ${filename}`);
  return res.json();
}

export async function fetchPlaybackStepTree(filename: string, stepNo: number, treeNo: number): Promise<any> {
  const res = await fetch(`/api/playbacks/${filename}/step/${stepNo}/tree/${treeNo}`);
  if (!res.ok) throw new Error(`Failed to load tree ${treeNo} for step ${stepNo}`);
  return res.json();
}

export async function fetchModels(): Promise<ModelSummary[]> {
  const res = await fetch("/api/models");
  if (!res.ok) throw new Error("Failed to fetch models");
  return res.json();
}

export async function fetchModelInfo(name: string): Promise<ModelInfo> {
  const res = await fetch(`/api/models/${name}/info`);
  if (!res.ok) throw new Error(`Failed to fetch info for model ${name}`);
  return res.json();
}

export async function fetchModelSingleTree(name: string, treeIdx: number): Promise<ModelSingleTreeResponse> {
  const res = await fetch(`/api/models/${name}/tree/${treeIdx}`);
  if (!res.ok) throw new Error(`Failed to fetch tree ${treeIdx} for model ${name}`);
  return res.json();
}

export async function fetchModelGraph(name: string): Promise<any> {
  const res = await fetch(`/api/models/${name}/graph`);
  if (!res.ok) throw new Error(`Failed to load graph for ${name}`);
  return res.json();
}
