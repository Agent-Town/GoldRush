// F-2285-1 — pin the magnitude domain of TileHeight's transcendental canonicalization.
//
// `roundMotion(v) = Math.round(v * 1e15) / 1e15` (src/sim/TileHeight.ts) exists to make two
// platforms whose libm `Math.cos`/`Math.sin` differ by one ULP agree on the slide candidate
// before it enters authoritative movement state. It works only while |v| stays small: once
// ulp(v) * 1e15 approaches 1, the quantum no longer straddles the difference and the platform
// delta passes straight through.
//
// F-2281-1 recorded this as a CLIFF ("absorbed below |v|~4, not above") resting on a precondition
// it inferred from a clamp: "distance is order 0.1-0.25, so the values sit two orders of magnitude
// inside the safe domain". Re-measured s2285, BOTH halves are optimistic:
//
//   * It is a GRADIENT, not a cliff. Absorption is never 100% at any magnitude -- it is ~98.5% at
//     |v|~0.06 and decays smoothly. There is no domain in which the canonicalization is total.
//   * The precondition is derived here from the constants rather than inferred from a clamp, and
//     the real bound is ~0.30, not 0.25 -- a margin of a few times, not two orders of magnitude.
//
// The finding's practical conclusion still stands (the cure holds today), but the headroom is far
// smaller than it claimed, and a single speed rebalance or timestep change can cross it. That is
// what this guard is for: it DERIVES the bound from the live constants, so such a change reds here
// instead of silently degrading determinism.
//
// Rooted in test:ledger-guards -- pure arithmetic, no sim boot, no network.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

/**
 * Extract one numeric constant, REFUSING loudly when the shape moves.
 *
 * A silent default here would be the exact false-green this guard exists to prevent: the derived
 * bound would keep reading "safe" off a constant nobody actually found. Every caller asserts the
 * extraction succeeded before any arithmetic is believed.
 */
function extract(label, source, re) {
  const m = source.match(re);
  if (!m) return { ok: false, label, value: null };
  const value = Number(m[1]);
  if (!Number.isFinite(value)) return { ok: false, label, value: null };
  return { ok: true, label, value };
}

/** Narrow to a named object literal block so `speed:` cannot match a different subject's speed. */
function block(source, key) {
  const start = source.indexOf(`\n  ${key}: {`);
  if (start < 0) return '';
  const end = source.indexOf('\n  },', start);
  return end < 0 ? '' : source.slice(start, end);
}

const balance = read('src/game/Balance.ts');
const upgrades = read('src/game/Upgrades.ts');
const loop = read('src/core/Loop.ts');
const tileHeight = read('src/sim/TileHeight.ts');

// `spring_heels` is the only move-speed upgrade; take its own entry, not the file's first numbers.
const springHeels = (() => {
  const i = upgrades.indexOf("id: 'spring_heels'");
  return i < 0 ? '' : upgrades.slice(i, i + 400);
})();

const CONSTANTS = [
  extract('Balance.hero.speed', block(balance, 'hero'), /\bspeed:\s*([0-9.]+)/),
  extract('Balance.terrainSim.downhillMax', block(balance, 'terrainSim'), /\bdownhillMax:\s*([0-9.]+)/),
  extract('spring_heels.maxStacks', springHeels, /\bmaxStacks:\s*([0-9]+)/),
  extract('spring_heels.moveSpeedMult', springHeels, /\bmoveSpeedMult:\s*([0-9.]+)/),
  extract('FIXED_SIM_STEP_SECONDS.denominator', loop, /FIXED_SIM_STEP_SECONDS\s*=\s*1\s*\/\s*([0-9]+)/),
  extract('roundMotion.quantum', tileHeight, /Math\.round\(value \* 1e([0-9]+)\)/),
];

const byLabel = Object.fromEntries(CONSTANTS.map((c) => [c.label, c.value]));

// ---------------------------------------------------------------------------------------------
// The derivation, stated once so every arm reads the same arithmetic.
//
//   Hero.ts:141  targetVelocity = moveIntent * (Balance.hero.speed * moveSpeedMult * terrainSpeedMul * slopeSpeed)
//   Hero.ts:147  nextPosition   = position + velocity * dt        (velocity lerps toward target, so |v| <= |target|)
//   TileHeight.ts:206/211      roundMotion(cos(angle) * distance * cos(turn))  =>  |v| <= distance
//
//   moveIntent is normalized to <= 1 (InputController.ts:269), terrainSpeedMul <= 1
//   (Terrain.ts DEFAULT_WATER_SPEED is 0.55..0.85, dry land 1), slopeSpeed <= downhillMax.
//   The enemy path (Enemy.ts:1314) is slower: 2.7 * 1.1 * 1.3 * 1.18 * 1.1 / 30 ~ 0.167.
// ---------------------------------------------------------------------------------------------
function derivedMaxStep() {
  const speed = byLabel['Balance.hero.speed'];
  const stacks = byLabel['spring_heels.maxStacks'];
  const perStack = byLabel['spring_heels.moveSpeedMult'];
  const downhill = byLabel['Balance.terrainSim.downhillMax'];
  const stepSeconds = 1 / byLabel['FIXED_SIM_STEP_SECONDS.denominator'];
  return speed * (1 + stacks * perStack) * downhill * stepSeconds;
}

/** Pinned at s2285 against a derived 0.2992. Raise only WITH a re-measured absorption floor. */
const MAX_STEP_BOUND = 0.30;
/** Absorption measured at the derived bound, s2285: 96.81%. Floor set just under it. */
const ABSORPTION_FLOOR_AT_BOUND = 0.96;

const roundMotion = (v) => Math.round(v * 1e15) / 1e15;

function nextUp(x) {
  const b = new ArrayBuffer(8);
  const f = new Float64Array(b);
  const u = new BigUint64Array(b);
  f[0] = x;
  u[0] += 1n;
  return f[0];
}

/**
 * Deterministic full-entropy sampler.
 *
 * NOT decimal-friendly by construction, and that is load-bearing: a sampler stepping through
 * "nice" values (0.5, 0.50002, ...) yields products v*1e15 that are ALREADY INTEGERS, so
 * Math.round is a no-op and absorption reads a flat 100% at every magnitude. The first pass at
 * this measurement did exactly that and had to be thrown away. Real inputs are
 * `Math.cos(angle) * projectedDistance` -- arbitrary mantissas.
 */
function makeRng(seed = 12345n) {
  let s = seed;
  const M = (1n << 64n) - 1n;
  return () => {
    s = (s * 6364136223846793005n + 1442695040888963407n) & M;
    return Number(s >> 11n) / Number(1n << 53n);
  };
}

/** Absorption rate at the real call-site shape: roundMotion(cos(angle) * distance). */
function absorptionAtDistance(distance, samples = 20000) {
  const rnd = makeRng();
  let absorbed = 0;
  let n = 0;
  for (let i = 0; i < samples; i++) {
    const v = Math.cos(rnd() * Math.PI * 2) * distance;
    if (Math.abs(v) < 1e-12) continue;
    n++;
    if (roundMotion(v) === roundMotion(nextUp(v))) absorbed++;
  }
  assert.ok(n > samples * 0.9, `sampler degenerate: only ${n}/${samples} usable`);
  return absorbed / n;
}

test('every constant the bound is derived from was actually found in source', () => {
  const missing = CONSTANTS.filter((c) => !c.ok).map((c) => c.label);
  assert.deepEqual(
    missing,
    [],
    `could not extract ${missing.join(', ')} -- the source shape moved. This guard REFUSES rather ` +
      `than defaulting: a silent default would let the derived bound read "safe" off a constant ` +
      `nobody found. Re-point the regex at the live declaration.`,
  );
});

test('the canonicalization quantum is still 1e15', () => {
  assert.equal(
    byLabel['roundMotion.quantum'],
    15,
    'roundMotion changed its quantum -- every absorption figure pinned here was measured at 1e15 ' +
      'and must be re-measured before this guard means anything.',
  );
});

test('max per-step hero displacement stays inside the pinned canonicalization domain', () => {
  const maxStep = derivedMaxStep();
  assert.ok(
    maxStep <= MAX_STEP_BOUND,
    `derived max per-step displacement ${maxStep.toFixed(4)} exceeds the pinned bound ` +
      `${MAX_STEP_BOUND}. Something raised hero speed, the move-speed upgrade cap, the downhill ` +
      `multiplier, or the sim timestep. That is not automatically a defect -- but the transcendental ` +
      `canonicalization in TileHeight.ts absorbs a SMALLER share of 1-ULP platform differences as ` +
      `|v| grows (it is a gradient, not a cliff: ~96.8% at 0.2992, ~91.5% at 1.0, ~82.6% at 2.0), ` +
      `so cross-platform replay determinism degrades with it. Re-measure the absorption rate and ` +
      `re-pin BOTH numbers together, or narrow the change.`,
  );
});

test('absorption at the derived bound holds its measured floor', () => {
  const rate = absorptionAtDistance(derivedMaxStep());
  assert.ok(
    rate >= ABSORPTION_FLOOR_AT_BOUND,
    `absorption at the derived max step fell to ${(rate * 100).toFixed(2)}%, below the ${(
      ABSORPTION_FLOOR_AT_BOUND * 100
    ).toFixed(0)}% floor measured at s2285.`,
  );
});

test('the domain is a GRADIENT, not a cliff — absorption is never total, at any magnitude', () => {
  // F-2281-1 framed this as a clean bound with a safe interior. It has no safe interior:
  // even two binades below the operating point, ~1.5% of 1-ULP differences survive.
  const farBelow = absorptionAtDistance(derivedMaxStep() / 4);
  assert.ok(
    farBelow < 1,
    'absorption read a flat 100% far below the operating point. That is the signature of a ' +
      'degenerate sampler (decimal-friendly values whose v*1e15 is already an integer), not of a ' +
      'safe domain. Check the sampler before believing this.',
  );
  assert.ok(farBelow > 0.9, `absorption far below the bound collapsed to ${(farBelow * 100).toFixed(2)}%`);
});

test('the bound is load-bearing — absorption degrades materially above it', () => {
  // Teeth for the bound assertion: if absorption were flat in this range, pinning maxStep would be
  // decoration. Measured s2285: ~96.8% at the bound vs ~82.6% at 2.0.
  const atBound = absorptionAtDistance(derivedMaxStep());
  const wayAbove = absorptionAtDistance(2.0);
  assert.ok(
    atBound - wayAbove > 0.05,
    `expected a material absorption gap between the operating point and 2.0 world units, got ` +
      `${(atBound * 100).toFixed(2)}% vs ${(wayAbove * 100).toFixed(2)}%. If these have converged, ` +
      `the magnitude relationship this guard pins no longer holds and the analysis needs redoing.`,
  );
});
