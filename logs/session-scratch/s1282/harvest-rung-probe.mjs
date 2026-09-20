// s1282 — F-1282-1: did the owner's HARVEST = LEVEL 2 ruling actually reach behaviour?
//
// s1281 (F-1281-1) measured ONE gate: AgentConsentStore.snapshot(ceiling).abilities.auto_pan.allowed,
// which flips false -> true at ceiling 2 once auto_pan is declared level 2. True, and I re-verified it.
// But `permissionDenial` (src/agent/StandingOrders.ts:397) has TWO gates and the ability check is the
// SECOND one:
//     :402  const required = requiredLevel(order);
//     :403  if (required > level) return `${order.verb} requires permission rung ${required}; ...`;
//     :408  const ability = requiredAbility(order);            <-- s1281 measured from here down
// and `requiredLevel` (:345-348) still returns 3 for BUILD *and* HARVEST.
//
// So this probe asks the WHOLE question through the real entry point (StandingOrdersExecutor.submit),
// not one branch of it: at agent permission level 2, with every rung and every ability granted, is a
// HARVEST standing order ACCEPTED or PERMISSION_DENIED?
//
// Control: REPAIR_UNDER (requiredLevel 2) must be accepted at level 2 — proves the harness itself can
// produce an "ok" and that a denial is a property of the order, not of my stub.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';

const repo = process.cwd();
const dir = mkdtempSync(`${tmpdir()}/s1282-harvest-`);
const probe = `${dir}/probe.mjs`;

writeFileSync(
  probe,
  `
import { StandingOrdersExecutor } from ${JSON.stringify(`${repo}/src/agent/StandingOrders.ts`)};

// Everything a player could possibly grant, so the ONLY variable is the agent permission level.
const consent = {
  rungs: Object.fromEntries([0, 1, 2, 3].map((l) => [String(l), { earned: true, granted: true }])),
  abilities: Object.fromEntries(
    ['auto_collect', 'auto_repair', 'auto_pan', 'light_duty'].map((a) => [a, { allowed: true }]),
  ),
};

const state = () => ({
  runState: 'playing',
  timeAlive: 10,
  hp: 100, maxHp: 100, enemiesAlive: 0, wave: 1, nextWaveInSim: 999, spawnDisabled: true,
  economy: { gold: 9999 },
  ui: { agent: { consent } },
  harvest: { activeNodes: [{ id: 'seam-1', active: true, position: { x: 1, z: 1 } }] },
  build: { hp: [], sluicePositions: [] },
});

// Schemas read at source (validateOrder, src/agent/StandingOrders.ts:350-373), not guessed:
// REPAIR_UNDER = exactly {verb, pct}; BUILD = exactly {verb, what, where, when} with what a real
// BuildableId (src/game/buildables.ts:3-7,173).
const ORDERS = {
  HARVEST: { verb: 'HARVEST', seam: 'seam-1' },
  REPAIR_UNDER: { verb: 'REPAIR_UNDER', pct: 50 },
  BUILD: { verb: 'BUILD', what: 'palisade', where: { x: 2, z: 2 }, when: { goldGte: 10 } },
};

const out = {};
for (const [name, order] of Object.entries(ORDERS)) {
  out[name] = {};
  for (const level of [1, 2, 3]) {
    const exec = new StandingOrdersExecutor({ permissionLevel: () => level }, state, () => []);
    const r = exec.submit([order], 10);
    out[name]['level' + level] = r.ok ? 'ACCEPTED' : (r.reason + ': ' + (r.message ?? ''));
  }
}
console.log(JSON.stringify(out));
`,
);

const r = spawnSync(
  'node',
  ['--import', `${repo}/logs/session-scratch/s1282/ts-loader.mjs`, probe],
  { encoding: 'utf8', cwd: repo },
);
const line = (r.stdout || '').trim().split('\n').pop();
if (!line || !line.startsWith('{')) {
  console.error('PROBE FAILED — no JSON on stdout. This is a broken instrument, not a result.');
  console.error('stdout:', r.stdout);
  console.error('stderr:', (r.stderr || '').slice(0, 2000));
  process.exit(2);
}
const out = JSON.parse(line);

console.log('Driving the REAL entry point: StandingOrdersExecutor.submit()');
console.log('All rungs granted, all abilities granted, auto_pan declared level 2 (main, s1281 85bb1938).\n');
for (const [verb, rows] of Object.entries(out)) {
  console.log(`${verb}  (requiredLevel per StandingOrders.ts:345-348)`);
  for (const [lvl, verdict] of Object.entries(rows)) console.log(`    ${lvl}: ${verdict}`);
  console.log('');
}
const harvest2 = out.HARVEST?.level2 ?? '';
const repair2 = out.REPAIR_UNDER?.level2 ?? '';
console.log('CONTROL  REPAIR_UNDER @ level2 =', repair2, repair2 === 'ACCEPTED' ? '(harness can say yes)' : '(HARNESS SUSPECT)');
console.log('SUBJECT  HARVEST      @ level2 =', harvest2);
console.log(
  harvest2 === 'ACCEPTED'
    ? '=> The ruling REACHED behaviour: a level-2 Prospector can be given a HARVEST standing order.'
    : '=> The ruling did NOT reach behaviour: HARVEST is still refused at level 2 by the EARLIER rung gate.',
);
