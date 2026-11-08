import React, { useState, useEffect } from "react";
import { PlaybackStep } from "../types/playback";
import { StepHUD } from "./StepHUD";

export const LiveStreamView: React.FC = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [latestStep, setLatestStep] = useState<PlaybackStep | null>(null);
  const [history, setHistory] = useState<PlaybackStep[]>([]);

  useEffect(() => {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${proto}//${window.location.host}/ws/stream`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onmessage = (event) => {
      try {
        const msg = jsonParse(event.data);
        if (msg.type === "step") {
          setLatestStep(msg.data);
          setHistory((prev) => [msg.data, ...prev.slice(0, 49)]);
        }
      } catch (e) {}
    };

    return () => ws.close();
  }, []);

  function jsonParse(str: string) {
    return JSON.parse(str);
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary overflow-hidden">
      <div className="p-3 bg-bg-panel border-b border-border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-jump" : "bg-duck"}`} />
          <span className="text-xs font-semibold text-text-primary">
            {connected ? "Connected to live stream" : "Waiting for WebSocket connection..."}
          </span>
        </div>
        <span className="text-xs font-mono-code text-text-dim">Frames received: {history.length}</span>
      </div>

      <StepHUD step={latestStep} activeTreeIndex={0} />

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        <span className="text-xs font-semibold text-text-muted uppercase">Recent stream frames</span>
        {history.map((s, idx) => (
          <div key={`live-frame-${idx}`} className="bg-bg-card border border-border-default p-2 rounded text-xs font-mono-code flex items-center justify-between">
            <span>Step #{s.step}</span>
            <span>Speed: {s.speed.toFixed(1)}</span>
            <span>TTI: {s.time_to_impact && s.time_to_impact > 0 ? s.time_to_impact.toFixed(1) : "—"}</span>
            <span className={`px-2 py-0.5 rounded border uppercase text-[10px] font-bold ${
              s.action === "jump" ? "text-jump border-jump" : s.action === "duck" ? "text-duck border-duck" : "text-text-dim border-border-default"
            }`}>{s.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
