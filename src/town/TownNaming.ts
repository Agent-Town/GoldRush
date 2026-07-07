import { TOWN_NAME_KEY, activeProfile, profileDataKey, type ProfileStorage } from '../game/ProfileStorage';

const NAME_RULE = /^[A-Za-z0-9 '\-]+$/;
const NAME_RULE_MESSAGE = 'Use 2-18 letters, numbers, spaces, apostrophes, or hyphens.';
const BLOCKED_PARTS = ['fuck', 'shit', 'bitch', 'cunt', 'pussy', 'asshole', 'bastard', 'nigger', 'faggot', 'slut', 'whore'];
export const TOWN_NAME_REJECTION = 'The Elder suggests a different name.';

export type TownNameValidation =
  | { ok: true; value: string }
  | { ok: false; message: string };

export function readTownName(storage = browserStorage()): string | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(townNameStorageKey(storage));
    if (!raw) return null;
    const result = validateTownName(raw);
    return result.ok ? result.value : null;
  } catch {
    return null;
  }
}

export function saveTownName(input: string, storage = browserStorage()): string | null {
  const result = validateTownName(input);
  if (!result.ok) return null;
  try {
    storage?.setItem(townNameStorageKey(storage), result.value);
  } catch {
    // Town can still update for this session if storage is unavailable.
  }
  return result.value;
}

export function validateTownName(input: string): TownNameValidation {
  const value = input.replace(/\s+/g, ' ').trim();
  if (value.length < 2 || value.length > 18 || !NAME_RULE.test(value)) return { ok: false, message: NAME_RULE_MESSAGE };
  if (hasBlockedPart(value)) return { ok: false, message: TOWN_NAME_REJECTION };
  return { ok: true, value };
}

function townNameStorageKey(storage: ProfileStorage | undefined): string {
  return profileDataKey(storage ? activeProfile(storage).id : 'robin', TOWN_NAME_KEY);
}

function hasBlockedPart(value: string): boolean {
  const compact = value.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return BLOCKED_PARTS.some((part) => compact.includes(part));
}

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
