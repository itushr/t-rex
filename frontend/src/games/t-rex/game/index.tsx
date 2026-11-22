import { useEffect, useRef } from "react";
import "./runner.css";
import "./runner.js";
import { SPRITE_1X, SPRITE_2X } from "../assets";
import { TRexSounds } from "../sounds";
import { createTRexController, TRexController } from "../controller";
import { patchRunner } from "../../../game/runnerAudioPatch";
import type { GameStatus } from "../../../game/useGameRunnerControls";

export interface DinoGameProps {
  interactive?: boolean;
  soundEnabled?: boolean;
  onReady?: (controller: TRexController) => void;
  onRunnerInstance?: (runner: any) => void;
  onStatusChange?: (status: GameStatus) => void;
}

export function DinoGame({
  interactive = true, soundEnabled = false, onReady, onRunnerInstance, onStatusChange,
}: DinoGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onReadyRef = useRef(onReady);
  const onRunnerInstanceRef = useRef(onRunnerInstance);
  const onStatusChangeRef = useRef(onStatusChange);
  const soundEnabledRef = useRef(soundEnabled);

  onReadyRef.current = onReady;
  onRunnerInstanceRef.current = onRunnerInstance;
  onStatusChangeRef.current = onStatusChange;
  soundEnabledRef.current = soundEnabled;

  useEffect(() => {
    const win = window as any;
    if (win.Runner) win.Runner.soundEnabled = soundEnabled;
    const r = win.Runner?.instance_;
    if (r) r.soundEnabled = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    document.body.classList.add("offline", "arcade-mode");
    const tpl = document.getElementById("audio-resources") as HTMLTemplateElement | null;
    if (tpl) {
      tpl.innerHTML = `<audio id="offline-sound-press" src="${TRexSounds.AUDIO_PRESS}"></audio>` +
        `<audio id="offline-sound-hit" src="${TRexSounds.AUDIO_HIT}"></audio>` +
        `<audio id="offline-sound-reached" src="${TRexSounds.AUDIO_REACHED}"></audio>`;
    }

    const win = window as any;
    if (typeof win.Runner === "function" && containerRef.current) {
      document.querySelectorAll(".runner-container").forEach((el) => el.remove());
      if (win.Runner.instance_) { win.Runner.instance_.stop?.(); win.Runner.instance_ = null; }
      patchRunner(win.Runner);
      win.Runner.soundEnabled = soundEnabledRef.current;
      win.Runner.isWeb = interactive;
      new win.Runner(".interstitial-wrapper");
      const r = win.Runner.instance_;
      if (r) {
        r.soundEnabled = soundEnabledRef.current;
        r.isWeb = interactive;
        r.onStatusChange = (s: GameStatus) => onStatusChangeRef.current?.(s);
        if (!interactive) { r.stopListening?.(); r.onVisibilityChange = () => {}; }
        if (r.containerEl) r.containerEl.style.width = r.dimensions?.WIDTH + "px";
        r.activated = true;
        r.setArcadeMode?.();
        onReadyRef.current?.(createTRexController(r));
        onRunnerInstanceRef.current?.(r);
      }
    }

    return () => {
      const r = (window as any).Runner?.instance_;
      if (r) { r.stop?.(); (window as any).Runner.instance_ = null; }
      document.querySelectorAll(".runner-container").forEach((el) => el.remove());
      document.body.classList.remove("offline", "arcade-mode", "inverted");
    };
  }, [interactive]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive || (e.target as HTMLElement)?.closest(".action-panel")) return;
    const r = (window as any).Runner?.instance_;
    if (r?.crashed) r.restart();
  };

  return (
    <div id="t" onPointerDown={handlePointerDown} className={`offline w-full flex-1 ${interactive ? "" : "pointer-events-none"}`} ref={containerRef}>
      <div id="main-frame-error" className="interstitial-wrapper">
        <div id="main-content"><div className="icon icon-offline" /></div>
        <div id="offline-resources" className="hidden">
          <img id="offline-resources-1x" src={SPRITE_1X} alt="" />
          <img id="offline-resources-2x" src={SPRITE_2X} alt="" />
          <template id="audio-resources" />
        </div>
      </div>
    </div>
  );
}

export default DinoGame;
