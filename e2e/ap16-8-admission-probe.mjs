import assert from 'node:assert/strict';
import { createServer } from 'vite';
const requestedContracts = process.argv.slice(2);
globalThis.location = new URL('http://gr-sim.local/?debug'); globalThis.window = { location: globalThis.location };
const vite = await createServer({ root: process.cwd(), appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const { HeadlessContractSim, CONTRACT_ADMISSION_EXEMPTIONS } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
const contracts = requestedContracts.length ? requestedContracts : Object.keys(CONTRACT_ADMISSION_EXEMPTIONS).sort();
const positions = [{ x: 0, z: 13 }, { x: 3, z: 12 }, { x: -3, z: 12 }];
const first = new Map();
for (const contractId of contracts) for (const policy of ['idle', 'scripted']) for (const suffix of ['01', '02']) for (let repeat = 1; repeat <= 2; repeat += 1) {
  const sim = new HeadlessContractSim({ contractId, seed: `${contractId}-${suffix}`, admissionProbe: true });
  let turn = sim.currentTurn();
  const boat = turn.view.now.deepwater; let error;
  if (boat && policy === 'scripted') sim.submitOrders([{ verb: 'BOAT_BUILD', padId: boat.pads[0].id, buildingId: 'turret' },
    { verb: 'REANCHOR', anchorId: boat.anchors.find(({ id }) => id !== boat.anchor.id).id }]);
  for (let turns = 0; !turn.terminal && turns < 100; turns += 1) {
    const now = turn.view.now; const orders = policy === 'idle' ? [] : now.pendingOffer?.[0] ? [{ verb: 'PICK_UPGRADE', id: now.pendingOffer[0].id }]
      : [...(now.atomic?.wrangle.active.some(({ state }) => state === 'exhausted') ? [{ verb: 'CAPTURE' }] : []),
        ...positions.slice(now.works.byKind.sentry_beacon ?? 0).map((where, index) => ({ verb: 'BUILD', what: 'sentry_beacon', where, when: { goldGte: [25, 35, 45][index] } })),
        ...now.seams.filter(({ active, remaining }) => active && remaining > 0).map(({ id }) => ({ verb: 'HARVEST', seam: id })),
        { verb: 'MOVE_HERO', pos: { x: 0, z: 12 } }];
    sim.submitOrders(orders.slice(0, 32)); try { turn = sim.advanceToTurn(); } catch (cause) { error = cause.message; break; }
  }
  const outcome = turn.terminal ? sim.outcome() : null; const alive = turn.view.now.threats.alive; const row = {
    contractId, policy, seed: `${contractId}-${suffix}`, repeat, terminal: turn.terminal, secured: outcome?.secured ?? false,
    lawful: outcome?.secured === true && !(contractId === 'e6-showroom' && alive >= 60), wave: outcome?.waves ?? turn.view.now.wave,
    alive, captured: turn.view.now.atomic?.wrangle.pen.total ?? 0, hash: outcome?.eventLogHash ?? sim.tickHash(Math.round(sim.timeAlive * 30)), error };
  const key = `${contractId}-${policy}-${suffix}`; if (first.has(key)) assert.deepEqual({ ...row, repeat: 1 }, first.get(key)); else first.set(key, row);
  assert.equal(row.lawful, false);
  console.log(JSON.stringify(row));
} await vite.close();
