// F-2286-1 — pin the TWO things that actually make TileHeight's canonicalization safe.
//
// BACKGROUND. `roundMotion(v) = Math.round(v * 1e15) / 1e15` (src/sim/TileHeight.ts) exists so
// two platforms whose libm `Math.cos`/`Math.sin` differ by one ULP agree on the slide candidate
// before it enters authoritative movement state.
//
//   F-2281-1 (s2281) called it a CLIFF and judged the headroom "two orders of magnitude".
//   F-2285-1 (s2285) re-measured: it is a GRADIENT, absorption is never 100%, and the real
//     magnitude headroom is ~3x, not two orders. It guarded the MAGNITUDE DOMAIN, and it closed
//     naming its own honest limit: "how often a surviving 1e-15 step actually flips a consider()
//     winner is UNMEASURED, and that is the number that says whether any of this is reachable."
//   F-2286-1 (s2286) measured that end to end against the REAL function, and found the safety
//     rests on two things NEITHER prior finding names -- which is what this guard pins.
//
// (1) THE COMPARATOR MARGIN. Every winner comparison inside `consider()` carries a `+ 0.000001`
//     epsilon. That is 1e9x LARGER than roundMotion's 1e-15 quantum, so a surviving one-ULP
//     difference is nine orders of magnitude below the threshold that could change a decision.
//     MEASURED, not asserted: perturbing the real Math.cos/Math.sin by one ULP flipped 0 of
//     12,000 resolveTerrainMove calls across BOTH live call shapes (hero: no goal; enemy: goal +
//     fallback), while ~1.3-2.3% carried a <=7.105e-15 position delta. The same harness at a
//     COARSE 1e-6 -- i.e. exactly the epsilon -- flipped 86.9%. The epsilon is the gate, and the
//     margin is why the survivors are inert. Iterating 400 walks x 900 ticks (316,478 perturbed
//     resolves) never amplified a carry: max delta over the whole run 1.42e-14.
//
//     So the protection is NOT primarily the magnitude domain. A rebalance that crosses
//     F-2285-1's ~0.30 bound raises the CARRY rate but still cannot flip a decision until the
//     surviving delta approaches 1e-6. What would be dangerous is narrowing this epsilon toward
//     the quantum, or coarsening the quantum toward the epsilon. Nothing watched that pair.
//
// (2) THE REACHABILITY GATE. resolveTerrainMove is not on the default path at all. Hero.ts
//     reaches it only `else if (hasElevationTile())`; Enemy.ts only on an elevation tile or an
//     authored non-empty water mask. Censused over all 10 epochs / 42 contracts: 5 reachable
//     (11.9%) -- the four epoch-2-steamworks contracts plus e3-canyon-works. Deleting a gate
//     would silently take this code from 11.9% of contracts to all of them, changing the blast
//     radius of the whole thread without touching TileHeight at all.
//
// This guard DERIVES both from live source rather than pinning a remembered number, and REFUSES
// loudly when a shape moves -- a silent default is the false green it exists to prevent.
//
// Rooted in test:ledger-guards -- pure source reading, no sim boot, no network, no vite.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

const tileHeight = read('src/sim/TileHeight.ts');
const hero = read('src/entities/Hero.ts');
const enemy = read('src/entities/Enemy.ts');

/**
 * Extract one numeric constant, REFUSING when the shape moves.
 *
 * Deliberately no default: a silent fallback would let the derived margin keep reading "safe"
 * off a constant nobody actually found, which is precisely the false green this guard is for.
 */
function extract(label, source, re) {
  const m = source.match(re);
  if (!m) return { ok: false, label, value: null };
  const value = Number(m[1]);
  if (!Number.isFinite(value)) return { ok: false, label, value: null };
  return { ok: true, label, value };
}

/** The `consider()` body -- narrowed so a comparison elsewhere in the file cannot be counted. */
function considerBody(source) {
  const start = source.indexOf('const consider = (moveX: number, moveZ: number) => {');
  if (start < 0) return '';
  const end = source.indexOf('\n  const considerSlide', start);
  return end < 0 ? '' : source.slice(start, end);
}

test('roundMotion quantum is extractable and is the 1e15 canonicalization grid', () => {
  const q = extract('roundMotion quantum', tileHeight, /Math\.round\(value \* 1e(\d+)\) \/ 1e\d+/);
  assert.equal(q.ok, true, 'REFUSING — roundMotion has moved; the margin cannot be derived.');
  assert.ok(q.value >= 12, `roundMotion exponent ${q.value} is coarser than 1e12 — the canonicalization grid moved`);
});

test('every winner comparison in consider() shares ONE epsilon', () => {
  const body = considerBody(tileHeight);
  assert.notEqual(body, '', 'REFUSING — consider() not found; its comparisons cannot be checked.');
  const eps = [...body.matchAll(/bestScore \+ (0\.\d+)/g)].map((m) => Number(m[1]));
  assert.ok(eps.length >= 3, `expected >=3 bestScore comparisons in consider(), found ${eps.length}`);
  assert.ok(eps.every(Number.isFinite), 'a bestScore epsilon did not parse');
  assert.equal(new Set(eps).size, 1, `consider() mixes epsilons ${[...new Set(eps)].join(', ')} — the margin is no longer one number`);
});

test('the comparator epsilon clears the canonicalization quantum by >=1e6', () => {
  const q = extract('roundMotion quantum', tileHeight, /Math\.round\(value \* 1e(\d+)\) \/ 1e\d+/);
  const body = considerBody(tileHeight);
  assert.equal(q.ok, true, 'REFUSING — roundMotion has moved.');
  assert.notEqual(body, '', 'REFUSING — consider() not found.');
  const m = body.match(/bestScore \+ (0\.\d+)/);
  assert.ok(m, 'REFUSING — no bestScore epsilon found.');

  const epsilon = Number(m[1]);
  const quantum = Math.pow(10, -q.value);
  const margin = epsilon / quantum;

  // Measured s2286: epsilon 1e-6 / quantum 1e-15 = 1e9, and 0 of 12,000 one-ULP perturbations
  // flipped a decision. At a margin of 1 (perturbing AT the epsilon) 86.9% flipped. 1e6 leaves
  // three orders of slack below today's value while still reddening on a real collapse.
  assert.ok(
    margin >= 1e6,
    `comparator margin collapsed to ${margin.toExponential(2)} (epsilon ${epsilon}, quantum ${quantum.toExponential(0)}). ` +
    'A surviving one-ULP libm difference can now reach a winner comparison. Re-measure the flip ' +
    'rate before changing either constant — see F-2286-1.',
  );
});

test('the hero reaches resolveTerrainMove ONLY behind hasElevationTile()', () => {
  const call = hero.indexOf('resolveTerrainMove(');
  assert.ok(call > 0, 'REFUSING — Hero.ts no longer calls resolveTerrainMove; this guard is stale.');
  const before = hero.slice(0, call);
  const gate = before.lastIndexOf('hasElevationTile()');
  assert.ok(gate > 0, 'Hero.ts calls resolveTerrainMove with no hasElevationTile() gate above it');
  // The gate must be the immediately-preceding branch, not some distant mention.
  assert.ok(
    call - gate < 400,
    'the nearest hasElevationTile() is far from the resolveTerrainMove call — the reachability gate may have moved',
  );
});

test('the enemy reaches it only on an elevation tile or an authored water mask', () => {
  const call = enemy.indexOf('resolveTerrainMove(');
  assert.ok(call > 0, 'REFUSING — Enemy.ts no longer calls resolveTerrainMove; this guard is stale.');
  assert.ok(
    enemy.includes('const elevation = hasElevationTile();'),
    'Enemy.move no longer branches on hasElevationTile() — the reachability gate moved',
  );
  assert.ok(
    /if \(authoredWaterMask\) this\.resolveTerrain\(/.test(enemy),
    'the enemy water-mask route into resolveTerrain moved — reachability is no longer what F-2286-1 censused',
  );
});

test('the canonicalization still covers both rotation candidates', () => {
  // If one of the pair stops being canonicalized, the absorption measurements above stop
  // describing the code, whatever the comparator margin says.
  assert.ok(
    /consider\(roundMotion\(Math\.cos\(angle\) \* projectedDistance\), roundMotion\(Math\.sin\(angle\) \* projectedDistance\)\)/.test(tileHeight),
    'the rotation candidate is no longer canonicalized on BOTH axes — re-measure F-2286-1',
  );
});
