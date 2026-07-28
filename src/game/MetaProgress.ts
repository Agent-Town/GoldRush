export const META_PROGRESS_KEY = 'gr.meta.v1';
export const META_TRACKS = ['territory', 'science', 'hero', 'agent'] as const;

export type MetaTrack = (typeof META_TRACKS)[number];
export type MetaPayout = Record<MetaTrack, number>;

export function trackLabel(track: MetaTrack): string {
  if (track === 'territory') return 'Territory';
  if (track === 'science') return 'Science';
  if (track === 'hero') return 'Hero';
  return 'Agent';
}

export type MetaProgress = {
  version: 1;
  tracks: Record<MetaTrack, number>;
};

export type MetaProgressStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function freshMetaProgress(): MetaProgress {
  return {
    version: 1,
    tracks: {
      territory: 0,
      science: 0,
      hero: 0,
      // ADR-002: M3 persists this reserved track; M4 interprets it.
      agent: 0,
    },
  };
}

export function migrateMetaProgress(raw: unknown): MetaProgress {
  if (!isRecord(raw)) return freshMetaProgress();

  const source = isRecord(raw.tracks) ? raw.tracks : raw;
  const next = freshMetaProgress();
  for (const track of META_TRACKS) next.tracks[track] = cleanTrack(source[track]);
  return next;
}

export function loadMetaProgress(storage: MetaProgressStorage): MetaProgress {
  let saved: string | null = null;
  try {
    saved = storage.getItem(META_PROGRESS_KEY);
  } catch {
    return migrateMetaProgress(null);
  }

  let raw: unknown = null;
  if (saved !== null) {
    try {
      raw = JSON.parse(saved);
    } catch {
      raw = null;
    }
  }

  const meta = migrateMetaProgress(raw);
  try {
    storage.setItem(META_PROGRESS_KEY, JSON.stringify(meta));
  } catch {}
  return meta;
}

export function saveMetaProgress(storage: MetaProgressStorage, meta: MetaProgress): MetaProgress {
  const next = migrateMetaProgress(meta);
  try {
    storage.setItem(META_PROGRESS_KEY, JSON.stringify(next));
  } catch {}
  return next;
}

export function addMetaPayout(meta: MetaProgress, payout: Partial<Record<MetaTrack, number>>): MetaProgress {
  const next = migrateMetaProgress(meta);
  for (const track of META_TRACKS) next.tracks[track] += cleanTrack(payout[track]);
  return next;
}

export function agentAutonomyLevel(meta: MetaProgress): number {
  return Math.floor(cleanTrack(meta.tracks.agent));
}

function cleanTrack(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
