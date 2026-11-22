import { useEffect, useRef, useState } from "react";
import { GameRecorder } from "./gameRecorder";
import { savePrivateGameplay } from "../services/privateApi";
import { getGameAdapter } from "../games";
import type { GameStatus } from "./useGameRunnerControls";

export function useWebGameRecorder(gameStatus: GameStatus, gameId: string = "trex") {
  const adapter = getGameAdapter(gameId);
  const recRef = useRef(new GameRecorder(adapter));
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
      const r = adapter.getRunnerInstance();
      const action = adapter.mapKeyEventToAction(e);
      if (e.type === "keydown" && action) {
        recRef.current.recordKey(r, action);
      } else if (e.type === "keyup" && action) {
        recRef.current.releaseKey(action);
      }
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("keyup", onKey, true);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("keyup", onKey, true);
      recRef.current.stop();
    };
  }, [adapter]);

  const toggleRecord = () => {
    const rec = recRef.current;
    if (!rec.isRecording()) {
      rec.start();
      setIsRecording(true);
      const shouldPause = gameStatus === "paused" || gameStatus === "crashed";
      if (shouldPause) rec.pause();
      setIsRecordingPaused(shouldPause);
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
    sessionStorage.setItem(`${gameId}_local_samples`, JSON.stringify(samples));
    if (gameId === "trex") sessionStorage.setItem("dino_local_samples", JSON.stringify(samples));
    if (samples.length >= 10) savePrivateGameplay(samples, undefined, gameId).catch(() => {});
    const targetUrl = gameId === "trex" ? "/train" : `/train/${gameId}`;
    window.history.pushState(null, "", targetUrl);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return { isRecording, isRecordingPaused, toggleRecord, forwardToTrain };
}
