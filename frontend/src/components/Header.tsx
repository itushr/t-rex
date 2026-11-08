import React from "react";

interface HeaderProps {
  title: string;
  viewMode: "playback" | "model" | "live";
  setViewMode: (mode: "playback" | "model" | "live") => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onResetZoom?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  viewMode,
  setViewMode,
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  onResetZoom,
}) => {
  return (
    <header className="bg-bg-panel border-b border-border-default px-4 py-2.5 flex items-center justify-between flex-wrap gap-3 z-30">
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-text-primary tracking-tight">{title}</span>
        <div className="flex bg-bg-card border border-border-default rounded p-0.5 text-xs">
          <button
            onClick={() => setViewMode("playback")}
            className={`px-2.5 py-1 rounded transition-colors ${viewMode === "playback" ? "bg-accent text-bg-primary font-semibold" : "text-text-dim hover:text-text-primary"}`}
          >
            Playbacks
          </button>
          <button
            onClick={() => setViewMode("model")}
            className={`px-2.5 py-1 rounded transition-colors ${viewMode === "model" ? "bg-accent text-bg-primary font-semibold" : "text-text-dim hover:text-text-primary"}`}
          >
            Model trees
          </button>
          <button
            onClick={() => setViewMode("live")}
            className={`px-2.5 py-1 rounded transition-colors ${viewMode === "live" ? "bg-accent text-bg-primary font-semibold" : "text-text-dim hover:text-text-primary"}`}
          >
            Live stream
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {viewMode === "playback" && onTogglePlay && (
          <>
            <button
              onClick={onTogglePlay}
              className="bg-bg-card border border-border-default hover:border-border-hover text-text-primary px-3 py-1 rounded text-xs font-medium"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              onClick={onPrev}
              className="bg-bg-card border border-border-default hover:border-border-hover text-text-primary px-3 py-1 rounded text-xs font-medium"
            >
              Previous
            </button>
            <button
              onClick={onNext}
              className="bg-bg-card border border-border-default hover:border-border-hover text-text-primary px-3 py-1 rounded text-xs font-medium"
            >
              Next
            </button>
          </>
        )}
        {onResetZoom && (
          <button
            onClick={onResetZoom}
            className="bg-bg-card border border-border-default hover:border-border-hover text-text-dim hover:text-text-primary px-3 py-1 rounded text-xs font-medium"
          >
            Reset view
          </button>
        )}
      </div>
    </header>
  );
};
