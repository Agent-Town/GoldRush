import { emitStorySignal, onStorySignal } from '../story/signals';
import { LEDGER_DISCOVERED_STORAGE_KEY } from './storage';
import { installLedgerBeatClick } from './events';
import {
  alwaysDiscoveredEntryIds,
  buildableLedgerEntryById,
  contractLedgerEntryById,
  enemyStatsDiscoveryByEntryId,
  enemyStatsDiscoveryIds,
  epochLedgerEntryByIdForEpoch,
  ledgerEntryNameForDiscoveryId,
  ledgerEntries,
  townActorLedgerEntryById,
  type EnemyLedgerEntryId,
  type LedgerDiscoveryId,
  type LedgerEntryId,
} from './registry';
import type { BuildableId } from '../game/buildables';
import type { TownActorId } from '../town/townsfolk';

const validEntryIds = new Set<LedgerEntryId>(ledgerEntries.map((entry) => entry.id));
const validDiscoveryIds = new Set<LedgerDiscoveryId>([...validEntryIds, ...enemyStatsDiscoveryIds]);
const alwaysDiscovered = new Set<LedgerEntryId>(alwaysDiscoveredEntryIds);
let epochDiscoveryInstalled = false;

export type LedgerEnemySource = {
  eliteKind?: string | null;
  bossGroupId?: string | null;
  isThief?: boolean;
  isWrecker?: boolean;
};

export function readLedgerDiscovered(storage = browserStorage()): Set<LedgerDiscoveryId> {
  return new Set([...alwaysDiscoveredEntryIds, ...readStoredDiscovered(storage)]);
}

export function discoverLedgerEntry(id: LedgerDiscoveryId, storage = browserStorage()): boolean {
  if (!storage || !validDiscoveryIds.has(id)) return false;
  const stored = readStoredDiscovered(storage);
  const known = new Set([...alwaysDiscoveredEntryIds, ...stored]);
  if (known.has(id)) return false;
  const next = [...stored, id];
  try {
    storage.setItem(LEDGER_DISCOVERED_STORAGE_KEY, JSON.stringify(next));
  } catch {
    return false;
  }
  installLedgerBeatClick();
  const entryName = ledgerEntryNameForDiscoveryId(id);
  if (entryName) emitStorySignal({ type: 'ledger-page', entryId: id, entryName });
  return true;
}

export function discoverLedgerBuildable(id: BuildableId): boolean {
  const entryId = buildableLedgerEntryById[id];
  return discoverLedgerEntry(entryId);
}

export function discoverLedgerContract(id: string): boolean {
  const entryId = contractLedgerEntryById[id];
  return entryId ? discoverLedgerEntry(entryId) : false;
}

export function discoverLedgerEpoch(id: string): boolean {
  const entryId = epochLedgerEntryByIdForEpoch[id];
  return entryId ? discoverLedgerEntry(entryId) : false;
}

export function installEpochLedgerDiscovery(): () => void {
  if (epochDiscoveryInstalled) return () => undefined;
  epochDiscoveryInstalled = true;
  const unsubscribe = onStorySignal((signal) => {
    if (signal.type === 'epoch-activated') discoverLedgerEpoch(signal.epochId);
  });
  return () => {
    epochDiscoveryInstalled = false;
    unsubscribe();
  };
}

export function discoverLedgerTownActor(id: TownActorId): boolean {
  const entryId = townActorLedgerEntryById[id];
  return entryId ? discoverLedgerEntry(entryId) : false;
}

export function ledgerEnemyEntryId(enemy: LedgerEnemySource): EnemyLedgerEntryId {
  if (enemy.eliteKind === 'baron' || enemy.eliteKind === 'railcar' || enemy.bossGroupId) return 'baron';
  if (enemy.isWrecker === true) return 'wrecker';
  if (enemy.isThief === true) return 'outlaw';
  return 'claim_jumper';
}

export function revealLedgerEnemyStats(id: EnemyLedgerEntryId): boolean {
  return discoverLedgerEntry(enemyStatsDiscoveryByEntryId[id]);
}

function readStoredDiscovered(storage = browserStorage()): LedgerDiscoveryId[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(LEDGER_DISCOVERED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is LedgerDiscoveryId => validDiscoveryIds.has(id) && !alwaysDiscovered.has(id as LedgerEntryId));
  } catch {
    return [];
  }
}

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
