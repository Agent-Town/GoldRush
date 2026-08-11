# agent-reels-2 — standing-order actions ride the run tape

**Slice:** `lane-d-agent-reels-2` · **branch:** `lane/d` · **lane tip:** `b7b3ea2ae` · **merge:** `1578a2298`
**Drained:** s1657, 2026-08-11 · **Gated in:** detached worktree `gate-s1657` (§3.0b), control worktree `gate-s1657-control` at plain main

## Verdict

**PASS — MERGED.** Own gates green on every axis. The two adjacent specs that fail were proven red on
**plain main** in equalised control runs, so nothing here is attributable to this slice. One finding
(**F-1657-2**) was a real defect in the slice and is cured in the drain's bookkeeping commit; one
(**F-1657-3**) is an honest limitation the runner itself reported and is non-blocking.

⚠️ **This slice arrived on the floor, not in a commit — see F-1656-1 / F-1657-1.** The runner finished it
with every gate green and then failed to commit a line of it: its auto-commit `git add` matched a
gitignored `.wrangler` path, exited 1 *advisorily* with all 15 files correctly staged, and the `&&` before
`git commit` read that as failure. `lane/d` therefore read **`ahead=0`** while holding **14,542 staged
insertions** — one refill away from `reset --hard` and Mistake #2, with no trace in any reflog anyone
thinks to check. Rescued byte-for-byte as `b7b3ea2ae` (0 files changed in the rescue, proven by
blob-hash comparison before and after). This was the **third** occurrence in one day and the first caught
while the work was still on the floor.

## What it does

Standing-order actions now ride the run tape as a first-class action kind, so a recorded agent session
replays with its orders intact instead of silently dropping them. `PlaybookFormat` carries the new kind;
`RunTape`/`PlaybookSession` install it on replay rather than filtering it out; the `standings` validator is
extended additively and — the part that matters for trust — **reuses the door's own order validation**,
which is what the earlier parity work bought. Three crown tapes are backfilled under `bench/gauntlet/tapes/`
and a CLI backfill script ships alongside. `EchoBossSystem` gains a one-line type narrowing forced by the
widened action union.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.73 s |
| `scripts/agent-reels.test.mjs` (own) | **1/1**, 5.31 s — validator bounds + byte-determinism |
| `e2e/agent-reels.spec.ts` (own) | **2/2** desktop-chrome + mobile-chrome, `--workers=1`, 51.8 s |
| `test:stats` (F-1229-1, `functions/` touched) | **87 checks** pass |
| `test:accounts` | **43 checks** pass |
| `test:mp` | **462 checks** pass |
| `test:node-guards` (§3.1 — `src/systems/`, `src/game/` touched) | 1 failure, **F-1657-2**, cured; `gate-caller-audit` **26/26** after |
| Merge | automatic, no conflicts; 15 files / **+14,542 −26** |
| `main...lane/d` after merge | `ahead=0` — fully absorbed |

### Adjacent reds — exonerated by CONTROL, not by label

`logs/suite-red-inventory.md` lists both specs as KNOWN-RED, but that snapshot is **14 days stale** and
the lookup tool says so itself: *"membership is never exoneration"* (F-1444-2). So both arms were run
**equalised** — same two spec files, same `--workers=1`, same shell — twice each:

| test | MERGED rep1 | CONTROL rep1 | MERGED rep2 | CONTROL rep2 | verdict |
|---|---|---|---|---|---|
| `pb02-replay-actor:78` event parity (`Expected: 15, Received: 0`) | ✘ ✘ | ✘ ✘ | ✘ ✘ | ✘ ✘ | **stable pre-existing main red**, 4/4 both arms |
| `e7-playbook-surface:33` tape drawer arms | ✘ ✘ | ✓ ✓ | ✓ ✘ | ✓ ✘ | **flaky in BOTH arms** |
| `e7-playbook-surface:54` | ✓ ✓ | ✓ ✘ | ✓ ✓ | ✓ ✓ | flaky, one failure on CONTROL only |

*(each cell is desktop / mobile)*

🔬 **The first observation alone said "regression".** rep1 showed `:33` failing 2/2 with the merge and
passing 2/2 without it — a clean-looking attribution that would have produced a **HOLD and a corrective
task against an innocent slice**. The repeat showed plain main failing identically, and `:33` run in
isolation on the merged tree passes. Two further facts made the first read untrustworthy and are recorded
so the next drain does not repeat it: the first control was **not load-equalised** (5 spec files in the
merged arm vs 2 in the control), and these specs are order/load sensitive. **A red seen once is not
evidence** — which is the same shape as s1656's control that "failed for the wrong reason", one axis over.

## Merge classification

Base `d490a0484`. All 15 paths are **LANE-TOUCHED only** — `git merge --no-ff` completed automatically with
zero conflicts, and the merged diffstat is byte-identical to the lane's own (15 files, +14,542 −26), so main
had moved none of them. No 3-way graft was needed and none was performed.

**Scope note (not a blocker):** four files sit outside the master's literal `Touch ONLY` list —
`src/game/Game.ts`, `src/playbook/PlaybookSession.ts`, `src/agent/AgentStub.ts`, `src/systems/EchoBossSystem.ts`.
The first two are covered by the master's *"`src/game/RunTape.ts` + the replay path it feeds"* clause. The
other two are small type-driven consequences of widening the action union (`AgentStub` +6, `EchoBossSystem`
+1, a `!('type' in action)` narrowing). Judged in scope; recorded because a firewall list is a contract and
a reader should not have to re-derive why four files are outside it.

## Findings

**F-1657-2 (fixed in this drain's bookkeeping commit).** The slice shipped `scripts/agent-reels.test.mjs`
as a **gate nothing calls** — `test:node-guards` went rc=1 with `gate-caller-audit` reporting
`NEW  scripts/agent-reels.test.mjs  NO CALLER`. An unrooted gate is an unread verdict: the audit's own
message cites `citation-title-guard.mjs`, which sat RED against the real tree for **nine fires** while nine
fires reported green batteries (F-1252-2). Cured by rooting it in `test:node-guards`; `gate-caller-audit`
then **26/26**. ⓘ This is the exact trap `f1655-1`'s master dodged deliberately by putting its tests in an
existing rooted file — worth noting that the trap catches the next author anyway when the guidance lives in
one master rather than in a gate.

**F-1657-3 (non-blocking, OWNER/ATTENDED CALL — the runner reported it against itself).** The three
backfilled crown tapes validate and are byte-deterministic, but the runner's own report states that
unchanged players **now die at waves 6/7/7**, so the tapes *"cannot honestly attach to historical secured
rows without historical simulator replay or archived inputs"*, and it therefore performed **no synthesis and
no posting**. That is the right call and the honest one — it is the Vocabulary Stretch refused rather than
taken. What it leaves open is a content question no gate can answer: **do the crown tapes get regenerated
against the current sim (losing their claim to be the historical runs), or does the historical claim need
archived inputs the factory does not have?** Recorded on the desk rather than guessed at.

**Not a finding — recorded to close it:** the `[run-tape] recording truncated: max-ticks at tick 18000` line
in the e2e output is the recorder's own documented ceiling firing normally, present in both arms.
