import { useEffect, useState } from "react";

export function useActionPanelTimer(isRecording = false, isRecordingPaused = false) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      setElapsedMs(0);
      return;
    }
    if (isRecordingPaused) return;

    const start = performance.now() - elapsedMs;
    const timer = setInterval(() => setElapsedMs(performance.now() - start), 200);
    return () => clearInterval(timer);
  }, [isRecording, isRecordingPaused]);

  const totalSec = Math.floor(elapsedMs / 1000);
  const hrs = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const secs = String(totalSec % 60).padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
}
