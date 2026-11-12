import { useEffect, useRef, useState } from "react";
import { AUDIO_PRESS, AUDIO_HIT, AUDIO_REACHED } from "./runnerAudio";
import { ActionPanel } from "../components/ActionPanel";
import { patchRunner } from "../game/runnerAudioPatch";
import { soundManager } from "../game/soundManager";
import { useGameRunnerControls } from "../game/useGameRunnerControls";
import { useWebGameRecorder } from "../game/useWebGameRecorder";

export function WebRunnerPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { gameStatus, togglePlayPause, restart } = useGameRunnerControls();
  const { isRecording, isRecordingPaused, toggleRecord, forwardToTrain } = useWebGameRecorder(gameStatus);

  useEffect(() => {
    soundManager.setSoundEnabled(true);
    let scriptTag: HTMLScriptElement | null = null;
    const linkTag = document.createElement("link");
    linkTag.rel = "stylesheet"; linkTag.href = "/t-rex-runner/index.css";
    document.head.appendChild(linkTag);
    document.body.classList.add("offline", "arcade-mode");

    const tpl = document.getElementById("audio-resources") as HTMLTemplateElement | null;
    if (tpl) tpl.innerHTML = `<audio id="offline-sound-press" src="${AUDIO_PRESS}"></audio><audio id="offline-sound-hit" src="${AUDIO_HIT}"></audio><audio id="offline-sound-reached" src="${AUDIO_REACHED}"></audio>`;

    function startRunner() {
      const win = window as any;
      if (typeof win.Runner === "function" && containerRef.current) {
        document.querySelectorAll(".runner-container").forEach((el) => el.remove());
        if (win.Runner.instance_) { win.Runner.instance_.stop?.(); win.Runner.instance_.stopListening?.(); win.Runner.instance_ = null; }
        patchRunner(win.Runner);
        win.Runner.isWeb = true; win.Runner.soundEnabled = soundManager.isSoundEnabled();
        new win.Runner(".interstitial-wrapper");
        const r = win.Runner.instance_;
        if (r) {
          r.isWeb = true; r.soundEnabled = soundManager.isSoundEnabled(); r.loadSounds?.();
          if (r.containerEl) r.containerEl.style.width = r.dimensions?.WIDTH + "px";
          r.activated = true; r.setArcadeMode?.();
        }
      }
    }

    const win = window as any;
    if (typeof win.Runner === "function") startRunner();
    else {
      scriptTag = document.createElement("script");
      scriptTag.src = "/t-rex-runner/index.js?v=" + Date.now();
      scriptTag.async = true; scriptTag.onload = startRunner;
      document.body.appendChild(scriptTag);
    }

    return () => {
      const r = (window as any).Runner?.instance_;
      if (r) { r.stop?.(); r.stopListening?.(); (window as any).Runner.instance_ = null; }
      document.querySelectorAll(".runner-container").forEach((el) => el.remove());
      document.body.classList.remove("offline", "arcade-mode", "inverted");
      linkTag.parentNode?.removeChild(linkTag); scriptTag?.parentNode?.removeChild(scriptTag);
    };
  }, []);

  const toggleSound = () => setSoundEnabled((prev) => {
    const next = !prev; soundManager.setSoundEnabled(next); return next;
  });

  return (
    <div className="bg-white text-black min-h-screen w-full flex flex-col items-center">
      <div id="t" className="offline w-full flex-1" ref={containerRef}>
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
        onToggleRecord={toggleRecord} onForward={forwardToTrain}
      />
    </div>
  );
}
