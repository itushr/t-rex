import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { PlaybackView } from "../components/PlaybackView";
import { ModelGraphView } from "../components/ModelGraphView";
import { LiveStreamView } from "../components/LiveStreamView";
import { fetchPlaybacks, fetchPlaybackDetail } from "../services/api";
import { PlaybackSession } from "../types/playback";
import { usePlaybackScrubber } from "../hooks/usePlaybackScrubber";

export function VisualizerPage() {
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
    <div className="visualizer-theme flex flex-col h-screen w-screen overflow-hidden text-foreground bg-background">
      <Header
        title="T-Rex"
        viewMode={viewMode}
        setViewMode={setViewMode}
        isPlaying={scrubber.isPlaying}
        onTogglePlay={scrubber.togglePlay}
        onPrev={scrubber.prevStep}
        onNext={scrubber.nextStep}
      />

      {viewMode === "playback" && currentSession && (
        <PlaybackView session={currentSession} scrubber={scrubber} />
      )}
      {viewMode === "model" && <ModelGraphView />}
      {viewMode === "live" && <LiveStreamView />}
    </div>
  );
}
