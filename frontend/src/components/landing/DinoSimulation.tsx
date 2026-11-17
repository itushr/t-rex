import { useEffect, useRef } from "react";

export type DinoAction = "JUMP" | "DUCK" | "RUN";

export function DinoSimulation({ onAction }: { onAction?: (a: DinoAction) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = "/assets/default_100_percent/100-offline-sprite.png";

    let animId = 0, tick = 0, score = 0;
    let dinoY = 0, dinoVy = 0, isJumping = false, isDucking = false, duckTimer = 0;
    let obsX = 700, obsType: "small" | "large" | "bird" = "small";
    let speed = 6.8, groundX = 0;

    const loop = () => {
      tick++; score += 0.15;
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      const groundY = 280;

      if (isJumping) {
        dinoY += dinoVy; dinoVy += 0.82;
        if (dinoY >= 0) { dinoY = 0; dinoVy = 0; isJumping = false; }
      }
      if (isDucking && --duckTimer <= 0) isDucking = false;

      obsX -= speed; groundX = (groundX - speed) % 600;
      if (obsX < -60) {
        obsX = cvs.width + Math.random() * 150 + 100;
        const r = Math.random();
        obsType = r < 0.4 ? "small" : r < 0.75 ? "large" : "bird";
        speed = Math.min(9.5, speed + 0.02);
      }

      // Autonomous lightweight jumping/ducking
      const dist = obsX - 90;
      if (dist < 115 && dist > 15) {
        if ((obsType === "small" || obsType === "large") && !isJumping) {
          isJumping = true; dinoVy = obsType === "large" ? -13.5 : -12.5;
        } else if (obsType === "bird" && !isJumping && !isDucking) {
          isDucking = true; duckTimer = 34;
        }
      }

      const act: DinoAction = isJumping ? "JUMP" : isDucking ? "DUCK" : "RUN";
      onAction?.(act);

      if (img.complete) {
        for (let x = groundX; x < cvs.width + 600; x += 600) {
          ctx.drawImage(img, 2, 54, 600, 12, x, groundY - 4, 600, 12);
        }
        const c1X = ((cvs.width - tick * 0.4) % (cvs.width + 80)) - 40;
        ctx.drawImage(img, 86, 2, 46, 14, c1X, 60, 46, 14);

        if (isJumping) {
          ctx.drawImage(img, 848, 2, 44, 47, 90, groundY - 47 + dinoY, 44, 47);
        } else if (isDucking) {
          const sx = tick % 14 < 7 ? 1112 : 1171;
          ctx.drawImage(img, sx, 19, 59, 30, 90, groundY - 30, 59, 30);
        } else {
          const sx = tick % 12 < 6 ? 936 : 980;
          ctx.drawImage(img, sx, 2, 44, 47, 90, groundY - 47, 44, 47);
        }

        if (obsType === "small") {
          ctx.drawImage(img, 228, 2, 17, 35, obsX, groundY - 35, 17, 35);
        } else if (obsType === "large") {
          ctx.drawImage(img, 332, 2, 25, 50, obsX, groundY - 50, 25, 50);
        } else {
          const sx = tick % 16 < 8 ? 134 : 180;
          ctx.drawImage(img, sx, 2, 46, 40, obsX, groundY - 58, 46, 40);
        }
      }

      ctx.fillStyle = "#535353"; ctx.font = "bold 13px monospace";
      ctx.fillText(`HI 01420  ${String(Math.floor(score)).padStart(5, "0")}`, cvs.width - 150, 35);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [onAction]);

  return (
    <div className="relative w-full h-full min-h-[340px] flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} width={900} height={320} className="w-full h-auto max-w-[900px]" />
    </div>
  );
}
export default DinoSimulation;
