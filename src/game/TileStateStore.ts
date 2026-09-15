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
/** Render entry: the Salvage Claw kept so thoroughly it becomes Low Orbit's yard. */
export const SALVAGE_CLAW_CARCASS_ENTRY_ID = 'salvage-claw-carcass';
/** Render entry: the Homemaker-9000's kept chair after the E6 ceremony. */
export const HOMEMAKER_KEPT_ENTRY_ID = 'homemaker-9000-kept';
/** Sim entry: one canal segment's permanent re-dig/demolish verdict (A10, the Old Canal). */
export const CANAL_CHOICE_ENTRY_ID = 'canal-choice';

export type DredgeQueenWreckPayload = { x: number; z: number };
export type OldDiggerGentlePayload = { x: number; z: number; yaw?: number };
export type SalvageClawCarcassPayload = { x: number; z: number };
export type HomemakerKeptPayload = { x: number; z: number };
export type GreenWaypointPayload = { x: number; z: number; r: number };
/**
 * A10. The band a decided segment governs, carried WITH the verdict so a birth never has to go
 * back to the contract to find out what the choice was about — the loader contract's own rule
 * that an entry describes itself.
 */
export type CanalChoicePayload = {
  choice: 'redig' | 'demolish';
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

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

/**
 * A8 (`specs/agent-play/door-completion-sheet.md:22`, RATIFIED 2026-08-20) — ONE GROUND, ONE ID.
 *
 * NO NEW ENTRY KIND IS INTRODUCED. The Seed Run plants the SAME sim kind TP-02 rehearsed on
 * dry-gulch (a no-spawn disc), only three times on one tile — and `sameEntry()` below dedupes
 * on `kind`+`id`, so three plants sharing the bare id would silently collapse into one. The
 * ground id becomes an id SUFFIX; the shared prefix is what keeps them one kind for
 * `applyAtBirth`. TP-02's own entry keeps the bare `green-waypoint` id and is untouched by
 * this — verified by `e2e/tp02-green-waypoint.spec.ts`, which asserts that exact string.
 */
export function greenWaypointEntryId(groundId: string): string {
  return `${GREEN_WAYPOINT_ENTRY_ID}:${groundId}`;
}

/** True for TP-02's bare entry AND for any A8 per-ground plant. Kind is checked, not assumed. */
export function isGreenWaypointEntry(entry: TileStateEntry): boolean {
  return entry.kind === 'sim'
    && (entry.id === GREEN_WAYPOINT_ENTRY_ID || entry.id.startsWith(`${GREEN_WAYPOINT_ENTRY_ID}:`));
}

/**
 * A10 (`specs/agent-play/door-completion-sheet.md:26`, RATIFIED 2026-08-20) — ONE SEGMENT, ONE ID,
 * for the same reason A8 needed one ground one id: `sameEntry()` dedupes on `kind`+`id`, so three
 * verdicts sharing a bare id would silently collapse into one and the last segment decided would
 * be the only one the profile remembered. The segment id is an id SUFFIX; the shared prefix is
 * what keeps them one kind for `applyAtBirth`.
 *
 * NO NEW ENTRY KIND. A re-dug band lands on the SAME `sim` substrate TP-02 rehearsed and A8
 * planted on, and reaches the run through the same `noSpawnZones` transform below.
 */
export function canalChoiceEntryId(segmentId: string): string {
  return `${CANAL_CHOICE_ENTRY_ID}:${segmentId}`;
}

/** True for any A10 per-segment verdict. Kind is checked, not assumed. */
export function isCanalChoiceEntry(entry: TileStateEntry): boolean {
  return entry.kind === 'sim' && entry.id.startsWith(`${CANAL_CHOICE_ENTRY_ID}:`);
}

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

    let raw: string | null;
    try {
      raw = this.storage.getItem(tileStateKey(this.profileId, contractId));
    } catch {
      console.warn(`Tile state read failed for ${contractId}: storage rejected the snapshot.`);
      raw = null;
    }
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
 * at its disc. Everything else still passes through unchanged. A8 plants the same
 * kind once per ground (`greenWaypointEntryId`), so a Seed Run tile can be born
 * carrying up to three discs — still one kind, still only at birth.
 *
 * A10 rides the SAME transform and adds no mechanism: a canal segment the profile
 * re-dug is a band that carries water, and outlaws do not wade up a live canal, so
 * a re-dug band is born as a no-spawn zone. A DEMOLISHED segment adds nothing here
 * on purpose — filled-in ground is ordinary ground, and the half of that verdict
 * that bites (works may stand there) is the consumer's, not the tile's.
 */
export function applyAtBirth(
  entries: readonly TileStateEntry[],
  tileParams: ContractManifest['tileParams'],
): ContractManifest['tileParams'] {
  const zones = entries
    .filter((entry) => isGreenWaypointEntry(entry))
    .map((entry) => parseGreenWaypointPayload(entry.payload))
    .filter((payload): payload is GreenWaypointPayload => payload !== null)
    .map((payload) => ({ x: payload.x, z: payload.z, radius: payload.r }));
  const wet = entries
    .filter((entry) => isCanalChoiceEntry(entry))
    .map((entry) => parseCanalChoicePayload(entry.payload))
    .filter((payload): payload is CanalChoicePayload => payload !== null && payload.choice === 'redig')
    .map(wetBandDisc);
  const born = [...zones, ...wet];
  if (born.length === 0) return tileParams;
  return { ...tileParams, noSpawnZones: [...(tileParams.noSpawnZones ?? []), ...born] };
}

/**
 * A BAND IS A RECTANGLE AND A NO-SPAWN ZONE IS A DISC, so one of them has to give, and it is
 * deliberately the CORNERS. The INSCRIBED circle is taken (half the shorter side), which
 * under-covers a long band's ends rather than over-covering its flanks: the circumscribed circle
 * would push spawns off dry ground the contract never flooded, and a zone that denies ground the
 * player can still walk on is a lie the wave would tell every run. `WaveSystem` only nudges a
 * spawn point to the rim (`keepSpawnOutOfNoSpawnZones`), so an under-covering disc costs a little
 * denial and never costs correctness.
 */
function wetBandDisc(payload: CanalChoicePayload): { x: number; z: number; radius: number } {
  return {
    x: (payload.minX + payload.maxX) / 2,
    z: (payload.minZ + payload.maxZ) / 2,
    radius: Math.min(payload.maxX - payload.minX, payload.maxZ - payload.minZ) / 2,
  };
}

export function parseCanalChoicePayload(payload: unknown): CanalChoicePayload | null {
  if (!isRecord(payload)) return null;
  const { choice, minX, maxX, minZ, maxZ } = payload;
  if (choice !== 'redig' && choice !== 'demolish') return null;
  if (![minX, maxX, minZ, maxZ].every((value) => typeof value === 'number' && Number.isFinite(value))) return null;
  if ((maxX as number) <= (minX as number) || (maxZ as number) <= (minZ as number)) return null;
  return {
    choice,
    minX: minX as number,
    maxX: maxX as number,
    minZ: minZ as number,
    maxZ: maxZ as number,
  };
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
  const { x, z, yaw } = payload;
  if (typeof x !== 'number' || typeof z !== 'number' || !Number.isFinite(x) || !Number.isFinite(z)) return null;
  if (yaw !== undefined && (typeof yaw !== 'number' || !Number.isFinite(yaw))) return null;
  return yaw === undefined ? { x, z } : { x, z, yaw };
}

export function parseSalvageClawCarcassPayload(payload: unknown): SalvageClawCarcassPayload | null {
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
