# F-1511-2 blocker-slide geometry gate

**Slice:** `lane-f1511-2-blocker-slide-geometry-gate`  
**Branch:** `lane/c`  
**Base tip:** `70903ae8c5a6`

## Verdict

**READY-FOR-GATES for the gameplay change; merge gate requires a supported-Node rerun of
`test:node-guards`.** Both routing judges and all landmark consumers are green. The exact node-guard
command ran under the lane shell's unsupported Node 23.11.1 and failed only the known F-1507-1
timeout-semantics guard; all Baron and E2 outcome pins passed unchanged.

## Change

`ClaimJumperEnemy.resolveBlocker()` now uses the existing blocker-centre-relative slide policy for
every blocker when the goal lies inside that blocker's padded span. That geometric head-on gate gives
a stable `avoidanceSide()` fallback without changing the enemy-relative `blockerSlideDirection()`
fall-through that protects wedge routing. No scalar deadband or new policy was added.

## Evidence

| Check | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0; existing chunk-size warning only |
| `npx playwright test e2e/landmark-collision.spec.ts e2e/never-trap.spec.ts --workers=1` | rc 0; **18/18 passed** in 1.8m, desktop + mobile |
| `landmark-collision.spec.ts:68` | **2/2 passed**; deterministic county-landmark go-around |
| `never-trap.spec.ts:88` | **2/2 passed**; Night Shift wedge/progress invariant preserved |
| `npm run test:node-guards` | rc 1 on Node 23.11.1; **343/345 passed**. Both reds are the same F-1507-1 timeout-semantics failure (direct plus fixture-owner replay). Baron driver and E2 Baron pinned outcomes passed; no Baron pin moved. |
| `npx playwright test e2e/map-census.spec.ts e2e/fort-landmark-collision.spec.ts --workers=1` | rc 0; **96/96 passed** in 6.4m, desktop + mobile |
| Browser error probes | Green through the specs' assertions; only known Three.Clock/render-demotion warnings appeared |

The F-1512-2 wandering `map-census.spec.ts:43` batch flake did not reproduce; all ten spot cases
passed, so no map drew the known flake in this run.

## Merge classification

**CONDITIONAL GREEN:** the scoped gameplay change is supported by 114/114 browser checks and stable
sim pins. Before merge, the supervisor should rerun `npm run test:node-guards` with the repository's
`.nvmrc` Node 26.4.0 installed normally. The lane does not carry that runtime, and guard infrastructure
is outside this task's firewall.

## Findings

- **F-1511-2 — CURED:** the centre-relative padded-span gate clears the deterministic head-on stall
  without reverting the F-BW-10 wedge cure.
- **F-1507-1 — ENVIRONMENTAL GATE BLOCK:** the lane shell uses Node 23.11.1 while `.nvmrc` pins
  26.4.0; Node 23 applies `--test-timeout` at file granularity and necessarily reds the protected
  per-test-budget assertion. No test or runtime file was changed to mask it.
- **F-1512-2 — NOT OBSERVED:** the known wandering mobile-spot flake drew no map in this run.

---

## DRAIN SUPERVISION — s1513, 2026-08-07 (merged `da540bfb`)

**Verdict: MERGED.** The runner's `CONDITIONAL GREEN` named exactly one precondition — a rerun of
`test:node-guards` on the repository's `.nvmrc` Node — and it is discharged below. The condition was
correctly identified and correctly refused by the lane: no test or runtime file was bent to hide it.

### The condition, discharged

| Check | Lane (Node 23.11.1) | s1513 fire shell (Node **26.4.0**) |
|---|---|---|
| `npm run test:node-guards` | rc 1 — 343/345, both reds the F-1507-1 timeout-semantics guard | **rc 0 — 346 tests / 343 pass / 0 fail / 0 cancelled / 3 skipped** |

The two lane reds were **purely the runtime**, exactly as the report diagnosed. `.nvmrc` pins 26.4.0;
Node 23 applies `--test-timeout` at file rather than per-test granularity and necessarily reds the
protected per-test-budget assertion. This is the standing F-1507-1 split (lanes v23.11.1, fires
v26.4.0) — still on the owner's desk, and this drain is a second independent datum for it.

### The check this class of change actually needs (F-1460-1)

The diff touches `src/entities/`, so the sim pins are in scope and a slice-local spec cannot see them.
Verified explicitly rather than assumed: **`the E2 Baron fights keep their pinned outcomes` PASSED**
(17.5 s) and `the Baron driver runs the declared fight and keeps medal writes off headless` PASSED
(21.9 s). **No Baron pin moved, and none was re-pinned** (F-1441-3 holds). The tally is identical to
the one I measured on the same tree before this slice (346/343/3), which is the cleanest available
evidence that this routing change moved no guarded number.

### Gates on the merged tree (`gate-s1513`, detached, §3.0b — main's tree never held undecided content)

| Check | Result |
|---|---|
| `npx tsc --noEmit` | **rc 0** |
| `npm run build` | **rc 0** (existing chunk-size warning only) |
| `landmark-collision` + `never-trap`, `--workers=1`, both projects | **rc 0 — 18/18 passed** (2.2m) |
| `landmark-collision.spec.ts:68` (the target) | **PASSED desktop + mobile** — was **2 FAILED**, reproduced twice, at s1512's baseline |
| `never-trap.spec.ts:88` (F-BW-10 wedge invariant) | **PASSED both** — the cure does not re-open the wedge |
| adjacent `fort-landmark-collision`, `--workers=1` | **rc 0 — 2 passed** (1.5m) |
| console/page errors | none; only the known `THREE.Clock` deprecation **warning** |

All Playwright runs used `--workers=1` (§3.1) against the default webServer on port 5188, probed free
before starting — not the `vite preview` scratch-port path the config comments warn about.

### Merge classification

Base `70903ae8`; lane `ahead=1 behind=10`. `git diff <base>..main` over both lane paths
(`src/entities/Enemy.ts`, the review file) is **empty** — main moved neither. Both files are
**LANE-TOUCHED only**: no MAIN-MOVED file, no 3-way graft, no conflicts. The gate tree was synced to
current main before the battery, so the numbers above are from the true post-merge tree, not the
lane's older base.

### The change, read from the code rather than inferred

Two lines: the `ACTIVE_TILE_ID === 'e1-twin-banks'` fence is deleted from both the `slideX` and
`slideZ` ternaries in `ClaimJumperEnemy.resolveBlocker()`. Inside the padded span the approach is
head-on, so `Math.sign(moveTarget.x - blocker.x)` is ~0 and the `|| this.avoidanceSide()` fallback
supplies a stable go-around **scoped to exactly that geometry**; outside the span
`blockerSlideDirection()` still governs, which is what preserves enemy-relative wedge routing. This
is the axis a scalar deadband could not reach — s1510 spent a full lane run proving that negative —
because the deadband asked about a *magnitude* where the real question was *where the goal is*.

### Findings

- **F-1511-2 — CURED and CLOSED.** Confirmed by a supervisor arm independent of both s1512's
  scratch-worktree measurement and the lane's own: same verdict from three separate instruments.
- **F-1512-1 — DID NOT REPRODUCE.** s1512 recorded `landmark-collision:157` red on *both* its arms and
  was careful to file it as a flake rather than claim it as a cure. It **passed on both projects here**,
  which supports the flake reading. Left open; one non-reproduction is not a closure.
- **F-1512-2 — NOT OBSERVED**, consistent with the lane's own run.
- **F-1507-1 — second datum.** The lane/fire Node split cost this slice a conditional verdict and cost
  me a rerun. Still non-blocking, still the owner's one-line call.
