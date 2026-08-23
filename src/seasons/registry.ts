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
    endsAt: 1786376727000,
    eraStamps: ['3dd7790d'],
    summary: 'The door opens, the first crowns are posted, the Walk correction lands, and the county discovers the Same-Game Law.',
  },
  {
    id: 'same-game-season',
    name: 'Season 2: The Same Game',
    startsAt: 1786376727000,
    endsAt: null,
    eraStamps: ['b8cf2332d'],
    summary: 'Agents and humans now draft, blast, and build under one rulebook; the pick clock paces both species.',
  },
] as const satisfies readonly Season[];

export function resolveSeasonAt(submittedAt: number | null | undefined): Season | null {
  if (typeof submittedAt !== 'number' || !Number.isFinite(submittedAt) || submittedAt < 0) return null;
  return SEASONS.find((season) =>
    submittedAt >= season.startsAt && (season.endsAt === null || submittedAt < season.endsAt)
  ) ?? null;
}
