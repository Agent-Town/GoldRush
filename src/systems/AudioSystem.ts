export const AUDIO_VOLUME_STORAGE_KEY = 'gr.audio.volume.v1';

let audioVolume = readStoredAudioVolume();

export function readAudioVolume(): number {
  return audioVolume;
}

export function setAudioVolume(value: number): number {
  audioVolume = clampVolume(value);
  try {
    globalThis.localStorage?.setItem(AUDIO_VOLUME_STORAGE_KEY, String(audioVolume));
  } catch {}
  return audioVolume;
}

export class AudioSystem {
  private context: AudioContext | null = null;
  private unlocked = false;

  constructor() {
    window.addEventListener('pointerdown', this.resume, { passive: true });
    window.addEventListener('keydown', this.resume);
  }

  playArc(): void {
    this.blip(360, 620, 0.035, 0.025);
  }

  playHit(): void {
    this.blip(190, 130, 0.045, 0.022);
  }

  playKill(): void {
    this.blip(260, 520, 0.09, 0.035);
  }

  playCoin(): void {
    this.blip(880, 1320, 0.04, 0.02);
  }

  playPing(): void {
    this.blip(660, 1480, 0.055, 0.03);
  }

  dispose(): void {
    window.removeEventListener('pointerdown', this.resume);
    window.removeEventListener('keydown', this.resume);
    void this.context?.close();
    this.context = null;
  }

  private readonly resume = (): void => {
    const context = this.ensureContext();
    this.unlocked = true;
    if (context.state !== 'running') void context.resume();
  };

  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
    }
    return this.context;
  }

  private blip(startHz: number, endHz: number, duration: number, gainValue: number): void {
    if (!this.unlocked) return;
    const volume = readAudioVolume();
    if (volume <= 0) return;
    const context = this.ensureContext();
    if (context.state !== 'running') return;

    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    const peak = Math.max(0.0001, gainValue * volume);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startHz, now);
    osc.frequency.exponentialRampToValueAtTime(endHz, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }
}

function readStoredAudioVolume(): number {
  try {
    return clampVolume(Number(globalThis.localStorage?.getItem(AUDIO_VOLUME_STORAGE_KEY) ?? 0.8));
  } catch {
    return 0.8;
  }
}

function clampVolume(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.8;
}
