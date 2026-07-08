import { META_PROGRESS_KEY } from './MetaProgress';
import {
  PROFILE_DATA_KEYS,
  activeProfile,
  importProfileRecord,
  loadProfileState,
  profileDataKey,
  saveProfileState,
  type ProfileRecord,
  type ProfileStorage,
  type ProfileState,
} from './ProfileStorage';

const TRANSFER_KIND = 'goldrush.profile.ledger';
const TRANSFER_VERSION = 1;

export type ProfileTransferEnvelope = {
  kind: typeof TRANSFER_KIND;
  version: typeof TRANSFER_VERSION;
  exportedAt: string;
  profile: ProfileRecord;
  data: Record<string, unknown>;
};

export type ProfileTransferPreview = {
  envelope: ProfileTransferEnvelope;
  line: string;
};

export type ProfileTransferFailure = { ok: false; message: string };

export type ProfileTransferResult =
  | { ok: true; profile: ProfileRecord }
  | ProfileTransferFailure;

export function packActiveProfile(storage: ProfileStorage): { envelope: ProfileTransferEnvelope; filename: string } {
  const profile = activeProfile(storage);
  const data: Record<string, unknown> = {};
  for (const key of PROFILE_DATA_KEYS) {
    const raw = storage.getItem(profileDataKey(profile.id, key));
    if (raw !== null) data[key] = decodeDatum(raw);
  }
  const envelope: ProfileTransferEnvelope = {
    kind: TRANSFER_KIND,
    version: TRANSFER_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    data,
  };
  return { envelope, filename: `goldrush-${slug(profile.name)}-${dateStamp()}.json` };
}

export function unpackPreview(text: string): ProfileTransferFailure | ProfileTransferPreview {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, message: 'That ledger is torn. Pick a Gold Rush save file.' };
  }
  if (!isEnvelope(raw)) return { ok: false, message: 'That ledger does not match this trail.' };
  return { envelope: raw, line: previewLine(raw) };
}

export function unpackProfile(storage: ProfileStorage, envelope: ProfileTransferEnvelope): ProfileTransferResult {
  const profile = importProfileRecord(storage, envelope.profile);
  if (!profile) return { ok: false, message: 'That ledger has no prospector name.' };
  for (const key of PROFILE_DATA_KEYS) {
    if (!(key in envelope.data)) continue;
    try {
      storage.setItem(profileDataKey(profile.id, key), encodeDatum(envelope.data[key]));
    } catch {
      return { ok: false, message: 'The browser would not store that ledger.' };
    }
  }
  return { ok: true, profile };
}

export function restoreProfileBundle(storage: ProfileStorage, envelope: ProfileTransferEnvelope): ProfileTransferResult {
  if (!isEnvelope(envelope)) return { ok: false, message: 'That ledger does not match this trail.' };
  const profile = normalizeCloudProfile(envelope.profile);
  if (!profile) return { ok: false, message: 'That ledger has no prospector name.' };

  const state = loadProfileState(storage) ?? { version: 2 as const, activeId: profile.id, profiles: [] };
  const profiles = state.profiles.filter((entry) => entry.id !== profile.id);
  const next: ProfileState = { version: 2, activeId: profile.id, profiles: [...profiles, profile] };
  saveProfileState(storage, next);

  for (const key of PROFILE_DATA_KEYS) storage.removeItem(profileDataKey(profile.id, key));
  for (const key of PROFILE_DATA_KEYS) {
    if (!(key in envelope.data)) continue;
    try {
      storage.setItem(profileDataKey(profile.id, key), encodeDatum(envelope.data[key]));
    } catch {
      return { ok: false, message: 'The browser would not store that ledger.' };
    }
  }
  return { ok: true, profile };
}

function isEnvelope(value: unknown): value is ProfileTransferEnvelope {
  if (!isRecord(value) || value.kind !== TRANSFER_KIND || value.version !== TRANSFER_VERSION) return false;
  if (!isRecord(value.profile) || typeof value.profile.id !== 'string' || typeof value.profile.name !== 'string') return false;
  return isRecord(value.data);
}

function normalizeCloudProfile(profile: ProfileRecord): ProfileRecord | null {
  const id = profile.id.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64);
  const name = profile.name.replace(/\s+/g, ' ').trim().slice(0, 24);
  if (!id || !name) return null;
  const now = Date.now();
  return {
    ...profile,
    id,
    name,
    createdAt: readTime(profile.createdAt) || now,
    updatedAt: readTime(profile.updatedAt) || now,
    hintsSeen: Array.isArray(profile.hintsSeen) ? profile.hintsSeen.filter((hint): hint is string => typeof hint === 'string') : [],
  };
}

function previewLine(envelope: ProfileTransferEnvelope): string {
  const town = readString(envelope.data['gr.town.name.v1']) ?? 'unnamed town';
  const tracks = readTracks(envelope.data[META_PROGRESS_KEY]);
  return `${envelope.profile.name} - town '${town}', science ${tracks.science}, territory ${roman(tracks.territory)} - bring them in?`;
}

function readTracks(value: unknown): { science: number; territory: number } {
  const source = isRecord(value) && isRecord(value.tracks) ? value.tracks : value;
  return {
    science: readNumber(isRecord(source) ? source.science : undefined),
    territory: readNumber(isRecord(source) ? source.territory : undefined),
  };
}

function decodeDatum(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function encodeDatum(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function readTime(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
}

function roman(value: number): string {
  const numerals = ['0', 'I', 'II', 'III', 'IV', 'V'];
  return numerals[value] ?? String(value);
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'profile';
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
