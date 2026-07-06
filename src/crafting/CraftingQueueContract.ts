export const CRAFTING_QUEUE_VERSION = 1;
export const CRAFTING_QUEUE_PENDING_DIR = 'assets/crafting-queue/pending';

export type CraftedItemKind = 'weapon_mod' | 'tool' | 'trinket';
export type CraftedItemRarity = 'common' | 'uncommon' | 'rare';

export type CraftedStatDeltas = {
  damageMult?: number;
  fireRateMult?: number;
  rangeMult?: number;
  moveSpeedMult?: number;
  panTickMult?: number;
  maxHpBonus?: number;
};

export type CraftedItemDef = {
  id: string;
  kind: CraftedItemKind;
  rarity: CraftedItemRarity;
  name: string;
  blurb: string;
  cost: number;
  stats: CraftedStatDeltas;
};

export type CraftingQueueReason = {
  code: string;
  message: string;
  path?: string;
};

export type CraftingQueueRequest = {
  version: 1;
  id: string;
  text: string;
  profile: string;
  timestamp: string;
};

export type CraftingQueueVerdict = {
  ok: boolean;
  reasons: CraftingQueueReason[];
  summary?: string;
};

export type CraftingQueueApproved = {
  version: 1;
  id: string;
  request: CraftingQueueRequest;
  item: CraftedItemDef;
  contractVerdict: CraftingQueueVerdict;
  simVerdict: CraftingQueueVerdict;
  approvedAt: string;
};

export type CraftingQueueRejected = {
  version: 1;
  id: string;
  request: CraftingQueueRequest;
  contractVerdict: CraftingQueueVerdict;
  simVerdict?: CraftingQueueVerdict;
  reasons: CraftingQueueReason[];
  rejectedAt: string;
};

export function normalizeQueueProfile(value: string | null | undefined): string {
  return (slug(value ?? '') || 'local_prospector').slice(0, 48);
}

export function makePendingQueueRequest(
  text: string,
  profile: string,
  timestamp: Date | string = new Date(),
): CraftingQueueRequest {
  const iso = (timestamp instanceof Date ? timestamp : new Date(timestamp)).toISOString();
  const normalizedProfile = normalizeQueueProfile(profile);
  const textSlug = slug(text).slice(0, 48) || 'order';
  return {
    version: CRAFTING_QUEUE_VERSION,
    id: `order_${normalizedProfile}_${queueStamp(iso)}_${textSlug}`,
    text,
    profile: normalizedProfile,
    timestamp: iso,
  };
}

export function pendingQueuePath(id: string): string {
  return `${CRAFTING_QUEUE_PENDING_DIR}/${id}.json`;
}

export function sanitizePendingQueueRequest(value: unknown): CraftingQueueRequest | null {
  if (!isRecord(value)) return null;
  if (value.version !== CRAFTING_QUEUE_VERSION) return null;
  if (typeof value.id !== 'string' || typeof value.text !== 'string') return null;
  if (typeof value.profile !== 'string' || typeof value.timestamp !== 'string') return null;
  if (value.text.length < 1 || value.text.length > 1200) return null;

  let canonical: CraftingQueueRequest;
  try {
    canonical = makePendingQueueRequest(value.text, value.profile, value.timestamp);
  } catch {
    return null;
  }

  return value.id === canonical.id ? canonical : null;
}

export function parseApprovedQueueEntry(value: unknown): CraftingQueueApproved | null {
  if (!isRecord(value)) return null;
  if (value.version !== CRAFTING_QUEUE_VERSION || typeof value.id !== 'string' || typeof value.approvedAt !== 'string') {
    return null;
  }
  if (!isRequest(value.request) || !isItem(value.item)) return null;
  if (!isVerdict(value.contractVerdict) || !isVerdict(value.simVerdict)) return null;
  return value.contractVerdict.ok && value.simVerdict.ok ? (value as CraftingQueueApproved) : null;
}

export function parseRejectedQueueEntry(value: unknown): CraftingQueueRejected | null {
  if (!isRecord(value)) return null;
  if (value.version !== CRAFTING_QUEUE_VERSION || typeof value.id !== 'string' || typeof value.rejectedAt !== 'string') {
    return null;
  }
  if (!isRequest(value.request) || !isVerdict(value.contractVerdict)) return null;
  if (value.simVerdict !== undefined && !isVerdict(value.simVerdict)) return null;
  if (!Array.isArray(value.reasons) || !value.reasons.every(isReason)) return null;
  return value as CraftingQueueRejected;
}

function isRequest(value: unknown): value is CraftingQueueRequest {
  return (
    isRecord(value) &&
    value.version === CRAFTING_QUEUE_VERSION &&
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

function queueStamp(iso: string): string {
  return iso.replace(/[-:.]/g, '').replace('T', 't').replace('Z', 'z');
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
