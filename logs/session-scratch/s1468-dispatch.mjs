// s1468 F-1424-3 dispatch order: refresh the lane AFTER the master's commit, prove the
// citation key IN THE LANE, then cp. Keys live in a FILE, never a shell-quoted probe.
import { spawnSync } from 'node:child_process';
import { readFileSync, copyFileSync } from 'node:fs';

const LANE = 'worktrees/lane-a';
const KEY = 'rather than treating generic combat as Moth Season';
const CENSUS = 'docs/bench/e3-readiness-census.md';
const MASTER = 'tasks/lane-e3-moth-socket.md';

function git(args, cwd) {
  const r = spawnSync('git', args, { encoding: 'utf8', cwd });
  console.log(`$ git ${args.join(' ')} -> rc=${r.status}`);
  const o = ((r.stdout || '') + (r.stderr || '')).trim();
  if (o) console.log('  ' + o.slice(0, 400).replace(/\n/g, '\n  '));
  return r;
}

// STEP 1 — refresh lane-a to the commit that CARRIES the master
git(['fetch', 'origin', 'main'], LANE);
git(['checkout', '-B', 'lane/a', 'origin/main'], LANE);

// STEP 2 — prove the key in the lane (it was already proved =1 on main)
function count(file) {
  return readFileSync(file, 'utf8').split('\n').filter(l => l.includes(KEY)).length;
}
const onMain = count(CENSUS);
const inLane = count(`${LANE}/${CENSUS}`);
console.log(`\ncitation key: main=${onMain}  lane=${inLane}  (both must be 1)`);

// safe-dupe probe must still read 0 in the lane
const dupe = readFileSync(`${LANE}/src/sim/HeadlessContractSim.ts`, 'utf8')
  .split('\n').filter(l => l.includes('MothSwarm')).length;
console.log(`safe-dupe MothSwarm in lane HeadlessContractSim.ts: ${dupe} (must be 0)`);

// does the lane carry the master itself?
let hasMaster = true;
try { readFileSync(`${LANE}/${MASTER}`, 'utf8'); } catch { hasMaster = false; }
console.log(`lane carries the master file: ${hasMaster}`);

if (onMain !== 1 || inLane !== 1 || dupe !== 0) {
  console.log('\nABORT — preconditions not met, NOT dispatching.');
  process.exit(1);
}
console.log('\nPRECONDITIONS OK — safe to cp into tasks/queue/lane-a/');
