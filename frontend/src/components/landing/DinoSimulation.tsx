import { useEffect, useRef } from "react";
import { DinoAction, SimState } from "./types";
import { PREDICTION_INTERVAL_SEC } from "./constants";

interface Props { onAction?: (a: DinoAction) => void; onStateChange?: (s: SimState) => void; }

const ACTIONS: DinoAction[] = ["jump", "duck", "none"];

function generateVotes(target: DinoAction): DinoAction[] {
  const targetCount = Math.random() < 0.65 ? 3 : 4;
  const res: DinoAction[] = Array(targetCount).fill(target);
  while (res.length < 5) res.push(ACTIONS[Math.floor(Math.random() * ACTIONS.length)]);
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

export function DinoSimulation({ onAction, onStateChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current; if (!cvs) return;
    const ctx = cvs.getContext("2d"); if (!ctx) return;
    const img = new Image();
    img.src = "/assets/default_100_percent/100-offline-sprite.png";

    let animId = 0, tick = 0, lastVoteTime = 0, currentTarget: DinoAction = "none";
    let votes = generateVotes("none");
    let dinoY = 0, dinoVy = 0, isJumping = false, isDucking = false, duckTimer = 0;
    let obsX = 750, obsType: "small" | "large" | "bird" = "small";
    let speed = 7.0, groundX = 0;
    const S = 1.95, GY = 350, DX = 60, intervalMs = PREDICTION_INTERVAL_SEC * 1000;

    const loop = (now: number) => {
      tick++;
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      if (isJumping) {
        dinoY += dinoVy; dinoVy += 1.05;
        if (dinoY >= 0) { dinoY = 0; dinoVy = 0; isJumping = false; }
      }
      if (isDucking && --duckTimer <= 0) isDucking = false;

      obsX -= speed; groundX = (groundX - speed) % 600;
      if (obsX < -100) {
        obsX = cvs.width + Math.random() * 180 + 80;
        const r = Math.random();
        obsType = r < 0.4 ? "small" : r < 0.75 ? "large" : "bird";
        speed = Math.min(10.0, speed + 0.02);
      }

      const dist = Math.max(0, Math.round(obsX - DX));
      const targetAct: DinoAction = (dist < 155 && dist > 20)
        ? (obsType === "bird" ? "duck" : "jump") : "none";

      if (targetAct !== currentTarget || now - lastVoteTime >= intervalMs) {
        currentTarget = targetAct;
        lastVoteTime = now;
        votes = generateVotes(targetAct);
        onAction?.(targetAct);
        onStateChange?.({ action: targetAct, votes, dist, speed: Number(speed.toFixed(1)), obsType });
      }

      if (targetAct === "jump" && !isJumping) {
        isJumping = true; dinoVy = obsType === "large" ? -19.5 : -18.0;
      } else if (targetAct === "duck" && !isJumping && !isDucking) {
        isDucking = true; duckTimer = 34;
      }

      if (img.complete) {
        for (let x = groundX; x < cvs.width + 600; x += 600) ctx.drawImage(img, 2, 54, 600, 12, x, GY - 4, 600, 12);
        if (isJumping) ctx.drawImage(img, 848, 2, 44, 47, DX, GY - 47 * S + dinoY, 44 * S, 47 * S);
        else if (isDucking) ctx.drawImage(img, tick % 14 < 7 ? 1112 : 1171, 19, 59, 30, DX, GY - 30 * S, 59 * S, 30 * S);
        else ctx.drawImage(img, tick % 12 < 6 ? 936 : 980, 2, 44, 47, DX, GY - 47 * S, 44 * S, 47 * S);

        if (obsType === "small") ctx.drawImage(img, 228, 2, 17, 35, obsX, GY - 35 * S, 17 * S, 35 * S);
        else if (obsType === "large") ctx.drawImage(img, 332, 2, 25, 50, obsX, GY - 50 * S, 25 * S, 50 * S);
        else ctx.drawImage(img, tick % 16 < 8 ? 134 : 180, 2, 46, 40, obsX, GY - 62 * S, 46 * S, 40 * S);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [onAction, onStateChange]);

  return (
    <div className="relative w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} width={850} height={390} className="w-full h-auto max-w-[850px]" />
    </div>
  );
}
export default DinoSimulation;
