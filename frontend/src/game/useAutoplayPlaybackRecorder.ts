import { useEffect, useRef, useState } from "react";
import type { OnnxDinoAutoplay, AutoplayStep } from "./onnxAutoplay";
import type { GameStatus } from "./useGameRunnerControls";
import { readObstacles } from "./dinoFeatureExtractor";

export function useAutoplayPlaybackRecorder(gameStatus: GameStatus, autoplay: OnnxDinoAutoplay) {
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const stepsRef = useRef<AutoplayStep[]>([]);

  useEffect(() => {
    autoplay.onStep = (step) => {
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
    let steps = stepsRef.current;
    if (!steps.length) {
      const r = (window as any).Runner?.instance_;
      const [obs1, obs2] = readObstacles(r);
      steps = [{
        time: 0.1, speed: Number(r?.currentSpeed) || 6, jumping: false, ducking: false,
        obs1, obs2, action: "none", time_to_impact: -1, crashed: Boolean(r?.crashed),
      }];
    }
    await fetch("/api/playbacks/local", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steps }),
    });
    window.history.pushState(null, "", "/visualize/playback/local");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return { isRecording, isRecordingPaused, toggleRecord, visualizePlayback };
}
