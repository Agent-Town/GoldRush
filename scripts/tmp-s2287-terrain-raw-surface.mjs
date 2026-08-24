// RETAINED EVIDENCE PROBE for F-2287-1 (s2287). Not a guard, not a gate -- this is the
// instrument that produced the numbers the finding and
// scripts/terrain-raw-surface-guard.test.mjs cite. Kept under the RETENTION LAW so the
// measurement is reproducible rather than remembered; F-1665-1's "write scratch to /tmp" governs
// one-shot splice helpers, and explicitly exempts a probe that produced evidence.
//
// THE QUESTION. F-2281-2 named an uncured surface and nobody had measured it: roundMotion is
// applied to the ROTATION candidate pair alone, while Math.hypot and the fallback slide
// candidates stay raw. s2286 closed naming it as the sharpest remaining question and framed the
// bet exactly: "if those flip where the cured pair does not, the cure is covering the wrong
// surface." This answers that, against the REAL function, on ONE SHARED CASE SET so the two
// surfaces are compared like with like rather than across two samples.
//
// WHAT READING THE CODE SAYS BEFORE ANY NUMBER IS TAKEN (src/sim/TileHeight.ts):
//   * The ONLY canonicalized candidate is the rotation pair -- consider(roundMotion(cos..),
//     roundMotion(sin..)). Every other consider() call passes RAW arithmetic.
//   * A winning candidate is written straight to bestX/bestZ, i.e. authoritative position. So a
//     raw path can carry a platform difference into movement state with NO absorption at all,
//     where the rotation path gets a 1e-15 quantum applied first.
//   * Math.atan2 sits UPSTREAM of that roundMotion (moveAngle -> angle -> cos/sin -> roundMotion),
//     so the existing cure should absorb atan2 divergence for free. That is a prediction this
//     probe tests rather than assumes.
//   * Math.hypot feeds fallbackX/fallbackZ, considerSlide's nx/nz, goalDistance and the goalBias
//     term -- none canonicalized. Math.sqrt would NOT qualify (IEEE-754 exactly specified);
//     hypot, cos, sin and atan2 are all implementation-approximated and may differ by an ulp
//     across platform libm, which is the divergence this whole thread is about.
//
// METHOD NOTES that decide whether the numbers mean anything:
//   * The subject is the SSR-loaded real src/sim/TileHeight.ts, never a re-implementation.
//   * The perturbation is BRACKETED to resolveTerrainMove's own call frames. src/world/Terrain.ts
//     calls Math.hypot 5x (and Math.cos/Math.sin more), so an unbracketed patch would perturb the
//     WALKABILITY PREDICATE and swamp the measurement with a different, much larger effect -- the
//     same trap s2286 recorded for the trig surface, and it applies verbatim to hypot. The
//     isWalkable wrapper disables the patch for the duration of every terrain sample.
//   * ONE SHARED CASE SET across all four surfaces. F-2281-2 asks a COMPARATIVE question
//     ("flip where the cured pair does not"), and two surfaces measured on two samples cannot
//     answer it.
//   * Every arm asserts its own validity before any verdict is believed (F-2215-1): a null
//     control that must be 100% identical, a positive control per surface that MUST flip, and a
//     non-zero count of actually-perturbed calls. A control whose failure mode is silence cannot
//     be told from the silence it measures -- and a surface that never fires produces a ZERO that
//     looks exactly like a clean result.
//
// USAGE:  node scripts/tmp-s2287-terrain-raw-surface.mjs [divergence|accumulate|all]
// Exit 2 = could not answer (refusal). Exit 0 = measured.

import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MODE = process.argv[2] ?? 'all';
const SEARCH = '?debug&epoch=epoch-2-steamworks&contract=e2-hill-mine';
const STEP_MAX = 0.2992; // F-2285-1's derived max hero per-step displacement

const { createServer } = await import(ROOT + 'node_modules/vite/dist/node/index.js');
globalThis.location = { search: SEARCH, href: 'http://localhost/' + SEARCH, pathname: '/' };

const refuse = (why) => { console.error(`REFUSING — ${why}`); process.exit(2); };

let seed = 0x2287c0de;
const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };

const ibuf = new BigInt64Array(1);
const fbuf = new Float64Array(ibuf.buffer);
const ulpAway = (v) => { if (!Number.isFinite(v) || v === 0) return v; fbuf[0] = v; ibuf[0] += 1n; return fbuf[0]; };

const vite = await createServer({ root: ROOT, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
try {
  const th = await vite.ssrLoadModule('/src/sim/TileHeight.ts');
  const Terrain = await vite.ssrLoadModule('/src/world/Terrain.ts');
  if (!th.hasElevationTile()) refuse('the probe contract does not reach resolveTerrainMove; the measurement would be vacuous.');

  // ---- the bracketed perturbation, one switch per platform-variable surface ----
  const cos0 = Math.cos, sin0 = Math.sin, hypot0 = Math.hypot, atan20 = Math.atan2;
  let PATCH = 'off';      // 'off' | 'ulp' | 'coarse'
  let TARGET = 'trig';    // 'trig' | 'hypot' | 'atan2'
  let COARSE = 1e-6;      // the 'coarse' magnitude; the threshold arm sweeps it by decades
  let fired = 0;
  const skew = (kind, v) => {
    if (PATCH === 'off' || TARGET !== kind) return v;
    fired += 1;
    return PATCH === 'ulp' ? ulpAway(v) : v + COARSE;
  };
  Math.cos = (x) => skew('trig', cos0(x));
  Math.sin = (x) => skew('trig', sin0(x));
  Math.hypot = (...a) => skew('hypot', hypot0(...a));
  Math.atan2 = (y, x) => skew('atan2', atan20(y, x));

  const rawWalk = (x, z) => Terrain.sample(x, z).walkable;
  const walk = (x, z) => { const s = PATCH; PATCH = 'off'; const r = rawWalk(x, z); PATCH = s; return r; };
  const b = Terrain.bounds;
  const resolve = (mode, target, px, pz, tx, tz, goal) => {
    PATCH = mode; TARGET = target;
    const r = goal ? th.resolveTerrainMove(px, pz, tx, tz, walk, goal) : th.resolveTerrainMove(px, pz, tx, tz, walk);
    PATCH = 'off';
    return r;
  };

  // ------------------------------------------------------------ divergence
  if (MODE === 'divergence' || MODE === 'all') {
    const PAIRS = Number(process.env.GR_S2287_PAIRS ?? 6000);
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

    const arm = (label, mode, target, withGoal) => {
      fired = 0;
      let identical = 0, carry = 0, flip = 0, maxD = 0;
      for (const [px, pz, tx, tz, gx, gz, fx, fz] of cases) {
        const goal = withGoal ? { x: gx, z: gz, fallbackX: fx, fallbackZ: fz } : undefined;
        const a = resolve('off', 'trig', px, pz, tx, tz, goal);
        const c = resolve(mode, target, px, pz, tx, tz, goal);
        const d = Math.max(Math.abs(a.x - c.x), Math.abs(a.z - c.z));
        if (d === 0 && a.moved === c.moved) { identical += 1; continue; }
        if (d > maxD) maxD = d;
        if (d > 1e-12 || a.moved !== c.moved) flip += 1; else carry += 1;
      }
      const p = (n) => `${(100 * n / cases.length).toFixed(4)}%`;
      console.log(`  ${label}`);
      console.log(`      identical ${p(identical)}  carry ${carry} (${p(carry)})  FLIP ${flip} (${p(flip)})  max|d| ${maxD.toExponential(3)}  skewed calls ${fired}`);
      return { identical, carry, flip, fired, cases: cases.length };
    };

    console.log('');
    console.log(`DIVERGENCE — ${cases.length} shared pairs, one-ULP platform libm difference`);
    console.log('  (carry = position moved but < 1e-12; FLIP = a different consider() winner)');
    console.log('');
    const nullArm = arm('CONTROL null (must be 100% identical)', 'off', 'trig', false);
    if (nullArm.identical !== cases.length) refuse('the harness is nondeterministic; nothing below can be believed.');

    console.log('');
    console.log('  --- CURED surface: cos/sin, canonicalized by roundMotion at the candidate ---');
    const trigHero = arm('trig ULP, hero shape (no goal)', 'ulp', 'trig', false);
    const trigEnemy = arm('trig ULP, enemy shape (goal + fallback)', 'ulp', 'trig', true);
    if (trigHero.fired === 0 || trigEnemy.fired === 0) refuse('the trig perturbation never fired — a vacuous green.');

    console.log('');
    console.log('  --- RAW surface F-2281-2 names: Math.hypot, never canonicalized ---');
    const hypHero = arm('hypot ULP, hero shape (no goal)', 'ulp', 'hypot', false);
    const hypEnemy = arm('hypot ULP, enemy shape (goal + fallback)', 'ulp', 'hypot', true);
    if (hypHero.fired === 0 || hypEnemy.fired === 0) {
      refuse('the hypot perturbation never fired — a ZERO here would be a narrowed corpus, not a clean result.');
    }

    console.log('');
    console.log('  --- UPSTREAM of the cure: atan2 feeds moveAngle -> cos/sin -> roundMotion ---');
    const atanHero = arm('atan2 ULP, hero shape (no goal)', 'ulp', 'atan2', false);
    const atanEnemy = arm('atan2 ULP, enemy shape (goal + fallback)', 'ulp', 'atan2', true);
    if (atanHero.fired === 0 || atanEnemy.fired === 0) refuse('the atan2 perturbation never fired — a vacuous green.');

    console.log('');
    console.log('  --- POSITIVE CONTROLS at 1e-6 (the comparator epsilon): each MUST flip, or');
    console.log('      its ULP zero above is vacuous rather than meaningful ---');
    const ctlTrig = arm('trig  @1e-6, enemy shape', 'coarse', 'trig', true);
    const ctlHyp = arm('hypot @1e-6, enemy shape', 'coarse', 'hypot', true);
    const ctlAtan = arm('atan2 @1e-6, enemy shape', 'coarse', 'atan2', true);
    if (ctlTrig.flip === 0) refuse('the trig positive control did not flip; the harness cannot see a flip at all.');
    if (ctlHyp.flip === 0) refuse('the hypot positive control did not flip; the hypot ULP zero would be vacuous.');
    if (ctlAtan.flip === 0) refuse('the atan2 positive control did not flip; the atan2 ULP zero would be vacuous.');

    console.log('');
    console.log('VERDICT — F-2281-2, answered on one shared case set');
    const rate = (a) => `${(100 * (a.carry + a.flip) / a.cases).toFixed(2)}%`;
    console.log(`  a platform difference reaches authoritative position via`);
    console.log(`      the CURED trig surface : hero ${rate(trigHero)}  enemy ${rate(trigEnemy)}`);
    console.log(`      the RAW hypot surface  : hero ${rate(hypHero)}   enemy ${rate(hypEnemy)}`);
    console.log(`      atan2 (upstream)       : hero ${rate(atanHero)}   enemy ${rate(atanEnemy)}`);
    console.log(`  DECISION FLIPS at one ULP: trig ${trigHero.flip + trigEnemy.flip} · hypot ${hypHero.flip + hypEnemy.flip} · atan2 ${atanHero.flip + atanEnemy.flip}`);
    console.log(`  FLIPS at 1e-6 (controls) : trig ${ctlTrig.flip} · hypot ${ctlHyp.flip} · atan2 ${ctlAtan.flip}`);
  }

  // ------------------------------------------------------------- threshold
  // "0 flips at one ULP, all flip at 1e-6" is a true answer to a narrow question. It does NOT say
  // how much headroom each surface has, and the surfaces are NOT alike: hypot's error enters
  // goalBias through a SUBTRACTIVE CANCELLATION (goalDistance - hypot(goal - x)), where two
  // nearly-equal large quantities are differenced, so absolute error there is amplified
  // relative to the term it lands in. The 1e-6 control makes that visible -- hypot moved a
  // position by 1.9e-1 where trig moved it 5.8e-7 -- so the margin must be MEASURED per surface,
  // not assumed uniform from F-2286-1's single figure.
  if (MODE === 'threshold' || MODE === 'all') {
    const N = Number(process.env.GR_S2287_THRESH ?? 1500);
    const cases = [];
    let tries = 0;
    while (cases.length < N && tries < N * 4000) {
      tries += 1;
      const px = b.minX + rnd() * (b.maxX - b.minX);
      const pz = b.minZ + rnd() * (b.maxZ - b.minZ);
      if (!rawWalk(px, pz)) continue;
      const ang = rnd() * Math.PI * 2;
      const step = (0.05 + rnd() * 0.95) * STEP_MAX;
      const tx = px + cos0(ang) * step;
      const tz = pz + sin0(ang) * step;
      if (rawWalk(tx, tz)) continue;
      const gA = rnd() * Math.PI * 2, gD = 2 + rnd() * 18, fA = rnd() * Math.PI * 2;
      cases.push([px, pz, tx, tz, px + cos0(gA) * gD, pz + sin0(gA) * gD, cos0(fA), sin0(fA)]);
    }
    if (cases.length < N * 0.5) refuse(`only ${cases.length}/${N} qualifying pairs; the threshold sample is too thin.`);

    console.log('');
    console.log(`THRESHOLD — ${cases.length} shared pairs, enemy shape, perturbation swept by decades`);
    console.log('  first magnitude at which ANY consider() winner flips = that surface\'s real headroom');
    console.log('');
    const decades = [1e-15, 1e-14, 1e-13, 1e-12, 1e-11, 1e-10, 1e-9, 1e-8, 1e-7, 1e-6];
    const found = {};
    for (const target of ['trig', 'hypot', 'atan2']) {
      const row = [];
      let firstFlip = null;
      for (const eps of decades) {
        COARSE = eps;
        fired = 0;
        let flip = 0;
        for (const [px, pz, tx, tz, gx, gz, fx, fz] of cases) {
          const goal = { x: gx, z: gz, fallbackX: fx, fallbackZ: fz };
          const a = resolve('off', target, px, pz, tx, tz, goal);
          const c = resolve('coarse', target, px, pz, tx, tz, goal);
          const d = Math.max(Math.abs(a.x - c.x), Math.abs(a.z - c.z));
          if (d > 1e-12 || a.moved !== c.moved) flip += 1;
        }
        if (fired === 0) refuse(`${target} never fired at eps=${eps}; a zero here is a narrowed corpus, not a result.`);
        row.push(`${eps.toExponential(0)}:${flip}`);
        if (flip > 0 && firstFlip === null) firstFlip = eps;
      }
      found[target] = firstFlip;
      console.log(`  ${target.padEnd(6)} ${row.join('  ')}`);
      console.log(`      first flip at ${firstFlip === null ? 'NONE up to 1e-6' : firstFlip.toExponential(0)}`);
    }
    COARSE = 1e-6;
    console.log('');
    console.log('  HEADROOM vs the 1e-6 comparator epsilon, and vs a real one-ULP libm difference:');
    for (const t of ['trig', 'hypot', 'atan2']) {
      const f = found[t];
      console.log(`      ${t.padEnd(6)} first flip ${f === null ? '> 1e-6' : f.toExponential(0)}` +
        `   — that is ${f === null ? '>1e9' : (f / 7.105e-15).toExponential(1)}x the largest delta a one-ULP difference actually carries (7.105e-15)`);
    }
  }

  // ------------------------------------------------------------ accumulate
  if (MODE === 'accumulate' || MODE === 'all') {
    const WALKS = Number(process.env.GR_S2287_WALKS ?? 400);
    const TICKS = Number(process.env.GR_S2287_TICKS ?? 900);
    // The surface is a PARAMETER so the cured and raw paths can be compared on one harness, one
    // seed and one call shape. s2286 reported 0% growth for trig, but on its own shape; reading
    // this arm's hypot figure against that number would vary TWO things at once and attribute the
    // difference to the surface. Run both here, or the comparison is confounded.
    const ACC_TARGET = process.argv[3] ?? process.env.GR_S2287_SURFACE ?? 'hypot';
    if (!['trig', 'hypot', 'atan2'].includes(ACC_TARGET)) refuse(`unknown surface ${ACC_TARGET}`);
    let grew = 0, macroscopic = 0, maxD = 0, resolves = 0, walksRun = 0;
    fired = 0;
    for (let w = 0; w < WALKS; w += 1) {
      let ax = 0, az = 0, ok = false;
      for (let t = 0; t < 400 && !ok; t += 1) {
        ax = b.minX + rnd() * (b.maxX - b.minX);
        az = b.minZ + rnd() * (b.maxZ - b.minZ);
        ok = rawWalk(ax, az);
      }
      if (!ok) continue;
      walksRun += 1;
      let cx = ax, cz = az, first = 0, last = 0;
      const heading = rnd() * Math.PI * 2;
      const vx = cos0(heading) * STEP_MAX, vz = sin0(heading) * STEP_MAX;
      for (let t = 0; t < TICKS; t += 1) {
        const goal = { x: ax + vx * 400, z: az + vz * 400, fallbackX: vx, fallbackZ: vz };
        const A = resolve('off', ACC_TARGET, ax, az, ax + vx, az + vz, goal);
        const C = resolve('ulp', ACC_TARGET, cx, cz, cx + vx, cz + vz, goal);
        resolves += 2;
        ax = A.x; az = A.z; cx = C.x; cz = C.z;
        const d = Math.max(Math.abs(ax - cx), Math.abs(az - cz));
        if (d > 0 && first === 0) first = d;
        last = d;
        if (d > maxD) maxD = d;
      }
      if (first > 0 && last > first * 10) grew += 1;
      if (last > 0.01) macroscopic += 1;
    }
    if (walksRun === 0) refuse('no walk found a walkable start; the accumulation arm is vacuous.');
    if (fired === 0) refuse('the accumulation perturbation never fired — a vacuous green.');
    console.log('');
    console.log(`ACCUMULATION — ${ACC_TARGET} surface, ${walksRun} walks x ${TICKS} ticks (${resolves} resolves, ${fired} skewed calls)`);
    console.log(`  walks whose delta GREW >10x     : ${grew} (${(100 * grew / walksRun).toFixed(2)}%)`);
    console.log(`  walks reaching a macroscopic gap: ${macroscopic} (${(100 * macroscopic / walksRun).toFixed(2)}%)`);
    console.log(`  max |delta| over every tick     : ${maxD.toExponential(3)}`);
  }
} finally {
  await vite.close();
}
