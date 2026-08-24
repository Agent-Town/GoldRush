// F-2288-1 — close the residue F-2287-1 declared, and it is a live blind spot rather than a
// theoretical one.
//
// THE RESIDUE, in s2287's own words: "No guard can cheaply assert *'no REACHING contract exceeds
// half-extent 32'* from source; arm (3) pins the DEFAULT only, and that residue is declared rather
// than papered over."
//
// WHY IT MATTERS. The largest position delta a one-ULP libm difference carries is 7.105e-15,
// which is EXACTLY ulp(32) = 32 * 2**-52. The carry IS the position ULP, so it scales with how far
// from the origin a map lets an entity stand, and every headroom figure on this thread (~1.4e3x
// cured, ~14x raw hypot) is quoted against that one number.
//
// WHY arm (3) CANNOT SEE IT. arm (3) reads `DEFAULT_CLAIM_SIZE` out of src/world/Terrain.ts. But a
// contract does not have to use the default: `tileParams.dimensions` overrides it per contract, and
// `tileParams.size` overrides it too. MEASURED s2288 over all 10 epochs / 42 contracts, the worst
// REACHING contract today is `e3-canyon-works` at 96 x 112 -- half-extent 56, which is 1.75x the
// default arm (3) pins. So arm (3) reads "32, safe" while the live maximum is 56, and it would go
// on reading "32, safe" if that contract's dimensions grew to 400. The constant it watches never
// moves; the number that matters is not that constant.
//
// WHAT ACTUALLY PROTECTS THE MARGIN IS THE BINADE, NOT THE DEFAULT. ulp() is a step function of
// the exponent, so every half-extent in [32, 64) carries the identical 7.105e-15 -- which is why
// e3-canyon-works at 56 costs nothing today. The margin degrades when a reaching contract crosses
// INTO THE NEXT BINADE, not when it merely exceeds 32. This guard therefore asserts the ULP, which
// is the quantity the measurement was actually taken in.
//
// MEASURED s2288, the standing exposure, priced rather than feared: 5 of 42 contracts reach, all
// in [32,64) -- PASS. But 28 of 42 (67%) sit OUTSIDE that binade while not reaching: 27 at 2x the
// measured basis and `e4-long-road` at 4x (400 x 96, half-extent 200). Any one of them gaining an
// elevation tile or an authored water mask would take raw-hypot headroom from ~14x to ~7x or
// ~3.5x with no line of src/sim/ changing. That is the event this guard exists to catch.
//
// REACHING is DERIVED from the call graph, not assumed from `elevation`:
//   Enemy.move() branches on hasElevationTile(). The FLAT branch still reaches
//   this.resolveTerrain() when `authoredWaterMask`, and only then returns; the elevation branch
//   reaches it unconditionally. resolveTerrain() holds the resolveTerrainMove() call, and the
//   Enemy is the ONLY caller passing `goal` -- which is what activates goalBias at all
//   (Hero.ts passes none, and is itself elevation-gated).
//   Terrain.ts drops a region-less waterMask to undefined, so an empty mask does NOT reach.
// This reproduces F-2286-1's reachability census exactly (5 of 42), independently derived.
//
// Rooted in test:ledger-guards -- pure JSON reading, no sim boot, no network, no vite.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

// Anchored to this file, never to process.cwd() (F-2220-1): a cwd-relative corpus silently
// narrows to empty from a subdirectory and every assertion below would pass vacuously.
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CONTRACTS = join(ROOT, 'assets/contracts');

const DEFAULT_CLAIM_SIZE = 64; // ContractFamilies.ts CONTRACT_DEFAULT_CLAIM_SIZE
const MEASURED_ULP = 32 * Math.pow(2, -52); // 7.105e-15 — the basis every F-2287-1 figure is quoted against

const ulpOf = (halfExtent) => Math.pow(2, Math.floor(Math.log2(halfExtent))) * Math.pow(2, -52);

/**
 * Census every contract's extent and whether it reaches the goalBias surface.
 *
 * Returns a RESULT OBJECT rather than throwing, so the arms below can tell "the corpus said no"
 * from "the corpus could not be read" — the distinction this repo has now paid for a dozen times.
 */
function census() {
  let epochs;
  try {
    epochs = readdirSync(CONTRACTS).filter((d) => d.startsWith('epoch-')).sort();
  } catch (err) {
    return { ok: false, why: `could not read ${CONTRACTS}: ${err.message}`, rows: [] };
  }
  if (epochs.length === 0) return { ok: false, why: `no epoch-* directories under ${CONTRACTS}`, rows: [] };

  const rows = [];
  for (const e of epochs) {
    const p = join(CONTRACTS, e, 'contracts.json');
    let doc;
    try {
      doc = JSON.parse(readFileSync(p, 'utf8'));
    } catch (err) {
      return { ok: false, why: `could not parse ${e}/contracts.json: ${err.message}`, rows: [] };
    }
    const list = Array.isArray(doc) ? doc : (doc.contracts ?? []);
    for (const c of list) {
      const tp = c.tileParams ?? {};
      const dims = tp.dimensions;
      const extent = dims ? Math.max(dims.width, dims.height) : (tp.size ?? DEFAULT_CLAIM_SIZE);
      const half = extent / 2;
      const liveMask = !!(tp.waterMask && Array.isArray(tp.waterMask.regions) && tp.waterMask.regions.length > 0);
      rows.push({
        id: c.id ?? '(no id)',
        epoch: e,
        half,
        ulp: Number.isFinite(half) && half > 0 ? ulpOf(half) : Number.NaN,
        reaching: !!tp.elevation || liveMask,
        why: [tp.elevation ? 'elevation' : null, liveMask ? 'waterMask' : null].filter(Boolean).join('+'),
      });
    }
  }
  return { ok: true, why: null, epochs: epochs.length, rows };
}

const c = census();

test('the contract corpus is readable and non-trivial', () => {
  // The anti-vacuity arm, and it runs FIRST on purpose. Every assertion below quantifies over
  // `reaching`; an empty or unreadable corpus drives that set to zero and makes all of them pass
  // while measuring nothing. An empty subject set is the shape of good news in every instrument on
  // this board, so it must REFUSE here rather than green.
  assert.equal(c.ok, true, `REFUSING — ${c.why}. The extent census cannot be taken, so no claim below is supported.`);
  assert.ok(c.epochs >= 5, `REFUSING — only ${c.epochs} epoch directories found; the corpus has shrunk unrecognizably.`);
  assert.ok(c.rows.length >= 10, `REFUSING — only ${c.rows.length} contracts censused; the parser or the corpus has moved.`);
  assert.ok(c.rows.every((r) => Number.isFinite(r.half) && r.half > 0), 'REFUSING — a contract yielded a non-finite half-extent.');
});

test('at least one contract still reaches the goalBias surface', () => {
  // If this goes to zero the blast radius of the whole F-2281/2285/2286/2287 thread changed, and
  // the margin figures stop describing anything reachable. Either way it is a loud stop, not a
  // pass: a zero here is far more likely to be this file's reaching-predicate breaking than the
  // corpus genuinely losing every elevation tile and water mask at once.
  assert.equal(c.ok, true, `REFUSING — ${c.why}`);
  const reaching = c.rows.filter((r) => r.reaching);
  assert.ok(
    reaching.length > 0,
    'REFUSING — no contract reaches resolveTerrainMove. Either every elevation tile and authored ' +
    'water mask left the corpus, or this file\'s reaching-predicate no longer matches Enemy.move(). ' +
    'Re-derive it from the call graph before trusting any headroom figure on this thread.',
  );
});

test('(F-2288-1) no REACHING contract exceeds the binade the margin was measured in', () => {
  assert.equal(c.ok, true, `REFUSING — ${c.why}`);
  const reaching = c.rows.filter((r) => r.reaching);
  const over = reaching.filter((r) => r.ulp > MEASURED_ULP);
  assert.deepEqual(
    over.map((r) => `${r.id} (half-extent ${r.half}, ulp ${r.ulp.toExponential(3)}, ${(r.ulp / MEASURED_ULP).toFixed(0)}x, via ${r.why})`),
    [],
    'A contract that REACHES resolveTerrainMove now carries a position ULP larger than the ' +
    `${MEASURED_ULP.toExponential(3)} every headroom figure on this thread is quoted against. ` +
    'Raw-hypot headroom was ~14x at that basis, so it falls in proportion. RE-MEASURE with ' +
    '`node scripts/tmp-s2287-terrain-raw-surface.mjs threshold` — do NOT shrink the map to make ' +
    'this pass, and do NOT assume the change was wrong; a bigger map may be entirely correct and ' +
    'simply needs the margin restated against its own ULP.',
  );
});

test('the dormant exposure is still only dormant — large contracts do not reach', () => {
  // The reverse-facing arm. 28 of 42 contracts sit outside the measured binade WITHOUT reaching,
  // which is lawful and must NOT red. What this pins is that the count cannot drift upward
  // unnoticed: if a large contract starts reaching, the arm above fires — this one just records
  // the standing exposure so a reader sees the size of the bet rather than inferring it.
  assert.equal(c.ok, true, `REFUSING — ${c.why}`);
  const dormant = c.rows.filter((r) => !r.reaching && r.ulp > MEASURED_ULP);
  const reaching = c.rows.filter((r) => r.reaching);
  assert.ok(
    dormant.length + reaching.length <= c.rows.length,
    'census arithmetic is inconsistent — the buckets overlap',
  );
  // Deliberately NOT an equality pin on 28: contracts are added routinely and a count pin here
  // would red on ordinary content work and be excused into uselessness inside a week (F-1460-1).
  assert.ok(
    dormant.every((r) => !r.reaching),
    'a contract classified dormant is also classified reaching — the predicate is incoherent',
  );
});
