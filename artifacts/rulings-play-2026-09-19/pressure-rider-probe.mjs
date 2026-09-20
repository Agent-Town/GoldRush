/**
 * F-HEAT14-3 proof: every number the human's HUD gauge draws now moves in the RIDER's own view.
 *
 * The heat-14 rider's finding was an ABSENCE — it read the union of `now` keys across a whole run
 * on the Trestle and the Incline and found "no pressure value, no band, no coal count, no boiler
 * fuel". An absence is disproved by showing presence AND movement, so this walks a real
 * `HeadlessContractSim` (no debug seam, no engine patch) through a secured run on every E2 map and
 * records what `now.pressure` said at every turn.
 *
 * The rig is the E2 CENSUS's own recipe (`e2e/er01-e2-census.spec.ts`): a buffed spark rig so the
 * hero survives to the secure, two boilers placed free, and the hero stood on the contract's own
 * first coal seam. That is a harness and is declared as one — its purpose is to drive the mechanic
 * hard enough that every row of the gauge has to answer, not to model a rider's economy. The
 * ordinary rider-economy ride is the second arm below: an unrigged sim with no boiler at all, which
 * must publish the same shape reading zero.
 *
 * Usage: node artifacts/rulings-play-2026-09-19/pressure-rider-probe.mjs
 */
import { createServer } from 'vite';

const location = new URL('http://gr-sim.local/?contract=e2-trestle');
globalThis.location = location;
globalThis.window = { location };

const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
const report = { generatedAt: new Date().toISOString(), arms: [] };
try {
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const steamworks = (await vite.ssrLoadModule('/assets/contracts/epoch-2-steamworks/contracts.json')).default;
  const seeds = (await vite.ssrLoadModule('/assets/contracts/bench-seeds.json')).default;

  const sample = (view) => {
    const p = view.now.pressure;
    return p && {
      wave: view.now.wave, t: view.now.timers.runSeconds,
      stored: p.stored, cap: p.cap, band: p.band, safeBand: p.safeBand,
      coal: p.coal, coalSeconds: p.coalSeconds, boilers: p.boilers, vents: p.vents,
      dug: p.seams.filter((seam) => seam.harvested).length, seams: p.seams.length,
      objective: `${p.objective.hotBoilers}/2 ${p.objective.active ? 'active' : 'idle'}${p.objective.complete ? ' complete' : ''}${p.objective.failed ? ' failed' : ''}`,
    };
  };
  const distinct = (rows, key) => new Set(rows.map((row) => JSON.stringify(row[key]))).size;

  for (const contract of steamworks.contracts) {
    for (const rigged of [true, false]) {
      const rig = { ...Balance.sparkRig };
      if (rigged) Object.assign(Balance.sparkRig, { damage: 1_000, fireRate: 60, range: 300, boltSpeed: 30, boltLife: 5 });
      try {
        // The view's `stablePrefix` reads `activeContract()`, which reads the URL — point it at the
        // contract under test the way `er01-e2-census.spec.ts` does, or every arm reads the first
        // map's authored seams.
        const at = new URL(`http://gr-sim.local/?debug&contract=${contract.id}`);
        globalThis.location = at;
        globalThis.window = { location: at };
        const sim = new HeadlessContractSim({ contractId: contract.id, seed: seeds[contract.id][0] });
        if (rigged) {
          sim.hero.applyStats(100_000, 1);
          sim.hero.heal(100_000);
          for (const x of [-4, 4]) sim.build.placeFree('boiler_house', { x, z: 12 }, 0);
          const seam = sim.pressure.diagnostics.seams[0];
          sim.hero.group.position.set(seam.x, 0.06, seam.z);
        }
        const rows = [];
        let turn = sim.currentTurn();
        rows.push(sample(turn.view));
        while (!turn.terminal) { turn = sim.advanceToTurn(); rows.push(sample(turn.view)); }
        const outcome = sim.outcome();
        report.arms.push({
          contract: contract.id, arm: rigged ? 'census-rig (boilers placed, hero on coal)' : 'plain rider economy (nothing placed)',
          secured: outcome.secured, waves: outcome.waves, turns: rows.length,
          published: rows.every((row) => row !== undefined),
          distinctValues: Object.fromEntries(['stored', 'band', 'coal', 'coalSeconds', 'boilers', 'vents', 'dug'].map((key) => [key, distinct(rows, key)])),
          bandsSeen: [...new Set(rows.map((row) => row.band))],
          peakStored: Math.max(...rows.map((row) => row.stored)),
          maxCoal: Math.max(...rows.map((row) => row.coal)),
          maxCoalSeconds: Math.max(...rows.map((row) => row.coalSeconds)),
          maxVents: Math.max(...rows.map((row) => row.vents)),
          boilersBuilt: Math.max(...rows.map((row) => row.boilers.built)),
          boilersHot: Math.max(...rows.map((row) => row.boilers.hot)),
          seamsDug: Math.max(...rows.map((row) => row.dug)),
          cap: rows[0].cap, safeBandFirst: rows[0].safeBand, safeBandLast: rows.at(-1).safeBand,
          first: rows[0], last: rows.at(-1),
        });
      } finally {
        Object.assign(Balance.sparkRig, rig);
      }
    }
  }

  // The control: an E1 contract declares no boilers, draws no HUD gauge, and must publish no field.
  const claim = new URL('http://gr-sim.local/?debug&contract=the-claim');
  globalThis.location = claim;
  globalThis.window = { location: claim };
  const control = new HeadlessContractSim({ contractId: 'the-claim', seed: seeds['the-claim'][0] });
  report.control = { contract: 'the-claim', pressurePublished: control.currentTurn().view.now.pressure !== undefined };
} finally {
  await vite.close();
}
console.log(JSON.stringify(report, null, 1));
