import { useEffect, useRef, useState } from "react";
import { GameRecorder } from "./gameRecorder";
import type { GameStatus } from "./useGameRunnerControls";

export function useWebGameRecorder(gameStatus: GameStatus) {
  const recRef = useRef(new GameRecorder());
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);

  useEffect(() => {
    const rec = recRef.current;
    if (isRecording) {
      if (gameStatus === "paused" || gameStatus === "crashed") {
        rec.pause(); setIsRecordingPaused(true);
      } else if (gameStatus === "playing") {
        rec.resume(); setIsRecordingPaused(false);
      }
    }
  }, [gameStatus, isRecording]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const r = (window as any).Runner?.instance_;
      const k = e.key;
      if (e.type === "keydown") {
        if (k === "ArrowUp" || k === " " || e.code === "Space") recRef.current.recordKey(r, "jump");
        else if (k === "ArrowDown") recRef.current.recordKey(r, "duck");
      } else if (e.type === "keyup" && k === "ArrowDown") {
        recRef.current.releaseKey("duck");
      }
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
      recRef.current.stop();
    };
  }, []);

  const toggleRecord = () => {
    const rec = recRef.current;
    if (!rec.isRecording()) {
      rec.start(); setIsRecording(true); setIsRecordingPaused(false);
    } else if (!rec.isPaused()) {
      rec.pause(); setIsRecordingPaused(true);
    } else {
      rec.resume(); setIsRecordingPaused(false);
    }
  };

  const forwardToTrain = () => {
    const samples = recRef.current.getSamples();
    recRef.current.stop();
    setIsRecording(false);
    sessionStorage.setItem("dino_local_samples", JSON.stringify(samples));
    window.history.pushState(null, "", "/train");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return { isRecording, isRecordingPaused, toggleRecord, forwardToTrain };
}
