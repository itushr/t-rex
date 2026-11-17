import { useEffect, useState } from "react";

export interface TimerData {
  mins: string;
  secs: string;
  ms: string;
}

export function useActionPanelTimer(isRecording = false, isRecordingPaused = false): TimerData {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      setElapsedMs(0);
      return;
    }
    if (isRecordingPaused) return;

    const start = performance.now() - elapsedMs;
    let animId: number;
    const loop = () => {
      setElapsedMs(performance.now() - start);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isRecording, isRecordingPaused]);

  const mins = String(Math.floor(elapsedMs / 60000)).padStart(2, "0");
  const secs = String(Math.floor((elapsedMs % 60000) / 1000)).padStart(2, "0");
  const ms = String(Math.floor((elapsedMs % 1000) / 10)).padStart(2, "0");

  return { mins, secs, ms };
}
