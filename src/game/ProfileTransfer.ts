// SAVE-COMPAT LAW: gr.profile.v2 storage keys are append-or-migrate only; old ledger imports must keep loading.
// Imports add a profile and never destroy another profile's data. Add compatibility fixtures; never replace ancestors.
import { META_PROGRESS_KEY } from './MetaProgress';
import { Balance } from './Balance';
import { gunzipJsonBase64, gzipTextBase64 } from '../core/GzipJson';
import {
  PROFILE_KEY,
  RUN_SUSPEND_KEY,
  activeProfile,
  importProfileRecord,
  isTileStateDataKey,
  loadProfileState,
  profileDataKey,
  profileDataKeys,
  saveProfileState,
  type ProfileRecord,
  type ProfileStorage,
  type ProfileState,
} from './ProfileStorage';
import { SAVE_SLOTS_KEY, compactSaveSlotsForTransfer, mergeSaveSlotsForRestore } from './SaveSlots';
import { RUN_SUSPEND_REJECTION_KEY, RUN_SUSPEND_REJECTION_LINE, normalizeRunSuspendDatum } from './RunSuspend';

const TRANSFER_KIND = 'goldrush.profile.ledger';
const TRANSFER_VERSION = 1;
const CLOUD_TRANSFER_VERSION = 2;
const TRANSFER_SOFT_LIMIT_BYTES = 190 * 1024;
const RESTORE_TEMP_PREFIX = `${TRANSFER_KIND}.restore`;
const CLOUD_DATA_CODEC_KEY = '$goldRushGzipDataV1';
const CLOUD_DATA_MAX_OUTPUT_BYTES = 10 * 1024 * 1024;

export type ProfileTransferEnvelope = {
  kind: typeof TRANSFER_KIND;
  version: typeof TRANSFER_VERSION | typeof CLOUD_TRANSFER_VERSION;
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

export class CloudProfileTooLargeError extends Error {
  readonly code = 'payload_too_large' as const;

  constructor(
    readonly dominantKey: string | null,
    readonly sizeBytes: number,
    readonly limitBytes: number,
  ) {
    super(cloudProfileTooLargeMessage(dominantKey));
    this.name = 'CloudProfileTooLargeError';
  }
}

export function packActiveProfile(storage: ProfileStorage): { envelope: ProfileTransferEnvelope; filename: string } {
  const profile = activeProfile(storage);
  const data: Record<string, unknown> = {};
  for (const key of profileDataKeys(storage, profile.id)) {
    const raw = storage.getItem(profileDataKey(profile.id, key));
    if (raw !== null) data[key] = isTileStateDataKey(key) ? raw : decodeDatum(raw);
  }
  let envelope: ProfileTransferEnvelope = {
    kind: TRANSFER_KIND,
    version: TRANSFER_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    data,
  };
  if (byteSize(JSON.stringify(envelope)) > TRANSFER_SOFT_LIMIT_BYTES && SAVE_SLOTS_KEY in data) {
    data[SAVE_SLOTS_KEY] = compactSaveSlotsForTransfer(data[SAVE_SLOTS_KEY]);
    envelope = { ...envelope, data };
  }
  return { envelope, filename: `goldrush-${slug(profile.name)}-${dateStamp()}.json` };
}

export async function packActiveProfileForCloud(
  storage: ProfileStorage,
): Promise<{ envelope: ProfileTransferEnvelope; filename: string }> {
  const packed = packActiveProfile(storage);
  const cloudPacked =
    byteSize(JSON.stringify(packed.envelope)) <= TRANSFER_SOFT_LIMIT_BYTES
      ? packed
      : {
          ...packed,
          envelope: {
            ...packed.envelope,
            version: CLOUD_TRANSFER_VERSION,
            data: { [CLOUD_DATA_CODEC_KEY]: await gzipTextBase64(JSON.stringify(packed.envelope.data)) },
          } satisfies ProfileTransferEnvelope,
        };
  const sizeBytes = byteSize(JSON.stringify(cloudPacked.envelope));
  if (sizeBytes > TRANSFER_SOFT_LIMIT_BYTES) {
    throw new CloudProfileTooLargeError(dominantDataKey(packed.envelope.data), sizeBytes, TRANSFER_SOFT_LIMIT_BYTES);
  }
  return cloudPacked;
}

export async function expandCloudProfileTransfer(
  envelope: ProfileTransferEnvelope,
): Promise<ProfileTransferEnvelope | null> {
  if (envelope.version === TRANSFER_VERSION) {
    return CLOUD_DATA_CODEC_KEY in envelope.data ? null : envelope;
  }
  const entries = Object.entries(envelope.data);
  if (entries.length !== 1 || entries[0]?.[0] !== CLOUD_DATA_CODEC_KEY) return null;
  const encoded = entries[0][1];
  if (typeof encoded !== 'string') return null;
  try {
    const data = await gunzipJsonBase64(encoded, CLOUD_DATA_MAX_OUTPUT_BYTES);
    return isRecord(data) ? { ...envelope, version: TRANSFER_VERSION, data } : null;
  } catch {
    return null;
  }
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
  if (envelope.version !== TRANSFER_VERSION) return { ok: false, message: 'That ledger does not match this trail.' };
  const profile = importProfileRecord(storage, envelope.profile);
  if (!profile) return { ok: false, message: 'That ledger has no claim-holder name.' };
  for (const key of profileDataKeys(storage, profile.id, Object.keys(envelope.data))) {
    if (!(key in envelope.data)) continue;
    const datum = normalizeImportDatum(key, envelope.data[key]);
    if (datum === null) continue;
    try {
      storage.setItem(profileDataKey(profile.id, key), encodeDatum(datum));
    } catch {
      return { ok: false, message: 'The browser would not store that ledger.' };
    }
  }
  return { ok: true, profile };
}

export function restoreProfileBundle(storage: ProfileStorage, envelope: ProfileTransferEnvelope): ProfileTransferResult {
  if (!isEnvelope(envelope) || envelope.version !== TRANSFER_VERSION) {
    return { ok: false, message: 'That ledger does not match this trail.' };
  }
  const profile = normalizeCloudProfile(envelope.profile);
  if (!profile) return { ok: false, message: 'That ledger has no claim-holder name.' };

  const keys = profileDataKeys(storage, profile.id, Object.keys(envelope.data));
  const staged = stageRestoreData(storage, profile.id, envelope, keys);
  if (!staged.ok) return staged;

  const stateRaw = safeGet(storage, PROFILE_KEY);
  const prior = new Map<string, string | null>();
  for (const key of keys) {
    const dataKey = profileDataKey(profile.id, key);
    prior.set(dataKey, safeGet(storage, dataKey));
  }

  const touched: string[] = [];
  try {
    for (const key of keys) {
      const dataKey = profileDataKey(profile.id, key);
      const tempKey = staged.keys.get(key);
      if (tempKey) storage.setItem(dataKey, storage.getItem(tempKey) ?? '');
      else storage.removeItem(dataKey);
      touched.push(dataKey);
    }
    const state = loadProfileState(storage) ?? { version: 2 as const, activeId: profile.id, profiles: [] };
    const profiles = state.profiles.filter((entry) => entry.id !== profile.id);
    const next: ProfileState = { version: 2, activeId: profile.id, profiles: [...profiles, profile] };
    saveProfileState(storage, next);
  } catch {
    rollbackRestore(storage, stateRaw, prior, touched);
    cleanupTempKeys(storage, staged.keys);
    writeRestoreRejection(storage, 'restore write failed; previous ledger left untouched');
    return { ok: false, message: 'The browser would not store that ledger.' };
  }

  cleanupTempKeys(storage, staged.keys);
  return { ok: true, profile };
}

function stageRestoreData(
  storage: ProfileStorage,
  profileId: string,
  envelope: ProfileTransferEnvelope,
  profileKeys: Iterable<string>,
): { ok: true; keys: Map<string, string> } | ProfileTransferFailure {
  const keys = new Map<string, string>();
  const token = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  for (const key of profileKeys) {
    if (!(key in envelope.data)) continue;
    const datum = normalizeDatum(storage, profileId, key, envelope.data[key]);
    if (datum === null && requiresValidatedDatum(key)) {
      cleanupTempKeys(storage, keys);
      writeRestoreRejection(storage, `restore rejected invalid ${key}; previous ledger left untouched`);
      return { ok: false, message: 'That ledger contains a damaged saved claim.' };
    }
    if (datum === null) continue;
    const tempKey = `${RESTORE_TEMP_PREFIX}.${token}.${key}`;
    try {
      storage.setItem(tempKey, encodeDatum(datum));
      keys.set(key, tempKey);
    } catch {
      cleanupTempKeys(storage, keys);
      writeRestoreRejection(storage, 'restore staging failed; previous ledger left untouched');
      return { ok: false, message: 'The browser would not store that ledger.' };
    }
  }
  return { ok: true, keys };
}

function isEnvelope(value: unknown): value is ProfileTransferEnvelope {
  if (
    !isRecord(value) ||
    value.kind !== TRANSFER_KIND ||
    (value.version !== TRANSFER_VERSION && value.version !== CLOUD_TRANSFER_VERSION)
  ) {
    return false;
  }
  if (!isRecord(value.profile) || typeof value.profile.id !== 'string' || typeof value.profile.name !== 'string') return false;
  if (!isRecord(value.data)) return false;
  if (value.version === CLOUD_TRANSFER_VERSION) {
    const entries = Object.entries(value.data);
    return entries.length === 1 && entries[0]?.[0] === CLOUD_DATA_CODEC_KEY && typeof entries[0][1] === 'string';
  }
  return !(CLOUD_DATA_CODEC_KEY in value.data);
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

function normalizeDatum(storage: ProfileStorage, profileId: string, key: string, value: unknown): unknown | null {
  if (isTileStateDataKey(key)) return normalizeTileStateDatum(value);
  if (key === 'gr.run.v1') return normalizeRunSuspendDatum(value);
  if (key === SAVE_SLOTS_KEY) return mergeSaveSlotsForRestore(safeGet(storage, profileDataKey(profileId, SAVE_SLOTS_KEY)), value);
  return value;
}

function normalizeImportDatum(key: string, value: unknown): unknown | null {
  if (isTileStateDataKey(key)) return normalizeTileStateDatum(value);
  if (key === 'gr.run.v1') return normalizeRunSuspendDatum(value);
  if (key === SAVE_SLOTS_KEY) return mergeSaveSlotsForRestore(null, value);
  return value;
}

function requiresValidatedDatum(key: string): boolean {
  return key === RUN_SUSPEND_KEY || key === SAVE_SLOTS_KEY || isTileStateDataKey(key);
}

function normalizeTileStateDatum(value: unknown): unknown | null {
  try {
    return byteSize(encodeDatum(value)) <= Balance.persistence.tileStateMaxBytes ? value : null;
  } catch {
    return null;
  }
}

function safeGet(storage: Pick<Storage, 'getItem'>, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function rollbackRestore(
  storage: ProfileStorage,
  stateRaw: string | null,
  prior: ReadonlyMap<string, string | null>,
  touched: readonly string[],
): void {
  for (const key of [...touched].reverse()) restoreRaw(storage, key, prior.get(key) ?? null);
  restoreRaw(storage, PROFILE_KEY, stateRaw);
}

function restoreRaw(storage: ProfileStorage, key: string, value: string | null): void {
  try {
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {}
}

function cleanupTempKeys(storage: ProfileStorage, keys: ReadonlyMap<string, string>): void {
  for (const key of keys.values()) {
    try {
      storage.removeItem(key);
    } catch {}
  }
}

function writeRestoreRejection(storage: ProfileStorage, reason: string): void {
  try {
    storage.setItem(
      RUN_SUSPEND_REJECTION_KEY,
      JSON.stringify({
        message: RUN_SUSPEND_REJECTION_LINE,
        reasons: [reason],
        droppedEconomyEvents: 0,
        at: Date.now(),
      }),
    );
  } catch {}
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

function dominantDataKey(data: Record<string, unknown>): string | null {
  let dominant: { key: string; bytes: number } | null = null;
  for (const [key, value] of Object.entries(data)) {
    const bytes = byteSize(JSON.stringify(value) ?? '');
    if (!dominant || bytes > dominant.bytes) dominant = { key, bytes };
  }
  return dominant?.key ?? null;
}

function cloudProfileTooLargeMessage(dominantKey: string | null): string {
  if (dominantKey === RUN_SUSPEND_KEY) {
    return "Your current run's save is too large to back up; finish the claim or start fresh, then try again.";
  }
  if (dominantKey === SAVE_SLOTS_KEY) {
    return 'Your manual claims are too large to back up; delete an older claim, then try again.';
  }
  return 'That ledger is too large to back up; trim its largest saved item, then try again.';
}

function byteSize(value: string): number {
  return new TextEncoder().encode(value).length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
