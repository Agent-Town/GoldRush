import fs from 'node:fs';

const p = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(p, 'utf8').split('\n');
const anchor = lines.findIndex((l) => l.startsWith('🟡 **F-1323-5'));
if (anchor < 0) throw new Error('anchor row F-1323-5 not found');

const f1 =
  '🟡 **F-1324-1 (s1324, OPEN, QUEUED lane-c — THE CHARTER FUZZ RIG IS NOT TOTAL OVER ITS OWN MUTATION SPACE, AND THE RED IS MERGE-CAUSED, NOT PRE-EXISTING).** ' +
  'F-1323-2 named the right root and the wrong cause. ✓ **ROOT (confirmed twice):** `charterMutants` applies **1–2 independent mutations to the same charter** with no memory between steps, so when ' +
  '`illegal:missing-briefing` (which `delete`s `contract.briefing`) precedes `blank:briefing.goal` (which reads `contract.briefing.goals`), the read throws. s1323’s runner found this by obeying its ' +
  'scope-1 STOP — **that master worked exactly as designed and cost 82,560 tokens to buy a correct answer.** ' +
  '⚠️ **CORRECTION 1 — NOT PRE-EXISTING; CAUSED BY s1323’s OWN DRAIN 1.** Re-ran the identical control (`git checkout -f 1d0236c0`, clean detached worktree, rig unpatched): ' +
  '**`Total: 2462 tests in 348 files`, exit 0.** Current main: **`Total: 0 tests in 0 files`, exit 1.** The control tree is provably pre-merge — it collects **no `e1-drill-yard` mutants at all**, ' +
  'while main collects mutant 52 `[e1-drill-yard]`. 💡 **The mechanism is the part worth keeping:** template choice is `templates[floor(rng() * templates.length)]`, so adding a contract to an epoch ' +
  '**re-rolls the entire seeded stream** (mutant 12 = `[e1-night-shift]` at the control, `[e1-dry-gulch]` on main). The latent bug is old (`d8395e4d`, 2026-07-17); the red is hours old. ' +
  '**An old latent defect + a merge that changes a contract count = a NEW red, and “the rig is untouched by this merge” does not exonerate the merge.** ' +
  '⚠️ **CORRECTION 2 — SEVERITY WAS UNDERSTATED.** It is not “3 of 209 node-guard tests”: plain `npx playwright test --list` crashes too, so **both CP-02 specs contribute ZERO tests to every run ' +
  'and whole-suite collection on main is at zero, down from 2462.** ⓘ **Targeted runs are unaffected** (`safari-swap` still lists 4 tests) — which is exactly why every drain gate, which always names ' +
  'its specs, kept passing while the suite went dark. The `whole-suite-collection` guard is the only instrument that saw it, and it was right. ' +
  '⚠️ **CORRECTION 3 — the old master’s blanket ban on a `return \'noop\'` guard clause is too broad:** three sibling arms in that same 13-arm menu already use exactly that idiom, and `noop` mutants ' +
  'stamp fine. The real requirement is that the arm must still **FIRE** when a briefing exists — assert it bidirectionally rather than banning the shape. ' +
  '✓ **Instrumented the full 200-mutant stream in a throwaway worktree: exactly ONE crash exists** (index 41, `e1-drill-yard`, step 1 after `illegal:missing-briefing`); with it neutralised the boot ' +
  'spec collects **18 tests in 1 file**. So one arm fix clears it and no second STOP is waiting. GATE: queued lane-c as `lane-c-f1324-1-charter-fuzz-composition-totality.md`, which asks for ' +
  '**totality over the mutation space**, not a fix to index 41 — because any future contract addition can re-roll the stream again.';

const f2 =
  '🟡 **F-1324-2 (s1324, OPEN, CHEAP — A SKIPPED `refresh-lane` JANITOR REQUEST IS CONSUMED AS THOUGH IT SUCCEEDED, SO “IT IS IN `done/`” IS NOT EVIDENCE THE LANE WAS REFRESHED).** ' +
  '`lane-runner-v3.sh:120-135`: the janitor loop refreshes a lane only `if [ -d "$wt" ] && [ ! -f tasks/running/$arg.pid ]`; when the lane is BUSY it prints `[janitor] skip refresh $arg (busy or ' +
  'missing)` — and then **falls through to the unconditional `mv` at `:135`, filing the request into `tasks/done/janitor-<epoch>-…` exactly as a successful refresh would be.** Success and skip are ' +
  'indistinguishable afterwards. ✓ **MEASURED, not read:** s1323 requested a lane-c refresh; `tasks/done/janitor-1785553593-s1323-refresh-lane-c.req` exists (03:06:33Z = 10:06 local) — yet lane-c’s ' +
  'HEAD was still `d3349fc0`, a **09:12 commit**, and `git merge-base --is-ancestor 199f7f60 lane/e2-arsenal` returned **ABSENT**. The lane was mid-run on f1323-2 at 10:06, so the refresh was skipped ' +
  'and the evidence of skipping was thrown away. ⚠️ **The consequence is not cosmetic and it nearly cost this fire a dispatch:** F-1324-1’s whole subject is the Drill Yard contract, which arrived in ' +
  '`199f7f60`. Queueing it onto a lane-c that lacked that commit would have handed the runner a tree **where the defect does not exist**, producing a baffled STOP or a false green. s1324 caught it ' +
  'only by running `merge-base --is-ancestor` on the named subject before queueing (the *“a measurement task must verify its subject is present”* law), then refreshed the lane directly — native fires ' +
  'execute cleanups directly per fire.md §0, so the `.req` mechanism is a VM-era relic for them. ➡️ **CURE (one line): only `mv` the request on the success arm; on skip, LEAVE IT so the next cycle ' +
  'retries when the lane goes idle.** ⓘ Note the edit is **INERT until the runner restarts** (pid 35584 has been up 21 days), so it must be landed *and* flagged for a restart, not landed and assumed. ' +
  '💡 *The shape: **a request queue that consumes work on failure silently converts “not done yet” into “done” — and s1323 read the `done/` entry and concluded the janitor was unreliable, when in ' +
  'fact it was obedient and merely unable to say no.*** GATE: none — fire-authorable, one line in `scripts/lane-runner-v3.sh` plus a runner restart.';

lines.splice(anchor, 0, f1, '', f2, '');
fs.writeFileSync(p, lines.join('\n'));
console.log(`inserted 2 finding rows before line ${anchor + 1}`);
console.log(`F-1324-1 id at char ${f1.indexOf('F-1324-1')} · F-1324-2 id at char ${f2.indexOf('F-1324-2')} (must be < 90)`);
