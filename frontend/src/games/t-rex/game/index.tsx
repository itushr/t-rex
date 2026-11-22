import { useEffect, useRef } from "react";
import "./runner.css";
import "./runner.js";
import { SPRITE_1X, SPRITE_2X } from "../assets";
import { TRexSounds } from "../sounds";
import { createTRexController, TRexController } from "../controller";
import { patchRunner } from "../../../game/runnerAudioPatch";

export interface DinoGameProps {
  interactive?: boolean;
  soundEnabled?: boolean;
  onReady?: (controller: TRexController) => void;
  onRunnerInstance?: (runner: any) => void;
  onStatusChange?: (status: any) => void;
}

export function DinoGame({ interactive = true, soundEnabled = false, onReady, onRunnerInstance }: DinoGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

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
      win.Runner.soundEnabled = soundEnabled;
      win.Runner.isWeb = interactive;
      new win.Runner(".interstitial-wrapper");
      const r = win.Runner.instance_;
      if (r) {
        r.soundEnabled = soundEnabled;
        r.isWeb = interactive;
        if (!interactive) { r.stopListening?.(); r.onVisibilityChange = () => {}; }
        if (r.containerEl) r.containerEl.style.width = r.dimensions?.WIDTH + "px";
        r.activated = true;
        r.setArcadeMode?.();
        onReady?.(createTRexController(r));
        onRunnerInstance?.(r);
      }
    }

    return () => {
      const r = (window as any).Runner?.instance_;
      if (r) { r.stop?.(); (window as any).Runner.instance_ = null; }
      document.querySelectorAll(".runner-container").forEach((el) => el.remove());
      document.body.classList.remove("offline", "arcade-mode", "inverted");
    };
  }, [soundEnabled, interactive, onReady, onRunnerInstance]);

  return (
    <div id="t" className={`offline w-full flex-1 ${interactive ? "" : "pointer-events-none"}`} ref={containerRef}>
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
