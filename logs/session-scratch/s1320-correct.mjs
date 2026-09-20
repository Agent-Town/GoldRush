import fs from 'node:fs';

// 1. goal leaf: queued -> stopped, with the real reason
const gp = 'tasks/goals.json';
const raw = fs.readFileSync(gp, 'utf8');
const g = JSON.parse(raw);
let hit = false;
const walk = (n) => {
  if (n.id === 'f1319-3-terrain-seed-per-sample-url-parse') {
    n.status = 'stopped';
    n.reason = "Ran s1320 at 20260801-080403 and was CANCELLED by its own scope-1 measure-first gate after 53,043 tokens with ZERO source changes — the gate worked. Cause is the AUTHOR's (s1320), not the runner's: lane/perf was 153 commits behind main, so gr-sim rejected e1-night-shift ('AP-07 currently supports only e1-dry-gulch') and the required fnv1a32:c086ef19 baseline could not reproduce. lane-usable said USABLE because that verdict means main..branch is empty and the tree is clean — it is a safety+cleanliness verdict, NOT a freshness one (F-1320-2). Lane tip archived to archive/lane-perf-s1320-cancel-report; refresh requested via tasks/janitor/s1320-refresh-lane-d.req. RE-QUEUE ONLY AFTER verifying lane/perf contains 90003628.";
    hit = true;
  }
  [...(n.subgoals || []), ...(n.tasks || [])].forEach(walk);
};
(g.goals || [g]).forEach(walk);
if (!hit) throw new Error('leaf not found');
fs.writeFileSync(gp, `${JSON.stringify(g, null, 2)}${raw.endsWith('\n') ? '\n' : ''}`);
console.log('leaf -> stopped');

// 2. BACKLOG: new F-1320-2 row after F-1320-1
const bp = 'tasks/BACKLOG.md';
const lines = fs.readFileSync(bp, 'utf8').split('\n');
const row = "🟡 **F-1320-2 (s1320, MEASURED BY MY OWN WASTED RUN — `lane-usable` SAYS `USABLE` FOR A LANE 153 COMMITS BEHIND MAIN, BECAUSE IT NEVER ASKS ABOUT FRESHNESS).** I authored the F-1320-1 cure master, ran `node scripts/lane-usable.mjs lane-d` **twice** (once before authoring, once immediately before the `cp`, exactly as the law prescribes), got **`USABLE  ahead=0 paths=0 tracked-dirt=0 untracked=0`** both times, and queued it. The runner then burned **53,043 tokens** producing zero edits, because `lane/perf` was **153 commits behind main** and therefore predates the AP-07 night-shift merge (`90003628`) the whole task depends on: `gr-sim` answered *\"AP-07 currently supports only e1-dry-gulch; received e1-night-shift\"*, so the required `fnv1a32:c086ef19` baseline could not reproduce. ⚙️ **The instrument is not broken — it is answering a different question, and its own wording says so.** `USABLE` is defined as *`main..branch` empty + clean tree* → *\"a master pre-flight will find main..branch empty\"*. A branch **behind** main trivially satisfies `main..branch = ∅`; being behind is invisible to it by construction. **F-1298-4 already taught that `lane-freeze-classify` answers the safety question and not the refill question; this is the third question — `lane-usable` answers safety AND cleanliness, but NOT freshness.** ⚠️ **And nothing else covers it:** `scripts/lane-runner-v3.sh` **never refreshes a lane on dispatch** — the only refresh path is an explicit `tasks/janitor/*.req` `refresh-lane` op (`:124-129`), which no authoring law, no master template, and no §2E refill clause mentions. So a lane can sit arbitrarily far behind main indefinitely while reading `USABLE` to every fire that checks it. ➡️ **Cure (fire-authorable, not owner-gated): teach `lane-usable` to report `git rev-list --count <branch>..main` and downgrade to a distinct verdict — `STALE-BASE` — above some threshold, or at minimum print the behind-count beside `ahead=`.** The one-word verdict is the feature; it needs a fourth word, not a footnote. ✅ **What DID work, and it is the reason this cost 53k rather than a bad merge:** the master's scope 1 was **measure-first with an explicit CANCEL condition** (*\"if the two eventLogHash values do not reproduce, STOP and report — the tree has moved under this brief\"*), and the runner obeyed it exactly: **zero source changes, a written report, and a correct diagnosis of its own blocker.** *The measure-first gate paid for itself on its first outing.* ⓘ Lane tip archived to `archive/lane-perf-s1320-cancel-report` (the cancel report is real evidence); refresh requested via `tasks/janitor/s1320-refresh-lane-d.req`; **not re-queued this fire on purpose** — the runner dispatches *before* it runs janitor ops in the same loop, so re-queuing now would aim it at the stale lane a second time. 💡 *The reusable shape: **I ran the prescribed check, twice, and it passed, and I was still wrong — because \"is this lane safe to use?\" and \"is this lane current enough to run THIS task?\" are different questions wearing the same one-word answer.** A green from the right instrument aimed at the wrong question is the most expensive kind, because it buys confidence.* GATE: none — fire-authorable.";
const idx = lines.findIndex((l) => l.startsWith('🟡 **F-1320-1'));
if (idx < 0) throw new Error('F-1320-1 row not found');
lines.splice(idx + 1, 0, '', row);
fs.writeFileSync(bp, lines.join('\n'));
console.log('F-1320-2 row inserted; first 90:', row.slice(0, 90));
