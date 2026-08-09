import feed from '../../news/herald.json' with { type: 'json' };

export type HeraldClass = 'board' | 'trail' | 'river' | 'schoolhouse' | 'ledger' | 'boss' | 'town-growth' | 'ceremony';

export type HeraldItem = {
  headline: string;
  lines: string[];
  date: string;
  hash: string;
  class?: HeraldClass;
};

const INTERNAL_HERALD_PATTERNS = [/\b\d{3}\b/, /\b[A-Z]{2,}-\d+\b/, /\bshipped\b/i, /\brepo\b/i, /\btoken\b/i, /\bbackend\b/i] as const;
/** Owner ruling 2026-08-09: local news older than two weeks retires from the paper. */
export const HERALD_FRESHNESS_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1_000;

/**
 * The in-world filter, exported so the living paper's own copy is held to the same bar the
 * static feed is (specs/gazette-house/living-paper.md law 5). Factory jargon never reaches print.
 */
export function isCleanHeraldLine(line: string): boolean {
  return line.trim().length > 0 && !INTERNAL_HERALD_PATTERNS.some((pattern) => pattern.test(line));
}

export function readHeraldItems(): HeraldItem[] {
  const override = typeof window === 'undefined' ? undefined : window.__GR_HERALD_FEED__;
  const source = Array.isArray(override) ? override : feed;
  const clean = source.filter(isCleanHeraldItem);
  const now = new Date();
  // Test feeds are dated snapshots; their newest item is the fixture's clock.
  const today = Array.isArray(override)
    ? Math.max(...clean.map((item) => Date.parse(`${item.date}T00:00:00Z`)))
    : Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return clean.filter((item) => {
    const age = today - Date.parse(`${item.date}T00:00:00Z`);
    return age >= 0 && age <= HERALD_FRESHNESS_DAYS * DAY_MS;
  }).slice(0, 4);
}

export function latestHeraldHeadline(): string {
  return readHeraldItems()[0]?.headline ?? 'No fresh ink today.';
}

function isCleanHeraldItem(value: unknown): value is HeraldItem {
  if (!isRecord(value) || typeof value.headline !== 'string' || typeof value.date !== 'string' || typeof value.hash !== 'string') {
    return false;
  }
  if (!Array.isArray(value.lines) || value.lines.some((line) => typeof line !== 'string')) return false;
  return [value.headline, ...value.lines].every(isCleanHeraldLine);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
