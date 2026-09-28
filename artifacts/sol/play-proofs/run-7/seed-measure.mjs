// Measures whether a real River completion (waves 0) survives Scoreboard.trimScores on (a) the run-6 driver's seed
// (driver.ts:72-75: every board contract seeded at waves 30, the contract under test at waves 1) plus the Last Claim
// prelude's own secured row, and (b) a realistic profile that has only the earned Last Claim secure.
import { createRequire } from 'node:module'; import { pathToFileURL } from 'node:url';
const req = createRequire(process.cwd() + '/package.json');
const { createServer } = await import(pathToFileURL(req.resolve('vite')).href);
const root = process.argv[2] ?? process.cwd();
const store = new Map();
const localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => void store.set(k, String(v)), removeItem: (k) => void store.delete(k), key: (i) => [...store.keys()][i] ?? null, get length() { return store.size; } };
const location = new URL('http://gr-sim.local/');
globalThis.location = location; globalThis.window = { location, localStorage }; globalThis.localStorage = localStorage;
const vite = await createServer({ root, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, watch: null } });
try {
  const { recordScore, loadScores } = await vite.ssrLoadModule('/src/game/Scoreboard.ts');
  const { SCOREBOARD_KEY } = await vite.ssrLoadModule('/src/game/ProfileStorage.ts');
  const { listBoardContracts } = await vite.ssrLoadModule('/src/meta/ContractFamilies.ts');
  const board = listBoardContracts();
  const river = { waves: 0, kills: 0, gold: 5, timeAlive: 4.9, at: 1_790_000_000_000, secured: true, secureWave: 0, deepestWave: 0, contractId: 'e10-river' };
  const prelude = { waves: 8, kills: 60, gold: 90, timeAlive: 240.07, at: 1_789_999_000_000, secured: true, secureWave: 8, deepestWave: 8, contractId: 'e10-last-claim' };
  const run = (label, seeded) => {
    store.clear();
    localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(seeded));
    recordScore(prelude);
    const beforeScores = loadScores();
    const beforeAts = new Set(beforeScores.map(s => s.at));
    const before = beforeScores.length;
    const after = recordScore(river);
    const kept = after.find((s) => s.contractId === 'e10-river' && !beforeAts.has(s.at) && (s.secured || s.completed));
    const riverRows = after.filter((s) => s.contractId === 'e10-river').map((s) => ({ waves: s.waves, at: s.at }));
    console.log(JSON.stringify({ label, seededRows: seeded.length, rowsBeforeRiver: before, rowsAfter: after.length, riverCompletionKept: Boolean(kept), riverRows }));
  };
  // (a) the driver's seed, verbatim shape: driver.ts seedEntries(underTest = 'e10-last-claim')
  const driverSeed = board.map((entry, index) => entry.id === 'e10-last-claim'
    ? { kills: 0, gold: 0, timeAlive: 1, at: index + 1, waves: 1, secured: true, contractId: entry.id, profileName: 'Robin' }
    : { kills: 40, gold: 400, timeAlive: 600, at: index + 1, waves: 30, secured: true, contractId: entry.id, profileName: 'Robin' });
  run('run-6 driver seed (board contracts incl. e10-river at waves 30)', driverSeed);
  // (b) realistic: nothing seeded but the earned lever
  run('realistic profile (only the earned Last Claim secure)', []);
  // (c) the driver's seed without its fabricated e10-river row
  run('run-6 driver seed minus its e10-river row', driverSeed.filter((s) => s.contractId !== 'e10-river'));
  console.log(JSON.stringify({ boardContracts: board.length, boardHasRiver: board.some((c) => c.id === 'e10-river') }));
} finally { await vite.close(); }
