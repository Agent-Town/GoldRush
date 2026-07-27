/**
 * task-guard-audit.mjs — fail when a NEW task master goes invisible.
 *
 * WHY THIS EXISTS (F-1130-4, F-1131-2, F-1131-6):
 * s1074 swept `tasks/DRAFT-*` and gave six masters a do-not-queue header. That was
 * correct on the day it ran. By s1130 there were TEN drafts and four carried no
 * guard at all -- one of them headed "Release-blocking". s1130 swept again, wider.
 * By s1131 the same shape had produced 53 more.
 *
 * The lesson those three fires converged on is that A ONE-TIME SWEEP IS NOT A
 * GUARD, IT IS A SNAPSHOT, and the board keeps moving underneath it. So this file
 * is deliberately NOT another sweep. It is a RATCHET: it records today's known
 * invisible set as a baseline and fails only when the set GROWS. Clearing the
 * backlog is optional and incremental; letting a NEW one appear unnoticed is not.
 *
 * "Invisible" means all three at once -- the shape that is unreachable from either
 * place a fire actually looks:
 *   1. never completed a run  (no move in tasks/done | failed | running)
 *   2. carries no status header (no leading `> ⛔ / ⚠️ / ⏸️` line)
 *   3. has no leaf in tasks/goals.json
 * A master like that reads as live unqueued work to every fire that lists tasks/,
 * which is Mistake #8's on-ramp (the 824k-token flail).
 *
 * NAME MATCHING, and why it is deliberately loose (F-1131-6):
 * the runner routinely drops a `lane-` prefix when it moves a file --
 * `tasks/lane-t7-ceremony.md` was moved as `shipped-s896-t7-ceremony-d976837f.md`.
 * A strict match called 108 masters never-run; trying the de-prefixed stem too
 * gives 87, recovering 21 that had in fact run. An over-strict matcher inflates
 * the alarm, and an inflated alarm is one people learn to ignore.
 *
 * Usage:
 *   node scripts/task-guard-audit.mjs            # audit; rc=1 if the set grew
 *   node scripts/task-guard-audit.mjs --update   # re-baseline (a deliberate act)
 *   node scripts/task-guard-audit.mjs --list     # print the whole invisible set
 */
import fs from 'node:fs';
import path from 'node:path';

const TASKS_DIR = 'tasks';
const BASELINE = path.join(TASKS_DIR, 'guard-audit-baseline.json');
const GUARD_HEADER = /^>\s*(⛔|⚠️|⚠|⏸️|⏸)/;

const readdirSafe = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir) : []);

// WHERE THIS CAN HONESTLY BE RUN (F-1151-1, s1151).
// "Has this master ever run?" is answered by listing tasks/done|failed|running -- and per the
// attended-coexistence law those move-directories are ALWAYS UNTRACKED, so they exist in full
// only in the MAIN checkout. Run from a linked lane worktree, this audit therefore sees a small
// fraction of the moves and reports hundreds of masters as never-run. Measured s1151: main had
// 816 done-moves and reported 0 invisible (rc=0), while worktrees/lane-c had 158 and reported
// 346 NEW invisible (rc=1) off the same baseline and the same commit.
// That red is deterministic for EVERY lane runner that runs the full battery, and it is the
// worst kind: plausible, self-describing, and wrong about its own cause -- the s1150 runner
// reported "guards 7/8, unclassified task masters" and sent the next fire hunting a board
// problem that did not exist. A guard that cannot compute its answer where it is run must
// REFUSE to report, not print a number. Skipping keeps the lane battery honest; the ratchet
// itself is a main-checkout duty, and fires run on main.
const gitEntry = fs.existsSync('.git') ? fs.statSync('.git') : null;
if (!gitEntry || gitEntry.isFile()) {
  const why = gitEntry
    ? 'a linked worktree (.git is a file)'
    : 'not a checkout root (no .git here)';
  console.log(`task-guard-audit: SKIPPED -- cwd is ${why}.`);
  console.log(
    '  tasks/done|failed|running are untracked and live only in the main checkout, so the\n' +
      '  invisible set cannot be computed here. Reporting a number from this cwd would be a\n' +
      '  false red (F-1151-1). Run this guard from the main checkout to get a real verdict.',
  );
  process.exit(0);
}

const masters = readdirSafe(TASKS_DIR).filter(
  (f) => f.endsWith('.md') && f !== 'BACKLOG.md',
);

const moves = [
  ...readdirSafe(path.join(TASKS_DIR, 'done')),
  ...readdirSafe(path.join(TASKS_DIR, 'failed')),
  ...readdirSafe(path.join(TASKS_DIR, 'running')),
];

// Every taskFile referenced anywhere in the goal tree. Leaves carry BOTH
// `subgoals` and `tasks` -- walking only the first is the F-1123-4 defect that
// makes dashboard-gen.sh render 312 of 371 leaves, so walk both.
const goalLeaves = new Set();
const walk = (node) => {
  if (!node) return;
  if (Array.isArray(node)) return void node.forEach(walk);
  if (typeof node !== 'object') return;
  if (typeof node.taskFile === 'string') {
    goalLeaves.add(node.taskFile.replace(/^tasks\//, ''));
  }
  walk(node.subgoals);
  walk(node.tasks);
  walk(node.goals);
};
try {
  walk(JSON.parse(fs.readFileSync(path.join(TASKS_DIR, 'goals.json'), 'utf8')));
} catch (error) {
  console.error(`task-guard-audit: cannot read tasks/goals.json -- ${error.message}`);
  process.exit(2);
}

const everRan = (master) => {
  const stem = master.replace(/\.md$/, '');
  const deprefixed = stem.replace(/^lane-/, '');
  return moves.some((move) => move.includes(stem) || move.includes(deprefixed));
};

const isGuarded = (master) => {
  try {
    const first = fs.readFileSync(path.join(TASKS_DIR, master), 'utf8').split('\n', 1)[0];
    return GUARD_HEADER.test(first);
  } catch {
    return false;
  }
};

const invisible = masters
  .filter((m) => !everRan(m))
  .filter((m) => !isGuarded(m))
  .filter((m) => !goalLeaves.has(m))
  .sort();

if (process.argv.includes('--update')) {
  fs.writeFileSync(
    BASELINE,
    `${JSON.stringify({ note: 'Known-invisible task masters. Grows only by a deliberate --update; see scripts/task-guard-audit.mjs.', count: invisible.length, masters: invisible }, null, 2)}\n`,
  );
  console.log(`task-guard-audit: baseline re-written with ${invisible.length} known-invisible masters.`);
  process.exit(0);
}

let baseline = [];
if (fs.existsSync(BASELINE)) {
  try {
    baseline = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).masters ?? [];
  } catch (error) {
    console.error(`task-guard-audit: baseline unreadable -- ${error.message}`);
    process.exit(2);
  }
} else {
  console.error(`task-guard-audit: no baseline at ${BASELINE}. Run with --update once to create it.`);
  process.exit(2);
}

const known = new Set(baseline);
const appeared = invisible.filter((m) => !known.has(m));
const cleared = baseline.filter((m) => !invisible.includes(m));

console.log(`task-guard-audit: ${masters.length} masters, ${invisible.length} invisible (baseline ${baseline.length}).`);
if (cleared.length) {
  console.log(`  ✅ ${cleared.length} cleared since the baseline: ${cleared.slice(0, 8).join(', ')}${cleared.length > 8 ? ', …' : ''}`);
  console.log('     (run --update to bank that progress so it cannot silently regress)');
}
if (process.argv.includes('--list')) {
  console.log('\n  --- full invisible set ---');
  invisible.forEach((m) => console.log(`  ${known.has(m) ? ' ' : 'NEW'} ${m}`));
}

if (appeared.length === 0) {
  console.log('  ✅ no NEW invisible master. rc=0');
  process.exit(0);
}

console.log(`\n  ❌ ${appeared.length} NEW invisible master(s) -- never ran, no status header, no goal leaf:`);
appeared.forEach((m) => console.log(`     tasks/${m}`));
console.log(
  '\n  Each reads as live unqueued work to every fire that lists tasks/ (Mistake #8).\n' +
    '  Fix by giving it its true disposition -- content-probe main at a datum the master\n' +
    '  names, then prepend one line: "> ⛔ SHIPPED — DO NOT QUEUE (…proof…)" or ⚠️ / ⏸️.\n' +
    '  If it is genuinely live work, add its goal leaf instead (Goal Registration Law).',
);
process.exit(1);
