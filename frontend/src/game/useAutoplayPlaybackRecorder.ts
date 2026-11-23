import { useEffect, useRef, useState } from "react";
import type { GameStatus } from "./useGameRunnerControls";
import { savePrivatePlayback } from "../services/privateApi";

export function useAutoplayPlaybackRecorder(
  gameStatus: GameStatus, autoplay: any, modelName = "local", isPrivate = false
) {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const stepsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!autoplay) return;
    autoplay.onStep = (step: any) => {
      if (isRecording && !isRecordingPaused) stepsRef.current.push(step);
    };
  }, [autoplay, isRecording, isRecordingPaused]);

  useEffect(() => {
    if (isRecording) {
      if (gameStatus === "paused" || gameStatus === "crashed") setIsRecordingPaused(true);
      else if (gameStatus === "playing") setIsRecordingPaused(false);
    }
  }, [gameStatus, isRecording]);

  const toggleRecord = () => {
    if (!isRecording) {
      stepsRef.current = []; setIsRecording(true); setIsRecordingPaused(false);
    } else if (!isRecordingPaused) {
      setIsRecordingPaused(true);
    } else {
      setIsRecordingPaused(false);
    }
  };

  const visualizePlayback = async () => {
    const steps = stepsRef.current;
    setIsRecording(false);
    setIsRecordingPaused(false);
    if (!steps.length) return;
    if (isPrivate) {
      const res = await savePrivatePlayback(modelName, steps);
      window.history.pushState(null, "", `/visualize/playback/private/${res.name}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else {
      window.history.pushState(null, "", "/visualize/playback/local");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return { isRecording, isRecordingPaused, toggleRecord, visualizePlayback };
}
