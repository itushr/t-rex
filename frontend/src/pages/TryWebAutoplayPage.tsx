import { useEffect, useRef, useState } from "react";
import { AUDIO_PRESS, AUDIO_HIT, AUDIO_REACHED } from "./runnerAudio";
import { OnnxDinoAutoplay } from "../game/onnxAutoplay";
import { ActionPanel } from "../components/ActionPanel";
import { patchRunner } from "../game/runnerAudioPatch";
import { soundManager } from "../game/soundManager";
import { useGameRunnerControls } from "../game/useGameRunnerControls";
import { useAutoplayPlaybackRecorder } from "../game/useAutoplayPlaybackRecorder";

const INPUTS = ["keydown", "keyup", "keypress", "mousedown", "touchstart"] as const;

export function TryWebAutoplayPage({ modelName }: { modelName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<OnnxDinoAutoplay>(new OnnxDinoAutoplay());
  const [soundEnabled, setSoundEnabled] = useState(false);
  const { gameStatus, togglePlayPause, restart } = useGameRunnerControls();
  const { isRecording, isRecordingPaused, toggleRecord, visualizePlayback } = useAutoplayPlaybackRecorder(gameStatus, autoplayRef.current);

  useEffect(() => {
    soundManager.setSoundEnabled(false);
    let scriptTag: HTMLScriptElement | null = null;
    const linkTag = document.createElement("link");
    linkTag.rel = "stylesheet"; linkTag.href = "/t-rex-runner/index.css";
    document.head.appendChild(linkTag);
    document.body.classList.add("offline", "arcade-mode");

    const tpl = document.getElementById("audio-resources") as HTMLTemplateElement | null;
    if (tpl) tpl.innerHTML = `<audio id="offline-sound-press" src="${AUDIO_PRESS}"></audio><audio id="offline-sound-hit" src="${AUDIO_HIT}"></audio><audio id="offline-sound-reached" src="${AUDIO_REACHED}"></audio>`;

    const disable = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.(".action-panel")) return;
      e.stopPropagation(); if (e.type.startsWith("key")) e.preventDefault();
    };
    INPUTS.forEach((ev) => window.addEventListener(ev, disable, { capture: true }));
    const autoplay = autoplayRef.current;
    let initialized = false;

    function start() {
      const win = window as any;
      if (typeof win.Runner !== "function" || !containerRef.current || initialized) return;
      initialized = true;
      document.querySelectorAll(".runner-container").forEach((el) => el.remove());
      if (win.Runner.instance_) { win.Runner.instance_.stop?.(); win.Runner.instance_ = null; }
      win.Runner.soundEnabled = false; win.Runner.isWeb = false;
      patchRunner(win.Runner);
      new win.Runner(".interstitial-wrapper");
      const r = win.Runner.instance_;
      if (r) {
        r.soundEnabled = false; r.isWeb = false; r.stopListening?.(); r.onVisibilityChange = () => {};
        if (r.containerEl) r.containerEl.style.width = r.dimensions?.WIDTH + "px";
        r.activated = true; r.setArcadeMode?.();
        autoplay.init(modelName).then((ok) => { if (ok) autoplay.start(); });
      }
    }

    if (typeof (window as any).Runner === "function") start();
    else {
      scriptTag = document.createElement("script");
      scriptTag.src = "/t-rex-runner/index.js?v=" + Date.now();
      scriptTag.async = true; scriptTag.onload = start;
      document.body.appendChild(scriptTag);
    }

    return () => {
      autoplay.stop();
      INPUTS.forEach((ev) => window.removeEventListener(ev, disable, { capture: true }));
      const r = (window as any).Runner?.instance_;
      if (r) { r.stop?.(); (window as any).Runner.instance_ = null; }
      document.querySelectorAll(".runner-container").forEach((el) => el.remove());
      document.body.classList.remove("offline", "arcade-mode", "inverted");
      linkTag.parentNode?.removeChild(linkTag); scriptTag?.parentNode?.removeChild(scriptTag);
    };
  }, [modelName]);

  const toggleSound = () => setSoundEnabled((prev) => {
    const next = !prev; soundManager.setSoundEnabled(next); return next;
  });

  return (
    <div className="bg-white text-black min-h-screen w-full flex flex-col items-center select-none">
      <div id="t" className="offline w-full flex-1 pointer-events-none" ref={containerRef}>
        <div id="main-frame-error" className="interstitial-wrapper">
          <div id="main-content"><div className="icon icon-offline" /></div>
          <div id="offline-resources" className="hidden">
            <img id="offline-resources-1x" src="/assets/default_100_percent/100-offline-sprite.png" alt="" />
            <img id="offline-resources-2x" src="/assets/default_200_percent/200-offline-sprite.png" alt="" /><template id="audio-resources" />
          </div>
        </div>
      </div>
      <ActionPanel
        soundEnabled={soundEnabled} onToggleSound={toggleSound} gameStatus={gameStatus}
        onTogglePlayPause={togglePlayPause} onRestart={restart}
        isRecording={isRecording} isRecordingPaused={isRecordingPaused}
        onToggleRecord={toggleRecord} showVisualize={true} onVisualize={visualizePlayback}
      />
    </div>
  );
}
