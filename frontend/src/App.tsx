import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { PlaybackView } from "./components/PlaybackView";
import { ModelGraphView } from "./components/ModelGraphView";
import { LiveStreamView } from "./components/LiveStreamView";
import { fetchPlaybacks, fetchPlaybackDetail } from "./services/api";
import { PlaybackSession } from "./types/playback";
import { usePlaybackScrubber } from "./hooks/usePlaybackScrubber";

export function App() {
  const [viewMode, setViewMode] = useState<"playback" | "model" | "live">("playback");
  const [playbacks, setPlaybacks] = useState<PlaybackSession[]>([]);
  const [selectedFilename, setSelectedFilename] = useState<string>("");
  const [currentSession, setCurrentSession] = useState<PlaybackSession | null>(null);

  useEffect(() => {
    fetchPlaybacks().then((list) => {
      setPlaybacks(list);
      if (list.length > 0 && list[0].filename) {
        setSelectedFilename(list[0].filename);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedFilename) return;
    fetchPlaybackDetail(selectedFilename).then((session) => {
      setCurrentSession(session);
    });
  }, [selectedFilename]);

  const scrubber = usePlaybackScrubber(currentSession?.records ?? []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden text-foreground bg-background">
      <Header
        title="T-Rex"
        viewMode={viewMode}
        setViewMode={setViewMode}
        isPlaying={scrubber.isPlaying}
        onTogglePlay={scrubber.togglePlay}
        onPrev={scrubber.prevStep}
        onNext={scrubber.nextStep}
      />

      {/* {viewMode === "playback" && (
        <div className="px-3 py-1.5 bg-bg-panel border-b border-border-default flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-text-muted">Session:</span>
            <select
              value={selectedFilename}
              onChange={(e) => setSelectedFilename(e.target.value)}
              className="bg-bg-card border border-border-default text-text-primary rounded px-2 py-0.5 outline-none font-mono-code"
            >
              {playbacks.map((p) => (
                <option key={p.filename} value={p.filename}>
                  {p.filename} ({p.model_name})
                </option>
              ))}
            </select>
          </div>
          {currentSession && (
            <span className="text-text-dim font-mono-code">
              {currentSession.total_steps} steps | {currentSession.duration}s | {currentSession.crashed ? "crashed" : "survived"}
            </span>
          )}
        </div>
      )} */}

      {viewMode === "playback" && currentSession && (
        <PlaybackView session={currentSession} scrubber={scrubber} />
      )}
      {viewMode === "model" && <ModelGraphView />}
      {viewMode === "live" && <LiveStreamView />}
    </div>
  );
}

export default App;
