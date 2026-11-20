import { useEffect, useRef } from "react";
import { FlappyEngine } from "../games/flappybird/flappyEngine";
import { FlappyRenderer } from "../games/flappybird/flappyRenderer";

export function FlappyBirdPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FlappyEngine | null>(null);
  const rendererRef = useRef<FlappyRenderer | null>(null);

  useEffect(() => {
    const prevBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#dfd593";
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const engine = new FlappyEngine(w, h);
    const renderer = new FlappyRenderer();
    engineRef.current = engine;
    rendererRef.current = renderer;

    const syncSize = () => {
      const nw = canvas.clientWidth || window.innerWidth;
      const nh = canvas.clientHeight || window.innerHeight;
      if (canvas.width !== nw || canvas.height !== nh) {
        canvas.width = nw;
        canvas.height = nh;
        engine.resize(nw, nh);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        engine.jump();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement)?.closest(".floating-nav")) return;
      engine.jump();
    };

    window.addEventListener("resize", syncSize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("pointerdown", handlePointerDown);

    let animId: number;
    const loop = (t: number) => {
      syncSize();
      engine.update(t);
      renderer.render(ctx, engine.state, canvas.width, canvas.height);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      document.body.style.backgroundColor = prevBg;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", syncSize);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none bg-sky-400">
      <div className="floating-nav absolute top-4 left-4 z-20 flex items-center gap-2">
        <a href="/" className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur border border-white/20 transition-all">← Home</a>
        <a href="/try-web/dino" className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur border border-white/20 transition-all">Play Dino</a>
      </div>
      <canvas ref={canvasRef} className="block w-full h-full cursor-pointer touch-none" />
    </div>
  );
}

export default FlappyBirdPage;
