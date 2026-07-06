export type ScoreRecord = {
  waves: number;
  kills: number;
  gold: number;
  timeAlive: number;
  at: number;
  secured?: boolean;
};

const STORAGE_KEY = 'gr.scores.v1';
const MAX_SCORES = 5;

export function loadScores(): ScoreRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isScoreRecord).sort(compareScores).slice(0, MAX_SCORES);
  } catch {
    return [];
  }
}

export function recordScore(record: ScoreRecord): ScoreRecord[] {
  try {
    const scores = [...loadScores(), record].sort(compareScores).slice(0, MAX_SCORES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    return scores;
  } catch {
    return [];
  }
}

export function clearScores(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private/headless contexts; scoreboard is optional.
  }
}

function compareScores(a: ScoreRecord, b: ScoreRecord): number {
  if (b.waves !== a.waves) return b.waves - a.waves;
  if (b.timeAlive !== a.timeAlive) return b.timeAlive - a.timeAlive;
  return b.at - a.at;
}

function isScoreRecord(value: unknown): value is ScoreRecord {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<keyof ScoreRecord, unknown>;
  return (
    isFiniteNumber(candidate.waves) &&
    isFiniteNumber(candidate.kills) &&
    isFiniteNumber(candidate.gold) &&
    isFiniteNumber(candidate.timeAlive) &&
    isFiniteNumber(candidate.at)
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
