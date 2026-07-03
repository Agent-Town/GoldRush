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
    const context = this.ensureContext();
    if (context.state !== 'running') return;

    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startHz, now);
    osc.frequency.exponentialRampToValueAtTime(endHz, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  }
}
