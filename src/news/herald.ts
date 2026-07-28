import feed from '../../news/herald.json' with { type: 'json' };

export type HeraldClass = 'board' | 'trail' | 'river' | 'schoolhouse' | 'ledger' | 'boss' | 'town-growth';

export type HeraldItem = {
  headline: string;
  lines: string[];
  date: string;
  hash: string;
  class?: HeraldClass;
};

const INTERNAL_HERALD_PATTERNS = [/\b\d{3}\b/, /\b[A-Z]{2,}-\d+\b/, /\bshipped\b/i, /\brepo\b/i, /\btoken\b/i, /\bbackend\b/i] as const;

export function readHeraldItems(): HeraldItem[] {
  const override = typeof window === 'undefined' ? undefined : window.__GR_HERALD_FEED__;
  const source = Array.isArray(override) ? override : feed;
  return source.filter(isCleanHeraldItem).slice(0, 4);
}

export function latestHeraldHeadline(): string {
  return readHeraldItems()[0]?.headline ?? 'No fresh ink today.';
}

function isCleanHeraldItem(value: unknown): value is HeraldItem {
  if (!isRecord(value) || typeof value.headline !== 'string' || typeof value.date !== 'string' || typeof value.hash !== 'string') {
    return false;
  }
  if (!Array.isArray(value.lines) || value.lines.some((line) => typeof line !== 'string')) return false;
  return [value.headline, ...value.lines].every((line) => line.trim().length > 0 && !INTERNAL_HERALD_PATTERNS.some((pattern) => pattern.test(line)));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
