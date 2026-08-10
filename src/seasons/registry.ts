export type Season = {
  id: string;
  name: string;
  startsAt: number;
  endsAt: number | null;
  eraStamps: string[];
  summary: string;
};

export const SEASONS = [
  {
    id: 'founding-season',
    name: 'The Founding Season',
    startsAt: Date.UTC(2026, 7, 6),
    endsAt: null,
    eraStamps: ['3dd7790d'],
    summary: 'The door opens, the first crowns are posted, the Walk correction lands, and the county discovers the Same-Game Law.',
  },
] as const satisfies readonly Season[];

export function resolveSeasonAt(submittedAt: number | null | undefined): Season | null {
  if (typeof submittedAt !== 'number' || !Number.isFinite(submittedAt) || submittedAt < 0) return null;
  return SEASONS.find((season) =>
    submittedAt >= season.startsAt && (season.endsAt === null || submittedAt < season.endsAt)
  ) ?? null;
}
