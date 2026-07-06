import { SCOREBOARD_KEY, activeProfileName } from './ProfileStorage';

export type ScoreRecord = {
  waves: number;
  kills: number;
  gold: number;
  timeAlive: number;
  at: number;
  secured?: boolean;
  profileName?: string;
};

const STORAGE_KEY = SCOREBOARD_KEY;
const MAX_SCORES = 5;

export function loadScores(): ScoreRecord[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isScoreRecord).map(withProfileName).sort(compareScores).slice(0, MAX_SCORES);
  } catch {
    return [];
  }
}

export function recordScore(record: ScoreRecord): ScoreRecord[] {
  try {
    const scores = [...loadScores(), withProfileName(record)].sort(compareScores).slice(0, MAX_SCORES);
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

function withProfileName(record: ScoreRecord): ScoreRecord {
  const profileName = typeof record.profileName === 'string' && record.profileName.trim() ? record.profileName.trim() : activeProfileName();
  return { ...record, profileName };
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
    isFiniteNumber(candidate.at) &&
    (candidate.secured === undefined || typeof candidate.secured === 'boolean') &&
    (candidate.profileName === undefined || typeof candidate.profileName === 'string')
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
