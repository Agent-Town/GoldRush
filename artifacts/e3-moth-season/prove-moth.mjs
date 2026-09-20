// Scratch prover: rides e3-moth-season with an adaptive floor policy and records the exact
// per-turn order arrays so they can be frozen into scripts/fixtures/moth-season-orders.json.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const ROOT = fileURLToPath(new URL('../../../../../Claude/Projects/Gold Rush/worktrees/lane-a/', import.meta.url));
const root = process.env.GR_ROOT ?? ROOT;
const contractId = process.env.GR_CONTRACT ?? 'e3-moth-season';
const seed = process.env.GR_SEED ?? 'e3-moth-season-01';
const out = process.env.GR_OUT ?? '/tmp/moth-proved.json';
const PREFERENCE = (process.env.GR_PREF ?? 'tinkers_plating,split_spark,heavy_spark,double_tap_coil,long_resonator,wide_ring,powder_charge,pan_legend,prospectors_luck,spring_heels').split(',');

globalThis.location = new URL(`http://gr-sim.local/?debug&contract=${contractId}&seed=${seed}`);
globalThis.window = { location: globalThis.location };
const originalLog = console.log;
console.log = console.info = console.debug = () => undefined;

const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const sim = new HeadlessContractSim({ contractId, seed });
  const recorded = [];
  const trace = [];
  let turn = sim.currentTurn();
  let index = 0;
  while (!turn.terminal && index < 400) {
    const view = turn.view;
    let orders;
    if (index === 0) {
      orders = [
        ...['gold-seam-1', 'gold-seam-2', 'gold-seam-3'].flatMap((seam) =>
          Array.from({ length: 6 }, () => ({ verb: 'HARVEST', seam }))),
        { verb: 'BUILD', what: 'sentry_beacon', where: { x: 0, z: -14 }, when: { goldGte: 25 } },
        { verb: 'REPAIR_UNDER', pct: 60 },
        { verb: 'HOLD', pos: { x: 0, z: 10 } },
      ];
    } else if (index === 1) {
      orders = [
        { verb: 'BUILD', what: 'decoy_shed', where: { x: 8, z: 12 }, when: { goldGte: 20 } },
        { verb: 'BUILD', what: 'sentry_beacon', where: { x: -6, z: 8 }, when: { goldGte: 60 } },
        { verb: 'BUILD', what: 'sentry_beacon', where: { x: 6, z: 8 }, when: { goldGte: 90 } },
        { verb: 'REPAIR_UNDER', pct: 60 },
        { verb: 'HOLD', pos: { x: 0, z: 10 } },
      ];
    } else if ((view.now.pendingOffer ?? []).length > 0) {
      const offered = view.now.pendingOffer.map((entry) => entry.id);
      const preferred = PREFERENCE.find((id) => offered.includes(id)) ?? offered[0];
      orders = [{ verb: 'PICK_UPGRADE', id: preferred }];
    } else {
      orders = [{ verb: 'REPAIR_UNDER', pct: 60 }, { verb: 'HOLD', pos: { x: 0, z: 10 } }];
    }
    const receipt = sim.submitOrders(orders);
    recorded.push(orders);
    const power = sim.powerGraph?.snapshot() ?? null;
    trace.push({
      turn: index,
      wave: view.now.wave,
      gold: view.now.gold,
      hp: view.now.hero.hp,
      canyonConnect: view.now.canyonConnect ?? null,
      lamp: power?.nodes.find((n) => n.id === 'corridor-lamp')?.state ?? null,
      gallery: power?.nodes.find((n) => n.id === 'corridor-gallery')?.state ?? null,
      wires: power?.wires.map((w) => `${w.id}:${w.state}`) ?? [],
      works: view.now.works.byKind,
      entries: view.now.works.entries.map((e) => `${e.id}:${e.index}:${Math.round(e.hp)}/${e.maxHp}${e.wrecked ? ':WRECKED' : ''}`),
      accepted: receipt?.ok !== false,
    });
    index += 1;
    turn = sim.advanceToTurn();
  }
  const outcome = turn.terminal ? sim.outcome() : { unterminated: true, wave: turn.view.now.wave };
  writeFileSync(out, `${JSON.stringify({ recorded, trace, outcome }, null, 2)}\n`);
  originalLog(JSON.stringify(outcome));
  originalLog(`turns=${recorded.length}`);
} finally {
  await vite.close();
}
