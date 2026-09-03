export type SelfDeclaredStack = {
  model?: string;
  harness?: string;
  harnessVersion?: string;
  harnessDigest?: string;
  harnessRef?: string;
  config?: string;
  source?: string;
  tokensIn?: number;
  tokensOut?: number;
  calls?: number;
};

const TEXT_FIELDS = ['model', 'harness', 'harnessVersion', 'config'] as const;
const COST_FIELDS = ['tokensIn', 'tokensOut', 'calls'] as const;
const STACK_KEYS = new Set<string>([...TEXT_FIELDS, ...COST_FIELDS, 'source', 'harnessDigest', 'harnessRef']);
const MAX_TEXT = 256;
const MAX_COST = 1_000_000_000_000;
const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{7,40}$/;

export async function computeHarnessDigest(
  charterText: string,
  notebookGenerationHeader: string,
  controllerVersion: string,
): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify([charterText, notebookGenerationHeader, controllerVersion]));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function assembleSelfDeclaredStack(input: Omit<SelfDeclaredStack, 'harnessDigest'> & {
  charterText?: string;
  notebookGenerationHeader?: string;
}): Promise<SelfDeclaredStack | undefined> {
  const { charterText, notebookGenerationHeader, ...stack } = input;
  const harnessDigest = charterText !== undefined && notebookGenerationHeader !== undefined && stack.harnessVersion
    ? await computeHarnessDigest(charterText, notebookGenerationHeader, stack.harnessVersion)
    : undefined;
  const declared = { ...stack, ...(harnessDigest ? { harnessDigest } : {}) };
  return Object.values(declared).some((value) => value !== undefined) ? declared : undefined;
}

export function normalizeSelfDeclaredStack(value: unknown): SelfDeclaredStack | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).some((key) => !STACK_KEYS.has(key))) return null;
  const stack: SelfDeclaredStack = {};
  for (const field of TEXT_FIELDS) {
    const entry = record[field];
    if (entry === undefined) continue;
    if (typeof entry !== 'string' || entry.length > MAX_TEXT) return null;
    stack[field] = entry;
  }
  if (stack.harness !== undefined && !stack.harnessVersion?.trim()) return null;
  if (record.harnessDigest !== undefined) {
    if (typeof record.harnessDigest !== 'string' || !SHA256.test(record.harnessDigest)) return null;
    stack.harnessDigest = record.harnessDigest;
  }
  if (record.harnessRef !== undefined) {
    if (typeof record.harnessRef !== 'string' || record.harnessRef.length > MAX_TEXT) return null;
    if (!COMMIT.test(record.harnessRef)) {
      try {
        if (new URL(record.harnessRef).protocol !== 'https:') return null;
      } catch {
        return null;
      }
    }
    stack.harnessRef = record.harnessRef;
  }
  if (record.source !== undefined) {
    if (typeof record.source !== 'string' || record.source.length > MAX_TEXT) return null;
    try {
      if (new URL(record.source).protocol !== 'https:') return null;
    } catch {
      return null;
    }
    stack.source = record.source;
  }
  for (const field of COST_FIELDS) {
    const entry = record[field];
    if (entry === undefined) continue;
    if (!Number.isSafeInteger(entry) || (entry as number) < 0 || (entry as number) > MAX_COST) return null;
    stack[field] = entry as number;
  }
  return stack;
}

type StandingRider = {
  name: string;
  client: 'browser' | 'headless';
  stack?: SelfDeclaredStack;
};

type StandingRosterRider = StandingRider & { playerId: string };

export function multiplayerStandingParty(roster: readonly StandingRider[]) {
  if (roster.length < 2 || !roster.some((rider) => rider.client === 'browser')) return undefined;
  return {
    riderCount: roster.length,
    riders: roster.map((rider) => ({
      name: rider.client === 'headless' ? rider.name.replace(/ \(scout\)$/, '') : rider.name,
      ...(rider.client === 'headless' ? { stack: rider.stack ?? {} } : {}),
    })),
  };
}

export function resetMultiplayerStandingRoster<T extends StandingRosterRider>(recorded: Map<string, T>, active: readonly T[]): void {
  recorded.clear();
  for (const rider of active) recorded.set(rider.playerId, rider);
}

export function isMultiplayerStandingSubmitter(roster: readonly StandingRosterRider[], playerId: string | null): boolean {
  return roster.find((rider) => rider.client === 'browser')?.playerId === playerId;
}
