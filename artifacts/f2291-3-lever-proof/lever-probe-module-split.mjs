// F-2289-1 LEVER PROBE — can a Vite SSR module re-instantiation produce the
// silent empty-log fallback while a live executor is still bound?
// Proves (or refutes) the arm the priced cure's regression test depends on.
//
// snapshotStandingOrders() is `installedExecutor?.snapshot() ?? {…empty…}`
// (src/agent/StandingOrders.ts:477-478), so a duck-typed stub exercises the exact
// branch without needing the real executor's constructor state.
import { createServer } from '/Users/robin/Claude/Projects/Gold Rush/node_modules/vite/dist/node/index.js';
import { fileURLToPath } from 'node:url';

const REPO = '/Users/robin/Claude/Projects/Gold Rush';
const vite = await createServer({ root: REPO, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } });
const SO = '/src/agent/StandingOrders.ts';
const line = (k, v) => console.log(String(k).padEnd(52), v);

const first = await vite.ssrLoadModule(SO);
const rt = await vite.ssrLoadModule('/src/game/RunTape.ts');
const hashOf = (v) => rt.agentOrdersEventLogHash(v);

const EMPTY_REF = hashOf({ log: [] });
line('empty-fallback reference hash', EMPTY_REF);

// A stub executor carrying REAL orders_replaced events — the live-sim condition.
const LIVE_LOG = [
  { at: 1000, seq: 1, type: 'orders_replaced', orders: [{ verb: 'HOLD', pos: { x: 0, z: 12 } }] },
  { at: 2000, seq: 2, type: 'orders_replaced', orders: [{ verb: 'MOVE_TO', pos: { x: 4, z: 9 } }] },
];
const stub = { snapshot: () => ({ needsRider: false, orders: [], log: LIVE_LOG }) };

line('\nbound, ZERO submissions -> hash', hashOf({ log: [] }));
line('  indistinguishable from fallback?', hashOf({ log: [] }) === EMPTY_REF);

first.bindStandingOrders(stub);
const live = first.snapshotStandingOrders();
const liveHash = hashOf(live);
line('\nbound WITH submissions -> log entries', live.log.length);
line('bound WITH submissions -> hash', liveHash);
line('  distinct from fallback?', liveHash !== EMPTY_REF);

// CONTROL: re-load with NO invalidation must still see the bound executor.
const same = await vite.ssrLoadModule(SO);
const sameHash = hashOf(same.snapshotStandingOrders());
line('\nCONTROL re-load, no invalidation: same obj?', same === first);
line('CONTROL hash (must equal live)', sameHash);
line('  control valid (still sees executor)?', sameHash === liveHash);

// ARM: invalidate the module in vite's graph, then load again.
const id = fileURLToPath(new URL('src/agent/StandingOrders.ts', `file://${REPO}/`));
const mod = vite.moduleGraph.getModuleById(id);
line('\nmodule found in graph?', Boolean(mod));
if (mod) vite.moduleGraph.invalidateModule(mod);

const after = await vite.ssrLoadModule(SO);
const afterSnap = after.snapshotStandingOrders();
const afterHash = hashOf(afterSnap);
line('after invalidation: fresh module object?', after !== first);
line('after invalidation: log entries', afterSnap.log.length);
line('after invalidation: hash', afterHash);

const armed = after !== first && afterHash === EMPTY_REF && liveHash !== EMPTY_REF && sameHash === liveHash;
console.log('\n==================================================');
console.log('LEVER ARMED:', armed);
console.log('  live (bound)      :', liveHash, `${live.log.length} entries`);
console.log('  after invalidation:', afterHash, `${afterSnap.log.length} entries`);
console.log('  original module still bound:', hashOf(first.snapshotStandingOrders()) === liveHash);
console.log('==================================================');

await vite.close();
