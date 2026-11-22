function beep(freq: number, duration: number, type: OscillatorType = "sine"): void {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export const playJumpSound = (): void => beep(440, 0.1, "triangle");
export const playGameOverSound = (): void => beep(150, 0.35, "sawtooth");
export const playScoreSound = (): void => beep(880, 0.15, "sine");

export const FlappySounds = {
  playJumpSound,
  playGameOverSound,
  playScoreSound,
};

export default FlappySounds;
