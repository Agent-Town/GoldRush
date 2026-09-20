// s1225 — two follow-ups to the staleness measure.
//
// (1) THE DENOMINATOR of that "0 stale leaves". A negative result is only as strong as the
//     number of leaves the probe could actually see: how many leaves matched a LANDED
//     done-move at all?  If that is tiny, "0" proves little.
// (2) THE SHARPER QUESTION. The board is DRY this fire — six empty queues, nothing in
//     tasks/running/. So any leaf at status "building" claims work is in progress that
//     provably is not, and any "queued" leaf claims a queue slot that is empty.
//     That is a staleness shape the first probe could not see, because it keys on done-moves
//     and these leaves have none.
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const goals = JSON.parse(fs.readFileSync(path.join(root, 'tasks/goals.json'), 'utf8'));

const leaves = [];
for (const goal of goals.goals) {
  for (const leaf of goal.tasks ?? []) leaves.push({ ...leaf, path: goal.id });
  for (const sub of goal.subgoals ?? []) {
    for (const leaf of sub.tasks ?? []) leaves.push({ ...leaf, path: `${goal.id}/${sub.id}` });
  }
}

const doneFiles = fs.readdirSync(path.join(root, 'tasks/done'));
const LANDED = /^(drained|shipped)-/;

// (1) denominator
const withTaskFile = leaves.filter((l) => l.taskFile);
const withAnyMove = withTaskFile.filter((l) => doneFiles.some((f) => f.endsWith(`-${l.taskFile}`)));
const withLandedMove = withTaskFile.filter((l) =>
  doneFiles.some((f) => f.endsWith(`-${l.taskFile}`) && LANDED.test(f)));

console.log('=== (1) DENOMINATOR of the "0 stale leaves" result ===');
console.log(`leaves total ................... ${leaves.length}`);
console.log(`  with a taskFile .............. ${withTaskFile.length}`);
console.log(`  with ANY done-move ........... ${withAnyMove.length}`);
console.log(`  with a LANDED done-move ...... ${withLandedMove.length}  <-- the real denominator`);
const terminal = new Set(['merged', 'shipped', 'superseded', 'verified-by-owner']);
console.log(`  ...of which terminal-status .. ${withLandedMove.filter((l) => terminal.has(l.status)).length}`);

// (2) in-flight claims vs the actual board
const queueDir = path.join(root, 'tasks/queue');
const queued = [];
for (const slot of fs.readdirSync(queueDir)) {
  const p = path.join(queueDir, slot);
  if (!fs.statSync(p).isDirectory()) continue;
  for (const f of fs.readdirSync(p)) queued.push(`${slot}/${f}`);
}
const runningDir = path.join(root, 'tasks/running');
const running = fs.existsSync(runningDir) ? fs.readdirSync(runningDir) : [];

console.log('\n=== (2) IN-FLIGHT CLAIMS vs THE ACTUAL BOARD ===');
console.log(`queue files on disk: ${queued.length} ${JSON.stringify(queued)}`);
console.log(`running files on disk: ${running.length} ${JSON.stringify(running)}`);

const inflight = leaves.filter((l) => l.status === 'building' || l.status === 'queued');
console.log(`\nleaves claiming in-flight (building|queued): ${inflight.length}`);
for (const l of inflight) {
  const move = doneFiles.filter((f) => l.taskFile && f.endsWith(`-${l.taskFile}`));
  const inQueue = queued.some((q) => l.taskFile && q.endsWith(l.taskFile));
  const inRunning = running.some((r) => l.taskFile && r.endsWith(l.taskFile));
  console.log(`  ${l.id}  status=${l.status}`);
  console.log(`      path: ${l.path}`);
  console.log(`      taskFile: ${l.taskFile ?? '—'}`);
  console.log(`      on queue: ${inQueue}   in running/: ${inRunning}   done-moves: ${move.length ? move.join(', ') : 'NONE'}`);
}

fs.writeFileSync(
  path.join(root, 'logs/session-scratch/s1225-goal-leaf-inflight.json'),
  JSON.stringify({
    denominator: {
      leaves: leaves.length,
      withTaskFile: withTaskFile.length,
      withAnyMove: withAnyMove.length,
      withLandedMove: withLandedMove.length,
    },
    board: { queued, running },
    inflight: inflight.map((l) => ({ id: l.id, status: l.status, taskFile: l.taskFile ?? null, path: l.path })),
  }, null, 2),
);
