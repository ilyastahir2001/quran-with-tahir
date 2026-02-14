// Notification sounds using Web Audio API — no external audio files needed

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Silently fail — audio features are non-critical
  }
}

/** Pleasant ascending tone for participant join */
export function playJoinSound() {
  playTone(440, 0.15, 'sine');
  setTimeout(() => playTone(554, 0.15, 'sine'), 100);
  setTimeout(() => playTone(659, 0.2, 'sine'), 200);
}

/** Soft descending tone for participant leave */
export function playLeaveSound() {
  playTone(659, 0.15, 'sine');
  setTimeout(() => playTone(554, 0.15, 'sine'), 100);
  setTimeout(() => playTone(440, 0.2, 'sine'), 200);
}
