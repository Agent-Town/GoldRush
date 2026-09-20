import { createServer } from 'vite';
const root = process.env.GR_ROOT;
globalThis.location = new URL('http://x.local/?debug&contract=e3-moth-season&seed=e3-moth-season-01');
globalThis.window = { location: globalThis.location };
const log = console.log; console.log = console.info = console.debug = () => undefined;
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { HeadlessContractSim } = await vite.ssrLoadModule('/src/sim/HeadlessContractSim.ts');
  const { Balance } = await vite.ssrLoadModule('/src/game/Balance.ts');
  Object.assign(Balance.sparkRig, { damage: 0, fireRate: 1, range: 300, boltSpeed: 30, boltLife: 5 });
  const sim = new HeadlessContractSim({ contractId: 'e3-moth-season', seed: 'e3-moth-season-01' });
  sim.hero.applyStats(100000, 1); sim.hero.heal(100000);
  log('beacon', sim.build.placeFree('sentry_beacon', { x: 0, z: -14 }, 0));
  log('lantern', sim.build.placeFree('lantern_post', { x: -8, z: 12 }, 0));
  log('decoy', sim.build.placeFree('decoy_shed', { x: 0, z: 0 }, 0));
  log('hp', JSON.stringify(sim.build.diagnostics.hp));
  let turn = sim.advanceToTurn();
  while (!turn.terminal && sim.mothSwarm.diagnostics().alive === 0) turn = sim.advanceToTurn();
  log('hp@moths', JSON.stringify(sim.build.diagnostics.hp));
  log('light', JSON.stringify(sim.lightField.diagnostics()));
  log('sources', JSON.stringify(sim.lightField.snapshot().sources.map(s => `${s.id}:${s.kind}`)));
} finally { await vite.close(); }
