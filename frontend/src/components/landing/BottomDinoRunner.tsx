import { useEffect, useRef } from "react";

interface Obstacle { x: number; type: "small" | "large" | "bird"; }

export function BottomDinoRunner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current; if (!cvs) return;
    const ctx = cvs.getContext("2d"); if (!ctx) return;
    const img = new Image();
    img.src = "/assets/default_100_percent/100-offline-sprite.png";

    const updateSize = () => { cvs.width = window.innerWidth; cvs.height = 100; };
    updateSize();
    window.addEventListener("resize", updateSize);

    const S = 1.25, GY = 82, DX = 120;
    let animId = 0, tick = 0, groundX = 0, speed = 7.5;
    let dinoY = 0, dinoVy = 0, isJumping = false, isDucking = false, duckTimer = 0;
    let obstacles: Obstacle[] = [
      { x: 650, type: "small" }, { x: 1250, type: "large" }, { x: 1850, type: "bird" },
    ];

    const loop = () => {
      tick++;
      ctx.clearRect(0, 0, cvs.width, cvs.height);

      if (isJumping) {
        dinoY += dinoVy; dinoVy += 1.0;
        if (dinoY >= 0) { dinoY = 0; dinoVy = 0; isJumping = false; }
      }
      if (isDucking && --duckTimer <= 0) isDucking = false;

      groundX = (groundX - speed) % 600;
      for (const obs of obstacles) obs.x -= speed;

      let maxX = Math.max(...obstacles.map((o) => o.x));
      for (const obs of obstacles) {
        if (obs.x < -80) {
          obs.x = Math.max(maxX + 420 + Math.random() * 260, cvs.width + 80);
          const r = Math.random();
          obs.type = r < 0.45 ? "small" : r < 0.75 ? "large" : "bird";
          maxX = obs.x;
        }
      }

      const nextObs = obstacles.filter((o) => o.x > DX - 30).sort((a, b) => a.x - b.x)[0];
      if (nextObs) {
        const dist = nextObs.x - DX;
        if (dist > 15 && dist < 145) {
          if (nextObs.type === "bird" && !isJumping && !isDucking) {
            isDucking = true; duckTimer = 34;
          } else if (nextObs.type !== "bird" && !isJumping) {
            isJumping = true; dinoVy = nextObs.type === "large" ? -17.5 : -16.0;
          }
        }
      }

      if (img.complete) {
        for (let x = groundX; x < cvs.width + 600; x += 600) ctx.drawImage(img, 2, 54, 600, 12, x, GY - 4, 600, 12);
        if (isJumping) ctx.drawImage(img, 848, 2, 44, 47, DX, GY - 47 * S + dinoY, 44 * S, 47 * S);
        else if (isDucking) ctx.drawImage(img, tick % 14 < 7 ? 1112 : 1171, 19, 59, 30, DX, GY - 30 * S, 59 * S, 30 * S);
        else ctx.drawImage(img, tick % 12 < 6 ? 936 : 980, 2, 44, 47, DX, GY - 47 * S, 44 * S, 47 * S);

        for (const obs of obstacles) {
          if (obs.x > -80 && obs.x < cvs.width + 100) {
            if (obs.type === "small") ctx.drawImage(img, 228, 2, 17, 35, obs.x, GY - 35 * S, 17 * S, 35 * S);
            else if (obs.type === "large") ctx.drawImage(img, 332, 2, 25, 50, obs.x, GY - 50 * S, 25 * S, 50 * S);
            else ctx.drawImage(img, tick % 16 < 8 ? 134 : 180, 2, 46, 40, obs.x, GY - 54 * S, 46 * S, 40 * S);
          }
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", updateSize); };
  }, []);

  return (
    <div className="w-full relative overflow-hidden">
      <canvas ref={canvasRef} height={100} className="w-full block" />
    </div>
  );
}
