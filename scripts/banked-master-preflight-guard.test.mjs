// F-1408-1 (s1408) — GUARD: a master that is BANKED (registered `queued`, not yet dispatched)
// must carry the CURRENT main-slot pre-flight, not the one that was current when it was authored.
//
// WHY THIS EXISTS. s1407 diagnosed F-1407-1 precisely and cured it in the right place: the three
// pre-flight TEMPLATES in `.claude/skills/author-task/SKILL.md`. Its own closing lesson was "A CURE
// LANDS IN A SURFACE, NOT IN A CLASS". That is true, and it is also incomplete — a template only
// governs masters authored AFTER it. Every master already sitting on disk keeps the predicate it
// was born with, and nothing re-reads it.
//
// MEASURED s1408: `f1401-1-bound-the-headless-driver-and-rule-the-escort-bench.md` was authored
// s1401, registered `status:"queued"` in tasks/goals.json, and had never been dispatched — no run
// log, no done-move, no failed entry. Its pre-flight was the pre-cure wording ("If tracked dirt
// exists that belongs to no task, STOP and report"), and the factory's own `logs/**` churn is
// exactly that: tracked dirt belonging to no task, present on essentially every cycle. It was the
// next main-slot dispatch in the chain named by the s1407 handoff, so it would have stopped at its
// pre-flight for zero edits — the identical failure that had just cost 54,875 tokens on f1406-1
// dispatch 1, six fires after the template that caused it was fixed.
//
// The template fix was correct and is not being second-guessed. This guard covers the gap the
// template structurally cannot: the masters that were already written.
//
// DENOMINATOR, chosen deliberately and stated so it is not widened by accident. This checks ONLY
// goal leaves the board has authored a master for and not yet dispatched. It does NOT sweep
// `tasks/*.md`: there are 942 top-level masters and the overwhelming majority are legacy files from
// July that nobody will queue again. Reddening the battery on those would be a false alarm every
// run, and a guard that cries wolf is deleted.
//
// ⚠️ THE DENOMINATOR WAS `status:"queued"` ALONE UNTIL s1539, AND THAT MADE THIS GUARD VACUOUS IN
// EXACTLY THE STATE IT WAS BUILT FOR (F-1539-2). `queued` is TRANSIENT: a leaf carries it only from
// the moment a fire copies its master into `tasks/queue/<slot>/` until the runner dispatches it,
// which is usually a window of about a minute. A master that has been AUTHORED and is waiting for a
// refill — the literal meaning of "banked", and the entire population this guard is named for — is
// `planned`. Measured s1539 on a dry board: 0 leaves at `queued`, so this file's one test examined
// NOTHING and reported green, while four freshly banked masters sat on disk waiting for the 11:00
// CODEX-WALL refill. A guard is not green because the tree is clean; it is green because it looked.
// Widening to `planned` cost nothing and cured that: the four were re-checked and all four carry the
// F-1407-1 exception. Leaves without a `taskFile` (9 of 13 `planned` at s1539 — spec-level goals with
// no master written yet) are correctly skipped: there is no file to check.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// The cure is identified by its finding id, not by matching prose — prose gets reworded, and a
// reworded-but-present exception must not red.
const CURE_MARKER = /F-1407-1|FACTORY-CHURN EXCEPTION/;

// Authored-but-not-yet-dispatched. See the denominator note above for why BOTH words are required.
const BANKED = new Set(['planned', 'queued']);

function queuedLeaves() {
  const g = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
  const out = [];
  (function walk(n) {
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n && typeof n === 'object') {
      if (BANKED.has(n.status) && typeof n.taskFile === 'string') out.push(n);
      Object.values(n).forEach((v) => { if (v && typeof v === 'object') walk(v); });
    }
  })(g.goals);
  return out;
}

// Slot -> branch, resolved from git itself. NEVER from prose: F-1464-3 measured the old written
// mapping (lane-a=lane/m3, lane-b=lane/m4, lane-c=lane/e2-arsenal, lane-d=lane/perf) false while all
// eight branches still EXISTED, which is what makes a stale mapping dangerous — it resolves cleanly
// and answers about the wrong ref.
function slotToBranch() {
  const map = new Map();
  const out = execFileSync('git', ['worktree', 'list'], { encoding: 'utf8' });
  for (const line of out.split('\n')) {
    const m = line.match(/worktrees\/(lane-[a-d]|art)\s+\S+\s+\[([^\]]+)\]/);
    if (m) map.set(m[1], m[2]);
  }
  return map;
}

test('every banked master carries the current main-slot pre-flight exception', () => {
  const offenders = [];
  for (const leaf of queuedLeaves()) {
    const path = `tasks/${leaf.taskFile}`;
    // A queued leaf whose master is gone is a different defect (goal-tracker owns that question).
    if (!existsSync(path)) continue;
    const body = readFileSync(path, 'utf8');
    // Only masters that actually declare a pre-flight can be missing its exception.
    if (!/PRE-FLIGHT/i.test(body)) continue;
    if (!CURE_MARKER.test(body)) offenders.push(leaf.taskFile);
  }
  assert.deepEqual(
    offenders,
    [],
    `banked master(s) carry a pre-cure pre-flight and will STOP on the factory's own logs/artifacts churn `
    + `(F-1407-1). Retro-fit the FACTORY-CHURN EXCEPTION from .claude/skills/author-task/SKILL.md `
    + `before dispatching: ${offenders.join(', ')}`,
  );
});

// F-1539-1 (s1539) — GUARD: a banked lane master must reset the branch its OWN worktree is on.
//
// WHY THIS EXISTS. All four masters banked for the 11:00 CODEX-WALL refill named the wrong branch in
// their SAFE-DUPE pre-flight: the two LANE-D masters said `git checkout -B lane/perf main` and the
// two LANE-B masters `git checkout -B lane/agent main`, while `worktrees/lane-d` is on `lane/d` and
// `worktrees/lane-b` on `lane/b`. `lane/agent` did not exist at all — `-B` would have created it.
//
// WHY IT BITES, traced through the runner rather than assumed: `scripts/lane-runner-v3.sh` never
// names a branch when it persists lane output, it runs `( cd "$wd" && git add -A -- . … && git
// commit … )` — onto whatever branch the worktree is sitting on. Codex executes the pre-flight prose
// itself, so the reset moves the worktree off `lane/d` BEFORE the runner commits: the run lands on
// `lane/perf` while the done-move says `lane-d`, and the drain reads `lane/d` at ahead=0 and
// concludes the work never happened. Worse in pairs — both LANE-D masters reset the SAME wrong
// branch, so the second would `-B` force-reset it back to main over the first's undrained output
// (the F-1522-1 / Reset Massacre shape). The runner's own LANE-SAFETY probe cannot see this: it
// resolves the slot's branch correctly BEFORE dispatch, and Codex switches away afterwards.
//
// WHY A GUARD AND NOT JUST A TEMPLATE FIX: the retired mapping survives in 280 of 942 masters on
// disk (measured s1539), nearly all of them historical and CORRECT when authored. Those 280 are not
// a defect backlog and must NOT be "cured" — but they are 280 readable exemplars, so every master
// drafted from an old one inherits the stale line. That is precisely what happened, twice, in two
// attended commits 52 minutes apart. The template governs new prose; this covers what gets copied.
test('every banked lane master resets the branch its own worktree is actually on', () => {
  const branchOf = slotToBranch();
  const offenders = [];
  for (const leaf of queuedLeaves()) {
    const path = `tasks/${leaf.taskFile}`;
    if (!existsSync(path)) continue;
    const body = readFileSync(path, 'utf8');
    const slot = body.match(/worktrees\/(lane-[a-d])/)?.[1];
    const reset = body.match(/checkout -B (\S+) main/)?.[1];
    // Main-slot masters and masters with no reset line have nothing to get wrong here.
    if (!slot || !reset) continue;
    const expected = branchOf.get(slot);
    // A slot with no live worktree is a different defect; this guard will not invent a verdict.
    if (!expected) continue;
    if (reset !== expected) {
      offenders.push(`${leaf.taskFile} (${slot} is on ${expected}, master resets ${reset})`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `banked lane master(s) reset a branch their worktree is NOT on (F-1539-1). Codex runs the `
    + `pre-flight itself, so the run would be committed to the wrong branch and read as lost — and a `
    + `second master resetting the same wrong branch would destroy the first's undrained output. `
    + `Resolve the slot's branch from \`git worktree list\`, never from prose (F-1464-3): ${offenders.join('; ')}`,
  );
});
