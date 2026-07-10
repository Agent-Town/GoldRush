import { RUN_SUSPEND_REJECTION_KEY, RUN_SUSPEND_REJECTION_LINE, type RunSuspendEnvelope } from './RunSuspend';
import { RUN_SUSPEND_KEY, SAVE_SLOTS_KEY } from './ProfileStorage';

export { SAVE_SLOTS_KEY };
export const AUTO_SAVE_SLOT_NAME = "The Ledger's Copy";
export const MANUAL_SAVE_SLOT_LIMIT = 12;
export const SAVE_SLOT_TRANSFER_MANUAL_LIMIT = 5;
export const SAVE_SLOTS_RECOVERY_KEY = `${SAVE_SLOTS_KEY}.recovery`;
export const SAVE_SLOT_STORAGE_BUDGET_BYTES = 5 * 1024 * 1024;
const SAVE_SLOT_WARN_RATIO = 0.8;
const SAVE_SLOT_TRANSFER_LIMIT_BYTES = 180 * 1024;
const BLOCKED_PARTS = ['fuck', 'shit', 'bitch', 'cunt', 'pussy', 'asshole', 'bastard', 'nigger', 'faggot', 'slut', 'whore'];
const NAME_RULE = /^[A-Za-z0-9 '\-—]+$/u;

type SaveSlotStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> & Partial<Pick<Storage, 'key' | 'length'>>;

export type SaveSlot = {
  id: string;
  name: string;
  wave: number;
  contractId: string;
  contractName: string;
  townName: string | null;
  timestamp: number;
  snapshotSizeBytes: number;
  snapshot: RunSuspendEnvelope;
};

export type SaveSlotsEnvelope = {
  v: 1;
  manual: SaveSlot[];
  transferNote?: string;
};

export type SaveSlotBudget = {
  usedBytes: number;
  budgetBytes: number;
  ratio: number;
  warning: boolean;
};

export type SaveSlotResult =
  | { ok: true; slot: SaveSlot; budget: SaveSlotBudget; message: string }
  | { ok: false; message: string };

export type SaveSlotMutationResult =
  | { ok: true; budget: SaveSlotBudget; message: string }
  | { ok: false; message: string };

export function readSaveSlots(storage: SaveSlotStorage | undefined = browserStorage()): SaveSlotsEnvelope {
  if (!storage) return emptyEnvelope();
  let raw: string | null = null;
  try {
    raw = storage.getItem(SAVE_SLOTS_KEY);
  } catch {
    return emptyEnvelope();
  }
  if (!raw) return emptyEnvelope();
  try {
    const parsed = JSON.parse(raw);
    const envelope = normalizeEnvelope(parsed);
    if (envelope) return envelope;
  } catch {}
  preserveCorruptSaveSlots(storage, raw);
  return emptyEnvelope();
}

export function saveManualSlot(
  input: {
    name: string;
    snapshot: RunSuspendEnvelope;
    contractName: string;
    townName: string | null;
    now?: number;
  },
  storage: SaveSlotStorage | undefined = browserStorage(),
): SaveSlotResult {
  if (!storage) return { ok: false, message: 'The browser would not store that claim.' };
  const name = validateSlotName(input.name);
  if (!name.ok) return name;
  const envelope = readSaveSlots(storage);
  if (envelope.manual.length >= MANUAL_SAVE_SLOT_LIMIT) {
    return { ok: false, message: 'Twelve claims are pinned. Delete one before saving another.' };
  }
  if (envelope.manual.some((slot) => sameName(slot.name, name.value))) {
    return { ok: false, message: 'That claim name is already pinned.' };
  }
  const snapshot = deepClone(input.snapshot);
  const slot: SaveSlot = {
    id: makeSlotId(),
    name: name.value,
    wave: snapshot.wave,
    contractId: snapshot.contractId,
    contractName: input.contractName || snapshot.contractId,
    townName: input.townName,
    timestamp: input.now ?? Date.now(),
    snapshotSizeBytes: byteSize(JSON.stringify(snapshot)),
    snapshot,
  };
  const next = sortSlots([slot, ...envelope.manual]);
  const written = writeEnvelope(storage, { v: 1, manual: next, transferNote: envelope.transferNote });
  if (!written.ok) return written;
  return {
    ok: true,
    slot,
    budget: written.budget,
    message: `Saved: ${slot.name} — as of wave ${slot.wave}'s end.`,
  };
}

export function renameSaveSlot(
  slotId: string,
  nameInput: string,
  storage: SaveSlotStorage | undefined = browserStorage(),
): SaveSlotMutationResult {
  if (!storage) return { ok: false, message: 'The browser would not store that claim.' };
  const name = validateSlotName(nameInput);
  if (!name.ok) return name;
  const envelope = readSaveSlots(storage);
  const slot = envelope.manual.find((entry) => entry.id === slotId);
  if (!slot) return { ok: false, message: 'That claim is no longer on the shelf.' };
  if (envelope.manual.some((entry) => entry.id !== slotId && sameName(entry.name, name.value))) {
    return { ok: false, message: 'That claim name is already pinned.' };
  }
  const next = envelope.manual.map((entry) => (entry.id === slotId ? { ...entry, name: name.value, timestamp: Date.now() } : entry));
  const written = writeEnvelope(storage, { v: 1, manual: sortSlots(next), transferNote: envelope.transferNote });
  if (!written.ok) return written;
  return { ok: true, budget: written.budget, message: `Renamed: ${name.value}.` };
}

export function deleteSaveSlot(
  slotId: string,
  storage: SaveSlotStorage | undefined = browserStorage(),
): SaveSlotMutationResult {
  if (!storage) return { ok: false, message: 'The browser would not store that claim.' };
  const envelope = readSaveSlots(storage);
  const slot = envelope.manual.find((entry) => entry.id === slotId);
  if (!slot) return { ok: false, message: 'That claim is already gone.' };
  const written = writeEnvelope(storage, { v: 1, manual: envelope.manual.filter((entry) => entry.id !== slotId), transferNote: envelope.transferNote });
  if (!written.ok) return written;
  return { ok: true, budget: written.budget, message: `Deleted: ${slot.name}.` };
}

export function restoreSaveSlotToAuto(
  slotId: string,
  storage: SaveSlotStorage | undefined = browserStorage(),
): { ok: true; slot: SaveSlot } | { ok: false; message: string } {
  if (!storage) return { ok: false, message: 'The browser would not load that claim.' };
  const slot = readSaveSlots(storage).manual.find((entry) => entry.id === slotId);
  if (!slot) return { ok: false, message: 'That claim is no longer on the shelf.' };
  try {
    storage.setItem(RUN_SUSPEND_KEY, JSON.stringify(slot.snapshot));
  } catch {
    return { ok: false, message: 'The browser would not load that claim.' };
  }
  return { ok: true, slot };
}

export function defaultSaveSlotName(snapshot: RunSuspendEnvelope, townName: string | null): string {
  const suffix = ` — wave ${snapshot.wave}`;
  const source = (townName ?? 'The Claim').trim() || 'The Claim';
  const maxBase = Math.max(2, 24 - suffix.length);
  const base = source.length > maxBase ? source.slice(0, maxBase).trim() : source;
  return `${base || 'Claim'}${suffix}`;
}

export function saveSlotsBudget(storage: SaveSlotStorage | undefined = browserStorage()): SaveSlotBudget {
  const usedBytes = storageUsageBytes(storage);
  const ratio = SAVE_SLOT_STORAGE_BUDGET_BYTES > 0 ? usedBytes / SAVE_SLOT_STORAGE_BUDGET_BYTES : 0;
  return {
    usedBytes,
    budgetBytes: SAVE_SLOT_STORAGE_BUDGET_BYTES,
    ratio,
    warning: ratio >= SAVE_SLOT_WARN_RATIO,
  };
}

export function formatBudgetWarning(budget: SaveSlotBudget): string | null {
  if (!budget.warning) return null;
  return `Ledger shelf is ${Math.round(budget.ratio * 100)}% full. Pack the ledger or delete old claims soon.`;
}

export function compactSaveSlotsForTransfer(value: unknown): unknown {
  const envelope = normalizeEnvelope(value);
  if (!envelope) return value;
  if (byteSize(JSON.stringify(envelope)) <= SAVE_SLOT_TRANSFER_LIMIT_BYTES || envelope.manual.length <= SAVE_SLOT_TRANSFER_MANUAL_LIMIT) {
    return envelope;
  }
  return {
    v: 1,
    manual: sortSlots(envelope.manual).slice(0, SAVE_SLOT_TRANSFER_MANUAL_LIMIT),
    transferNote: 'Packed the 5 most recent manual claims to keep the ledger bundle small; older claims stay on this device.',
  } satisfies SaveSlotsEnvelope;
}

export function mergeSaveSlotsForRestore(existingRaw: string | null, incoming: unknown): SaveSlotsEnvelope | null {
  const incomingEnvelope = normalizeEnvelope(incoming);
  if (!incomingEnvelope) return null;
  if (!existingRaw) return incomingEnvelope;
  let existingEnvelope: SaveSlotsEnvelope | null = null;
  try {
    existingEnvelope = normalizeEnvelope(JSON.parse(existingRaw));
  } catch {
    existingEnvelope = null;
  }
  if (!existingEnvelope) return incomingEnvelope;
  const byId = new Map<string, SaveSlot>();
  for (const slot of sortSlots([...incomingEnvelope.manual, ...existingEnvelope.manual])) {
    if (!byId.has(slot.id)) byId.set(slot.id, slot);
  }
  return {
    v: 1,
    manual: sortSlots([...byId.values()]).slice(0, MANUAL_SAVE_SLOT_LIMIT),
    transferNote: incomingEnvelope.transferNote ?? existingEnvelope.transferNote,
  };
}

function validateSlotName(input: string): { ok: true; value: string } | { ok: false; message: string } {
  const value = input.replace(/\s+/g, ' ').trim();
  if (sameName(value, AUTO_SAVE_SLOT_NAME)) return { ok: false, message: `${AUTO_SAVE_SLOT_NAME} is reserved for automatic saves.` };
  if (value.length < 2 || value.length > 24 || !NAME_RULE.test(value)) {
    return { ok: false, message: 'Use 2-24 letters, numbers, spaces, apostrophes, hyphens, or dashes.' };
  }
  const compact = value.toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (BLOCKED_PARTS.some((part) => compact.includes(part))) return { ok: false, message: 'The Ledger suggests a different name.' };
  return { ok: true, value };
}

function writeEnvelope(
  storage: SaveSlotStorage,
  envelope: SaveSlotsEnvelope,
): { ok: true; budget: SaveSlotBudget } | { ok: false; message: string } {
  try {
    storage.setItem(SAVE_SLOTS_KEY, JSON.stringify({ ...envelope, manual: sortSlots(envelope.manual) }));
  } catch {
    return { ok: false, message: 'The browser shelf is full. Delete a claim or pack the ledger first.' };
  }
  return { ok: true, budget: saveSlotsBudget(storage) };
}

function normalizeEnvelope(value: unknown): SaveSlotsEnvelope | null {
  if (!isRecord(value) || value.v !== 1 || !Array.isArray(value.manual)) return null;
  return {
    v: 1,
    manual: sortSlots(value.manual.filter(isSaveSlot)),
    transferNote: typeof value.transferNote === 'string' ? value.transferNote : undefined,
  };
}

function preserveCorruptSaveSlots(storage: SaveSlotStorage, raw: string): void {
  try {
    storage.setItem(SAVE_SLOTS_RECOVERY_KEY, raw);
  } catch {}
  try {
    storage.setItem(
      RUN_SUSPEND_REJECTION_KEY,
      JSON.stringify({
        message: RUN_SUSPEND_REJECTION_LINE,
        reasons: ['manual save shelf was set aside for recovery'],
        droppedEconomyEvents: 0,
        at: Date.now(),
      }),
    );
  } catch {}
}

function isSaveSlot(value: unknown): value is SaveSlot {
  if (!isRecord(value) || !isRunSuspendSnapshot(value.snapshot)) return false;
  return (
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.contractId === 'string' &&
    typeof value.contractName === 'string' &&
    cleanNumber(value.wave, -1) >= 0 &&
    cleanNumber(value.timestamp, -1) > 0 &&
    cleanNumber(value.snapshotSizeBytes, -1) >= 0 &&
    (value.townName === null || typeof value.townName === 'string')
  );
}

function isRunSuspendSnapshot(value: unknown): value is RunSuspendEnvelope {
  if (!isRecord(value)) return false;
  return (
    value.v === 1 &&
    cleanNumber(value.wave, -1) >= 0 &&
    typeof value.contractId === 'string' &&
    isRecord(value.waveSystem) &&
    isRecord(value.enemies) &&
    isRecord(value.economy) &&
    isRecord(value.hero) &&
    Array.isArray(value.buildings)
  );
}

function sortSlots(slots: SaveSlot[]): SaveSlot[] {
  return [...slots].sort((a, b) => b.timestamp - a.timestamp || b.wave - a.wave || a.name.localeCompare(b.name));
}

function sameName(left: string, right: string): boolean {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

function storageUsageBytes(storage: SaveSlotStorage | undefined): number {
  if (!storage || typeof storage.length !== 'number' || typeof storage.key !== 'function') {
    return byteSize(JSON.stringify(readSaveSlots(storage)));
  }
  let total = 0;
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (!key) continue;
    let value: string | null = null;
    try {
      value = storage.getItem(key);
    } catch {}
    total += byteSize(key) + byteSize(value ?? '');
  }
  return total;
}

function makeSlotId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `slot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyEnvelope(): SaveSlotsEnvelope {
  return { v: 1, manual: [] };
}

function cleanNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function byteSize(value: string): number {
  return new TextEncoder().encode(value).length;
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function browserStorage(): Storage | undefined {
  try {
    return globalThis.localStorage ?? undefined;
  } catch {
    return undefined;
  }
}
