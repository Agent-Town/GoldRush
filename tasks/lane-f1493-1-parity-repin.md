# lane-f1493-1-parity-repin — land the F-SEED-1 parity cure's adjacent assertions WITH the slice

**FIRE-AUTHORED (attended review welcome)** — s1493, 2026-08-06.
**Role:** Codex runner · **Workdir:** `worktrees/lane-a` (branch `lane/a`)

---

## ⚠️ PRE-FLIGHT — READ EVERY WORD. THIS LANE MUST **NOT** BE RESET.

`lane/a` holds **unmerged content that exists nowhere else**: the F-SEED-1 parity cure
(`src/sim/HeadlessContractSim.ts`, `e2e/front-door-parity.spec.ts`, `docs/bench/e2-readiness-census.md`).
`node scripts/lane-usable.mjs lane-a` correctly reports **HOLDS**. That is expected and it is the
whole point of this task: your work only makes sense **on top of** that cure, because the numbers you
are about to pin **do not exist without it**. A fresh lane would compute the OLD numbers and "fix"
them wrongly — that is F-1492-1, verbatim.

**So the normal safe-dupe pre-flight is SUSPENDED for this task, by explicit authorization:**

1. `git -C worktrees/lane-a status --short` → must be **clean** (no tracked dirt). If it is dirty, **STOP** and report.
   > **FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them and proceed (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence. ⓘ What still STOPs, unchanged and load-bearing here: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — i.e. anything a live drain or a concurrent task could actually own. **On this lane that clause is doing real work**: the branch holds unmerged content that exists nowhere else, so unexplained dirt in those paths is a genuine STOP, not a formality.
2. `git -C worktrees/lane-a rev-parse HEAD` → must be **`1e19a7d58`**. If it is anything else, **STOP** and report the tip you found; do not reset, do not pull, do not rebase.
3. `grep -c "waves: contract.twist.secureWave, calls: 0" worktrees/lane-a/e2e/er01-e2-census.spec.ts` → must print **`1`**.
   If it prints `0`, the lane drifted from the tree this task was written against — **STOP** and report. (s1493 verified this key returns 1 on main AND in the lane at authoring time.)
4. **NEVER run `git reset --hard`, `git clean`, `git checkout <other>` or `git pull` in this worktree.** Commit on top of `1e19a7d58`.

---

## READ FIRST (paths, in this order)

⚠️ **The first two files are on `main` and are NOT in this worktree** — `lane/a` is 24 commits behind and **must not be refreshed** (see the pre-flight). Read them without changing your tree:
`git show main:reviews/f1492-2-secure-wave-reframed.md` · `git show main:reviews/f-seed-1-front-door-parity.md`.
Everything you strictly need is also restated in the WHY section below, so a `git show` failure is not a blocker — but read them if you can.

- `reviews/f1492-2-secure-wave-reframed.md` (via `git show main:`) — **the whole WHY of this task**, with the measurements.
- `reviews/f-seed-1-front-door-parity.md` (via `git show main:`) — s1492's gate on the cure you are extending (F-1492-1 is the finding this task closes).
- `e2e/er01-e2-census.spec.ts` — the row you are correcting (line ~109).
- `scripts/gr-sim.test.mjs` — the six expectations you are re-pinning.
- `src/sim/HeadlessContractSim.ts:325-328` and `src/game/Game.ts:4844` — the `autoSecureWaveForRun` bypass that makes the census equality unsound on baron contracts. **Read these two before you edit the assertion**, so you are implementing a measured conclusion rather than trusting this file.

## WHY (evidence, quoted)

s1492 gated the parity cure and held it: *"It is held because it moves EIGHT adjacent assertions and repairs NONE of them"* (`reviews/f-seed-1-front-door-parity.md`, F-1492-1). Six live in `scripts/gr-sim.test.mjs` (a member of `test:node-guards`, which every fire runs) and two are the same `e2-hill-mine` census row on desktop + mobile.

s1493 then measured the census red on the merged tree and found the eighth is **not** what it was taken for. The received object is `{ calls: 0, secured: true, waves: 14 }` against an expected `waves: 12` — Hill Mine is **still secured, still with zero agent calls, still deterministic**. And `contract.twist.secureWave` is an **input threshold that baron contracts bypass**: `autoSecureWaveForRun()` returns `Number.MAX_SAFE_INTEGER` while `twist.baron && !baronBeaten`, so a baron map secures when the Baron dies, not at the declared wave. The equality `waves === secureWave` is therefore structurally guaranteed on **exactly one** of the four E2 contracts (`e2-pressure-garden`, the only baron-less one) and was a combat-speed coincidence on the other three.

Both suites were measured green at pre-merge main and red at the merge by s1492's control run, and s1493 re-measured the census independently (`6 passed / 2 failed`, exactly `e2-hill-mine` ×2). The six gr-sim numbers were confirmed **deterministic across two runs of the same commit** before this task prescribed pinning them.

**The named cause for every moved number — required by the standing prohibition F-1441-3 before any pin may move — is: the headless hero now carries the browser's progression and panning costs, so it survives longer, kills more, and hashes differently.** This is the cure working, not a regression.

## SCOPE (numbered, each testable)

1. **Correct the census assertion.** In `e2e/er01-e2-census.spec.ts` (~line 109), replace the single unconditional
   `expect(first).toMatchObject({ secured: true, waves: contract.twist.secureWave, calls: 0 });`
   with an assertion that says what the engine actually guarantees:
   - always assert `secured: true` and `calls: 0` (unchanged, unconditional);
   - when the contract declares **no** `twist.baron`: keep the **strict equality** `waves === contract.twist.secureWave` (structurally guaranteed — do not weaken it);
   - when the contract **does** declare `twist.baron`: assert `waves >= contract.twist.secureWave` instead, because the run secures on the Baron's death, not on the wave threshold.
   Add a short comment at the site naming **F-1493-1** and the `autoSecureWaveForRun` bypass, so the next reader does not "restore" the equality.
   **Do NOT touch `assets/contracts/**` — raising `secureWave` to 14 is explicitly REJECTED (it would change the player-facing "secured wave N" line and the sim's tick budget to satisfy a test; see the review's "Why raising secureWave to 14 would be the wrong repair").**
2. **Re-pin the six `scripts/gr-sim.test.mjs` expectations** to the values the merged tree produces. Take every number and hash **from your own run**, never from this file — the table in the review is evidence of what moved, not a paste source.
3. **Annotate the pins.** At each re-pinned site add a one-line comment naming **F-1493-1** and the cause (`headless progression parity, s1493`). A pin with no named cause is the thing F-1441-3 forbids; a pin with one is auditable.
4. **Report, do not fix, anything else that reds.** If a suite outside the two named here fails, write it in your report with the failing test name — do **not** repair it. That is a finding for the drain, not scope for you.

## FIREWALL

**TOUCH-ONLY:** `e2e/er01-e2-census.spec.ts` · `scripts/gr-sim.test.mjs`

**NO:** `assets/contracts/**` (especially `epoch-2-steamworks/contracts.json`) · `src/**` (the cure is already correct and already gated — do not "improve" it) · `docs/**` · `tasks/**` · `reviews/**` · `STATUS.md` · any other lane · any `git reset`/`clean`/`pull` in this worktree.

## SELF-CHECK (run all; report each with its real number)

- `npx tsc --noEmit` → clean
- `npm run build` → green
- `node --test scripts/gr-sim.test.mjs` → **9/9**, and run it **twice**, reporting that both runs agree (these are deterministic pins; two disagreeing runs mean STOP and report, not re-pin)
- `npx playwright test e2e/er01-e2-census.spec.ts --workers=1` → **8/8**, desktop **and** mobile
- `npx playwright test e2e/front-door-parity.spec.ts --workers=1` → **4/4** desktop + mobile (the cure's own spec must stay green)
- `npm run test:node-guards` → **rc=0** (this is the battery the reds were sitting in; it is the point of the task)
- zero console/page errors in the playwright runs

`--workers=1` on every playwright command is mandatory in this repo's gate shells (§3.1) — pass it explicitly even though the config also sets it.

## READY-FOR-GATES + what to report

Report: the exact before/after of each of the seven edited assertions; the two gr-sim run results side by side; the 8/8 census line; whether `test:node-guards` reached rc=0; and **any suite you saw red that this task did not name**.

**Do not merge anything. Do not touch main.** A fire drains this branch as one slice — cure + assertions together, which is the whole point of F-1492-1.
