export const AUDIO_VOLUME_STORAGE_KEY = 'gr.audio.volume.v1';
export const AUDIO_MUTED_STORAGE_KEY = 'gr.audio.muted.v1';
export const MUSIC_VOLUME_STORAGE_KEY = 'gr.audio.music-volume.v1';

let audioVolume = readStoredAudioVolume();
let audioMuted = readStoredAudioMuted();
let musicVolume = readStoredMusicVolume();
const preferenceListeners = new Set<() => void>();

export function readAudioVolume(): number {
  audioVolume = readStoredAudioVolume();
  return audioVolume;
}

export function setAudioVolume(value: number): number {
  audioVolume = clampVolume(value);
  try {
    globalThis.localStorage?.setItem(AUDIO_VOLUME_STORAGE_KEY, String(audioVolume));
  } catch {}
  notifyAudioPreferenceListeners();
  return audioVolume;
}

export function readAudioMuted(): boolean {
  audioMuted = readStoredAudioMuted();
  return audioMuted;
}

export function setAudioMuted(value: boolean): boolean {
  audioMuted = value;
  try {
    globalThis.localStorage?.setItem(AUDIO_MUTED_STORAGE_KEY, audioMuted ? '1' : '0');
  } catch {}
  notifyAudioPreferenceListeners();
  return audioMuted;
}

export function readMusicVolume(): number {
  musicVolume = readStoredMusicVolume();
  return musicVolume;
}

export function setMusicVolume(value: number): number {
  musicVolume = clampVolume(value);
  try {
    globalThis.localStorage?.setItem(MUSIC_VOLUME_STORAGE_KEY, String(musicVolume));
  } catch {}
  notifyAudioPreferenceListeners();
  return musicVolume;
}

export function subscribeAudioPreferences(listener: () => void): () => void {
  preferenceListeners.add(listener);
  return () => preferenceListeners.delete(listener);
}

function notifyAudioPreferenceListeners(): void {
  for (const listener of preferenceListeners) listener();
}

function readStoredAudioVolume(): number {
  try {
    return clampVolume(Number(globalThis.localStorage?.getItem(AUDIO_VOLUME_STORAGE_KEY) ?? 0.8));
  } catch {
    return 0.8;
  }
}

function readStoredAudioMuted(): boolean {
  try {
    return globalThis.localStorage?.getItem(AUDIO_MUTED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function readStoredMusicVolume(): number {
  try {
    return clampVolume(Number(globalThis.localStorage?.getItem(MUSIC_VOLUME_STORAGE_KEY) ?? 0.35));
  } catch {
    return 0.35;
  }
}

function clampVolume(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.8;
}
