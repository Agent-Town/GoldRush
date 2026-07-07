import type { ProjectileKind } from '../systems/CombatSystem';
import { soundManifest, soundUrlLoader, type SoundName } from './manifest';
import { readAudioMuted, readAudioVolume, subscribeAudioPreferences } from './settings';

export { soundManifest, type SoundName } from './manifest';
export {
  AUDIO_MUTED_STORAGE_KEY,
  AUDIO_VOLUME_STORAGE_KEY,
  readAudioMuted,
  readAudioVolume,
  setAudioMuted,
  setAudioVolume,
} from './settings';

const MAX_PER_SOUND = 4;
const DUCK_AFTER_TOTAL = 8;
const DUCK_GAIN = 0.55;

type SoundDiagnostics = {
  unlocked: boolean;
  muted: boolean;
  volume: number;
  requests: number;
  started: number;
  missing: number;
  active: number;
  loops: string[];
  lastRequested: string | null;
  lastStarted: string | null;
};

type LoopState = {
  source: AudioBufferSourceNode;
  gain: GainNode;
};

export class SoundSystem {
  private context: AudioContext | null = null;
  private unlocked = false;
  private disposed = false;
  private requests = 0;
  private started = 0;
  private missing = 0;
  private active = 0;
  private lastRequested: string | null = null;
  private lastStarted: string | null = null;
  private readonly buffers = new Map<SoundName, Promise<AudioBuffer | null>>();
  private readonly activeBySound = new Map<SoundName, number>();
  private readonly loops = new Map<SoundName, LoopState>();
  private readonly unsubscribePreferences = subscribeAudioPreferences(() => this.applyMasterVolume());

  constructor() {
    window.addEventListener('pointerdown', this.unlock, { passive: true });
    window.addEventListener('keydown', this.unlock);
  }

  play(name: SoundName | string, volume = 1): void {
    if (this.disposed) return;
    this.requests += 1;
    this.lastRequested = name;
    if (!isSoundName(name)) {
      if (this.unlocked) this.missing += 1;
      return;
    }
    if (!this.unlocked || readAudioMuted() || readAudioVolume() <= 0) return;
    const count = this.activeBySound.get(name) ?? 0;
    if (count >= MAX_PER_SOUND) return;
    this.activeBySound.set(name, count + 1);
    void this.playLoaded(name, volume);
  }

  setLoop(name: SoundName, on: boolean, volume = 1): void {
    if (!on || readAudioMuted() || readAudioVolume() <= 0) {
      this.stopLoop(name);
      return;
    }
    if (!this.unlocked || this.loops.has(name)) {
      if (this.loops.has(name)) this.setLoopVolume(name, volume);
      return;
    }
    void this.startLoop(name, volume);
  }

  setLoopVolume(name: SoundName, volume: number): void {
    const loop = this.loops.get(name);
    const entry = soundManifest[name];
    if (!loop || !entry) return;
    loop.gain.gain.value = this.effectiveVolume(entry.volume * volume);
  }

  stopLoop(name: SoundName): void {
    const loop = this.loops.get(name);
    if (!loop) return;
    this.loops.delete(name);
    this.active = Math.max(0, this.active - 1);
    try {
      loop.source.stop();
    } catch {}
  }

  playArc(): void {
    this.play('spark-bolt-fire');
  }

  playHit(): void {
    this.play('spark-bolt-hit');
  }

  playKill(): void {
    this.play('gold-chime', 0.55);
  }

  playCoin(): void {
    this.play('gold-chime');
  }

  playPing(): void {
    this.play('invalid', 0.8);
  }

  playShot(kind: ProjectileKind, ownerId: string): void {
    if (ownerId === 'turrets') {
      this.play('turret-fire');
    } else if (kind === 'lob') {
      this.play('blast-charge-arm');
    } else {
      this.play('spark-bolt-fire');
    }
  }

  playDetonation(ownerId: string): void {
    this.play(ownerId === 'hero_blast' ? 'blast-charge-boom' : 'spark-bolt-hit');
  }

  playBuildingDamage(family: string, hp: number, maxHp: number, wrecked: boolean): void {
    if (wrecked) {
      this.play('palisade-collapse');
      return;
    }
    if (family === 'palisade' && maxHp > 0 && hp / maxHp <= 0.35) this.play('palisade-crack');
    else this.play('palisade-hit');
  }

  dispose(): void {
    this.disposed = true;
    window.removeEventListener('pointerdown', this.unlock);
    window.removeEventListener('keydown', this.unlock);
    this.unsubscribePreferences();
    for (const name of [...this.loops.keys()]) this.stopLoop(name);
    void this.context?.close();
    this.context = null;
  }

  diagnostics(): SoundDiagnostics {
    return {
      unlocked: this.unlocked,
      muted: readAudioMuted(),
      volume: readAudioVolume(),
      requests: this.requests,
      started: this.started,
      missing: this.missing,
      active: this.active,
      loops: [...this.loops.keys()],
      lastRequested: this.lastRequested,
      lastStarted: this.lastStarted,
    };
  }

  private readonly unlock = (): void => {
    if (this.disposed) return;
    const context = this.ensureContext();
    this.unlocked = true;
    if (context.state !== 'running') void context.resume().catch(() => undefined);
  };

  private ensureContext(): AudioContext {
    if (!this.context) this.context = new AudioContext();
    return this.context;
  }

  private async playLoaded(name: SoundName, volume: number): Promise<void> {
    const context = this.context;
    if (!context || context.state !== 'running') {
      this.releaseSoundSlot(name);
      return;
    }
    const buffer = await this.loadBuffer(name);
    if (!buffer || this.disposed || readAudioMuted()) {
      this.releaseSoundSlot(name);
      return;
    }
    const entry = soundManifest[name];
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    gain.gain.value = this.effectiveVolume(entry.volume * volume);
    source.connect(gain).connect(context.destination);
    this.active += 1;
    source.onended = () => this.markEnded(name);
    source.start();
    this.started += 1;
    this.lastStarted = name;
  }

  private async startLoop(name: SoundName, volume: number): Promise<void> {
    const context = this.context;
    if (!context || context.state !== 'running' || this.loops.has(name)) return;
    const buffer = await this.loadBuffer(name);
    if (!buffer || this.disposed || this.loops.has(name) || readAudioMuted()) return;
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain).connect(context.destination);
    this.loops.set(name, { source, gain });
    this.active += 1;
    this.setLoopVolume(name, volume);
    source.onended = () => {
      if (this.loops.get(name)?.source === source) this.loops.delete(name);
    };
    source.start();
    this.started += 1;
    this.lastStarted = name;
  }

  private loadBuffer(name: SoundName): Promise<AudioBuffer | null> {
    const existing = this.buffers.get(name);
    if (existing) return existing;
    const promise = this.fetchBuffer(name);
    this.buffers.set(name, promise);
    return promise;
  }

  private async fetchBuffer(name: SoundName): Promise<AudioBuffer | null> {
    const loader = soundUrlLoader(name);
    const context = this.context;
    if (!loader || !context) {
      this.missing += 1;
      return null;
    }
    try {
      const url = await loader();
      const response = await fetch(url);
      if (!response.ok) {
        this.missing += 1;
        return null;
      }
      return await context.decodeAudioData(await response.arrayBuffer());
    } catch {
      this.missing += 1;
      return null;
    }
  }

  private markEnded(name: SoundName): void {
    this.active = Math.max(0, this.active - 1);
    this.releaseSoundSlot(name);
  }

  private releaseSoundSlot(name: SoundName): void {
    this.activeBySound.set(name, Math.max(0, (this.activeBySound.get(name) ?? 1) - 1));
  }

  private effectiveVolume(volume: number): number {
    const duck = this.active + 1 > DUCK_AFTER_TOTAL ? DUCK_GAIN : 1;
    return Math.max(0, Math.min(1, volume * readAudioVolume() * duck));
  }

  private applyMasterVolume(): void {
    for (const name of this.loops.keys()) this.setLoopVolume(name, 1);
    if (readAudioMuted() || readAudioVolume() <= 0) {
      for (const name of [...this.loops.keys()]) this.stopLoop(name);
    }
  }
}

function isSoundName(name: string): name is SoundName {
  return Object.hasOwn(soundManifest, name);
}
