import { useState, useEffect, useCallback } from "react";
import { PlaybackStep } from "../types/playback";

export function usePlaybackScrubber(records: PlaybackStep[]) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const nextStep = useCallback(() => {
    setCurrentIndex((prev) => (prev < records.length - 1 ? prev + 1 : prev));
  }, [records.length]);

  const prevStep = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0));
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!isPlaying || records.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= records.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 120);
    return () => clearInterval(timer);
  }, [isPlaying, records.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === "ArrowDown" || e.key === "j") {
        e.preventDefault();
        nextStep();
      } else if (e.key === "ArrowUp" || e.key === "k") {
        e.preventDefault();
        prevStep();
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextStep, prevStep, togglePlay]);

  return {
    currentIndex,
    setCurrentIndex,
    isPlaying,
    togglePlay,
    nextStep,
    prevStep,
    activeStep: records[currentIndex] || null,
  };
}
