// RETAINED EVIDENCE (F-2288-1, s2288) — the census behind the reaching-contract extent guard.
//
// This is the instrument that produced the exposure table quoted in the F-2288-1 BACKLOG row and
// in scripts/reaching-contract-extent-guard.test.mjs's header. It is retained under the RETENTION
// LAW as a citable probe, NOT as a one-shot helper: run it to re-derive the numbers rather than
// trusting the prose, exactly as F-2287-1's threshold sweep is retained.
//
// It answers the question s2287's arm (3) declared it could not: which contracts REACH the
// goalBias subtractive-cancellation surface in src/sim/TileHeight.ts, and what position ULP does
// each one's map half-extent imply?
//
// The GUARD asserts only the load-bearing half (no reaching contract leaves the [32,64) binade).
// This probe additionally prints the DORMANT exposure — contracts outside that binade that do not
// reach today — which is deliberately NOT pinned, because contracts are added routinely and a
// count pin there would red on ordinary content work (F-1460-1).
//
//   node scripts/tmp-s2288-reaching-extent-census.mjs
//
// Reaching is derived from the call graph; see the guard's header for the derivation.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIR = join(ROOT, 'assets/contracts');
const DEFAULT_CLAIM_SIZE = 64; // ContractFamilies.ts CONTRACT_DEFAULT_CLAIM_SIZE
const MEASURED_ULP = 32 * Math.pow(2, -52); // ulp(32) = 7.105e-15, the F-2287-1 basis

const ulpOf = (v) => Math.pow(2, Math.floor(Math.log2(v))) * Math.pow(2, -52);

const epochs = readdirSync(DIR).filter((d) => d.startsWith('epoch-')).sort();
const rows = [];
for (const e of epochs) {
  const p = join(DIR, e, 'contracts.json');
  let doc;
  try { doc = JSON.parse(readFileSync(p, 'utf8')); }
  catch (err) { console.log(`REFUSING — could not read ${e}: ${err.message}`); process.exit(2); }
  const list = Array.isArray(doc) ? doc : (doc.contracts ?? []);
  for (const c of list) {
    const tp = c.tileParams ?? {};
    const dims = tp.dimensions;
    const extent = dims ? Math.max(dims.width, dims.height) : (tp.size ?? DEFAULT_CLAIM_SIZE);
    const half = extent / 2;
    const liveMask = !!(tp.waterMask && Array.isArray(tp.waterMask.regions) && tp.waterMask.regions.length > 0);
    rows.push({
      epoch: e, id: c.id ?? '(no id)', extent, half, ulp: ulpOf(half),
      reaching: !!tp.elevation || liveMask,
      why: [tp.elevation ? 'elevation' : null, liveMask ? 'waterMask' : null].filter(Boolean).join('+'),
      via: dims ? 'dimensions' : (tp.size != null ? 'size' : 'DEFAULT'),
    });
  }
}

// Declare the corpus ALWAYS, including the happy path (F-2208-1): the single line that separates
// "I censused 42 contracts and found nothing" from "I censused nothing".
console.log(`corpus  ${rows.length} contracts across ${epochs.length} epochs  [${DIR}]`);
console.log(`basis   ulp(32) = ${MEASURED_ULP.toExponential(3)}  — the [32,64) binade every F-2287-1 headroom figure is quoted against`);
console.log('');

const reaching = rows.filter((r) => r.reaching).sort((a, b) => b.half - a.half);
console.log(`REACHING the goalBias surface: ${reaching.length} of ${rows.length} (${((reaching.length / rows.length) * 100).toFixed(1)}%)`);
for (const r of reaching) {
  const flag = r.ulp > MEASURED_ULP ? `  *** ${(r.ulp / MEASURED_ULP).toFixed(0)}x THE MEASURED BASIS ***` : '';
  console.log(`  half=${String(r.half).padStart(5)}  ulp=${r.ulp.toExponential(3)}  ${r.id.padEnd(22)} via ${r.via.padEnd(10)} [${r.why}]${flag}`);
}

console.log('');
const dormant = rows.filter((r) => !r.reaching && r.ulp > MEASURED_ULP).sort((a, b) => b.half - a.half);
console.log(`DORMANT — outside the binade, but not reaching today: ${dormant.length} of ${rows.length} (${((dormant.length / rows.length) * 100).toFixed(1)}%)`);
console.log('  (one elevation tile or one live waterMask away from moving the margin, with no src/sim/ line changing)');
for (const r of dormant) {
  console.log(`  half=${String(r.half).padStart(5)}  ulp=${r.ulp.toExponential(3)} (${(r.ulp / MEASURED_ULP).toFixed(0)}x)  ${r.id}`);
}

console.log('');
const worst = reaching.length ? reaching[0] : null;
console.log(`VERDICT: worst REACHING half-extent = ${worst ? worst.half : 'n/a'} (${worst ? worst.id : 'none reach'})`);
console.log(worst && worst.ulp <= MEASURED_ULP
  ? 'PASS — every reaching contract sits in [32,64); the F-2287-1 margin is measured on the worst live case.'
  : 'FAIL — re-measure the margin; see scripts/reaching-contract-extent-guard.test.mjs.');
