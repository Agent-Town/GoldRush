import { MEDALS_KEY, activeProfile, profileDataKey, type ProfileStorage } from './ProfileStorage';

export const BARON_MEDAL_BLURB = "He'll be back — with machines.";

export type MedalState = {
  version: 1;
  baronBeaten: boolean;
};

export function freshMedals(): MedalState {
  return { version: 1, baronBeaten: false };
}

export function loadMedals(storage: MedalStorage | undefined = browserStorage()): MedalState {
  if (!storage) return freshMedals();
  let raw: unknown = null;
  try {
    const saved = storage.getItem(medalStorageKey(storage));
    raw = saved ? JSON.parse(saved) : null;
  } catch {
    raw = null;
  }
  return migrateMedals(raw);
}

export function hasBaronMedal(storage: MedalStorage | undefined = browserStorage()): boolean {
  return loadMedals(storage).baronBeaten;
}

export function awardBaronMedal(storage: MedalStorage | undefined = browserStorage()): MedalState {
  const medals = { ...loadMedals(storage), baronBeaten: true };
  try {
    storage?.setItem(medalStorageKey(storage), JSON.stringify(medals));
  } catch {}
  return medals;
}

type MedalStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function migrateMedals(raw: unknown): MedalState {
  if (!raw || typeof raw !== 'object') return freshMedals();
  return { version: 1, baronBeaten: (raw as { baronBeaten?: unknown }).baronBeaten === true };
}

function browserStorage(): MedalStorage | undefined {
  try {
    return globalThis.localStorage || undefined;
  } catch {
    return undefined;
  }
}

function medalStorageKey(storage: MedalStorage): string {
  return profileDataKey(activeProfile(storage as ProfileStorage).id, MEDALS_KEY);
}
