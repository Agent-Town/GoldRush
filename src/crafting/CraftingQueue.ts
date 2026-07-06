import {
  makePendingQueueRequest,
  normalizeQueueProfile,
  pendingQueuePath,
  type CraftedItemDef,
  type CraftingQueueApproved,
  type CraftingQueueReason,
  type CraftingQueueRejected,
  type CraftingQueueRequest,
  type CraftingQueueVerdict,
} from './CraftingQueueContract';

export type CraftingRejectedNotice = {
  id: string;
  text: string;
  reasons: CraftingQueueReason[];
};

export type CraftingQueueSnapshot = {
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

const approvedFiles = import.meta.glob('../../assets/crafting-queue/approved/*.json', {
  eager: true,
  import: 'default',
});
const rejectedFiles = import.meta.glob('../../assets/crafting-queue/rejected/*.json', {
  eager: true,
  import: 'default',
});

export function loadCraftingQueue(profile: string): CraftingQueueSnapshot {
  const normalizedProfile = normalizeQueueProfile(profile);
  const approved = Object.values(approvedFiles)
    .map(parseApproved)
    .filter((entry): entry is CraftingQueueApproved => Boolean(entry))
    .filter((entry) => entry.request.profile === normalizedProfile)
    .map((entry) => entry.item);
  const rejected = Object.values(rejectedFiles)
    .map(parseRejected)
    .filter((entry): entry is CraftingQueueRejected => Boolean(entry))
    .filter((entry) => entry.request.profile === normalizedProfile)
    .map((entry) => ({
      id: entry.id,
      text: entry.request.text,
      reasons: entry.reasons.length ? entry.reasons : [...entry.contractVerdict.reasons, ...(entry.simVerdict?.reasons ?? [])],
    }));
  return { approved, rejected };
}

export async function postPendingOrder(
  text: string,
  profile: string,
  timestamp: Date | string = new Date(),
): Promise<PendingPostResult> {
  const request = makePendingQueueRequest(text, profile, timestamp);
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

function parseApproved(value: unknown): CraftingQueueApproved | null {
  if (!isRecord(value)) return null;
  if (value.version !== 1 || typeof value.id !== 'string' || typeof value.approvedAt !== 'string') return null;
  if (!isRequest(value.request) || !isItem(value.item)) return null;
  if (!isVerdict(value.contractVerdict) || !isVerdict(value.simVerdict)) return null;
  return value.contractVerdict.ok && value.simVerdict.ok ? (value as CraftingQueueApproved) : null;
}

function parseRejected(value: unknown): CraftingQueueRejected | null {
  if (!isRecord(value)) return null;
  if (value.version !== 1 || typeof value.id !== 'string' || typeof value.rejectedAt !== 'string') return null;
  if (!isRequest(value.request) || !isVerdict(value.contractVerdict)) return null;
  if (value.simVerdict !== undefined && !isVerdict(value.simVerdict)) return null;
  if (!Array.isArray(value.reasons) || !value.reasons.every(isReason)) return null;
  return value as CraftingQueueRejected;
}

function isRequest(value: unknown): value is CraftingQueueRequest {
  return (
    isRecord(value) &&
    value.version === 1 &&
    typeof value.id === 'string' &&
    typeof value.text === 'string' &&
    typeof value.profile === 'string' &&
    typeof value.timestamp === 'string'
  );
}

function isVerdict(value: unknown): value is CraftingQueueVerdict {
  return isRecord(value) && typeof value.ok === 'boolean' && Array.isArray(value.reasons) && value.reasons.every(isReason);
}

function isReason(value: unknown): value is CraftingQueueReason {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string' &&
    (value.path === undefined || typeof value.path === 'string')
  );
}

function isItem(value: unknown): value is CraftedItemDef {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    isOneOf(value.kind, ['weapon_mod', 'tool', 'trinket']) &&
    isOneOf(value.rarity, ['common', 'uncommon', 'rare']) &&
    typeof value.name === 'string' &&
    typeof value.blurb === 'string' &&
    typeof value.cost === 'number' &&
    isRecord(value.stats)
  );
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return typeof value === 'string' && allowed.includes(value as T);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
