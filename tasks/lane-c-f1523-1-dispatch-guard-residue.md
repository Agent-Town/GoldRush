CODEX: model=gpt-5.6-sol effort=high
# lane-c-f1523-1-dispatch-guard-residue — the dispatch guard must refuse on RESIDUE, not on the coarse HOLDS word (F-1523-6)
FIRE-AUTHORED s1523 (attended review welcome)
ROLE: lane implementer. WORKDIR: this lane worktree (`worktrees/lane-c`, branch `lane/c`). Commit prefix `f1523-1:`. One task, firewalled. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## WHY (F-1523-6, measured by the s1523 drain on the guard it merged one hour earlier — not inherited)

s1523 merged `d883927bd`, the F-1522-1 pre-dispatch lane-safety guard: it refuses to dispatch into a lane whose `lane-usable.mjs` verdict word is exactly `HOLDS`. **The guard does precisely what its master specified and its five fixture arms all pass.** The defect is not in the guard's logic — it is that **`HOLDS` is computed at a coarser resolution than the question the guard asks it.**

**Read from `scripts/lane-usable.mjs`, not inferred:** `held` is built at **blob identity** — a path is HELD unless the lane blob equals main's blob (`if (l === m) continue`) or the lane never moved it (`if (l === b) continue`). The **line-level residue** — the `(N of M added lines absent from main)` text every fire reads — is computed by `residueForHeld`/`formatHeldResidue` **for DISPLAY ONLY** and never feeds back into the verdict.

So a lane whose every added line is already on main, but whose files main has since moved *further*, lands in `held` and reads `HOLDS`.

**Measured on the live fleet at s1523, replaying the merged guard's own extraction:**

| slot | rc | verdict | residue on every held path | guard would |
|---|---|---|---|---|
| lane-a | 2 | HOLDS | `lb-01…spec.ts` **0 of 13 absent**; `BACKLOG.md` 1 of 1 (a row this drain deliberately superseded) | **REFUSE** |
| lane-b | 2 | HOLDS | `lb-01…spec.ts` **0 of 43 absent**; `BACKLOG.md` **0 of 1 absent** | **REFUSE** |
| lane-c | 0 | USABLE | — | dispatch |
| lane-d | 1 | AHEAD-BUT-ABSORBED | — | dispatch |

`node scripts/lane-absorbed-lines.mjs lane/b e2e/lb-01-county-standings.spec.ts tasks/BACKLOG.md` answers the one-directional question in one command:

```
e2e/lb-01-county-standings.spec.ts: ABSORBED — all 43 added line(s) present in main
tasks/BACKLOG.md: ABSORBED — all 1 added line(s) present in main
```

**lane-b holds nothing main has not absorbed, and the guard would refuse it.**

⚠️ **WHY THIS IS URGENT DESPITE THE GUARD BEING INERT.** The guard takes effect only when the runner restarts — and **F-1522-5 is on the owner's desk right now asking Robin to do exactly that.** If he restarts today, two of four lanes are refused on their first dispatch, with a message naming paths that are fully absorbed. The factory would read as broken by the very commit meant to protect it.

⚠️ **AND STATE THE LIMIT HONESTLY — THIS IS NOT F-1027-1's PERMANENT BRICK.** A fire can still clear such a lane by hand (archive the tip, reset). What the defect costs is that **the ordinary post-drain state of a lane now requires manual intervention before it can be used again**, and with four lanes against a fast-moving main that is the common case, not the rare one. Do not overstate it in your report, and do not understate it either.

🚫 **THE FIX IS NOT IN `lane-usable.mjs`. THAT FILE IS A STANDING PROHIBITION (F-1212-4, F-1419-1): its verdict words, `RC` map, `CHURN` set and `RUN_SURFACE` are consumed, never modified.** Widening `AHEAD-BUT-ABSORBED` to swallow zero-residue BOTH-MOVED paths would change a verdict word's meaning under every other consumer — fires, refill decisions, `--cure` — and `--cure`'s refusal on HOLDS is load-bearing. **Do not touch that file.** The guard is the consumer that asked the wrong-resolution question; the guard is where the second question belongs.

## READ-FIRST (open each; do not work from this summary)
- `scripts/lane-runner-v3.sh` — the F-1522-1 guard block at the dispatch site (find it by its `BEGIN F-1522-1 LANE-SAFETY GUARD` comment). Note how `lane_verdict` is extracted with `sed` from the `  => WORD:` line, and that it refuses only when `lane_probe_rc` is 2 **and** the word is exactly `HOLDS`.
- `scripts/lane-usable.mjs` — `inspect()`'s `held` loop (blob identity), `residueForHeld`, `formatHeldResidue`, and the verdict ladder. **READ ONLY. You may not edit this file.**
- `scripts/lane-absorbed-lines.mjs` — the whole file. Its usage line is `lane-absorbed-lines.mjs <branch> <path> [<path> ...]`; it prints one line per path and its wording is `ABSORBED — all N added line(s) present in main` for a fully-absorbed path. **Read how it reports a NOT-absorbed path and how it exits — do not guess either.**
- `scripts/lane-dispatch-safety-guard.test.sh` — your test's model and the file you extend. It builds disposable fixture repos in a temp dir and drives the real extracted runner block against them.
- `reviews/f1522-1-dispatch-lane-safety.md` — the guard's drain review.

CITE BY CONTENT, NOT BY LINE (F-1310-1). Verify each returns **1** before starting:
- `grep -c "BEGIN F-1522-1 LANE-SAFETY GUARD" scripts/lane-runner-v3.sh` → 1
- `grep -c "else if (c.held.length === 0) verdict = 'AHEAD-BUT-ABSORBED'" scripts/lane-usable.mjs` → 1
- `grep -c "ABSORBED — all" scripts/lane-absorbed-lines.mjs` → 1
**If any returns 0, STOP and report — the lane drifted after dispatch. Do not "fix" it by editing the citation.**

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/c main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
> **FACTORY-CHURN EXCEPTION (F-1407-1) — ALWAYS EXPECTED, NEVER A STOP; list them and proceed:** `logs/**` (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`) and `artifacts/**` / `reviews/shots-*` / any `.png`. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
Then `git -C . status --short` → clean modulo the two churn classes above. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## SCOPE (each item separately checkable, in this order)

1. **NARROW THE REFUSAL TO A NON-ZERO RESIDUE.** In the F-1522-1 guard block in `scripts/lane-runner-v3.sh`, when — and only when — the verdict word is `HOLDS`, ask the line-level question about **the held paths that verdict named**, via `node scripts/lane-absorbed-lines.mjs "<branch>" <path>...`. Refuse the dispatch **only if at least one held path is NOT fully absorbed**. If every held path reports absorbed, **dispatch proceeds** and the block logs one line saying so, naming the paths it cleared and why (so the next reader sees the decision, not just its outcome).
   - Derive the branch and the held paths from the probe output you already captured — the `HELD <KIND>  <path>` lines. Do not re-run `lane-usable.mjs` a second time to get them.
   - **FAIL OPEN, UNCHANGED AND STILL LOAD-BEARING:** if the residue probe errors, times out, is unparseable, or the script is missing, **fall back to the CURRENT behaviour — refuse on `HOLDS`.** ⚠️ Note this is the *opposite* default from the outer probe, and that is deliberate: the outer probe failing open protects the factory from a broken instrument; the inner probe failing **closed** protects unmerged work from an instrument that could not prove it was safe. **Say in your report that you understood this asymmetry and implemented it deliberately.** Bound this probe with a timeout as the outer one is bounded.
   - Do not alter the outer `HOLDS`/rc-2 detection, the `main`/`ROOT` slot skip, or the fail-open of the outer probe.

2. **PROVE BOTH NEW DIRECTIONS WITH MANUFACTURED FIXTURES (s1299/s1300 standard)** — extend `scripts/lane-dispatch-safety-guard.test.sh`. **All five existing arms must still pass unchanged**; a report that silently drops one is a REJECT. New arms:
   - **DISPATCHES-HOLDS-BUT-FULLY-ABSORBED:** a lane whose held path is BOTH-MOVED with **every added line already on main** (main moved the file further) → verdict is `HOLDS`, and **dispatch PROCEEDS**. This is the arm that reproduces the live lane-b shape and is the whole point of the task; **a report without it is a pre-declared REJECT.**
   - **REFUSES-HOLDS-WITH-REAL-RESIDUE:** a lane holding a line main has never seen → still **REFUSED**, queue file still queued. This proves the narrowing did not disarm the guard.
   - **REFUSES-ON-RESIDUE-PROBE-FAILURE:** make the residue probe fail (e.g. `lane-absorbed-lines.mjs` unreadable) on a `HOLDS` lane → **REFUSED** (fail-closed inner probe).
   - Show the DISPATCHES-HOLDS-BUT-FULLY-ABSORBED arm **failing against the current script** and passing after. Paste both.

3. **DO NOT add an npm script.** The test is already rooted in the `test:ledger-guards` chain; leave that chain alone.

4. **REPORT THE LIVE FLEET UNDER YOUR CHANGE.** Run `node scripts/lane-usable.mjs --all` and, for each lane it calls `HOLDS`, run `lane-absorbed-lines.mjs` on that lane's held paths, and state plainly in your report which lanes your change would now dispatch and which it would still refuse. **Do not modify any lane to make this tidier** — report what is there.

## FIREWALL
Touch ONLY: `scripts/lane-runner-v3.sh` (the F-1522-1 guard block only) · `scripts/lane-dispatch-safety-guard.test.sh`.
NO changes to: **`scripts/lane-usable.mjs` — STANDING PROHIBITION, F-1212-4 / F-1419-1, read-only in this task** · `scripts/lane-absorbed-lines.mjs` (you consume it; if it cannot answer the question, STOP and report rather than editing it) · `package.json` · the janitor block or its `reset --hard` · the auto-commit pathspecs (F-1154-1) · the main-slot lock gate (F-1402-1) · the retention-law epitaph, whose coordinates `CLAUDE.md` §4.10b cites by number — **if your edit shifts those lines, REPORT the shift and do NOT edit `CLAUDE.md`; the re-base is the drain's call** · any `src/**`, `e2e/**`, `playwright.config.ts`.

## SELF-CHECK (name the exact commands and paste real output)
- `npx tsc --noEmit` → 0 errors. `npm run build` → green.
- `bash scripts/lane-dispatch-safety-guard.test.sh` → **all eight arms** pass; paste every arm name.
- The scope-2 manufactured evidence: DISPATCHES-HOLDS-BUT-FULLY-ABSORBED **red against the current script**, green after. Both pastes.
- `npm run test:ledger-guards` → green.
- `node --test scripts/gate-caller-audit.test.mjs scripts/law-pointer-guard.test.mjs` → green, or the exact pointer shift reported (see FIREWALL).
- `git diff -- scripts/lane-usable.mjs scripts/lane-absorbed-lines.mjs package.json src/ e2e/` → **EMPTY** (paste the empty result).
- The three citation greps above, each → 1.
- Scope 4's live-fleet table.
- Confirm in words that the guard remains **inert until the runner is restarted** (pid 35584, running since 2026-07-11), and that you did not restart, kill or signal it.

If you find yourself about to exit without changes, WRITE WHY into your report first — a silent no-op wastes a queue slot and a gate.

READY-FOR-GATES + report: the narrowed condition and exactly where it sits relative to the existing `HOLDS` check; all eight arm names with output; the manufactured red/green pair; your statement of the deliberate fail-open/fail-closed asymmetry; the live-fleet table; and whether any law pointer shifted.
