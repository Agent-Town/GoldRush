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
// goal leaves with `status:"queued"` — i.e. masters the board has committed to dispatching. It does
// NOT sweep `tasks/*.md`: there are 828 top-level masters, 107 of them with no dispatch trace, and
// the overwhelming majority are legacy files from July that nobody will queue again. Reddening the
// battery on those would be a false alarm every run, and a guard that cries wolf is deleted.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';

// The cure is identified by its finding id, not by matching prose — prose gets reworded, and a
// reworded-but-present exception must not red.
const CURE_MARKER = /F-1407-1|FACTORY-CHURN EXCEPTION/;

function queuedLeaves() {
  const g = JSON.parse(readFileSync('tasks/goals.json', 'utf8'));
  const out = [];
  (function walk(n) {
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n && typeof n === 'object') {
      if (n.status === 'queued' && typeof n.taskFile === 'string') out.push(n);
      Object.values(n).forEach((v) => { if (v && typeof v === 'object') walk(v); });
    }
  })(g.goals);
  return out;
}

test('every banked (queued) master carries the current main-slot pre-flight exception', () => {
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
