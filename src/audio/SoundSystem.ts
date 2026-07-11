import type { ProjectileKind } from '../systems/CombatSystem';
import { soundManifest, soundUrlLoader, type SoundManifestEntry, type SoundName } from './manifest';
import { readAudioMuted, readAudioVolume, readMusicVolume, subscribeAudioPreferences } from './settings';

export { soundManifest, type SoundName } from './manifest';
export {
  AUDIO_MUTED_STORAGE_KEY,
  AUDIO_VOLUME_STORAGE_KEY,
  MUSIC_VOLUME_STORAGE_KEY,
  readAudioMuted,
  readAudioVolume,
  readMusicVolume,
  setAudioMuted,
  setAudioVolume,
  setMusicVolume,
} from './settings';

const MAX_PER_SOUND = 4;
const GLOBAL_VOICE_CAP = 12;
const HEADROOM_AFTER_VOICES = 6;
const HEADROOM_GAIN_FLOOR = 0.45;
let audioWasUnlocked = false;
const FAMILY_INTERVAL_MS = {
  gold: 120,
  hit: 60,
} as const;

type SoundPriority = 'ambient' | 'economy' | 'combat' | 'ui';
type SoundFamily = keyof typeof FAMILY_INTERVAL_MS;

type SoundDiagnostics = {
  unlocked: boolean;
  muted: boolean;
  volume: number;
  musicVolume: number;
  requests: number;
  started: number;
  missing: number;
  active: number;
  concurrentVoices: number;
  voiceCap: number;
  dropsPerSecond: number;
  headroomGain: number;
  loops: string[];
  loopSourceCounts: Record<string, number>;
  loopVolumes: Record<string, number>;
  lastRequested: string | null;
  lastStarted: string | null;
  playsPerSecond: Record<string, number>;
  startedBySound: Record<string, number>;
  droppedBySound: Record<string, number>;
  droppedByFamily: Record<string, number>;
  droppedByPriority: Record<string, number>;
};

type LoopState = {
  source: AudioBufferSourceNode;
  gain: GainNode;
  voiceId: number;
  volume: number;
  sourceCount: number;
};

type VoiceState = {
  id: number;
  name: SoundName;
  priority: SoundPriority;
  loop: boolean;
  countsPerSound: boolean;
  source: AudioBufferSourceNode | null;
};

export class SoundSystem {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private unlocked = false;
  private disposed = false;
  private requests = 0;
  private started = 0;
  private missing = 0;
  private nextVoiceId = 1;
  private lastRequested: string | null = null;
  private lastStarted: string | null = null;
  private readonly buffers = new Map<SoundName, Promise<AudioBuffer | null>>();
  private readonly voices = new Map<number, VoiceState>();
  private readonly activeBySound = new Map<SoundName, number>();
  private readonly startedBySound = new Map<SoundName, number>();
  private readonly droppedBySound = new Map<SoundName, number>();
  private readonly droppedByFamily = new Map<SoundFamily, number>();
  private readonly droppedByPriority = new Map<SoundPriority, number>();
  private readonly droppedAt: number[] = [];
  private readonly startedAtBySound = new Map<SoundName, number[]>();
  private readonly lastAcceptedAtBySound = new Map<SoundName, number>();
  private readonly lastAcceptedAtByFamily = new Map<SoundFamily, number>();
  private readonly loops = new Map<SoundName, LoopState>();
  private readonly startingLoops = new Set<SoundName>();
  private readonly desiredLoops = new Map<SoundName, number>();
  private readonly unsubscribePreferences = subscribeAudioPreferences(() => this.applyMasterVolume());

  constructor() {
    window.addEventListener('pointerdown', this.unlock, { passive: true });
    window.addEventListener('keydown', this.unlock);
    if (audioWasUnlocked) this.unlock();
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
    if (!this.acceptSoundRequest(name)) return;
    const count = this.activeBySound.get(name) ?? 0;
    if (count >= MAX_PER_SOUND) {
      this.recordDrop(name);
      return;
    }
    const voiceId = this.reserveVoice(name, false, true);
    if (voiceId === null) return;
    this.activeBySound.set(name, count + 1);
    void this.playLoaded(name, volume, voiceId);
  }

  setLoop(name: SoundName, on: boolean, volume = 1): void {
    if (on) this.desiredLoops.set(name, volume);
    else this.desiredLoops.delete(name);
    if (!on || readAudioMuted() || readAudioVolume() <= 0) {
      this.stopLoop(name);
      return;
    }
    if (!this.unlocked || this.loops.has(name)) {
      if (this.loops.has(name)) this.setLoopVolume(name, volume);
      return;
    }
    if (this.startingLoops.has(name)) return;
    void this.startLoop(name, volume);
  }

  setLoopVolume(name: SoundName, volume: number): void {
    const loop = this.loops.get(name);
    const entry: SoundManifestEntry = soundManifest[name];
    if (!loop || !entry) return;
    loop.volume = volume;
    loop.sourceCount = this.loopSourceCount(name, loop.sourceCount);
    loop.gain.gain.value = this.effectiveVolume(entry.volume * volume * loopSourceScale(loop.sourceCount) * this.groupVolume(entry));
  }

  stopLoop(name: SoundName): void {
    const loop = this.loops.get(name);
    if (!loop) return;
    this.releaseVoice(loop.voiceId, true);
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
    this.play(ownerId === 'hero_blast' || ownerId.startsWith('baron_rocket') ? 'blast-charge-boom' : 'spark-bolt-hit');
  }

  playBuildingDamage(family: string, hp: number, maxHp: number, wrecked: boolean, forceCrack = false): void {
    if (wrecked) {
      this.play('palisade-collapse');
      return;
    }
    if (forceCrack || (family === 'palisade' && maxHp > 0 && hp / maxHp <= 0.35)) this.play('palisade-crack');
    else this.play('palisade-hit');
  }

  dispose(): void {
    this.disposed = true;
    window.removeEventListener('pointerdown', this.unlock);
    window.removeEventListener('keydown', this.unlock);
    this.unsubscribePreferences();
    for (const voice of [...this.voices.values()]) this.releaseVoice(voice.id, true);
    void this.context?.close();
    this.context = null;
    this.masterGain = null;
    window.__GR_AUDIO_DIAGNOSTICS__ = undefined;
  }

  diagnostics(): SoundDiagnostics {
    const active = this.voices.size;
    return {
      unlocked: this.unlocked,
      muted: readAudioMuted(),
      volume: readAudioVolume(),
      musicVolume: readMusicVolume(),
      requests: this.requests,
      started: this.started,
      missing: this.missing,
      active,
      concurrentVoices: active,
      voiceCap: GLOBAL_VOICE_CAP,
      dropsPerSecond: this.dropsPerSecondSnapshot(),
      headroomGain: this.headroomGain(),
      loops: [...this.loops.keys()],
      loopSourceCounts: Object.fromEntries([...this.loops].map(([name, loop]) => [name, loop.sourceCount])),
      loopVolumes: Object.fromEntries([...this.loops].map(([name, loop]) => [name, loop.gain.gain.value])),
      lastRequested: this.lastRequested,
      lastStarted: this.lastStarted,
      playsPerSecond: this.playsPerSecondSnapshot(),
      startedBySound: Object.fromEntries(this.startedBySound),
      droppedBySound: Object.fromEntries(this.droppedBySound),
      droppedByFamily: Object.fromEntries(this.droppedByFamily),
      droppedByPriority: Object.fromEntries(this.droppedByPriority),
    };
  }

  private readonly unlock = (): void => {
    if (this.disposed) return;
    audioWasUnlocked = true;
    const context = this.ensureContext();
    if (context.state === 'running') {
      this.unlocked = true;
      this.startDesiredLoops();
      return;
    }
    void context.resume()
      .then(() => {
        if (!this.disposed && context.state === 'running') this.unlocked = true;
        if (this.unlocked) this.startDesiredLoops();
      })
      .catch(() => undefined);
  };

  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext();
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.updateMasterGain();
    }
    return this.context;
  }

  private async playLoaded(name: SoundName, volume: number, voiceId: number): Promise<void> {
    const context = this.context;
    if (!context || context.state !== 'running') {
      this.releaseVoice(voiceId);
      return;
    }
    const buffer = await this.loadBuffer(name);
    if (!buffer || this.disposed || readAudioMuted()) {
      this.releaseVoice(voiceId);
      return;
    }
    const voice = this.voices.get(voiceId);
    if (!voice) return;
    const entry: SoundManifestEntry = soundManifest[name];
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.playbackRate.value = this.playbackRate(entry.pitchVariance);
    gain.gain.value = this.effectiveVolume(entry.volume * volume * this.groupVolume(entry));
    source.connect(gain).connect(this.masterGain ?? context.destination);
    voice.source = source;
    source.onended = () => this.releaseVoice(voiceId);
    source.start();
    this.started += 1;
    this.recordStarted(name);
    this.lastStarted = name;
  }

  private async startLoop(name: SoundName, volume: number): Promise<void> {
    const context = this.context;
    if (!context || context.state !== 'running' || this.loops.has(name)) return;
    this.startingLoops.add(name);
    const voiceId = this.reserveVoice(name, true, false);
    if (voiceId === null) {
      this.startingLoops.delete(name);
      return;
    }
    const buffer = await this.loadBuffer(name);
    if (!buffer || this.disposed || this.loops.has(name) || readAudioMuted()) {
      this.startingLoops.delete(name);
      this.releaseVoice(voiceId);
      return;
    }
    const voice = this.voices.get(voiceId);
    if (!voice) {
      this.startingLoops.delete(name);
      return;
    }
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain).connect(this.masterGain ?? context.destination);
    voice.source = source;
    this.loops.set(name, { source, gain, voiceId, volume, sourceCount: this.loopSourceCount(name, 1) });
    this.setLoopVolume(name, volume);
    source.onended = () => {
      if (this.loops.get(name)?.source === source) this.loops.delete(name);
      this.releaseVoice(voiceId);
    };
    this.startingLoops.delete(name);
    source.start();
    this.started += 1;
    this.recordStarted(name);
    this.lastStarted = name;
  }

  private acceptSoundRequest(name: SoundName): boolean {
    const entry: SoundManifestEntry = soundManifest[name];
    const minIntervalMs = entry.minIntervalMs ?? 0;
    const now = performance.now();
    const last = this.lastAcceptedAtBySound.get(name) ?? -Infinity;
    if (now - last < minIntervalMs) {
      this.recordDrop(name);
      return false;
    }
    const family = soundFamily(name);
    const familyIntervalMs = family ? FAMILY_INTERVAL_MS[family] : 0;
    const lastFamily = family ? (this.lastAcceptedAtByFamily.get(family) ?? -Infinity) : -Infinity;
    if (family && now - lastFamily < familyIntervalMs) {
      this.recordDrop(name, family);
      return false;
    }
    if (minIntervalMs > 0) this.lastAcceptedAtBySound.set(name, now);
    if (family) this.lastAcceptedAtByFamily.set(family, now);
    return true;
  }

  private reserveVoice(name: SoundName, loop: boolean, countsPerSound: boolean): number | null {
    const priority = soundPriority(name);
    if (this.voices.size >= GLOBAL_VOICE_CAP) {
      const evicted = this.lowestEvictableVoice(priority);
      if (!evicted) {
        this.recordDrop(name);
        return null;
      }
      this.recordDrop(evicted.name);
      this.releaseVoice(evicted.id, true);
    }
    const id = this.nextVoiceId++;
    this.voices.set(id, { id, name, priority, loop, countsPerSound, source: null });
    this.updateMasterGain();
    this.publishAudioDiagnostics();
    return id;
  }

  private lowestEvictableVoice(incoming: SoundPriority): VoiceState | null {
    let lowest: VoiceState | null = null;
    for (const voice of this.voices.values()) {
      if (!lowest || priorityRank(voice.priority) < priorityRank(lowest.priority)) lowest = voice;
    }
    return lowest && priorityRank(lowest.priority) < priorityRank(incoming) ? lowest : null;
  }

  private releaseVoice(voiceId: number, stop = false): void {
    const voice = this.voices.get(voiceId);
    if (!voice) return;
    this.voices.delete(voiceId);
    if (voice.countsPerSound) this.releaseSoundSlot(voice.name);
    if (voice.loop && this.loops.get(voice.name)?.voiceId === voiceId) this.loops.delete(voice.name);
    if (stop && voice.source) {
      try {
        voice.source.stop();
      } catch {}
    }
    this.updateMasterGain();
    this.publishAudioDiagnostics();
  }

  private recordDrop(name: SoundName, family = soundFamily(name)): void {
    const now = performance.now();
    const priority = soundPriority(name);
    this.droppedBySound.set(name, (this.droppedBySound.get(name) ?? 0) + 1);
    this.droppedByPriority.set(priority, (this.droppedByPriority.get(priority) ?? 0) + 1);
    if (family) this.droppedByFamily.set(family, (this.droppedByFamily.get(family) ?? 0) + 1);
    this.droppedAt.push(now);
    this.trimStarts(this.droppedAt, now);
    this.publishAudioDiagnostics();
  }

  private playbackRate(pitchVariance = 0): number {
    return Math.max(0.01, 1 + (Math.random() * 2 - 1) * pitchVariance);
  }

  private recordStarted(name: SoundName): void {
    const now = performance.now();
    this.startedBySound.set(name, (this.startedBySound.get(name) ?? 0) + 1);
    const starts = this.startedAtBySound.get(name) ?? [];
    starts.push(now);
    this.startedAtBySound.set(name, starts);
    this.trimStarts(starts, now);
    this.publishAudioDiagnostics();
  }

  private playsPerSecondSnapshot(): Record<string, number> {
    const now = performance.now();
    const entries = [...this.startedAtBySound.entries()].map(([name, starts]) => [name, this.trimStarts(starts, now).length]);
    return Object.fromEntries(entries);
  }

  private dropsPerSecondSnapshot(): number {
    return this.trimStarts(this.droppedAt, performance.now()).length;
  }

  private trimStarts(starts: number[], now: number): number[] {
    while (starts[0] !== undefined && now - starts[0] > 1000) starts.shift();
    return starts;
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

  private releaseSoundSlot(name: SoundName): void {
    this.activeBySound.set(name, Math.max(0, (this.activeBySound.get(name) ?? 1) - 1));
  }

  private effectiveVolume(volume: number): number {
    return Math.max(0, Math.min(1, volume));
  }

  private headroomGain(): number {
    const voices = this.voices.size;
    if (voices <= HEADROOM_AFTER_VOICES) return 1;
    // Poor-man limiter: preserve headroom as mixes get dense, capped so the game never disappears.
    return Math.max(HEADROOM_GAIN_FLOOR, Math.sqrt(HEADROOM_AFTER_VOICES / voices));
  }

  private updateMasterGain(): void {
    if (!this.masterGain) return;
    this.masterGain.gain.value = readAudioMuted() ? 0 : readAudioVolume() * this.headroomGain();
  }

  private publishAudioDiagnostics(): void {
    if (typeof window === 'undefined') return;
    const diagnostics = this.diagnostics();
    window.__GR_AUDIO_DIAGNOSTICS__ = diagnostics;
    if (window.__THREE_GAME_DIAGNOSTICS__) window.__THREE_GAME_DIAGNOSTICS__.audio = diagnostics;
  }

  private loopSourceCount(name: SoundName, fallback: number): number {
    if (name === 'sluice-water-loop' && typeof window !== 'undefined') {
      // ponytail: source-count belongs in the caller; keep this inside audio until that firewall opens.
      const build = window.__THREE_GAME_DIAGNOSTICS__?.build;
      const count = build?.sluicePositions?.length ?? build?.sluices;
      if (typeof count === 'number' && Number.isFinite(count) && count > 0) return count;
    }
    return Math.max(1, Math.round(fallback));
  }

  private applyMasterVolume(): void {
    this.updateMasterGain();
    for (const [name, loop] of this.loops) this.setLoopVolume(name, loop.volume);
    if (readAudioMuted() || readAudioVolume() <= 0) {
      for (const name of [...this.loops.keys()]) this.stopLoop(name);
    } else {
      this.startDesiredLoops();
    }
  }

  private groupVolume(entry: SoundManifestEntry): number {
    return entry.group === 'music' ? readMusicVolume() : 1;
  }

  private startDesiredLoops(): void {
    for (const [name, volume] of this.desiredLoops) this.setLoop(name, true, volume);
  }
}

function isSoundName(name: string): name is SoundName {
  return Object.hasOwn(soundManifest, name);
}

function loopSourceScale(count: number): number {
  return Math.min(1.55, 1 + Math.log2(Math.max(1, count)) * 0.12);
}

function soundFamily(name: SoundName): SoundFamily | null {
  if (name === 'gold-chime' || name === 'stockpile-deposit') return 'gold';
  if (name === 'spark-bolt-hit' || name === 'palisade-hit' || name === 'palisade-crack' || name === 'palisade-collapse') return 'hit';
  return null;
}

function soundPriority(name: SoundName): SoundPriority {
  const entry: SoundManifestEntry = soundManifest[name];
  if (entry.group === 'ui' || entry.group === 'voice' || name === 'wave-start-horn') return 'ui';
  if (name === 'gold-chime' || name === 'stockpile-deposit' || name === 'pan-swish') return 'economy';
  if (entry.group === 'ambience' || entry.loop) return 'ambient';
  return 'combat';
}

function priorityRank(priority: SoundPriority): number {
  return priority === 'ui' ? 3 : priority === 'combat' ? 2 : priority === 'economy' ? 1 : 0;
}
