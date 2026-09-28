# /drain — gate and merge one finished output

One drain per invocation. Serial. Never batch-gate. Compacted 2026-09-24 on the owner's order; the incident history behind every rule is in `docs/law/skill-drain-archive-2026-09-24.md` (grep the F-ID).

**Attended sessions: the tracked toolkit `scripts/attended/` does this whole skill from one JSON config (`land.sh`, under `dlock.sh`; `scripts/attended/README.md`). The steps below are what it encodes and what a hand-run must still do.**

## 0. Preconditions (abort if any fails; fix the precondition first)
- [ ] **IS IT ALLOWED? The FIRST command, before classification and before you form an opinion:** `node scripts/drain-block-check.mjs --strict <done-move filename | taskfile | branch>`. **Exit 1 = STOP** (a policy block is not a property of the tree; no git probe can see it; a well-argued runner report is not an unblock). Read the `blockClass`: `owner-fork` is lifted by the owner only; `gate-side` is a fire-recorded readiness hold you lift by SATISFYING its stated condition and re-registering the leaf in the same commit. `--strict` makes an unmatched master (no goal leaf) exit 2 instead of 0: UNKNOWN is a Goal Registration finding, never a clearance. `--all` audits every blocked leaf.
- [ ] STATUS.md line 1: you hold the lock (attended) or no fresh ACTIVE fire owns main (the four shapes are in CLAUDE.md §1). **And `tasks/.fire.lock` is absent or older than 50 minutes (F-E1T-2): a fire commits `lock CLEARED` before its last writes, so that directory, kept by the runner for the process lifetime, is the liveness signal; line 1 alone is not.**
- [ ] `git status --short | grep -v '^??'` on main is EMPTY apart from `logs/**`. A live main-slot task means WAIT (Mistake #12).
- [ ] **CUSTODY — NEVER PLACE CONTENT YOU HAVE NOT *DECIDED* TO MERGE INTO MAIN'S WORKING TREE. GATE UNDECIDED CONTENT IN A DETACHED WORKTREE** (F-1295-1; law at `scripts/fire.md` §3.0b; owed to this surface since s1343 and landed 2026-09-24). This is the INVERSE of the clean-main bullet above: that one asks whether someone else's dirt contaminates your gate; this one asks whether your gate leaks.
- [ ] Identify the drain unit: a done-move in `tasks/done/` plus its lane branch, or a `save/*` salvage ref. Read the run log tail (`tasks/runs/<stamp>-*.log`): confirm a REAL diff (Mistake #1; rc=0 with zero diff is not drainable) AND read it for the runner's acceptance evidence, which lives in the run log far more often than in an `artifacts/**/report.md` (only about one run in eight writes one). Absence of a report file is never by itself a REJECT.

## 1. Classify the diff (never blind-merge)
```
git log --oneline main..<branch>
git diff --name-status main...<branch>
```
For EVERY file: **LANE-TOUCHED only** (clean apply) / **MAIN-MOVED too** (3-way judgment: read both sides; today's main wins on infrastructure, the lane wins on its feature intent) / **NEW**. Known additive-collision files (`Balance.ts`, `vite-env.d.ts`) usually auto-merge; verify the hunks are additive. The two shared campaign documents (`artifacts/sol/map-art-campaign-2/report.md`, `reviews/sol-map-art-current-status-20260909.md`) are resolved by key (`## ` sections, `| name (id) |` rows) with the session's `md-3way.cjs`, never by `--theirs`.
- Base over ~12h stale AND conflicts on hot files (`Game.ts`, `CombatSystem`, `main.ts`)? STOP: rule the **RE-LAND** path (Mistake #15): a fresh task off current main, the branch kept as `save/<name>`, renamed `archive/<name>` when the re-land ships.
- List blobs over 50 MB in `main..<branch>` before merging; the public remote refuses pushes over 2 GB.

## 2. Merge (path-scoped, in a detached worktree)
Never place undecided content in main's working tree: cut `git worktree add --detach <scratch>/wt-<slice>-land main`, merge there (`git merge --no-ff --no-commit <branch>`, resolve by the classification you wrote, `NEVER git add -A`), gate there, and fast-forward main only at the end (`git merge --ff-only`). The art store: land the store's main (`branch -f` and push) and point the drains' scratch store worktree at it BEFORE any engine hash is measured.

## 3. The gate battery (on the MERGED tree; evidence, not vibes)
```
node scripts/drain-block-check.mjs --strict <the drain unit>          # re-assert on the merged tree
npx tsc --noEmit && npm run build && GR_RELEASE=e1 npm run build      # E1 payload law: node scripts/first-town-payload.mjs under 52,000,000 B
node scripts/run-guards.mjs --changed-since <base hash>               # picks the battery FROM THE DIFF; functions/ adds test:stats, test:accounts, test:mp
node scripts/evidence-budget.mjs <base hash> HEAD                     # owner 14a size budget: 40 MB of new artifacts/ + reviews/shots-* per landing, and the tree under its banked ceiling
node scripts/gate-battery.mjs --label "<slice> drain" --transcript artifacts/<slice>-gate.txt --cwd <the worktree> --env GR_CAPTURE_EXTERNAL_SERVER=1 --env GR_CAPTURE_BASE_URL=http://127.0.0.1:<scratch port> '[["own spec","npx","playwright","test","e2e/<slice>.spec.ts"], …]'
```
- `--workers=1` on every playwright command is a correctness requirement of the instrument, not style (at the default worker count the fire shell's CPU ceiling manufactures timing reds); `gate-battery.mjs` injects it and keeps an append-only transcript. Never pin `workers` unconditionally in `playwright.config.ts` (`workers: isFireShell ? 1 : undefined` is the mechanism, guarded by `fire-shell-serialisation.test.mjs`).
- One vite server of ours at a time: the dependency cache under `node_modules/.vite` is shared and two servers cause optimizer reload storms; serialize gates under the drain lock and warm the server with one cheap test before the run.
- Adjacent = the task's self-check list plus `task-025` plus `m1-01` plus `m2-01` minimum. BOTH projects. Capture exit codes from the command, not a pipe tail.
- Boot probe: zero console and page errors, plain boot desktop and 390px; a user-facing slice is verified WITHOUT `?debug` (Mistake #10).
- Anything renders: perf snapshot vs baseline; over 15% p95 regression or over 200 stress draw calls fails. The host's p95 is bimodal on some maps; a ratio needs a same-session control.
- **Reds are fingerprinted, never excused by membership:** a control of the same specs on clean main (same port, warmed) is the attribution; `node scripts/red-inventory-lookup.mjs <spec>` tells you where to SPEND the control, and its 2026-08-11 snapshot is stale. Any NEW red (not in the control) fails the drain: revert the merge, write the finding, spawn the corrective, ladder it, all in this session.
- Full `npm run test:node-guards` on the merged tree before the pin, and again on main after the fast-forward (the diff-picked battery misses guards keyed on other files). The engine-era and bench-seeds rows red before the pin are the pre-pin hash class.
- **The pin is measured LAST**, after every cure the drain itself made, on the merged tree with the scratch store at the landed commit; a same-era pin's cause names the store commit and what moved; never an era bump.

## 4. The review file `reviews/<slice>.md` (model: `reviews/sci-04.md`)
Slice, branch, tip → Verdict → What it does (one paragraph, and where the PLAYER sees it in a plain boot) → Evidence (real numbers, suite counts, timings, the control's attribution) → Merge classification (base hash, per-file table, conflict resolutions) → Findings (F-IDs; each non-blocking-with-reason or spawning a corrective in the same commit).

## 5. Commit and ledger (one event, one commit set)
- [ ] Merge message: `<prefix>: <slice> — <one-line>` plus an evidence line.
- [ ] **GOAL REGISTRATION LAW (owner 2026-07-16):** flip the leaf in `tasks/goals.json` IN THE DRAIN COMMIT: `status` → `merged`, `mergeHash` → the full 40-char hash (not `mergeCommit`, which nothing reads).
- [ ] `tasks/BACKLOG.md`: the ladder line marked landed IN THIS COMMIT (Mistake #5); un-gate anything whose GATE just opened; queue it if the throttle allows.
- [ ] Salvage lifecycle: `save/*` → `archive/*` once the content is on main; the lane branch stays as the merged ancestor (safe-dupe for the next pre-flight).
- [ ] Screenshots to `reviews/shots-<slice>/`; every artifact the review names must exist.
- [ ] `git push origin main` (BACKUP LAW); then `bash scripts/deploy.sh` when runtime changed (PUBLISH-GATED: DO NOT WRAP it through node; a headless fire leaves the deploy to the attended session; the assayer must report SYNCED, and if it prints NOT SYNCED, replay the mirror rsync and restart by hand); then the preview redeploy.
- [ ] `npm run test:ledger-guards` as the last act of a drain that wrote a ledger row (the guards that judge the row run before it exists otherwise).

A headless fire runs every `npm run …` and `bash scripts/*.sh` this skill names through node (`execFileSync`), because its permission gate refuses the bare forms; an attended session runs them as written.

## 6. Handoff
Update STATUS line 1 if you hold the lock (keep the OWNER'S DESK tail verbatim; declare a new desk item with a first-key BACKLOG row), the handover section, and the memory note if a rule was learned: what merged (hash), what the gate proved (counts), what un-gated, what is next.
