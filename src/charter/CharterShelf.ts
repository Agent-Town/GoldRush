import { activeProfile, profileDataKey, type ProfileStorage } from '../game/ProfileStorage';
import { charterJson, parseCharter, type Charter } from './CharterSchema';

// The charter shelf lives under the gr.profile.v2 scope: one shelf per
// profile, keyed through the same profileDataKey convention as every other
// profile datum. Records are canonical charter JSON texts; damaged records
// are dropped on read, never repaired in place.
export const CHARTER_SHELF_LOGICAL_KEY = 'gr.charterShelf.v1';
export const CHARTER_SHELF_MAX = 24;

export type CharterShelfEntry = { charter: Charter; text: string };
export type CharterShelfAddResult = { ok: true; count: number } | { ok: false; message: string };

export function charterShelfStorageKey(storage: ProfileStorage): string {
  return profileDataKey(activeProfile(storage).id, CHARTER_SHELF_LOGICAL_KEY);
}

export function readCharterShelf(storage: ProfileStorage): CharterShelfEntry[] {
  let texts: unknown;
  try {
    const raw = storage.getItem(charterShelfStorageKey(storage));
    texts = raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
  if (!Array.isArray(texts)) return [];
  const entries: CharterShelfEntry[] = [];
  for (const text of texts) {
    if (typeof text !== 'string') continue;
    const parsed = parseCharter(text);
    if (parsed.ok) entries.push({ charter: parsed.charter, text });
  }
  return entries;
}

export function addCharterToShelf(storage: ProfileStorage, charter: Charter): CharterShelfAddResult {
  const text = charterJson(charter);
  const existing = readCharterShelf(storage);
  if (existing.some((entry) => entry.text === text)) return { ok: true, count: existing.length };
  if (existing.length >= CHARTER_SHELF_MAX) {
    return { ok: false, message: `The shelf holds ${CHARTER_SHELF_MAX} charters; retire one before stamping another.` };
  }
  try {
    storage.setItem(charterShelfStorageKey(storage), JSON.stringify([...existing.map((entry) => entry.text), text]));
    return { ok: true, count: existing.length + 1 };
  } catch {
    return { ok: false, message: 'The shelf could not hold this charter.' };
  }
}

export function removeCharterFromShelf(storage: ProfileStorage, text: string): number {
  const remaining = readCharterShelf(storage).filter((entry) => entry.text !== text);
  try {
    storage.setItem(charterShelfStorageKey(storage), JSON.stringify(remaining.map((entry) => entry.text)));
  } catch {}
  return remaining.length;
}
