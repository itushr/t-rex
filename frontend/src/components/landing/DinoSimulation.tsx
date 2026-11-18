import { useEffect, useRef } from "react";
import { DinoAction, SimState } from "./types";

interface Props {
  onAction?: (a: DinoAction) => void;
  onStateChange?: (s: SimState) => void;
}

function getVotes(dist: number, obsType: string): DinoAction[] {
  if (dist < 155 && dist > 20) {
    return obsType === "bird" ? ["duck", "duck", "jump", "duck", "none"] : ["jump", "jump", "duck", "jump", "none"];
  }
  return ["none", "none", "none", "jump", "none"];
}

function getMaxFreq(votes: DinoAction[]): DinoAction {
  const counts: Record<string, number> = {};
  votes.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
  let best = votes[0], maxC = 0;
  for (const [k, c] of Object.entries(counts)) { if (c > maxC) { maxC = c; best = k as DinoAction; } }
  return best;
}

export function DinoSimulation({ onAction, onStateChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const img = new Image();
    img.src = "/assets/default_100_percent/100-offline-sprite.png";

    let animId = 0, tick = 0, lastReportTick = 0, lastAct: DinoAction = "none";
    let dinoY = 0, dinoVy = 0, isJumping = false, isDucking = false, duckTimer = 0;
    let obsX = 750, obsType: "small" | "large" | "bird" = "small";
    let speed = 7.0, groundX = 0;
    const S = 1.95, GY = 350, DX = 60;

    const loop = () => {
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
      const votes = getVotes(dist, obsType);
      const act = getMaxFreq(votes);

      if (act === "jump" && !isJumping) {
        isJumping = true; dinoVy = obsType === "large" ? -19.5 : -18.0;
      } else if (act === "duck" && !isJumping && !isDucking) {
        isDucking = true; duckTimer = 34;
      }

      if (act !== lastAct || tick - lastReportTick >= 10) {
        lastAct = act; lastReportTick = tick;
        onAction?.(act);
        onStateChange?.({ action: act, votes, dist, speed: Number(speed.toFixed(1)), obsType: dist < 320 ? obsType : "none" });
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
