import { DIFFICULTY_PRESET_STORAGE_KEY, normalizeDifficultyPreset, type DifficultyPresetId } from './Balance';
import { META_PROGRESS_KEY } from './MetaProgress';
import { RESEARCH_STATE_KEY, researchStateKey } from '../meta/ResearchTree';
import { MEGAPROJECT_STATE_KEY } from '../meta/Megaproject';
import { AUDIO_MUTED_STORAGE_KEY, AUDIO_VOLUME_STORAGE_KEY, MUSIC_VOLUME_STORAGE_KEY } from '../audio/settings';
import { STORY_TALES_STORAGE_KEY } from '../story/settings';
import { LEDGER_DISCOVERED_STORAGE_KEY } from '../encyclopedia/storage';
import { PERFORMANCE_TIER_STORAGE_KEY, RUNTIME_PERFORMANCE_VERDICTS_STORAGE_KEY } from './PerformanceTier';
import { ACTIVE_EPOCH_KEY, EPOCH_CEREMONY_KEY, listEpochs } from '../meta/ContractFamilies';
import { PLAYBOOKS_KEY } from '../playbook/PlaybookStore';
import { E7_SIGNAL_STATE_KEY } from '../systems/E7SignalSystem';
import {
  HERO_SKIN_STORAGE_KEY,
  HERO_SKINS_OWNED_STORAGE_KEY,
  PROSPECTOR_SKIN_STORAGE_KEY,
  PROSPECTOR_SKINS_OWNED_STORAGE_KEY,
} from './ProspectorSkin';

export const PROFILE_KEY = 'gr.profile.v2';
export const CAMERA_ZOOM_STORAGE_KEY = 'gr.camera.zoom.v1';
export const LEGACY_SCOREBOARD_KEY = 'gr.scores.v1';
export const SCOREBOARD_KEY = 'gr.scores.v2';
export const RUN_SUSPEND_KEY = 'gr.run.v1';
export const RUN_HISTORY_KEY = 'gr.history.v1';
export const SAVE_SLOTS_KEY = 'gr.saveSlots.v1';
export const TOWN_NAME_KEY = 'gr.town.name.v1';
export const MEDALS_KEY = 'gr.medals.v1';
export const FIRST_CLAIM_DONE_KEY = 'gr.firstClaim.done.v1';
export const DREDGE_QUEEN_WRECK_KEY = 'gr.e5W6Wreck.v1';
const TILE_STATE_DATA_KEY_PREFIX = 'tilestate.';
export const DEFAULT_PROFILE_NAME = 'Robin';
export const DEFAULT_DIFFICULTY_PRESET: DifficultyPresetId = 'trail';

export const PROFILE_DATA_KEYS = new Set([
  META_PROGRESS_KEY,
  RUN_SUSPEND_KEY,
  RUN_HISTORY_KEY,
  SAVE_SLOTS_KEY,
  TOWN_NAME_KEY,
  MEDALS_KEY,
  FIRST_CLAIM_DONE_KEY,
  DREDGE_QUEEN_WRECK_KEY,
  LEGACY_SCOREBOARD_KEY,
  SCOREBOARD_KEY,
  RESEARCH_STATE_KEY,
  MEGAPROJECT_STATE_KEY,
  DIFFICULTY_PRESET_STORAGE_KEY,
  AUDIO_VOLUME_STORAGE_KEY,
  AUDIO_MUTED_STORAGE_KEY,
  MUSIC_VOLUME_STORAGE_KEY,
  STORY_TALES_STORAGE_KEY,
  LEDGER_DISCOVERED_STORAGE_KEY,
  ACTIVE_EPOCH_KEY,
  EPOCH_CEREMONY_KEY,
  PLAYBOOKS_KEY,
  E7_SIGNAL_STATE_KEY,
  CAMERA_ZOOM_STORAGE_KEY,
  PROSPECTOR_SKIN_STORAGE_KEY,
  PROSPECTOR_SKINS_OWNED_STORAGE_KEY,
  HERO_SKIN_STORAGE_KEY,
  HERO_SKINS_OWNED_STORAGE_KEY,
  ...listEpochs().map((epoch) => researchStateKey(epoch.id)),
]);
const DEVICE_PROFILE_DATA_KEYS = new Set([RUNTIME_PERFORMANCE_VERDICTS_STORAGE_KEY]);
const LATE_PROFILE_DATA_KEYS = [
  AUDIO_VOLUME_STORAGE_KEY,
  AUDIO_MUTED_STORAGE_KEY,
  MUSIC_VOLUME_STORAGE_KEY,
  STORY_TALES_STORAGE_KEY,
  ACTIVE_EPOCH_KEY,
  EPOCH_CEREMONY_KEY,
  CAMERA_ZOOM_STORAGE_KEY,
] as const;
const DEVICE_LOCAL_MIGRATION_KEYS = [PERFORMANCE_TIER_STORAGE_KEY] as const;

export type ProfileRecord = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  difficultyPreset: DifficultyPresetId;
  hintsSeen: string[];
  trailGuide?: true;
};

export type ProfileState = {
  version: 2;
  activeId: string;
  profiles: ProfileRecord[];
};

export type ProfileStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const nativeStorage = {
  getItem: typeof Storage === 'undefined' ? undefined : Storage.prototype.getItem,
  setItem: typeof Storage === 'undefined' ? undefined : Storage.prototype.setItem,
  removeItem: typeof Storage === 'undefined' ? undefined : Storage.prototype.removeItem,
};
const inertStorage: Storage = {
  length: 0,
  clear() {},
  getItem() {
    return null;
  },
  key() {
    return null;
  },
  removeItem() {},
  setItem() {},
};

let scopedStorage: Storage | null = null;
let sessionProfileId = '';
let storageScopeInstalled = false;

export function ensureProfileState(storage: ProfileStorage): ProfileState {
  const saved = loadProfileState(storage);
  if (saved) {
    migrateProfileDataKeys(storage, saved.profiles.map((profile) => profile.id), LATE_PROFILE_DATA_KEYS);
    migrateDeviceLocalDataKeys(storage, saved, DEVICE_LOCAL_MIGRATION_KEYS);
    return saved;
  }

  const now = Date.now();
  const robin = freshProfile(DEFAULT_PROFILE_NAME, now, 'robin', readLegacyDifficulty(storage));
  const state: ProfileState = { version: 2, activeId: robin.id, profiles: [robin] };
  saveProfileState(storage, state);
  migrateLegacyData(storage, robin.id);
  saveProfileDatum(storage, robin.id, DIFFICULTY_PRESET_STORAGE_KEY, robin.difficultyPreset);
  return state;
}

export function loadProfileState(storage: Pick<Storage, 'getItem' | 'setItem'>): ProfileState | null {
  try {
    const raw = rawGet(storage, PROFILE_KEY);
    if (!raw) return null;
    const state = migrateProfileState(JSON.parse(raw));
    if (state) {
      const normalized = JSON.stringify(state);
      if (normalized !== raw) rawSet(storage, PROFILE_KEY, normalized);
    }
    return state;
  } catch {
    return null;
  }
}

export function saveProfileState(storage: Pick<Storage, 'setItem'>, state: ProfileState): ProfileState {
  const next =
    migrateProfileState(state) ?? {
      version: 2 as const,
      activeId: 'robin',
      profiles: [freshProfile(DEFAULT_PROFILE_NAME, Date.now(), 'robin')],
    };
  rawSet(storage, PROFILE_KEY, JSON.stringify(next));
  return next;
}

export function activeProfile(storage: ProfileStorage): ProfileRecord {
  const state = ensureProfileState(storage);
  return state.profiles.find((profile) => profile.id === selectedProfileId(state)) ?? state.profiles[0]!;
}

export function activeProfileName(storage?: ProfileStorage): string {
  try {
    const source = storage ?? browserStorage();
    return source ? activeProfile(source).name : DEFAULT_PROFILE_NAME;
  } catch {
    return DEFAULT_PROFILE_NAME;
  }
}

export function createProfile(storage: ProfileStorage, name: string, difficultyPreset?: DifficultyPresetId): ProfileRecord | null {
  const cleanName = cleanProfileName(name);
  if (!cleanName) return null;
  const state = loadProfileState(storage);

  if (!state) {
    const now = Date.now();
    const profile = freshProfile(cleanName, now, uniqueProfileId(cleanName, []), difficultyPreset ?? readLegacyDifficulty(storage), true);
    const next: ProfileState = { version: 2, activeId: profile.id, profiles: [profile] };
    saveProfileState(storage, next);
    migrateLegacyData(storage, profile.id);
    saveProfileDatum(storage, profile.id, DIFFICULTY_PRESET_STORAGE_KEY, profile.difficultyPreset);
    return profile;
  }

  const existing = state.profiles.find((profile) => profile.name.toLowerCase() === cleanName.toLowerCase());
  if (existing) {
    state.activeId = existing.id;
    existing.updatedAt = Date.now();
    saveProfileState(storage, state);
    return existing;
  }

  const now = Date.now();
  const profile = freshProfile(cleanName, now, uniqueProfileId(cleanName, state.profiles), difficultyPreset, true);
  state.profiles.push(profile);
  state.activeId = profile.id;
  saveProfileState(storage, state);
  saveProfileDatum(storage, profile.id, DIFFICULTY_PRESET_STORAGE_KEY, profile.difficultyPreset);
  return profile;
}

export function importProfileRecord(storage: ProfileStorage, source: ProfileRecord): ProfileRecord | null {
  const cleanName = cleanProfileName(source.name);
  if (!cleanName) return null;
  const state = ensureProfileState(storage);
  const now = Date.now();
  const name = uniqueProfileName(cleanName, state.profiles);
  const profile = freshProfile(
    name,
    cleanTime(source.createdAt) || now,
    uniqueProfileId(name, state.profiles),
    normalizeDifficultyPreset(source.difficultyPreset),
    source.trailGuide === true,
  );
  profile.updatedAt = now;
  profile.hintsSeen = cleanHintsSeen(source.hintsSeen);
  state.profiles.push(profile);
  state.activeId = profile.id;
  saveProfileState(storage, state);
  saveProfileDatum(storage, profile.id, DIFFICULTY_PRESET_STORAGE_KEY, profile.difficultyPreset);
  return profile;
}

export function setActiveProfile(storage: ProfileStorage, profileId: string): boolean {
  const state = ensureProfileState(storage);
  const profile = state.profiles.find((entry) => entry.id === profileId);
  if (!profile) return false;
  profile.updatedAt = Date.now();
  state.activeId = profile.id;
  saveProfileState(storage, state);
  return true;
}

export function markHintSeen(storage: ProfileStorage, hintId: string): boolean {
  const cleanHint = hintId.trim();
  if (!cleanHint) return false;
  const state = ensureProfileState(storage);
  const profile = state.profiles.find((entry) => entry.id === selectedProfileId(state));
  if (!profile) return false;
  if (!profile.hintsSeen.includes(cleanHint)) profile.hintsSeen.push(cleanHint);
  profile.updatedAt = Date.now();
  saveProfileState(storage, state);
  return true;
}

export function profileDataKey(profileId: string, logicalKey: string): string {
  return `${PROFILE_KEY}.${profileId}.${logicalKey}`;
}

export function tileStateKey(profileId: string, contractId: string): string {
  return profileDataKey(profileId, `tilestate.${contractId}`);
}

export function profileDataKeys(
  storage: ProfileStorage,
  profileId: string,
  candidates: Iterable<string> = [],
): Set<string> {
  const keys = new Set(PROFILE_DATA_KEYS);
  for (const key of candidates) if (isTileStateDataKey(key) || isResearchStateDataKey(key)) keys.add(key);
  if (!isEnumerableStorage(storage)) return keys;

  const prefix = `${PROFILE_KEY}.${profileId}.`;
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key?.startsWith(prefix)) {
        const logicalKey = key.slice(prefix.length);
        if (isTileStateDataKey(logicalKey) || isResearchStateDataKey(logicalKey)) keys.add(logicalKey);
      }
    }
  } catch {}
  return keys;
}

export function isTileStateDataKey(key: string): boolean {
  return key.startsWith(TILE_STATE_DATA_KEY_PREFIX) && key.length > TILE_STATE_DATA_KEY_PREFIX.length;
}

function isResearchStateDataKey(key: string): boolean {
  return /^gr\.research\.epoch-[a-z0-9-]+\.v1$/.test(key);
}

export function bindProfileSession(profileId: string): void {
  sessionProfileId = profileId;
}

export function installProfileStorageScope(storage: Storage): void {
  scopedStorage = storage;
  if (storageScopeInstalled || !nativeStorage.getItem || !nativeStorage.setItem || !nativeStorage.removeItem) return;
  storageScopeInstalled = true;

  // ponytail: one-page storage shim; replace with injected storage if callers stop using localStorage directly.
  Storage.prototype.getItem = function getProfileScopedItem(key: string): string | null {
    if (this !== scopedStorage) return nativeStorage.getItem!.call(this, key);
    if (key === PERFORMANCE_TIER_STORAGE_KEY) return readDeviceLocalDatum(this, key);
    const scoped = scopedDataKey(this, key);
    const value = nativeStorage.getItem!.call(this, scoped);
    if (value === null && key === DIFFICULTY_PRESET_STORAGE_KEY) return activeProfile(this).difficultyPreset;
    return value;
  };

  Storage.prototype.setItem = function setProfileScopedItem(key: string, value: string): void {
    if (this !== scopedStorage) {
      nativeStorage.setItem!.call(this, key, value);
      return;
    }
    const profileDatum = isProfileDataStorageKey(key);
    nativeStorage.setItem!.call(this, scopedDataKey(this, key), value);
    if (key === DIFFICULTY_PRESET_STORAGE_KEY) setActiveProfileDifficulty(this, value);
    if (profileDatum) notifyProfileDataChanged(key);
  };

  Storage.prototype.removeItem = function removeProfileScopedItem(key: string): void {
    nativeStorage.removeItem!.call(this, this === scopedStorage ? scopedDataKey(this, key) : key);
    if (this === scopedStorage && isProfileDataStorageKey(key)) notifyProfileDataChanged(key);
  };
}

function scopedDataKey(storage: Storage, key: string): string {
  if (!PROFILE_DATA_KEYS.has(key) && !DEVICE_PROFILE_DATA_KEYS.has(key)) return key;
  const state = loadProfileState(storage);
  if (!state) return key;
  return profileDataKey(selectedProfileId(state), key);
}

function isProfileDataStorageKey(key: string): boolean {
  if (PROFILE_DATA_KEYS.has(key)) return true;
  if (!key.startsWith(`${PROFILE_KEY}.`)) return false;
  const remainder = key.slice(PROFILE_KEY.length + 1);
  const firstDot = remainder.indexOf('.');
  return firstDot > 0 && PROFILE_DATA_KEYS.has(remainder.slice(firstDot + 1));
}

function migrateLegacyData(storage: ProfileStorage, profileId: string): void {
  migrateProfileDataKeys(storage, [profileId], PROFILE_DATA_KEYS);
}

function migrateProfileDataKeys(storage: ProfileStorage, profileIds: readonly string[], keys: Iterable<string>): void {
  for (const key of keys) {
    const legacy = rawGet(storage, key);
    if (legacy === null) continue;
    for (const profileId of profileIds) {
      if (rawGet(storage, profileDataKey(profileId, key)) === null) saveProfileDatum(storage, profileId, key, legacy);
    }
  }
}

function migrateDeviceLocalDataKeys(storage: ProfileStorage, state: ProfileState, keys: Iterable<string>): void {
  for (const key of keys) {
    if (rawGet(storage, key) !== null) continue;
    const legacy = rawGet(storage, profileDataKey(selectedProfileId(state), key));
    if (legacy !== null) rawSet(storage, key, legacy);
  }
}

function readDeviceLocalDatum(storage: Storage, key: string): string | null {
  const value = nativeStorage.getItem!.call(storage, key);
  if (value !== null) return value;
  const state = loadProfileState(storage);
  if (!state) return null;
  const legacy = nativeStorage.getItem!.call(storage, profileDataKey(selectedProfileId(state), key));
  if (legacy === null) return null;
  nativeStorage.setItem!.call(storage, key, legacy);
  return legacy;
}

function saveProfileDatum(storage: Pick<Storage, 'setItem'>, profileId: string, key: string, value: string): void {
  rawSet(storage, profileDataKey(profileId, key), value);
}

function setActiveProfileDifficulty(storage: ProfileStorage, value: string): void {
  const state = ensureProfileState(storage);
  const profile = state.profiles.find((entry) => entry.id === selectedProfileId(state));
  if (!profile) return;
  profile.difficultyPreset = normalizeDifficultyPreset(value);
  profile.updatedAt = Date.now();
  saveProfileState(storage, state);
}

function selectedProfileId(state: ProfileState): string {
  return sessionProfileId && state.profiles.some((profile) => profile.id === sessionProfileId)
    ? sessionProfileId
    : state.activeId;
}

function readLegacyDifficulty(storage: ProfileStorage): DifficultyPresetId {
  return normalizeDifficultyPreset(rawGet(storage, DIFFICULTY_PRESET_STORAGE_KEY) ?? DEFAULT_DIFFICULTY_PRESET);
}

function migrateProfileState(raw: unknown): ProfileState | null {
  if (!isRecord(raw) || raw.version !== 2 || !Array.isArray(raw.profiles)) return null;

  const seen = new Set<string>();
  const profiles: ProfileRecord[] = [];
  for (const item of raw.profiles) {
    const profile = migrateProfile(item, seen);
    if (profile) profiles.push(profile);
  }
  if (profiles.length === 0) return null;

  const activeId = typeof raw.activeId === 'string' && seen.has(raw.activeId) ? raw.activeId : profiles[0]!.id;
  return { version: 2, activeId, profiles };
}

function migrateProfile(raw: unknown, seen: Set<string>): ProfileRecord | null {
  if (!isRecord(raw)) return null;
  const name = cleanProfileName(typeof raw.name === 'string' ? raw.name : '');
  if (!name) return null;
  const id = uniqueProfileId(typeof raw.id === 'string' ? raw.id : slugProfileName(name), [...seen].map((entry) => ({ id: entry })));
  seen.add(id);
  const createdAt = cleanTime(raw.createdAt);
  const updatedAt = cleanTime(raw.updatedAt) || createdAt;
  return {
    id,
    name,
    createdAt,
    updatedAt,
    difficultyPreset: normalizeDifficultyPreset(
        typeof raw.difficultyPreset === 'string' ? raw.difficultyPreset : DEFAULT_DIFFICULTY_PRESET,
    ),
    hintsSeen: cleanHintsSeen(raw.hintsSeen),
    ...(raw.trailGuide === true ? { trailGuide: true as const } : {}),
  };
}

function freshProfile(
  name: string,
  now: number,
  id: string,
  difficultyPreset: DifficultyPresetId = DEFAULT_DIFFICULTY_PRESET,
  trailGuide = false,
): ProfileRecord {
  return { id, name, createdAt: now, updatedAt: now, difficultyPreset, hintsSeen: [], ...(trailGuide ? { trailGuide: true } : {}) };
}

function uniqueProfileId(name: string, existing: readonly { id: string }[]): string {
  const taken = new Set(existing.map((profile) => profile.id));
  const base = slugProfileName(name);
  let id = base;
  let suffix = 2;
  while (taken.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }
  return id;
}

function uniqueProfileName(name: string, existing: readonly { name: string }[]): string {
  const taken = new Set(existing.map((profile) => profile.name.toLowerCase()));
  if (!taken.has(name.toLowerCase())) return name;
  let suffix = 2;
  while (taken.has(`${name} (${suffix})`.toLowerCase())) suffix += 1;
  return `${name} (${suffix})`;
}

function slugProfileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'profile';
}

function cleanProfileName(name: string): string {
  return name.replace(/\s+/g, ' ').trim().slice(0, 24);
}

function cleanHintsSeen(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value
            .filter((hint): hint is string => typeof hint === 'string' && hint.trim().length > 0)
            .map((hint) => hint.trim()),
        ),
      ]
    : [];
}

function cleanTime(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : Date.now();
}

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}

export function safeLocalStorage(): Storage {
  return browserStorage() ?? inertStorage;
}

export function rawGet(storage: Pick<Storage, 'getItem'>, key: string): string | null {
  try {
    return nativeStorage.getItem && isNativeStorage(storage) ? nativeStorage.getItem.call(storage, key) : storage.getItem(key);
  } catch {
    return null;
  }
}

export function rawSet(storage: Pick<Storage, 'setItem'>, key: string, value: string): void {
  try {
    if (nativeStorage.setItem && isNativeStorage(storage)) nativeStorage.setItem.call(storage, key, value);
    else storage.setItem(key, value);
  } catch {
    // Persistence is best-effort when storage is unavailable.
  }
}

function isNativeStorage(storage: unknown): storage is Storage {
  return typeof Storage !== 'undefined' && storage instanceof Storage;
}

export function notifyProfileDataChanged(key: string): void {
  try {
    globalThis.window?.dispatchEvent(new CustomEvent('gr:profile-data-changed', { detail: { key } }));
  } catch {
    // Storage still wrote; sync is best-effort.
  }
}

function isEnumerableStorage(storage: ProfileStorage): storage is ProfileStorage & Pick<Storage, 'key' | 'length'> {
  const candidate = storage as Partial<Pick<Storage, 'key' | 'length'>>;
  return typeof candidate.key === 'function' && typeof candidate.length === 'number';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
