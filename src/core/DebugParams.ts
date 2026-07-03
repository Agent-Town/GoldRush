export type DebugParams = {
  readonly debug: boolean;
  readonly seed: string | null;
  readonly timescale: number;
  readonly nospawn: boolean;
  readonly nowaves: boolean;
  readonly nokill: boolean;
  readonly stress: number;
};

const DEFAULT_PARAMS: DebugParams = {
  debug: false,
  seed: null,
  timescale: 1,
  nospawn: false,
  nowaves: false,
  nokill: false,
  stress: 0,
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
    stress: readNonNegativeInt(params, 'stress', DEFAULT_PARAMS.stress),
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

export function isCombatDamageDisabled(): boolean {
  return DEBUG_PARAMS.nokill;
}

export function getStressCount(): number {
  return DEBUG_PARAMS.stress;
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
