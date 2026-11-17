import { useEffect, useRef } from "react";

export interface SimState {
  action: "NONE" | "JUMP" | "DUCK";
  dist: number;
  speed: number;
}

export function DinoSimulation({ onUpdate }: { onUpdate: (s: SimState) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    let animId: number, dinoY = 0, dinoVy = 0, isJumping = false, isDucking = false, duckTimer = 0;
    let obsX = 650, obsType: "cactus" | "bird" = "cactus", speed = 6.5;

    const loop = () => {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      const groundY = 175;
      if (isJumping) {
        dinoY += dinoVy; dinoVy += 0.85;
        if (dinoY >= 0) { dinoY = 0; dinoVy = 0; isJumping = false; }
      }
      if (isDucking && --duckTimer <= 0) isDucking = false;

      obsX -= speed;
      if (obsX < -40) {
        obsX = cvs.width + Math.random() * 120 + 80;
        obsType = Math.random() > 0.4 ? "cactus" : "bird";
        speed = Math.min(8.5, speed + 0.05);
      }
      const dist = Math.max(0, Math.round(obsX - 100));
      let action: "NONE" | "JUMP" | "DUCK" = "NONE";
      if (dist < 125 && dist > 15) {
        if (obsType === "cactus" && !isJumping) { isJumping = true; dinoVy = -13; action = "JUMP"; }
        else if (obsType === "bird" && !isJumping && !isDucking) { isDucking = true; duckTimer = 35; action = "DUCK"; }
      }
      if (isJumping) action = "JUMP"; else if (isDucking) action = "DUCK";
      onUpdate({ action, dist, speed: Number(speed.toFixed(1)) });

      ctx.strokeStyle = "#e4e4e7"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(cvs.width, groundY); ctx.stroke();

      if (obsX > 100 && obsX < cvs.width) {
        ctx.strokeStyle = action !== "NONE" ? "rgba(16, 185, 129, 0.7)" : "rgba(161, 161, 170, 0.4)";
        ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(100, groundY - 25 + dinoY);
        ctx.lineTo(obsX, groundY - (obsType === "bird" ? 38 : 18));
        ctx.stroke(); ctx.setLineDash([]);
      }

      ctx.fillStyle = "#18181b";
      const dh = isDucking ? 22 : 40, dw = isDucking ? 42 : 30;
      ctx.beginPath(); ctx.roundRect(70, groundY - dh + dinoY, dw, dh, 4); ctx.fill();

      ctx.fillStyle = obsType === "cactus" ? "#059669" : "#2563eb";
      if (obsType === "cactus") {
        ctx.beginPath(); ctx.roundRect(obsX, groundY - 36, 20, 36, 3); ctx.fill();
      } else {
        ctx.beginPath(); ctx.roundRect(obsX, groundY - 48, 28, 16, 4); ctx.fill();
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full h-[200px] flex items-center justify-center bg-zinc-50/60 rounded-2xl border border-zinc-200/70 overflow-hidden">
      <canvas ref={canvasRef} width={760} height={200} className="w-full h-full max-w-[760px]" />
    </div>
  );
}
