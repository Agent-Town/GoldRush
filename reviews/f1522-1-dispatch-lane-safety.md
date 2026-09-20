# f1522-1-dispatch-lane-safety — drain review (s1523)

- **Slice:** `f1522-1-dispatch-lane-safety` (F-1522-4, the corrective the s1522 Reset Massacre demanded)
- **Branch / tip:** `lane/d` @ `0b54eac38` — one runner auto-commit, 3 files, +143/-1
- **Base:** `e6445595` (`git merge-base main lane/d`)
- **Gated in:** detached worktree `gate-s1523` at main `d17889c8a`, `git merge --no-ff lane/d` → `6a0c1e6e8` (§3.0b custody: undecided content never entered main's working tree)
- **Drain:** s1523, 2026-08-07

## VERDICT: MERGE — all five manufactured arms pass, both directions proved, firewall empty.

## What it does

Lane safety used to live in each master's PRE-FLIGHT prose, so **a lane was only ever as safe as whichever master happened to be dispatched into it next**. F-1522-1 measured that gap end-to-end in 101 seconds: `lane/a` held an undrained commit (`ee61f25ee`, 28 files / 39,847 insertions), and the *next* master's pre-flight — which guards uncommitted dirt and says nothing about committed-but-undrained commits — reset the lane over it. Codex obeyed correctly; it had `ahead 1` on screen and was never asked about it.

This slice moves the guard **out of the ~190 masters and into the one place every dispatch passes through**: a pre-dispatch check in `scripts/lane-runner-v3.sh`, after the worktree-dir check and *before* the `mv` that claims the queue file. On a positive `HOLDS` it leaves the queue file in place, logs the held paths, and `continue`s — the next cycle re-logs it, and that repetition is the intended "drain me" signal.

**The design's load-bearing negative:** it is deliberately *not* a `git log main..HEAD` non-empty gate. That is **F-1027-1**, a recorded permanent brick — lanes land by squash merge, so a lane branch reads ahead forever once its work merges. The guard instead branches on `lane-usable.mjs`'s verdict **word**, distinguishing `HOLDS` (content main never absorbed) from `AHEAD-BUT-ABSORBED` (safe). It never branches on the exit code, because `HOLDS`/`DIRTY`/`BUSY` deliberately share rc 2. The comment block at the site says all of this, so nobody "simplifies" it back into a brick.

**It fails open by construction:** a 10-second bounded `perl`-wrapped probe; if it errors, times out, is unparseable, or `node`/the script is missing, dispatch proceeds exactly as today. A broken probe must never stall the factory.

## Evidence (all on the merged tree in `gate-s1523`, `--workers=1` N/A — no playwright surface)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 0 errors (4.5 s) |
| `npm run build` | **rc=0**, ✓ built in 999 ms (14.7 s wall) |
| `bash scripts/lane-dispatch-safety-guard.test.sh` (slice's own) | **rc=0**, 5/5 arms |
| `node --test scripts/gate-caller-audit.test.mjs` | **rc=0**, 19/19 — the test is rooted, no un-rooted gate |
| `node --test scripts/law-pointer-guard.test.mjs` | **rc=1 → rc=0** after the drain's re-base (see below), 11/11 |
| `npm run test:ledger-guards` (full chain) | **rc=0** (15.7 s) — the five new arms appear in the chain output |
| firewall `git diff main...lane/d` on `src/ e2e/ scripts/lane-usable.mjs playwright.config.ts specs/ reviews/ tasks/ STATUS.md` | **EMPTY** |

**The five arms, by name (both directions — a green that never executes the refusal path is not evidence about the refusal):**

```
PASS(REFUSES-HOLDS): queue file stayed queued and held-path.txt was logged
PASS(DISPATCHES-AHEAD-BUT-ABSORBED): safe squash-dupe shape dispatched
PASS(DISPATCHES-USABLE): clean ahead=0 lane dispatched
PASS(DISPATCHES-DIRTY-RC2): DIRTY shares rc=2 but is not HOLDS
PASS(DISPATCHES-PROBE-FAIL-OPEN): missing probe dispatched
```

`DISPATCHES-AHEAD-BUT-ABSORBED` is the anti-brick arm the master pre-declared non-negotiable; it is present and green. The runner also pasted the manufactured red against the pre-change script — `FAIL(REFUSES-HOLDS): verdict=HOLDS; queue=moved; output=<empty>` / `TEST-EXIT:1` — i.e. the guard's absence is what the fixture detects, which is the s1299/s1300 standard.

No playwright, no boot probe, no screenshots: the diff touches `scripts/**` and one `package.json` line only. **Where does the PLAYER see this, in a plain boot? Nowhere** — this is factory machinery, and Mistake #10's question is answered by that, not waived. It touches no `src/sim/`, `src/systems/` or `src/entities/`, so the F-1460-1 `test:node-guards` rider does not apply (it ran anyway inside `test:ledger-guards`' overlapping members).

## Merge classification

| File | Class | Resolution |
|---|---|---|
| `scripts/lane-runner-v3.sh` | LANE-TOUCHED (+30) | clean — `git log e6445595..main` on this path is **empty**, main never moved it |
| `scripts/lane-dispatch-safety-guard.test.sh` | LANE-ONLY (new, 112 lines) | clean |
| `package.json` | LANE-TOUCHED (+1/-1, the `test:ledger-guards` chain append) | clean, main never moved it |

Zero MAIN-MOVED files, zero conflicts; the gate merge was a clean `ort`. Landed on main path-scoped (squash), not as a merge commit.

## Findings

**F-1523-1 — the drain's owed act, PAID IN THIS COMMIT (not a defect).** The runner correctly refused to fix it: `CLAUDE.md` §4.10b's retention-law pointers `lane-runner-v3.sh:169` and `:171` drifted **exactly +30 lines** to `:199` and `:201`, because the guard was inserted above them. The master firewalled `CLAUDE.md` and named the re-base as the drain's call.

**The epitaph's substance was re-verified by READING, never by the coordinate** (`gate-s1523/scripts/lane-runner-v3.sh:199–:210`): the retention-window prune is present *only* as a commented `DO NOT RESTORE` epitaph naming the s1031 casualty (`20260721-110240-lane-a-lane-town-variants-e8`, 886,731 tokens), and the `.git/*.stale*`+`tmp_obj_*` sweep above it is intact and deliberately left alone. **INTACT. No law violation.** Both coordinates re-based in this commit, plus `scripts/law-pointer-baseline.json` via `--update`; the guard is green after.

Worth recording: **this is the first rot the rotting commit predicted in advance.** The master named the shift, told its runner to report rather than fix it, and assigned the re-base to the drain — so the guard reddened exactly once, on the gate, and was cured in the same commit that caused it. That is the intended lifecycle of a rotting pointer, not a lapse.

**F-1523-2 (non-blocking, inherited-claim correction).** The runner's report listed a second `test:ledger-guards` red — *"pre-existing goal-ledger red: `f1424-4-worker-arm-rates -> f1424-4-lane-shell-worker-arms`"*. **Re-measured on the merged tree: GONE, rc=0.** It was real when the lane ran (13:01) and was cured minutes earlier by s1522 retiring that leaf as `superseded`; the lane's base predated the retirement. Verified, not inherited — a fire trusting the report's word would have carried a phantom red forward.

**F-1523-3 (non-blocking, and it is the honest limit of this merge).** ⚠️ **This guard is INERT until the lane runner is restarted.** The live dispatch loop is **pid 35584, started Sat Jul 11 06:10:18 2026** — a running `bash` holds its original inode, so it is executing the July-11 revision of the script. This cure joins **eight** landed-but-never-executed commits to `lane-runner-v3.sh`. The master ordered this reported and explicitly forbade curing it (no restart, kill, or signal from a fire — it would abort live Codex runs). It is already on the owner's desk as **F-1522-5**; this merge raises the inert count by one and does not change the recommendation: `kill 35584` and relaunch at a quiet moment.

So, stated plainly: **the factory is not yet protected by this guard.** What it has is a proven, rooted, both-directions-tested cure sitting one restart away from taking effect — and a fixture suite that will keep it honest when it does.
