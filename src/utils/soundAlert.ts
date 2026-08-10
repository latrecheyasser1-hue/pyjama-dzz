/**
 * Web Audio API Sound Chime Synthesizer for Pyjama DZ
 * Synthesizes a high-quality dual-tone chime (A5 -> E6) without requiring external audio files.
 */
export function playNewOrderChime() {
  if (typeof window === 'undefined') return;

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    
    const ctx = new AudioCtx();

    // Resume AudioContext if suspended by browser autoplay rules
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth gain envelope to prevent clicking
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playNote(880, now, 0.25);       // Note 1: A5 (880 Hz)
    playNote(1318.51, now + 0.12, 0.35); // Note 2: E6 (1318.51 Hz)
  } catch (err) {
    console.warn('Audio playback not permitted or unavailable:', err);
  }
}
