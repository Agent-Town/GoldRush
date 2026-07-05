export type DebugParams = {
  readonly debug: boolean;
  readonly seed: string | null;
  readonly timescale: number;
  readonly nospawn: boolean;
  readonly nowaves: boolean;
  readonly nokill: boolean;
  readonly nopause: boolean;
  readonly nosteal: boolean;
  readonly nowreck: boolean;
  readonly noping: boolean;
  readonly stress: number;
  readonly profile: boolean;
};

const DEFAULT_PARAMS: DebugParams = {
  debug: false,
  seed: null,
  timescale: 1,
  nospawn: false,
  nowaves: false,
  nokill: false,
  nopause: false,
  nosteal: false,
  nowreck: false,
  noping: false,
  stress: 0,
  profile: false,
};

export function readDebugParams(search = getSearch()): DebugParams {
  const params = new URLSearchParams(search);

  return {
    debug: readFlag(params, 'debug'),
    seed: params.get('seed'),
    timescale: readPositiveNumber(params, 'timescale', DEFAULT_PARAMS.timescale),
    nospawn: readFlag(params, 'nospawn'),
    nowaves: readFlag(params, 'nowaves'),
    nokill: readFlag(params, 'nokill'),
    nopause: readFlag(params, 'nopause'),
    nosteal: readFlag(params, 'nosteal'),
    nowreck: readFlag(params, 'nowreck'),
    noping: readFlag(params, 'noping'),
    stress: readNonNegativeInt(params, 'stress', DEFAULT_PARAMS.stress),
    profile: readFlag(params, 'profile'),
  };
}

export const DEBUG_PARAMS = readDebugParams();

export function isDebugEnabled(): boolean {
  return DEBUG_PARAMS.debug;
}

export function getDebugSeed(): string | null {
  return DEBUG_PARAMS.seed;
}

export function getTimescale(): number {
  return DEBUG_PARAMS.timescale;
}

export function isSpawnDisabled(): boolean {
  return DEBUG_PARAMS.nospawn;
}

export function areWavesDisabled(): boolean {
  return DEBUG_PARAMS.nowaves;
}

/** ?nolevel — test harness: XP/level math runs, but level-ups never freeze the sim with an offer. */
export function isLevelUpDisabled(): boolean {
  return new URLSearchParams(window.location.search).has('nolevel');
}

export function isCombatDamageDisabled(): boolean {
  return DEBUG_PARAMS.nokill;
}

export function isCharmPauseDisabled(): boolean {
  return DEBUG_PARAMS.nopause;
}

export function isStealDisabled(): boolean {
  return DEBUG_PARAMS.nosteal;
}

export function isWreckDisabled(): boolean {
  return DEBUG_PARAMS.nowreck;
}

export function isPingDisabled(): boolean {
  return DEBUG_PARAMS.noping;
}

export function getStressCount(): number {
  return DEBUG_PARAMS.stress;
}

export function isProfileEnabled(): boolean {
  return DEBUG_PARAMS.profile;
}

function getSearch(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.location.search;
}

function readFlag(params: URLSearchParams, key: string): boolean {
  return params.has(key);
}

function readPositiveNumber(params: URLSearchParams, key: string, fallback: number): number {
  const rawValue = params.get(key);
  if (rawValue === null) {
    return fallback;
  }

  const value = Number(rawValue);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function readNonNegativeInt(params: URLSearchParams, key: string, fallback: number): number {
  const rawValue = params.get(key);
  if (rawValue === null) {
    return fallback;
  }

  const value = Number(rawValue);
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
}
