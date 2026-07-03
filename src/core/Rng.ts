const DEFAULT_SEED = 0x9e3779b9;

export type Rng = {
  readonly seed: number;
  next(): number;
  range(min: number, max: number): number;
  int(minInclusive: number, maxExclusive: number): number;
  chance(probability: number): boolean;
};

export function normalizeSeed(seed: string | number | null | undefined): number {
  if (typeof seed === 'number' && Number.isFinite(seed)) {
    return seed >>> 0;
  }

  if (typeof seed !== 'string' || seed.length === 0) {
    return DEFAULT_SEED;
  }

  const numeric = Number(seed);
  if (Number.isFinite(numeric)) {
    return numeric >>> 0;
  }

  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: string | number | null | undefined = readSeedFromUrl()): Rng {
  const normalizedSeed = normalizeSeed(seed);
  const nextValue = mulberry32(normalizedSeed);

  return {
    seed: normalizedSeed,
    next: nextValue,
    range(min: number, max: number) {
      return min + (max - min) * nextValue();
    },
    int(minInclusive: number, maxExclusive: number) {
      return Math.floor(this.range(minInclusive, maxExclusive));
    },
    chance(probability: number) {
      return nextValue() < probability;
    },
  };
}

function readSeedFromUrl(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return new URLSearchParams(window.location.search).get('seed');
}
