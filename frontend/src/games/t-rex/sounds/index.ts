import { AUDIO_PRESS, AUDIO_HIT, AUDIO_REACHED } from "./runnerAudio";

export const playJumpSound = (): void => {
  const el = document.getElementById("offline-sound-press") as HTMLAudioElement | null;
  el?.play?.().catch(() => {});
};

export const playGameOverSound = (): void => {
  const el = document.getElementById("offline-sound-hit") as HTMLAudioElement | null;
  el?.play?.().catch(() => {});
};

export const playScoreSound = (): void => {
  const el = document.getElementById("offline-sound-reached") as HTMLAudioElement | null;
  el?.play?.().catch(() => {});
};

export const TRexSounds = {
  playJumpSound,
  playGameOverSound,
  playScoreSound,
  AUDIO_PRESS,
  AUDIO_HIT,
  AUDIO_REACHED,
};

export default TRexSounds;
