---
name: drain
description: Gate and merge one finished task's output into main, the Gold Rush way — classification, gate battery, review file, path-scoped merge, ledger updates, salvage lifecycle. Use whenever a done-move exists in tasks/done/ or a lane branch sits ahead of main and you intend to land it.
---

# /drain — gate and merge one finished output

One drain per invocation. Serial. Never batch-gate (DISJOINT-PAIR exception only per fire.md §3, two max, provably disjoint diffs).

## 0. Preconditions (abort if any fails; fix the precondition first)
- [ ] **IS IT ALLOWED? — the FIRST command, before classification and before you form an opinion:** `node scripts/drain-block-check.mjs <done-move filename | taskfile | branch>`. **Exit 1 = STOP: do not drain, do not gate, do not "just check the merge."** Every other precondition asks *is it READY* — but a policy block is **not a property of the tree**, so no git probe can ever see it. s1104 merged owner-gated rf-34 with a genuinely-ahead branch, a real two-dot diff, and a runner report it judged sound — then reversed it the same fire. **A well-argued runner report is not an unblock; it is often exactly what made the fork worth reserving for the owner.** The block lives in `tasks/goals.json` (`status:"blocked"` + `blockedReason`) keyed by `taskFile`, which every done-move filename already contains — a lookup, not a judgement, one second. A block is lifted by the OWNER only, never by a green battery. Exit 2/UNKNOWN = no goal leaf matched: that is a Goal Registration Law bookkeeping finding, **not a clearance** (F-1116-1: 524 of 644 masters have no leaf). `--all` audits every blocked leaf on the board.
- [ ] STATUS.md line-1: you hold the lock (attended) or no fresh ACTIVE fire owns main.
- [ ] `git status --short | grep -v '^??'` on main is EMPTY (clean-main window). If a live main-slot task is running: WAIT — never gate over a dirty tree (Mistake #12: Gate Contamination).
- [ ] Identify the drain unit: a done-move in `tasks/done/` + its lane branch, OR a `save/*` salvage ref. Read the RUN LOG tail (`tasks/runs/<stamp>-*.log`) — confirm the run made a REAL diff (Mistake #1: Silent No-Op). rc=0 with zero diff → do NOT drain; mark the ladder line no-op and re-queue with a corrected premise if the work is still owed.

## 1. Classify the diff (never blind-merge)
```
git log --oneline main..<branch>          # what's ahead
git diff --name-status main...<branch>    # the files
```
For EVERY file, classify: **LANE-TOUCHED only** (clean apply) / **MAIN-MOVED too** (needs 3-way judgment — read both sides; today's main wins on infrastructure, the lane wins on its feature intent) / **NEW file** (free). Known additive-collision files (`Balance.ts`, `vite-env.d.ts`) usually auto-merge — verify the hunks are additive.
- Base >~12h stale AND conflicts on hot files (Game.ts/CombatSystem/main.ts)? → STOP. Rule the **RE-LAND** path instead (Mistake #15): fresh task off current main, salvage-ref the branch, rename `save/<name>` when the re-land ships → `archive/<name>`.

## 2. Merge (path-scoped, on clean main)
Prefer `git merge --no-ff <branch>` when classification was clean; otherwise apply per-file with explicit 3-way judgment. NEVER `git add -A`. Resolve conflicts by the classification you wrote in step 1 — if you're inventing a resolution, stop and re-classify.

## 3. The gate battery (on the MERGED tree — evidence, not vibes)
```
node scripts/drain-block-check.mjs <the drain unit>   # §0 — re-assert on the merged tree
npx tsc --noEmit
npm run build
node scripts/run-guards.mjs --changed-since <the base hash from your merge classification>   # ~16s, +7s if the merge touched functions/; picks the battery FROM THE DIFF
npx playwright test <the-slice's-spec> <adjacent-suites> -c <self-booting scratch config, ports 5199/5231/5234 family> --workers=1 --reporter=line
```
- **`--workers=1` IS LOAD-BEARING, NOT STYLE (F-1270-1, measured s1270 — stated here because this line has carried the flag since s114 with no reason attached, and six fires therefore never knew).** `playwright.config.ts` sets no `workers` key, so a fire defaults to **6 obtained workers**, and at 6 the fire shell's per-job CPU ceiling (F-1269-1) starves each chromium into timing reds. Interleaved, same shell, same hour: **w=1 → 3/3 runs rc=0, 0 drift reds / 18 · default → 3/3 runs rc=1, 17 drift reds / 18**, and w=1 was *faster* (55.94 s vs 60.74 s mean). **A red seen at default workers is not evidence until it reproduces at `--workers=1`.** Never move this into `playwright.config.ts` — the lane shell runs 6 workers ~3.5× faster and would pay for a fire-only defect.
- **Why the battery is chosen FROM THE DIFF (F-1229-1, measured s1229 — this replaces the fixed `--only` list of s1228).** Three guards always run — `test:node-guards`, `test:power-budget`, `test:task-guards` — because they gate what a **drain itself writes**: `scripts/**`, the `tasks/` ledger (Goal Registration Law), `src/systems/PowerGraph.ts`. On top of that, **any merge touching `functions/` also runs `test:stats`, `test:accounts`, `test:mp` (~7s)**. That rule exists because worker code had **no gate at all**: `tsconfig.json` `include` is `["src", "e2e", "playwright.config.ts"]`, so `tsc` never reads `functions/**`, and `vite build` never bundles Pages Functions. **Proven by mutation, not argued:** `accountId: 12345` (a string field) in `functions/api/_accounts.ts` left `tsc` **rc=0**, `build` **rc=0** and all three gate guards **rc=0** — while `test:accounts` caught it in **1 second**. `functions/` changed in **four merges over 2026-07-28..29** alone, every one drained blind. s1228 kept `test:accounts`/`test:mp` out because they rewrite a **tracked artifact** mid-gate; that reason was correct, and it has been **removed rather than worked around** — both writers now honour `GR_GUARD_NO_ARTIFACT`, which `run-guards.mjs` sets, so a gate can no longer dirty its own tree (verified: a full eight-guard run leaves `git status` clean). The two **80s** deploy contracts stay out — they gate `deploy.sh`/`deploy-site.sh`, which no drain touches. `npm run test:guards` still runs all eight on demand.
- **If you cannot supply a base hash**, fall back to `--only test:node-guards,test:power-budget,test:task-guards` and **say so in the review** — you are then merging worker code unguarded, which is the exact hole F-1229-1 closed. A bad ref makes `--changed-since` **exit 2**; it never quietly narrows the battery.
- Adjacent = the task's self-check list + task-025 + m1-01 + m2-01 minimum. BOTH projects (desktop + mobile). Capture exit codes from the COMMAND, not a pipe tail.
- Boot probe: zero console/page errors, plain boot desktop + 390px. If the slice is user-facing: verify visibility WITHOUT `?debug` (Mistake #10).
- Anything renders? Perf snapshot (draw calls, frame p95) vs baseline; >15% p95 regression or >200 stress draw calls = FAIL.
- Failures: fingerprint them. Match a documented known-red exactly (file/assertion/count) → note and proceed. Any NEW failure → the drain FAILS: revert the merge, write the finding, spawn the corrective task, ladder it — all in this session.

## 4. The review file — `reviews/<slice>.md` (model: reviews/sci-04.md)
Sections, all mandatory: Slice/branch/tip → Verdict → What it does (one paragraph) → Evidence (real numbers: suite counts, timings) → Merge classification (base hash, per-file table, conflict resolutions) → Findings (F-IDs; each non-blocking-with-reason or spawning a corrective in this same commit).

## 5. Commit + ledger (one event, one commit set)
- [ ] Merge commit message: `<prefix>: <slice> — <one-line>` + evidence line.
- [ ] **GOAL REGISTRATION LAW (owner ruling 2026-07-16): flip this slice's leaf in `tasks/goals.json` IN THE DRAIN COMMIT** — `status` → `merged` and `mergeHash` → the full 40-char hash. Not `mergeCommit`: that near-miss key is read by NO consumer, so such a leaf is simultaneously "merged without evidence" to `goal-tracker.test.mjs` and "not shipped" to the queue guard (F-1123-1). Missing goal-tree bookkeeping means the drain duty is UNFINISHED.
- [ ] `tasks/BACKLOG.md`: mark the ladder line ✅ SHIPPED <hash> IN THIS COMMIT (Mistake #5: Ghost Line). Un-gate anything whose GATE just opened; queue it if the throttle allows.
- [ ] Salvage lifecycle: branch content now on main → rename `save/*` → `archive/*`; lane branch left as merged ancestor (safe-dupe for the next pre-flight).
- [ ] Screenshots → `reviews/shots-<slice>/`. Artifacts referenced by the review must exist.
- [ ] If origin exists: `git push origin main` (BACKUP LAW). Push failure = note in handoff, never a blocker.

## 6. Handoff line
Update your handoff/STATUS line-1 (if you hold the lock): what merged (hash), what the gate proved (counts), what un-gated, what's next. Refresh the ACTIVE stamp if you continue; CLEAR the lock when you stop.
