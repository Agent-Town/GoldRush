import {
  makePendingQueueRequest,
  normalizeQueueProfile,
  parseApprovedQueueEntry,
  parseRejectedQueueEntry,
  pendingQueuePath,
  sanitizePendingQueueRequest,
  type CraftedItemDef,
  type CraftingQueueApproved,
  type CraftingQueueReason,
  type CraftingQueueRejected,
  type CraftingQueueRequest,
} from './CraftingQueueContract';

export type CraftingPendingNotice = {
  id: string;
  text: string;
  timestamp: string;
};

export type CraftingRejectedNotice = {
  id: string;
  text: string;
  reasons: CraftingQueueReason[];
};

export type CraftingQueueSnapshot = {
  pending: CraftingPendingNotice[];
  approved: CraftedItemDef[];
  rejected: CraftingRejectedNotice[];
};

export type PendingPostResult = {
  request: CraftingQueueRequest;
  path: string;
  saved: boolean;
  error?: string;
  alreadyExists?: boolean;
};

export function loadCraftingQueue(profile: string): CraftingQueueSnapshot {
  return snapshotFromQueueEntries([], [], [], normalizeQueueProfile(profile));
}

export async function loadCraftingQueueState(profile: string): Promise<CraftingQueueSnapshot> {
  const normalizedProfile = normalizeQueueProfile(profile);
  try {
    const response = await fetch(`/__goldrush/crafting-queue/state?profile=${encodeURIComponent(normalizedProfile)}`);
    if (!response.ok) return loadStaticCraftingQueue(normalizedProfile);
    const body: unknown = await response.json();
    return parseQueueState(body, normalizedProfile) ?? loadStaticCraftingQueue(normalizedProfile);
  } catch {
    return loadStaticCraftingQueue(normalizedProfile);
  }
}

export async function postPendingOrder(
  text: string,
  profile: string,
  timestamp: Date | string = new Date(),
  tier = 1,
): Promise<PendingPostResult> {
  const request = makePendingQueueRequest(text, profile, timestamp, tier);
  const path = pendingQueuePath(request.id);
  try {
    const response = await fetch('/__goldrush/crafting-queue/pending', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(request),
    });
    const body = await readJson(response);
    if (response.ok && body?.ok !== false) return { request, path, saved: true };
    return {
      request,
      path: typeof body?.path === 'string' ? body.path : path,
      saved: false,
      ...(body?.reason === 'duplicate' || response.status === 409 ? { alreadyExists: true } : {}),
      error: typeof body?.message === 'string' ? body.message : `HTTP ${response.status}`,
    };
  } catch (error) {
    return { request, path, saved: false, error: error instanceof Error ? error.message : String(error) };
  }
}

async function readJson(response: Response): Promise<Record<string, unknown> | null> {
  try {
    const value: unknown = await response.json();
    return isRecord(value) ? value : null;
  } catch {
    return null;
  }
}

function parseQueueState(value: unknown, normalizedProfile: string): CraftingQueueSnapshot | null {
  if (!isRecord(value) || !Array.isArray(value.pending) || !Array.isArray(value.approved) || !Array.isArray(value.rejected)) {
    return null;
  }
  return snapshotFromQueueEntries(
    parseMany(value.pending, sanitizePendingQueueRequest),
    parseMany(value.approved, parseApprovedQueueEntry),
    parseMany(value.rejected, parseRejectedQueueEntry),
    normalizedProfile,
  );
}

export function snapshotFromQueueEntries(
  pendingEntries: CraftingQueueRequest[],
  approvedEntries: CraftingQueueApproved[],
  rejectedEntries: CraftingQueueRejected[],
  normalizedProfile: string,
): CraftingQueueSnapshot {
  const approvedForProfile = approvedEntries.filter((entry) => entry.request.profile === normalizedProfile);
  const rejectedForProfile = rejectedEntries.filter((entry) => entry.request.profile === normalizedProfile);
  const verdictIds = new Set([...approvedForProfile, ...rejectedForProfile].map((entry) => entry.request.id));
  const pending = pendingEntries
    .filter((entry) => entry.profile === normalizedProfile && !verdictIds.has(entry.id))
    .map((entry) => ({ id: entry.id, text: entry.text, timestamp: entry.timestamp }));
  const approved = approvedForProfile.map((entry) => entry.item);
  const rejected = rejectedForProfile.map((entry) => ({
    id: entry.request.id,
    text: entry.request.text,
    reasons: entry.reasons.length ? entry.reasons : [...entry.contractVerdict.reasons, ...(entry.simVerdict?.reasons ?? [])],
  }));
  return { pending, approved, rejected };
}

function parseMany<T>(values: unknown[], parse: (value: unknown) => T | null): T[] {
  return values.map(parse).filter((entry): entry is T => Boolean(entry));
}

async function loadStaticCraftingQueue(profile: string): Promise<CraftingQueueSnapshot> {
  try {
    const staticQueue = await import('./CraftingQueueStatic');
    return staticQueue.loadStaticCraftingQueue(profile);
  } catch {
    return loadCraftingQueue(profile);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
