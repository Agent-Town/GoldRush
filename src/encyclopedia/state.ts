import { emitStorySignal } from '../story/signals';
import { LEDGER_DISCOVERED_STORAGE_KEY } from './storage';
import { installLedgerBeatClick } from './events';
import {
  alwaysDiscoveredEntryIds,
  buildableLedgerEntryById,
  ledgerEntryById,
  ledgerEntries,
  type LedgerEntryId,
} from './registry';
import type { BuildableId } from '../game/buildables';

const validEntryIds = new Set<LedgerEntryId>(ledgerEntries.map((entry) => entry.id));
const alwaysDiscovered = new Set<LedgerEntryId>(alwaysDiscoveredEntryIds);

export function readLedgerDiscovered(storage = browserStorage()): Set<LedgerEntryId> {
  return new Set([...alwaysDiscoveredEntryIds, ...readStoredDiscovered(storage)]);
}

export function discoverLedgerEntry(id: LedgerEntryId, storage = browserStorage()): boolean {
  if (!storage || !validEntryIds.has(id)) return false;
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
  emitStorySignal({ type: 'ledger-page', entryId: id, entryName: ledgerEntryById[id].name });
  return true;
}

export function discoverLedgerBuildable(id: BuildableId): boolean {
  const entryId = buildableLedgerEntryById[id];
  return entryId ? discoverLedgerEntry(entryId) : false;
}

function readStoredDiscovered(storage = browserStorage()): LedgerEntryId[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(LEDGER_DISCOVERED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is LedgerEntryId => validEntryIds.has(id) && !alwaysDiscovered.has(id));
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
