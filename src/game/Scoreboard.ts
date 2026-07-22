import { LEGACY_SCOREBOARD_KEY, SCOREBOARD_KEY, activeProfileName } from './ProfileStorage';

export type WeaponSplit = {
  spark: number;
  blast: number;
};

export type ScoreRecord = {
  waves: number;
  kills: number;
  gold: number;
  timeAlive: number;
  at: number;
  baseValue?: number;
  weaponSplit?: WeaponSplit;
  secured?: boolean;
  secureWave?: number;
  deepestWave?: number;
  profileName?: string;
  contractId?: string;
  legacy?: boolean;
};

const STORAGE_KEY = SCOREBOARD_KEY;
const MAX_SCORES = 5;
const FALLBACK_CONTRACT_ID = 'the-claim';

// Global top-5 PLUS each contract's own best: a strong Claim ledger must never
// erase another map's only record (the board reads per-contract bests).
function trimScores(scores: ScoreRecord[]): ScoreRecord[] {
  const sorted = [...scores].sort(compareScores);
  const kept = new Set<ScoreRecord>(sorted.slice(0, MAX_SCORES));
  const seenContracts = new Set<string>();
  for (const score of sorted) {
    const id = score.contractId?.trim() || FALLBACK_CONTRACT_ID;
    if (seenContracts.has(id)) continue;
    seenContracts.add(id);
    kept.add(score);
  }
  return sorted.filter((score) => kept.has(score));
}

export function loadScores(): ScoreRecord[] {
  try {
    return trimScores(migrateLegacyScores().filter(isScoreRecord).map(withProfileName));
  } catch {
    return [];
  }
}

export function recordScore(record: ScoreRecord): ScoreRecord[] {
  try {
    const scores = trimScores([...loadScores().filter((score) => score.at !== record.at), withRunStats(record)]);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
    return scores;
  } catch {
    return [];
  }
}

export function clearScores(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_SCOREBOARD_KEY);
  } catch {
    // Storage can be unavailable in private/headless contexts; scoreboard is optional.
  }
}

function migrateLegacyScores(): ScoreRecord[] {
  const current = readScores(STORAGE_KEY, false);
  const legacy = readScores(LEGACY_SCOREBOARD_KEY, true);
  if (legacy.length === 0) return current;

  const merged = uniqueScores([...current, ...legacy]).sort(compareScores).slice(0, MAX_SCORES);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  window.localStorage.removeItem(LEGACY_SCOREBOARD_KEY);
  return merged;
}

function readScores(key: string, legacy: boolean): ScoreRecord[] {
  const raw = window.localStorage.getItem(key);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isScoreRecord).map((record) => normalizeScore(record, legacy));
}

function uniqueScores(scores: ScoreRecord[]): ScoreRecord[] {
  const seen = new Set<string>();
  const result: ScoreRecord[] = [];
  for (const score of scores) {
    const key = `${score.at}:${score.waves}:${score.kills}:${score.gold}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(score);
  }
  return result;
}

function withProfileName(record: ScoreRecord): ScoreRecord {
  const profileName = typeof record.profileName === 'string' && record.profileName.trim() ? record.profileName.trim() : activeProfileName();
  return { ...record, profileName };
}

function withRunStats(record: ScoreRecord): ScoreRecord {
  const diagnostics = window.__THREE_GAME_DIAGNOSTICS__;
  const damage = diagnostics?.build.damageByOwner ?? {};
  return withProfileName({
    ...record,
    baseValue: cleanNumber(record.baseValue) ?? Math.round(diagnostics?.economy.summary.baseValue ?? 0),
    weaponSplit: record.weaponSplit ?? {
      spark: Math.round(damage.hero ?? 0),
      blast: Math.round(damage.hero_blast ?? 0),
    },
  });
}

function normalizeScore(record: ScoreRecord, legacy: boolean): ScoreRecord {
  return withProfileName({
    ...record,
    baseValue: cleanNumber(record.baseValue) ?? 0,
    weaponSplit: normalizeWeaponSplit(record.weaponSplit),
    legacy: record.legacy === true || legacy || undefined,
  });
}

function compareScores(a: ScoreRecord, b: ScoreRecord): number {
  if (b.waves !== a.waves) return b.waves - a.waves;
  if ((b.baseValue ?? 0) !== (a.baseValue ?? 0)) return (b.baseValue ?? 0) - (a.baseValue ?? 0);
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
    (candidate.baseValue === undefined || isFiniteNumber(candidate.baseValue)) &&
    (candidate.weaponSplit === undefined || isWeaponSplit(candidate.weaponSplit)) &&
    (candidate.secured === undefined || typeof candidate.secured === 'boolean') &&
    (candidate.secureWave === undefined || isFiniteNumber(candidate.secureWave)) &&
    (candidate.deepestWave === undefined || isFiniteNumber(candidate.deepestWave)) &&
    (candidate.profileName === undefined || typeof candidate.profileName === 'string') &&
    (candidate.contractId === undefined || typeof candidate.contractId === 'string') &&
    (candidate.legacy === undefined || typeof candidate.legacy === 'boolean')
  );
}

function normalizeWeaponSplit(value: unknown): WeaponSplit {
  if (!isWeaponSplit(value)) return { spark: 0, blast: 0 };
  return { spark: Math.round(value.spark), blast: Math.round(value.blast) };
}

function isWeaponSplit(value: unknown): value is WeaponSplit {
  if (!value || typeof value !== 'object') return false;
  const split = value as Record<keyof WeaponSplit, unknown>;
  return isFiniteNumber(split.spark) && isFiniteNumber(split.blast);
}

function cleanNumber(value: unknown): number | null {
  return isFiniteNumber(value) ? value : null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
