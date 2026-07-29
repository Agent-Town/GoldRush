# Review — lane-d-collection-guards-root-invariance

- **Slice:** `tasks/lane-d-collection-guards-root-invariance.md` (FIRE-AUTHORED s1201)
- **Branch / tip:** `lane/perf` @ `278ad24c095372b0b67cd85a4759ab5938b8c68e`
- **Merge base:** `8c398bdc` (stale by 3 main commits — see Merge classification)
- **Merged at:** `fbefb903` ⚠️ **not by a drain commit of mine — see F-1202-2**
- **Drained by:** s1202 fire, 2026-07-29
- **§3.0 drain-block-check:** ✅ CLEAR (`status="queued"`), run FIRST, before classification and before I formed an opinion.

## Verdict

**MERGED — DELIVERABLE VERIFIED, WITH ONE BLOCKING-CLASS FINDING RAISED AND ITS CURE MEASURED (F-1202-1).**

The slice does exactly what it claims: both Playwright-collection guards are now root-invariant, their failures are legible, the invariance is guarded by a new battery file, and the previous slice's unguarded caption is pinned. I re-derived every premise myself on clean main before merging.

But the merge **also turned a deterministic-green battery into a flaky one** — 0/6 red before, 4/11 red after — and that is not a property of the new guard's correctness. It is a **latent `spawnSync` stdout-truncation race in the guard being fixed**, which the new guard's extra load merely made visible. I characterised it to root cause and **measured a working cure (0/8)**; the corrective is authored and queued rather than hand-applied, because fires gate and author — Codex implements.

## What it does

Both `scripts/whole-suite-collection.test.mjs` and `scripts/town-spec-collection.test.mjs` spawned `npx playwright test --list` with **no `cwd`**, so the child inherited the caller's directory. Run from anywhere but the repo root, Playwright found no config, fell back to defaults, matched the `*.test.mjs` files in `scripts/`, and executed node-test files as Playwright specs — streaming the node test-runner **binary protocol** into stdout, which the assertion message then dumped whole. The guard hid its own diagnosis exactly when it broke.

The slice resolves the repo root from the module's own location (`fileURLToPath(new URL('../', import.meta.url))` — mandatory, because this repo's path contains a space), bounds the failure message to the last 20 lines / 4,000 chars per stream, adds `scripts/collection-guards-cwd-invariance.test.mjs` which executes both guards from `os.tmpdir()` and asserts exit 0, registers it as the 15th battery file, and extends the `- Run tree:` assertion to pin `resolved masking-row test bodies` (closing F-1201-2).

## Evidence

All numbers measured by me on this machine. Premises re-derived on clean main **before** the merge — not read from the run's report.

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ exit 0 (4.51s) |
| `npm run build` | ✅ exit 0, 2136 modules, built in 2.08s |
| Battery, clean main, **pre-merge** | ✅ **72 tests / 72 pass / 0 fail**, exit 0 (14.2s) |
| **Premise re-derived, pre-merge** — `cd scripts && node --test whole-suite-collection.test.mjs` | ✅ **FAILS**, exit 1, 16.81s — assertion message is the raw node:test binary protocol, verbatim |
| **Premise re-derived, pre-merge** — `… town-spec-collection.test.mjs` | ✅ **FAILS**, exit 1, 0.45s — `Total: 0 tests in 0 files / Error: No tests found` |
| **Deliverable, post-merge** — both guards from `<repo>/scripts` | ✅ **exit 0** (1.51s / 0.53s) |
| **Deliverable, post-merge** — both guards from `/var/folders/…/T` (foreign cwd) | ✅ **exit 0** (1.51s / 0.53s) |
| `node scripts/run-guards.mjs --only test:node-guards` | ✅ `PASS rc=0 15s` |
| Guard count | **72 → 74** (N=2, as the run stated) |
| m3 subject restore (`scripts/suite-red-inventory.mjs`) | ✅ SHA-256 `310a97c0…488a9e` on **both** `lane/perf` and `main` — byte-identical to the master's stop-check |
| Battery determinism, **post-merge** | 🚨 **4/11 RED** — see F-1202-1 |

### The run's own report, checked rather than trusted

The run reported a **master correction** worth keeping: nested `node --test` inherits `NODE_TEST_CONTEXT`, and unless the outer guard deletes it Node **skips the recursive run and returns a false green in ~30 ms**. The shipped guard deletes exactly that one variable from a copied env. This is the "prototype the cure — it can pass its own guard while doing nothing" hazard, caught by the run itself. Its m1/m2/m3 control verdicts are consistent with everything I measured independently.

The run reported battery wall-time 5.35s → 5.53s; I measure 14–21s. Not a defect — different machine load — but it means **the run's +0.18s figure understates what the new guard costs**, and the honest number is roughly **+2–4s**.

## Merge classification

Base `8c398bdc` is 3 commits stale (`cf00ad73`, `4247c383`, `be2c9657`). The two-dot diff therefore showed **4 phantom deletions**, which I verified are exactly the set of files main moved since the base — not deletions at all:

| File | Class | Action |
|---|---|---|
| `package.json` | LANE-TOUCHED (main untouched since base) | taken from lane |
| `scripts/collection-guards-cwd-invariance.test.mjs` | LANE-TOUCHED (new) | taken from lane |
| `scripts/suite-red-inventory.test.mjs` | LANE-TOUCHED | taken from lane |
| `scripts/town-spec-collection.test.mjs` | LANE-TOUCHED | taken from lane |
| `scripts/whole-suite-collection.test.mjs` | LANE-TOUCHED | taken from lane |
| `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `tasks/lane-d-collection-guards-root-invariance.md` | **MAIN-MOVED-ONLY — phantom deletions from the stale base** | left alone |

Collision check: the lane-touched set and the main-moved set are **disjoint**, so no 3-way graft was needed. Post-merge `git diff fbefb903 lane/perf --` over the 5 paths is **empty — the merge landed byte-exact**.

Zero `src/` and zero `e2e/` bytes ⇒ no browser probe and no screenshots required (m3-05e/m3-05f precedent), stated here rather than silently omitted.

## Findings

### 🚨 F-1202-1 — the merge made the battery flaky, and the cause is a `spawnSync` truncation race *inside the guard being fixed*

**Measured, three arms, same machine, same session:**

| Arm | Battery | Red rate |
|---|---|---|
| pre-merge main (13 files, `spawnSync`) | 72 tests | **0/6** |
| merged (15 files, `spawnSync`) | 74 tests | **4/11** |
| merged + prototype cure (async capture) | 74 tests | **0/8** |

Every failure is the whole-suite collection guard — twice directly, twice through the new meta-guard wrapping it.

**Root cause, verified at the captured bytes, not inferred.** The failing assertion is `assert.match(result.stdout, /Total: [1-9]\d* tests/)` — but `result.status` is **0** and the listing is present and well-formed. The capture is simply **truncated before the trailing `Total:` line**:

- full solo capture: **296,028 bytes**, `Total: 2430 tests in 338 files` present, twice, byte-identical
- failing capture #1: **≈153,474 chars**, ends mid-line (`… assay-ledger-page.spec.ts:80:1 › locks the recor`)
- failing capture #2: **≈156,216 chars**

Two *different* truncation points ⇒ a **race**, not a buffer boundary. And it is not `maxBuffer`: the full output (296 KB) is well under the 1 MB default, and on overflow `spawnSync` would set `error=ENOBUFS` and a null status, whereas here `status` is 0 and the first assertion passes. **`spawnSync` is returning partial stdout while reporting success.** Four concurrent `execFile` listings return the full 296,028 bytes every time — so the defect follows the *synchronous* capture, not Playwright and not concurrency as such.

⚠️ **This defect was always in the guard.** The new meta-guard did not create it; it raised process load enough to expose it. The pre-merge 0/6 green was a **false green** — a racy capture that happened not to lose the race under lighter load. Reverting this slice would restore that comfortable false green and re-hide the bug, which is why I did not revert.

**Cure measured, not guessed** (memory: *a finding's recommendation is an untested second hypothesis*). Replacing the synchronous capture with promisified `execFile` — preserving the run's `{status, stdout, stderr}` shape so the scope-3 diagnostic and all three assertions survive unchanged — gives **0/8 red**, and is *faster* (12–15s vs 16–21s, because the async child no longer blocks the test runner's event loop). Prototyped on disk **unstaged**, measured, and reverted; the tree is back to `fbefb903` byte-for-byte.

➡️ **Corrective authored + queued: `lane-d-collection-guards-spawnsync-truncation`.** Not hand-applied: fires gate and author, Codex implements.

⚠️ **NEXT FIRE: expect the battery to be ~36% red until that lands, always on `whole suite collects without loading Vite-only modules`, always with `status` 0 and a truncated listing. That fingerprint is this finding — do not diagnose it as a new defect and do not "fix" the regex** (which is correct; see F-1201-1, already refuted at source last fire).

### 🔻 F-1202-2 — a concurrent writer committed my staged merge under its own unrelated message, through an ACTIVE lock

At 07:20:43 I took the line-1 lock (`be2c9657`). At **07:25:43**, while my gate battery was running, commit **`fbefb903` — "goals: tree updated — Chalk ruling unblocks era-art, rf-05 public URL live, e10 Static warm w/ 3 Qs pending"** (author `Claude (Cowork orchestrator)`) landed carrying **its own** `logs/.goal-tree.html`, `logs/dashboard.html`, `tasks/goals.json` edits **plus all five of my staged merge paths**.

It used a **non-path-scoped `git commit`**, which commits the whole index — so it swept my staged drain into a commit whose message describes something else entirely. Consequences, all real:

1. The slice's merge hash is `fbefb903`, a commit whose message never mentions it. Anyone auditing this slice by commit message finds nothing (**Mistake #16 shape, from the other direction**).
2. One commit now mixes two unrelated concerns, violating "one concern per commit" and "path-scoped adds ONLY".
3. My in-flight measurement was corrupted: a control I intended as "clean main" silently ran against the merged tree (it reported 74 tests where 72 were expected — which is how I caught it). I re-ran the control against `4247c383`'s file contents explicitly and got the true 0/6.

**Mitigation I adopted for the rest of the session, and recommend as practice while any concurrent writer is live:** stage nothing you are not about to commit; make experimental edits **on disk, unstaged**, since a plain `git commit` sweeps the *index* but not the working tree. Both my control and my cure prototype were run that way and survived untouched.

Not raised as a defect against the slice. Raised because the lock convention is the factory's only serialization primitive and something is writing straight through it. **Owner-visible: this is the second distinct way (after §1.1's stamp skew) the lock has failed to serialize main this month.**

## Bookkeeping

- Goal leaf `factory-collection-guards-root-invariance` → `status: "merged"`, `mergeHash: fbefb903`, this review, drain notes (Goal Registration Law).
- Done-move prefixed `shipped-fbefb903-…`.
- Corrective `lane-d-collection-guards-spawnsync-truncation` authored, goal leaf registered, queued to `tasks/queue/lane-d/`.
- GZ-01: **not owed** — zero `src/` and zero `e2e/` bytes, no player-visible change (m3-05e/f precedent).
- DEPLOY: **skipped** — zero gameplay code.
