import { Balance } from './Balance';
import { activeProfile, notifyProfileDataChanged, tileStateKey, type ProfileStorage } from './ProfileStorage';
import type { ContractManifest } from '../meta/ContractFamilies';

export const TILE_STATE_SCHEMA_VERSION = 1;

/** Render entry: the Dredge-Queen's hulk mount (W6, migrated onto the substrate at TP-01). */
export const DREDGE_QUEEN_WRECK_ENTRY_ID = 'dredge-queen-wreck';
/** Sim entry: one permanent planted-green waypoint (TP-02, the Seed Run's mechanic in miniature). */
export const GREEN_WAYPOINT_ENTRY_ID = 'green-waypoint';
/** Render entry: the Old Digger's kept-machine flag (E9 §BOSS — reprogrammed, gentle, forever). */
export const OLD_DIGGER_GENTLE_ENTRY_ID = 'old-digger-gentle';
/** Render entry: the Homemaker-9000's kept chair after the E6 ceremony. */
export const HOMEMAKER_KEPT_ENTRY_ID = 'homemaker-9000-kept';

export type DredgeQueenWreckPayload = { x: number; z: number };
export type OldDiggerGentlePayload = { x: number; z: number };
export type HomemakerKeptPayload = { x: number; z: number };
export type GreenWaypointPayload = { x: number; z: number; r: number };

export type TileStateEntry = {
  kind: 'sim' | 'render';
  id: string;
  payload: unknown;
  schemaVersion: number;
  [key: string]: unknown;
};

export type TileStateSnapshot = {
  schemaVersion: number;
  entries: TileStateEntry[];
  [key: string]: unknown;
};

export class TileStateStore {
  private readonly profileId: string;
  private readonly snapshots = new Map<string, TileStateSnapshot>();
  private readonly staged = new Map<string, TileStateEntry[]>();

  constructor(private readonly storage: ProfileStorage) {
    this.profileId = activeProfile(storage).id;
  }

  readSnapshot(contractId: string): TileStateSnapshot {
    const cached = this.snapshots.get(contractId);
    if (cached) return cached;

    const raw = this.storage.getItem(tileStateKey(this.profileId, contractId));
    const snapshot = parseSnapshot(raw);
    this.snapshots.set(contractId, snapshot);
    return snapshot;
  }

  stageWrite(contractId: string, entry: TileStateEntry): void {
    if (!isTileStateEntry(entry)) throw new TypeError('Invalid tile-state entry');
    const entries = this.staged.get(contractId) ?? [];
    const index = entries.findIndex((candidate) => sameEntry(candidate, entry));
    const staged = cloneJsonEntry(entry);
    if (index < 0) entries.push(staged);
    else entries[index] = staged;
    this.staged.set(contractId, entries);
  }

  commitAtRunEnd(): boolean {
    let committedAll = true;
    let wrote = false;
    for (const [contractId, stagedEntries] of this.staged) {
      const current = this.readSnapshot(contractId);
      const entries = [...current.entries];
      for (const staged of stagedEntries) {
        const index = entries.findIndex((candidate) => sameEntry(candidate, staged));
        if (index < 0) entries.push(staged);
        else entries[index] = { ...entries[index], ...staged };
      }
      const snapshot: TileStateSnapshot = { ...current, entries };

      let serialized: string;
      try {
        serialized = JSON.stringify(snapshot);
      } catch {
        console.warn(`Tile state write refused for ${contractId}: snapshot is not serializable.`);
        committedAll = false;
        continue;
      }

      const bytes = new TextEncoder().encode(serialized).byteLength;
      if (bytes > Balance.persistence.tileStateMaxBytes) {
        console.warn(
          `Tile state write refused for ${contractId}: ${bytes} bytes exceeds the ${Balance.persistence.tileStateMaxBytes}-byte budget.`,
        );
        committedAll = false;
        continue;
      }

      try {
        this.storage.setItem(tileStateKey(this.profileId, contractId), serialized);
      } catch {
        console.warn(`Tile state write refused for ${contractId}: storage rejected the whole snapshot.`);
        committedAll = false;
        continue;
      }
      this.snapshots.set(contractId, snapshot);
      this.staged.delete(contractId);
      wrote = true;
    }
    if (wrote) notifyProfileDataChanged('tilestate');
    return committedAll;
  }
}

/**
 * Loader contract: call once during tile construction, before tick 0. Sim entries
 * may only transform tile parameters here; render entries may only describe mounts.
 * Unknown kinds and ids pass through untouched (forward compat); the input object
 * is never mutated — a changed birth returns a fresh tileParams.
 *
 * TP-02 implements exactly one sim kind: the green waypoint adds a no-spawn zone
 * at its disc. Everything else still passes through unchanged.
 */
export function applyAtBirth(
  entries: readonly TileStateEntry[],
  tileParams: ContractManifest['tileParams'],
): ContractManifest['tileParams'] {
  const zones = entries
    .filter((entry) => entry.kind === 'sim' && entry.id === GREEN_WAYPOINT_ENTRY_ID)
    .map((entry) => parseGreenWaypointPayload(entry.payload))
    .filter((payload): payload is GreenWaypointPayload => payload !== null)
    .map((payload) => ({ x: payload.x, z: payload.z, radius: payload.r }));
  if (zones.length === 0) return tileParams;
  return { ...tileParams, noSpawnZones: [...(tileParams.noSpawnZones ?? []), ...zones] };
}

export function parseGreenWaypointPayload(payload: unknown): GreenWaypointPayload | null {
  if (!isRecord(payload)) return null;
  const { x, z, r } = payload;
  if (typeof x !== 'number' || typeof z !== 'number' || typeof r !== 'number') return null;
  if (!Number.isFinite(x) || !Number.isFinite(z) || !Number.isFinite(r) || r <= 0) return null;
  return { x, z, r };
}

export function parseDredgeQueenWreckPayload(payload: unknown): DredgeQueenWreckPayload | null {
  if (!isRecord(payload)) return null;
  const { x, z } = payload;
  if (typeof x !== 'number' || typeof z !== 'number' || !Number.isFinite(x) || !Number.isFinite(z)) return null;
  return { x, z };
}

export function parseOldDiggerGentlePayload(payload: unknown): OldDiggerGentlePayload | null {
  if (!isRecord(payload)) return null;
  const { x, z } = payload;
  if (typeof x !== 'number' || typeof z !== 'number' || !Number.isFinite(x) || !Number.isFinite(z)) return null;
  return { x, z };
}

export function parseHomemakerKeptPayload(payload: unknown): HomemakerKeptPayload | null {
  if (!isRecord(payload)) return null;
  const { x, z } = payload;
  if (typeof x !== 'number' || typeof z !== 'number' || !Number.isFinite(x) || !Number.isFinite(z)) return null;
  return { x, z };
}

function parseSnapshot(raw: string | null): TileStateSnapshot {
  if (raw === null) return emptySnapshot();
  try {
    const value: unknown = JSON.parse(raw);
    if (
      !isRecord(value) ||
      typeof value.schemaVersion !== 'number' ||
      !Number.isInteger(value.schemaVersion) ||
      !Array.isArray(value.entries)
    ) {
      return emptySnapshot();
    }
    if (!value.entries.every(isTileStateEntry)) return emptySnapshot();
    return value as TileStateSnapshot;
  } catch {
    return emptySnapshot();
  }
}

function emptySnapshot(): TileStateSnapshot {
  return { schemaVersion: TILE_STATE_SCHEMA_VERSION, entries: [] };
}

function sameEntry(left: TileStateEntry, right: TileStateEntry): boolean {
  return left.kind === right.kind && left.id === right.id;
}

function isTileStateEntry(value: unknown): value is TileStateEntry {
  return (
    isRecord(value) &&
    (value.kind === 'sim' || value.kind === 'render') &&
    typeof value.id === 'string' &&
    value.id.length > 0 &&
    typeof value.schemaVersion === 'number' &&
    Number.isInteger(value.schemaVersion) &&
    value.schemaVersion >= 1 &&
    Object.hasOwn(value, 'payload')
  );
}

function cloneJsonEntry(entry: TileStateEntry): TileStateEntry {
  if (!isJsonValue(entry, new Set())) throw new TypeError('Tile-state entries must contain JSON data only');
  return JSON.parse(JSON.stringify(entry)) as TileStateEntry;
}

function isJsonValue(value: unknown, ancestors: Set<object>): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value) && !Object.is(value, -0);
  if (typeof value !== 'object') return false;
  if (ancestors.has(value)) return false;

  const prototype = Object.getPrototypeOf(value);
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) return false;

  ancestors.add(value);
  const valid = Array.isArray(value) ? isJsonArray(value, ancestors) : isJsonObject(value, ancestors);
  ancestors.delete(value);
  return valid;
}

function isJsonArray(value: unknown[], ancestors: Set<object>): boolean {
  if (Reflect.ownKeys(value).length !== value.length + 1) return false;
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor?.enumerable || !('value' in descriptor) || !isJsonValue(descriptor.value, ancestors)) return false;
  }
  return true;
}

function isJsonObject(value: object, ancestors: Set<object>): boolean {
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== 'string') return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !('value' in descriptor) || !isJsonValue(descriptor.value, ancestors)) return false;
  }
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
