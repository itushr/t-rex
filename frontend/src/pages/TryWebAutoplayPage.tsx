import { useEffect, useRef } from "react";
import { AUDIO_PRESS, AUDIO_HIT, AUDIO_REACHED } from "./runnerAudio";
import { OnnxDinoAutoplay } from "../game/onnxAutoplay";

const INPUT_EVENTS = ["keydown", "keyup", "keypress", "mousedown", "touchstart"] as const;

export function TryWebAutoplayPage({ modelName }: { modelName: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<OnnxDinoAutoplay>(new OnnxDinoAutoplay());

  useEffect(() => {
    let scriptTag: HTMLScriptElement | null = null;
    const linkTag = document.createElement("link");
    linkTag.rel = "stylesheet";
    linkTag.href = "/t-rex-runner/index.css";
    document.head.appendChild(linkTag);
    document.body.classList.add("offline");

    const tpl = document.getElementById("audio-resources") as HTMLTemplateElement | null;
    if (tpl) {
      tpl.innerHTML = `<audio id="offline-sound-press" src="${AUDIO_PRESS}"></audio><audio id="offline-sound-hit" src="${AUDIO_HIT}"></audio><audio id="offline-sound-reached" src="${AUDIO_REACHED}"></audio>`;
    }

    const disable = (e: Event) => { e.stopPropagation(); e.preventDefault(); };
    INPUT_EVENTS.forEach((ev) => window.addEventListener(ev, disable, { capture: true }));

    const autoplay = autoplayRef.current;
    let initialized = false;

    function startRunner() {
      const win = window as any;
      if (typeof win.Runner === "function" && containerRef.current && !initialized) {
        initialized = true;
        document.querySelectorAll(".runner-container").forEach((el) => el.remove());
        if (win.Runner.instance_) win.Runner.instance_ = null;
        new win.Runner(".interstitial-wrapper");
        const r = win.Runner.instance_;
        if (r) {
          r.stopListening?.();
          r.onVisibilityChange = () => {};
          autoplay.init(modelName).then((ok) => {
            (window as any).__autoplayOk = ok;
            if (ok) {
              autoplay.start();
              if (!r.playing) {
                r.loadSounds?.();
                r.playing = true;
                r.update?.();
                r.tRex?.startJump?.(r.currentSpeed);
              }
            }
          });
        }
      }
    }

    const win = window as any;
    if (typeof win.Runner === "function") startRunner();
    else {
      scriptTag = document.createElement("script");
      scriptTag.src = "/t-rex-runner/index.js";
      scriptTag.async = true;
      scriptTag.onload = startRunner;
      document.body.appendChild(scriptTag);
    }

    return () => {
      autoplay.stop();
      INPUT_EVENTS.forEach((ev) => window.removeEventListener(ev, disable, { capture: true }));
      const r = (window as any).Runner?.instance_;
      if (r) { r.stop?.(); (window as any).Runner.instance_ = null; }
      document.querySelectorAll(".runner-container").forEach((el) => el.remove());
      document.body.classList.remove("offline", "arcade-mode", "inverted");
      if (linkTag.parentNode) linkTag.parentNode.removeChild(linkTag);
      if (scriptTag?.parentNode) scriptTag.parentNode.removeChild(scriptTag);
    };
  }, [modelName]);

  return (
    <div className="bg-white text-black min-h-screen w-full flex flex-col items-center select-none pointer-events-none">
      <div id="t" className="offline w-full flex-1" ref={containerRef}>
        <div id="main-frame-error" className="interstitial-wrapper">
          <div id="main-content"><div className="icon icon-offline" /></div>
          <div id="offline-resources" className="hidden">
            <img id="offline-resources-1x" src="/assets/default_100_percent/100-offline-sprite.png" alt="" />
            <img id="offline-resources-2x" src="/assets/default_200_percent/200-offline-sprite.png" alt="" />
            <template id="audio-resources" />
          </div>
        </div>
      </div>
    </div>
  );
}
