/**
 * s1173-guard-matrix.mjs — measure the coverage matrix of the two guards that
 * gate task masters, using EACH GUARD'S OWN definitions (copied, not paraphrased).
 *
 *   task-guard-audit  "invisible" = neverRan AND noHeader AND noGoalLeaf   (a 3-way AND)
 *   drain-block-check "verdict"   = goals.json leaf keyed by taskFile      (goal leaf only)
 *
 * The question s1172's lesson raises: the audit reports 0 because its AND is
 * narrow. How many masters carry a machine-readable DO-NOT-QUEUE header but no
 * goal leaf -- i.e. are VISIBLE to the audit and UNKNOWN to the §3.0 drain gate?
 */
import fs from 'node:fs';
import path from 'node:path';

const TASKS_DIR = 'tasks';
const GUARD_HEADER = /^>\s*(⛔|⚠️|⚠|⏸️|⏸)/;
const readdirSafe = (d) => (fs.existsSync(d) ? fs.readdirSync(d) : []);

const masters = readdirSafe(TASKS_DIR).filter((f) => f.endsWith('.md') && f !== 'BACKLOG.md');
const moves = [
  ...readdirSafe(path.join(TASKS_DIR, 'done')),
  ...readdirSafe(path.join(TASKS_DIR, 'failed')),
  ...readdirSafe(path.join(TASKS_DIR, 'running')),
];

const goalLeaf = new Map();
const walk = (node) => {
  if (!node) return;
  if (Array.isArray(node)) return void node.forEach(walk);
  if (typeof node !== 'object') return;
  if (typeof node.taskFile === 'string') {
    goalLeaf.set(node.taskFile.replace(/^tasks\//, ''), node);
  }
  walk(node.subgoals);
  walk(node.tasks);
  walk(node.goals);
};
walk(JSON.parse(fs.readFileSync(path.join(TASKS_DIR, 'goals.json'), 'utf8')));

const everRan = (m) => {
  const stem = m.replace(/\.md$/, '');
  const deprefixed = stem.replace(/^lane-/, '');
  return moves.some((mv) => mv.includes(stem) || mv.includes(deprefixed));
};
const headerOf = (m) => {
  try {
    return fs.readFileSync(path.join(TASKS_DIR, m), 'utf8').split('\n', 1)[0];
  } catch {
    return '';
  }
};

const rows = masters.map((m) => {
  const h = headerOf(m);
  const leaf = goalLeaf.get(m);
  return {
    m,
    ran: everRan(m),
    header: GUARD_HEADER.test(h),
    headerText: h.slice(0, 120),
    leaf: !!leaf,
    status: leaf?.status ?? null,
  };
});

const n = (f) => rows.filter(f).length;
console.log(`masters=${masters.length}  goalLeaves(total keys)=${goalLeaf.size}`);
console.log(`  ran=${n((r) => r.ran)}  header=${n((r) => r.header)}  leaf=${n((r) => r.leaf)}`);
console.log(`  audit-invisible (ran=0,header=0,leaf=0) = ${n((r) => !r.ran && !r.header && !r.leaf)}`);
console.log(`  NO GOAL LEAF at all (drain-block-check => UNKNOWN) = ${n((r) => !r.leaf)}`);
console.log('');

// The cell the audit calls VISIBLE and the drain gate calls UNKNOWN.
const headerNoLeaf = rows.filter((r) => r.header && !r.leaf);
console.log(`CELL A — header present, NO goal leaf  (audit: visible | §3.0: UNKNOWN) = ${headerNoLeaf.length}`);

// Bucket cell A by the header's own marker.
const bucket = new Map();
for (const r of headerNoLeaf) {
  const kind = /⛔/.test(r.headerText) ? '⛔' : /⏸/.test(r.headerText) ? '⏸️' : '⚠️';
  if (!bucket.has(kind)) bucket.set(kind, []);
  bucket.get(kind).push(r);
}
for (const [k, v] of bucket) console.log(`    ${k} ${v.length}`);
console.log('');

// Which of those headers assert an OWNER gate (the class status:"blocked" models)?
const OWNER = /owner|robin|design fork|ratif|GATE: owner|not fire-authored|spends money/i;
const ownerish = headerNoLeaf.filter((r) => OWNER.test(r.headerText));
console.log(`CELL A rows whose HEADER TEXT names an owner gate = ${ownerish.length}`);
ownerish.forEach((r) => console.log(`    ${r.m}\n      ${r.headerText}`));
console.log('');

// And the inverse cell: a leaf exists and says blocked.
const blocked = rows.filter((r) => r.status === 'blocked');
console.log(`CELL B — goal leaf status="blocked" (the only thing §3.0 stops on) = ${blocked.length}`);
blocked.forEach((r) => console.log(`    ${r.m}  header=${r.header}`));
