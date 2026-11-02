/**
 * High-clarity Web Audio API sound generator for Buy & Sell GH Admin Notifications.
 * Zero-asset dependency, instant synthesis, zero network failure risk.
 */

export type AlertSoundType = "loud-chime" | "urgent-pulse" | "store-chime" | "digital-beep";

export interface SoundOption {
  id: AlertSoundType;
  label: string;
  description: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  {
    id: "loud-chime",
    label: "Loud Chime (High Clarity)",
    description: "Clear, prominent multi-tone bell. Premium Apple-style alert.",
  },
  {
    id: "urgent-pulse",
    label: "Urgent Attention Pulse",
    description: "High-visibility repeating pulse for fast response in busy environments.",
  },
  {
    id: "store-chime",
    label: "Store Chime (Cash Register)",
    description: "Resonant retail bell chime for incoming orders & inquiries.",
  },
  {
    id: "digital-beep",
    label: "Modern Digital Alert",
    description: "Crisp double-tone electronic prompt.",
  },
];

let globalAudioContext: AudioContext | null = null;
let repeatIntervalTimer: number | null = null;
let alertActive = false;

export const getAudioContext = async (): Promise<AudioContext | null> => {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!globalAudioContext || globalAudioContext.state === "closed") {
      globalAudioContext = new AudioContextClass();
    }

    if (globalAudioContext.state === "suspended") {
      await globalAudioContext.resume();
    }

    return globalAudioContext;
  } catch {
    return null;
  }
};

export const isAudioUnlocked = (): boolean => {
  if (!globalAudioContext) return false;
  return globalAudioContext.state === "running";
};

export const unlockAudio = async (): Promise<boolean> => {
  const ctx = await getAudioContext();
  if (!ctx) return false;
  if (ctx.state === "running") {
    // Play a tiny silent/subtle tick to confirm unlock
    playTone(ctx, "loud-chime", 0.5);
    return true;
  }
  return false;
};

/**
 * Synthesizes and plays the selected notification sound at the specified volume.
 * @param ctx Active AudioContext
 * @param type Sound type
 * @param volume Normalized volume (0.0 to 1.0)
 */
export const playTone = (ctx: AudioContext, type: AlertSoundType, volume: number = 0.85) => {
  if (volume <= 0 || ctx.state !== "running") return;
  const now = ctx.currentTime;
  // Master gain node with smooth anti-clipping headroom
  const masterGain = ctx.createGain();
  const scaledGain = Math.max(0.01, Math.min(1.0, volume)) * 0.38;
  masterGain.gain.setValueAtTime(scaledGain, now);
  masterGain.connect(ctx.destination);

  switch (type) {
    case "loud-chime": {
      // 3-note ascending chime: G5 (784Hz) -> C6 (1046.5Hz) -> E6 (1318.5Hz)
      const notes = [
        { freq: 784, start: 0, dur: 0.22 },
        { freq: 1046.5, start: 0.14, dur: 0.32 },
        { freq: 1318.5, start: 0.28, dur: 0.5 },
      ];
      notes.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + start);

        noteGain.gain.setValueAtTime(0.0001, now + start);
        noteGain.gain.exponentialRampToValueAtTime(0.3, now + start + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.03);
      });
      break;
    }

    case "urgent-pulse": {
      // Attention pulse: Alternating 880Hz / 1320Hz tones pulsed 3 times
      const pulses = [
        { f1: 880, f2: 1320, start: 0 },
        { f1: 880, f2: 1320, start: 0.22 },
        { f1: 880, f2: 1320, start: 0.44 },
      ];
      pulses.forEach(({ f1, f2, start }) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const pulseGain = ctx.createGain();

        osc1.type = "triangle";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(f1, now + start);
        osc2.frequency.setValueAtTime(f2, now + start);

        pulseGain.gain.setValueAtTime(0.0001, now + start);
        pulseGain.gain.exponentialRampToValueAtTime(0.35, now + start + 0.015);
        pulseGain.gain.exponentialRampToValueAtTime(0.0001, now + start + 0.18);

        osc1.connect(pulseGain);
        osc2.connect(pulseGain);
        pulseGain.connect(masterGain);

        osc1.start(now + start);
        osc2.start(now + start);
        osc1.stop(now + start + 0.2);
        osc2.stop(now + start + 0.2);
      });
      break;
    }

    case "store-chime": {
      // Metallic bell ping: 1200Hz fundamental + 2400Hz harmonic overtone with ringing decay
      const tones = [
        { freq: 1174.66, dur: 0.8, type: "sine" as OscillatorType, amp: 0.35 },
        { freq: 2349.32, dur: 0.6, type: "triangle" as OscillatorType, amp: 0.15 },
        { freq: 3520.0, dur: 0.4, type: "sine" as OscillatorType, amp: 0.08 },
      ];
      tones.forEach(({ freq, dur, type: oscType, amp }) => {
        const osc = ctx.createOscillator();
        const toneGain = ctx.createGain();
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, now);

        toneGain.gain.setValueAtTime(0.0001, now);
        toneGain.gain.exponentialRampToValueAtTime(amp, now + 0.01);
        toneGain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

        osc.connect(toneGain);
        toneGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + dur + 0.02);
      });
      break;
    }

    case "digital-beep": {
      // Modern electronic double-beep: 987.77Hz (B5) -> 1318.51Hz (E6)
      const beeps = [
        { freq: 987.77, start: 0, dur: 0.1 },
        { freq: 1318.51, start: 0.12, dur: 0.16 },
      ];
      beeps.forEach(({ freq, start, dur }) => {
        const osc = ctx.createOscillator();
        const beepGain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + start);

        beepGain.gain.setValueAtTime(0.0001, now + start);
        beepGain.gain.exponentialRampToValueAtTime(0.3, now + start + 0.01);
        beepGain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);

        osc.connect(beepGain);
        beepGain.connect(masterGain);
        osc.start(now + start);
        osc.stop(now + start + dur + 0.02);
      });
      break;
    }
  }
};

/**
 * Triggers sound alert. If repeating alerts are enabled, sets up interval until acknowledged.
 */
export const triggerAlertSound = async (
  type: AlertSoundType,
  volumePercent: number,
  repeatEnabled: boolean,
  intervalSeconds: number = 30
) => {
  const ctx = await getAudioContext();
  if (!ctx || ctx.state !== "running") return;

  const vol = Math.max(0, Math.min(100, volumePercent)) / 100;
  playTone(ctx, type, vol);

  if (repeatEnabled) {
    alertActive = true;
    if (repeatIntervalTimer) window.clearInterval(repeatIntervalTimer);
    repeatIntervalTimer = window.setInterval(() => {
      if (!alertActive) {
        stopAlertSound();
        return;
      }
      void (async () => {
        const activeCtx = await getAudioContext();
        if (activeCtx && activeCtx.state === "running") {
          playTone(activeCtx, type, vol);
        }
      })();
    }, Math.max(10, intervalSeconds) * 1000);
  }
};

export const stopAlertSound = () => {
  alertActive = false;
  if (repeatIntervalTimer) {
    window.clearInterval(repeatIntervalTimer);
    repeatIntervalTimer = null;
  }
};

export const isAlertActive = (): boolean => alertActive;
