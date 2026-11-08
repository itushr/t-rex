import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
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
    <header className="border-b border-border px-2 py-2.5 flex items-center justify-between flex-wrap gap-3 z-30">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2">
          <div className="size-8">
            <svg viewBox="13.848000000000003 0 283.6449999999999 305.4" className="size-7" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="M269.352 91.664h-42.436V80.04h70.577v-65.73h-14.294V0H168.4v14.309h-13.848v91.664H140.26v13.861h-20.994v14.309H98.271v14.308H83.977v13.862H58.069v-14.309H44.222v-13.861H29.928v-28.17h-16.08v86.746h13.847v14.308h14.293v13.862h13.848v14.308H70.13v13.862h13.847v56.34h30.375V289.3h-13.848V277.23h13.848v-13.862h14.294V249.06h11.613v14.308h14.294V305.4h30.375V289.3h-14.294v-54.104h14.294V220.89h13.847v-21.016h14.294v-49.186h11.614v13.862h16.527v-30.406h-28.14v-25.934h56.282z" fill="currentcolor" /><path d="M182.248 20.569h16.974V37.56h-16.974z" className="fill-black" /></g></svg>
          </div>
          {title}
        </span>
      </div>
      <div className="flex border border-border rounded p-0.5 text-sm">
        <button
          onClick={() => setViewMode("playback")}
          className={`px-2.5 cursor-pointer py-1 rounded transition-colors ${viewMode === "playback" ? "bg-accent text-bg-primary font-semibold" : "text-text-dim hover:text-text-primary"}`}
        >
          Playbacks
        </button>
        <button
          onClick={() => setViewMode("model")}
          className={`px-2.5 cursor-pointer py-1 rounded transition-colors ${viewMode === "model" ? "bg-accent text-bg-primary font-semibold" : "text-text-dim hover:text-text-primary"}`}
        >
          Model trees
        </button>
        <button
          onClick={() => setViewMode("live")}
          className={`px-2.5 cursor-pointer py-1 rounded transition-colors ${viewMode === "live" ? "bg-accent text-bg-primary font-semibold" : "text-text-dim hover:text-text-primary"}`}
        >
          Live stream
        </button>
      </div>

      <div className="flex items-center gap-2">
        {viewMode === "playback" && onTogglePlay && (
          <>
            <button
              onClick={onTogglePlay}
              className="text-text-primary px-1 py-1 cursor-pointer text-xs font-medium"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={onPrev}
              className="text-text-primary px-1 py-1 cursor-pointer text-xs font-medium"
            >
              <SkipBack size={20} />
            </button>
            <button
              onClick={onNext}
              className="text-text-primary px-1 py-1 cursor-pointer text-xs font-medium"
            >
              <SkipForward size={20} />
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
