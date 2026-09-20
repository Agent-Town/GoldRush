import fs from 'node:fs';

// leaf: stopped -> queued (re-dispatched onto a verified-fresh lane)
const gp = 'tasks/goals.json';
const raw = fs.readFileSync(gp, 'utf8');
const g = JSON.parse(raw);
let hit = false;
const walk = (n) => {
  if (n.id === 'f1319-3-terrain-seed-per-sample-url-parse') {
    n.status = 'queued';
    n.reason = "Authored s1320 from a --cpu-prof attribution + 5 measured arms. First dispatch (20260801-080403) was CANCELLED by its own scope-1 measure-first gate after 53,043 tokens with ZERO source changes, because lane/perf was 153 commits behind main and gr-sim rejected e1-night-shift — an AUTHOR error (s1320), not a runner error, and the instrument gap is F-1320-2 (lane-usable's USABLE means safe+clean, NOT fresh). Lane tip archived to archive/lane-perf-s1320-cancel-report; refreshed via the janitor refresh-lane op IN THE SAME FIRE (lane/perf..main now 0). RE-QUEUED s1320 only after proving freshness explicitly: `git merge-base --is-ancestor 07854e6b lane/perf` passes, i.e. the lane now contains the AP-07 night-shift merge the task depends on.";
    hit = true;
  }
  [...(n.subgoals || []), ...(n.tasks || [])].forEach(walk);
};
(g.goals || [g]).forEach(walk);
if (!hit) throw new Error('leaf not found');
fs.writeFileSync(gp, `${JSON.stringify(g, null, 2)}${raw.endsWith('\n') ? '\n' : ''}`);
console.log('leaf -> queued (fresh lane, proven)');

// STATUS line-1: the refresh landed in-fire, so correct the two places that said otherwise
const p = 'STATUS.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
let l0 = lines[0];

l0 = l0.replace(
  "⛔ **I deliberately did NOT re-queue it this fire:** the runner dispatches *before* it runs janitor ops in the same loop, so re-queuing now would aim it at the stale lane a second time — that is the next fire's first act, **after** verifying `lane/perf` contains `07854e6b`.",
  "✅ **AND THE REFRESH LANDED INSIDE THIS FIRE, SO I RE-QUEUED IT — but only after proving freshness with the check `lane-usable` does not make:** the janitor executed the req on its next loop, `lane/perf..main` went **153 → 0**, and `git merge-base --is-ancestor 07854e6b lane/perf` **passes**, i.e. the lane demonstrably contains the AP-07 merge the task depends on. `lane-usable lane-d` re-run immediately before the second `cp` → **USABLE**, `ahead=0 tracked-dirt=0`. Leaf flipped `queued → stopped → queued`, each step with its real reason. **The re-dispatch is lawful under §7.5 because the premise CHANGED** — a 153-commit-fresher lane — rather than being an identical retry.",
);
l0 = l0.replace(
  "**(1) FIRST ACT: verify `lane/perf` now contains `07854e6b` (the janitor refresh req is dropped), then re-queue `lane-d-f1319-3-terrain-seed-per-sample-url-parse.md` — it is the board's best-evidenced work**",
  "**(1) `lane-d` is REFRESHED AND RE-ARMED — the master is queued on a lane proven to contain `07854e6b`, and it is the board's best-evidenced work.** Its first dispatch cancelled itself lawfully; **if the second one cancels too, believe it and read the report rather than re-queuing a third time**",
);

lines[0] = l0;
fs.writeFileSync(p, lines.join('\n'));
console.log('line-1 finalised, chars:', l0.length);
