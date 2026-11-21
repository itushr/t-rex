import { useEffect, useRef, useState } from "react";
import { AUDIO_PRESS, AUDIO_HIT, AUDIO_REACHED } from "../games/trex/audio/runnerAudio";
import { ActionPanel } from "../components/ActionPanel";
import { patchRunner } from "../game/runnerAudioPatch";
import { soundManager } from "../game/soundManager";
import { useGameRunnerControls } from "../game/useGameRunnerControls";
import { useDinoRL } from "../games/trex/rl/useDinoRL";

const INPUTS = ["keydown", "keyup", "keypress", "mousedown", "touchstart"] as const;

export function DinoReinforcePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const { gameStatus, togglePlayPause, restart } = useGameRunnerControls();
  const { tries, repeat, setRepeat, config, updateConfig } = useDinoRL(gameStatus, restart);

  useEffect(() => {
    soundManager.setSoundEnabled(false);
    let scriptTag: HTMLScriptElement | null = null;
    const linkTag = Object.assign(document.createElement("link"), { rel: "stylesheet", href: "/t-rex-runner/index.css" });
    document.head.appendChild(linkTag);
    document.body.classList.add("offline", "arcade-mode");

    const tpl = document.getElementById("audio-resources") as HTMLTemplateElement | null;
    if (tpl) tpl.innerHTML = `<audio id="offline-sound-press" src="${AUDIO_PRESS}"></audio><audio id="offline-sound-hit" src="${AUDIO_HIT}"></audio><audio id="offline-sound-reached" src="${AUDIO_REACHED}"></audio>`;

    const disable = (e: Event) => {
      if ((e.target as HTMLElement | null)?.closest?.(".action-panel")) return;
      if (e.type.startsWith("key") && "rpmtcv".includes((e as KeyboardEvent).key?.toLowerCase())) return;
      e.preventDefault(); e.stopPropagation();
    };
    INPUTS.forEach((ev) => window.addEventListener(ev, disable, { capture: true }));

    function start() {
      const win = window as any;
      if (typeof win.Runner !== "function" || !containerRef.current) return;
      document.querySelectorAll(".runner-container").forEach((el) => el.remove());
      if (win.Runner.instance_) { win.Runner.instance_.stop?.(); win.Runner.instance_ = null; }
      win.Runner.soundEnabled = false; win.Runner.isWeb = false; patchRunner(win.Runner);
      new win.Runner(".interstitial-wrapper");
      const r = win.Runner.instance_;
      if (r) {
        r.soundEnabled = false; r.isWeb = false; r.stopListening?.();
        if (r.containerEl) r.containerEl.style.width = r.dimensions?.WIDTH + "px";
        r.activated = true; r.setArcadeMode?.();
        r.playing = true; r.paused = false; r.time = performance.now();
        if (typeof r.play === "function") r.play();
        r.tRex?.startJump?.(r.currentSpeed);
        r.update?.();
      }
    }

    if (typeof (window as any).Runner === "function") start();
    else {
      scriptTag = Object.assign(document.createElement("script"), { src: "/t-rex-runner/index.js?v=" + Date.now(), async: true, onload: start });
      document.body.appendChild(scriptTag);
    }

    return () => {
      INPUTS.forEach((ev) => window.removeEventListener(ev, disable, { capture: true }));
      const r = (window as any).Runner?.instance_;
      if (r) { r.stop?.(); (window as any).Runner.instance_ = null; }
      document.querySelectorAll(".runner-container").forEach((el) => el.remove());
      document.body.classList.remove("offline", "arcade-mode", "inverted");
      linkTag.parentNode?.removeChild(linkTag); scriptTag?.parentNode?.removeChild(scriptTag);
    };
  }, []);

  const toggleSound = () => setSoundEnabled((p) => { soundManager.setSoundEnabled(!p); return !p; });

  return (
    <div className="bg-white text-black min-h-screen w-full flex flex-col items-center select-none">
      <div id="t" className="offline w-full flex-1 pointer-events-none" ref={containerRef}>
        <div id="main-frame-error" className="interstitial-wrapper">
          <div id="main-content"><div className="icon icon-offline" /></div>
          <div id="offline-resources" className="hidden">
            <img id="offline-resources-1x" src="/assets/default_100_percent/100-offline-sprite.png" alt="" />
            <img id="offline-resources-2x" src="/assets/default_200_percent/200-offline-sprite.png" alt="" />
            <template id="audio-resources" />
          </div>
        </div>
      </div>
      <ActionPanel
        mode="reinforcement" soundEnabled={soundEnabled} onToggleSound={toggleSound}
        gameStatus={gameStatus} onTogglePlayPause={togglePlayPause} onRestart={restart}
        tries={tries} repeat={repeat} onToggleRepeat={() => setRepeat((r) => !r)}
        rlConfig={config} onSaveRLConfig={updateConfig}
      />
    </div>
  );
}

export default DinoReinforcePage;
