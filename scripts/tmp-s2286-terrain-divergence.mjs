// RETAINED EVIDENCE PROBE for F-2286-1 (s2286). Not a guard, not a gate -- this is the
// instrument that produced the numbers the finding and
// scripts/terrain-comparator-margin-guard.test.mjs cite. Kept under the RETENTION LAW so the
// measurement is reproducible rather than remembered; F-1665-1's "write scratch to /tmp" governs
// one-shot splice helpers, and explicitly exempts a probe that produced evidence.
//
// THE QUESTION. F-2285-1 measured how often roundMotion ABSORBS a one-ULP platform libm
// difference and closed naming its own honest limit: "how often a surviving 1e-15 step actually
// flips a consider() winner is UNMEASURED, and that is the number that says whether any of this
// is reachable in play." This answers that, against the REAL function.
//
// THREE PARTS
//   census      -- which contracts REACH resolveTerrainMove at all (it is not on the default path)
//   divergence  -- single-call flip rate under a one-ULP perturbation, both live call shapes
//   accumulate  -- whether a carried delta amplifies when the map is iterated
//
// METHOD NOTES that decide whether the numbers mean anything:
//   * The subject is the SSR-loaded real src/sim/TileHeight.ts, never a re-implementation.
//   * The perturbation is BRACKETED to cover only TileHeight:206 and :211. Terrain.sample itself
//     calls Math.cos/Math.sin (blocker rotation :283-284, river geometry :1399-1415, hash :1656),
//     so an unbracketed patch would perturb the WALKABILITY PREDICATE and swamp the measurement
//     with a different, much larger effect. The isWalkable wrapper disables the patch for the
//     duration of every terrain sample.
//   * Math.atan2 (:203) and Math.hypot (:148/:192) are left STOCK on purpose: they are the
//     uncured surface F-2281-2 names, and perturbing them would conflate two findings.
//   * Every arm asserts its own validity before any verdict is believed (F-2215-1): a null
//     control that must be 100% identical, a positive control at 1e-6 that MUST flip, and a
//     non-zero count of actually-perturbed calls. A control whose failure mode is silence cannot
//     be told from the silence it measures.
//
// USAGE:  node scripts/tmp-s2286-terrain-divergence.mjs [census|divergence|accumulate|all]
// Exit 2 = could not answer (refusal). Exit 0 = measured.

import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MODE = process.argv[2] ?? 'all';
const SEARCH = '?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine';
const STEP_MAX = 0.2992; // F-2285-1's derived max hero per-step displacement

const { createServer } = await import(ROOT + 'node_modules/vite/dist/node/index.js');
globalThis.location = { search: SEARCH, href: 'http://localhost/' + SEARCH, pathname: '/' };

const refuse = (why) => { console.error(`REFUSING — ${why}`); process.exit(2); };

let seed = 0x2286c0de;
const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

const ibuf = new BigInt64Array(1);
const fbuf = new Float64Array(ibuf.buffer);
const ulpAway = (v) => { if (!Number.isFinite(v) || v === 0) return v; fbuf[0] = v; ibuf[0] += 1n; return fbuf[0]; };

const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const cf = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');

  // ---------------------------------------------------------------- census
  if (MODE === 'census' || MODE === 'all') {
    const epochs = cf.listEpochs();
    if (!Array.isArray(epochs) || epochs.length === 0) refuse('listEpochs() returned no corpus.');
    const rows = [];
    for (const e of epochs) {
      const id = typeof e === 'string' ? e : e?.id;
      if (!id) continue;
      // NOTE: listContracts() defaults to epoch-1 only. A first pass of this census used the
      // default and returned a flat ZERO -- the shape of good news from a narrowed corpus.
      for (const c of cf.listContracts(id)) {
        const tp = c.tileParams ?? {};
        rows.push({ epoch: id, id: c.id, elevation: Boolean(tp.elevation), regions: tp.waterMask?.regions?.length ?? 0 });
      }
    }
    if (rows.length === 0) refuse('zero contracts across all epochs — a read failure, not an answer.');
    const elev = rows.filter((r) => r.elevation);
    const maskOnly = rows.filter((r) => !r.elevation && r.regions > 0);
    const reach = rows.filter((r) => r.elevation || r.regions > 0);
    console.log(`CENSUS — corpus ${rows.length} contracts across ${epochs.length} epochs`);
    console.log(`  elevation tile (hero AND enemy reach it) : ${elev.length}  [${elev.map((r) => r.id).join(', ')}]`);
    console.log(`  water-mask only (ENEMY only)             : ${maskOnly.length}`);
    console.log(`  REACHABLE at all                         : ${reach.length} / ${rows.length}  (${(100 * reach.length / rows.length).toFixed(1)}%)`);
    console.log(`  default contract ${cf.DEFAULT_CONTRACT_ID} reaches it : ` +
      `${Boolean(rows.find((r) => r.id === cf.DEFAULT_CONTRACT_ID && (r.elevation || r.regions > 0)))}`);
  }

  if (MODE === 'census') process.exit(0);

  const th = await vite.ssrLoadModule('/src/sim/TileHeight.ts');
  const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
  if (!th.hasElevationTile()) refuse('the probe contract does not reach resolveTerrainMove; the measurement would be vacuous.');

  const cos0 = Math.cos, sin0 = Math.sin;
  let PATCH = 'off';          // 'off' | 'ulp' | 'coarse'
  let fired = 0;
  const skew = (v) => { if (PATCH === 'off') return v; fired += 1; return PATCH === 'ulp' ? ulpAway(v) : v + 1e-6; };
  Math.cos = (x) => skew(cos0(x));
  Math.sin = (x) => skew(sin0(x));

  const rawWalk = (x, z) => Terrain.sample(x, z).walkable;
  const walk = (x, z) => { const s = PATCH; PATCH = 'off'; const r = rawWalk(x, z); PATCH = s; return r; };
  const b = Terrain.bounds;
  const resolve = (mode, px, pz, tx, tz, goal) => {
    PATCH = mode;
    const r = goal ? th.resolveTerrainMove(px, pz, tx, tz, walk, goal) : th.resolveTerrainMove(px, pz, tx, tz, walk);
    PATCH = 'off';
    return r;
  };

  // ------------------------------------------------------------ divergence
  if (MODE === 'divergence' || MODE === 'all') {
    const PAIRS = Number(process.env.GR_S2286_PAIRS ?? 6000);
    const cases = [];
    let tries = 0;
    while (cases.length < PAIRS && tries < PAIRS * 4000) {
      tries += 1;
      const px = b.minX + rnd() * (b.maxX - b.minX);
      const pz = b.minZ + rnd() * (b.maxZ - b.minZ);
      if (!rawWalk(px, pz)) continue;
      const ang = rnd() * Math.PI * 2;
      const step = (0.05 + rnd() * 0.95) * STEP_MAX;
      const tx = px + cos0(ang) * step;
      const tz = pz + sin0(ang) * step;
      if (rawWalk(tx, tz)) continue;   // a walkable target never reaches resolveTerrainMove
      const gA = rnd() * Math.PI * 2, gD = 2 + rnd() * 18, fA = rnd() * Math.PI * 2;
      cases.push([px, pz, tx, tz, px + cos0(gA) * gD, pz + sin0(gA) * gD, cos0(fA), sin0(fA)]);
    }
    if (cases.length < PAIRS * 0.5) refuse(`only ${cases.length}/${PAIRS} qualifying pairs; the sample is too thin.`);

    const arm = (label, mode, withGoal) => {
      fired = 0;
      let identical = 0, carry = 0, flip = 0, maxD = 0;
      for (const [px, pz, tx, tz, gx, gz, fx, fz] of cases) {
        const goal = withGoal ? { x: gx, z: gz, fallbackX: fx, fallbackZ: fz } : undefined;
        const a = resolve('off', px, pz, tx, tz, goal);
        const c = resolve(mode, px, pz, tx, tz, goal);
        const d = Math.max(Math.abs(a.x - c.x), Math.abs(a.z - c.z));
        if (d === 0 && a.moved === c.moved) { identical += 1; continue; }
        if (d > maxD) maxD = d;
        if (d > 1e-12 || a.moved !== c.moved) flip += 1; else carry += 1;
      }
      const p = (n) => `${(100 * n / cases.length).toFixed(4)}%`;
      console.log(`  ${label}`);
      console.log(`      identical ${p(identical)}  carry ${carry} (${p(carry)})  FLIP ${flip} (${p(flip)})  max|d| ${maxD.toExponential(3)}  skewed calls ${fired}`);
      return { identical, carry, flip, fired };
    };

    console.log('');
    console.log(`DIVERGENCE — ${cases.length} pairs, one-ULP libm difference`);
    const nullArm = arm('CONTROL null (must be 100% identical)', 'off', false);
    if (nullArm.identical !== cases.length) refuse('the harness is nondeterministic; nothing below can be believed.');
    const heroArm = arm('hero shape (no goal)', 'ulp', false);
    if (heroArm.fired === 0) refuse('the perturbation never fired — a vacuous green.');
    const coarse = arm('CONTROL coarse 1e-6 (MUST flip)', 'coarse', false);
    if (coarse.flip === 0) refuse('a 1e-6 perturbation produced zero flips; the detector is vacuous.');
    const enemyNull = arm('CONTROL null, enemy shape', 'off', true);
    if (enemyNull.identical !== cases.length) refuse('the enemy-shape harness is nondeterministic.');
    const enemyArm = arm('enemy shape (goal + fallback)', 'ulp', true);
    if (enemyArm.fired === 0) refuse('the enemy-shape perturbation never fired.');
    console.log(`  VERDICT: flips ${heroArm.flip + enemyArm.flip} / ${cases.length * 2} across both live call shapes; ` +
      `detector proven live by ${coarse.flip} flips at 1e-6`);
  }

  // ------------------------------------------------------------ accumulate
  if (MODE === 'accumulate' || MODE === 'all') {
    // SCOPE: an idealized constant-velocity walker, NOT Hero.update(). Re-implementing Hero's
    // velocity lerp and speed multipliers would re-implement the subject; isolating the map
    // answers "does resolveTerrainMove amplify a perturbation under iteration" with less to go
    // wrong. It does NOT give the true in-play rate.
    const WALKS = Number(process.env.GR_S2286_WALKS ?? 400);
    const TICKS = Number(process.env.GR_S2286_TICKS ?? 900);
    const advance = (mode, x, z, dx, dz) => {
      const tx = x + dx * STEP_MAX, tz = z + dz * STEP_MAX;
      if (walk(tx, tz)) return [tx, tz];
      const r = resolve(mode, x, z, tx, tz);
      return [r.x, r.z];
    };
    let identical = 0, stable = 0, grew = 0, macro = 0, resolves = 0, maxFinal = 0, started = 0;
    fired = 0;
    for (let w = 0; w < WALKS * 4 && started < WALKS; w += 1) {
      const px = b.minX + rnd() * (b.maxX - b.minX);
      const pz = b.minZ + rnd() * (b.maxZ - b.minZ);
      if (!rawWalk(px, pz)) continue;
      const ang = rnd() * Math.PI * 2, dx = cos0(ang), dz = sin0(ang);
      started += 1;
      let ax = px, az = pz, cx = px, cz = pz;
      for (let t = 0; t < TICKS; t += 1) {
        const before = fired;
        [ax, az] = advance('off', ax, az, dx, dz);
        [cx, cz] = advance('ulp', cx, cz, dx, dz);
        if (fired > before) resolves += 1;
      }
      const d = Math.max(Math.abs(ax - cx), Math.abs(az - cz));
      if (d > maxFinal) maxFinal = d;
      if (d === 0) identical += 1; else if (d <= 1e-12) stable += 1; else if (d <= 1e-3) grew += 1; else macro += 1;
    }
    if (resolves === 0) refuse('no walk ever hit an obstacle; the accumulation probe is vacuous.');
    if (fired === 0) refuse('the accumulation perturbation never fired.');
    const p = (n) => `${(100 * n / started).toFixed(2)}%`;
    console.log('');
    console.log(`ACCUMULATION — ${started} walks x ${TICKS} ticks, ${resolves} perturbed resolves`);
    console.log(`      identical ${p(identical)}  stable<=1e-12 ${stable} (${p(stable)})  GREW ${grew} (${p(grew)})  MACROSCOPIC ${macro} (${p(macro)})`);
    console.log(`      max final |delta| ${maxFinal.toExponential(3)}`);
  }

  Math.cos = cos0;
  Math.sin = sin0;
} finally {
  await vite.close();
}
