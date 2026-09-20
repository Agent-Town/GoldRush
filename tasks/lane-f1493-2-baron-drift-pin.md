CODEX: model=gpt-5.6-sol effort=xhigh

# lane-f1493-2-baron-drift-pin — give the E2 baron maps a real drift tripwire, in the file where outcome pinning already lives

**FIRE-AUTHORED s1494 (attended review welcome).** Authored from a finding that was **declared by its
own author before it shipped** (F-1493-2, `tasks/goals.json` leaf `f1493-1-parity-repin`,
`authorNotesSuccessor`) and **confirmed on the merged tree by this fire**
(`reviews/f-seed-1-plus-f1493-1-landing.md`, merge `335408077`). No spec slice is needed and none is
invented: this is test-instrument hygiene inside an existing, precedented pattern. No design fork, no
canon, no owner word.

ROLE: implementer on lane-a. WORKDIR: `worktrees/lane-a` (branch `lane/a`). Commit prefix `bdp:`.
Never touch STATUS.md, reviews/, tasks/queue/, tasks/goals.json, or other lanes.

---

## PRE-FLIGHT — DO THESE IN ORDER. STEP 1 IS MANDATORY AND UNCONDITIONAL.

**F-1465-2 exists because a master offered the refresh as a conditional and put a currency probe
beside it; the runner ran the probe first against a stale lane and truthfully reported a failure that
was only staleness. Refresh FIRST, probe SECOND, always.**

**STEP 1 — REFRESH (unconditional, run exactly this):**
```
git -C worktrees/lane-a fetch origin main
git -C worktrees/lane-a checkout -B lane/a origin/main
```
This is safe and authorized: `node scripts/lane-usable.mjs lane-a` read **USABLE** (`ahead=0`,
`tracked-dirt=0`) at authoring time — the branch's entire former content is on main at `335408077`.

**STEP 2 — CURRENCY PROBE (only after step 1). Must print `1`:**
```
grep -c "if (contract.twist.baron) expect(first.waves).toBeGreaterThanOrEqual(contract.twist.secureWave);" e2e/er01-e2-census.spec.ts
```
If it prints `0`, the lane does not have the F-1493-1 landing this task is built on — **STOP** and
report the tip you found. (s1494 verified this exact one-line key returns `1` on main at authoring
time, and re-verified it in the lane after the refresh, per F-1425-2: a key that spans a wrapped line
matches nowhere, including in the file it was copied from.)

**STEP 3 — CLEANLINESS:** `git -C worktrees/lane-a status --short` → must be clean.
> **FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED and are NEVER a STOP; list them and proceed (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any `.png` — regenerated evidence. ⓘ What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — i.e. anything a live drain or a concurrent task could actually own.

---

## READ FIRST (paths, in this order)

- `scripts/gr-sim.test.mjs`, the test **`the Baron driver runs the declared fight and keeps medal writes off headless`** — **this is your template and you must follow its shape, not invent one.** Read the whole test: the juiced `Balance.sparkRig`, the 100,000-HP hero, `while (!turn.terminal) turn = sim.advanceToTurn()`, `const first = run(); const second = run(); assert.deepEqual(second, first);` **before** any pin, and the long named-cause comment block above the pinned object.
- `reviews/f-seed-1-plus-f1493-1-landing.md` — why this gap exists and why it is deliberate.
- `e2e/er01-e2-census.spec.ts`, the test **`census support is explicit and deterministic`** — the row that used to catch this by accident. **You are NOT editing this file.**
- `assets/contracts/epoch-2-steamworks/contracts.json` and `assets/contracts/bench-seeds.json` — the four E2 contracts and their two seeds each.

## WHY (evidence, quoted)

s1493 corrected an unsound census assertion and **declared the cost of its own correction in the same
breath**: *"F-1493-2 (declared, not fixed): the corrected row no longer catches baron-map tuning
drift, because it never did except by accident on 3 of 4 — a real ratchet would be a new
deliverable."* (`tasks/goals.json`, leaf `f1493-1-parity-repin`.)

s1494 drained that slice and confirmed the gap is real rather than theoretical, by **reading the
files rather than reasoning about them**:

- `e2e/er01-e2-census.spec.ts` now asserts, on a baron map, only `secured: true`, `calls: 0`,
  per-seed hash determinism, and `waves >= contract.twist.secureWave`. **A Hill Mine fight that
  drifted from 14 waves to 25 would pass.**
- `scripts/gr-sim.test.mjs` **does** contain an `e2-hill-mine` test — but it is
  `gr-sim boots escort mode from data instead of URL state`, a **boot/mode** test that never runs the
  fight to a terminal turn. It pins `escortDiagnostics` and the modes list, nothing about the battle.
- The only byte-exact outcome pin for any baron anywhere is **`e1-baron`**, in
  `scripts/gr-sim.test.mjs`. E2's three baron maps have none.

**Three of the four E2 contracts declare a baron** — `e2-hill-mine`, `e2-trestle`, `e2-incline`
(`e2-pressure-garden` is the baron-less one, and it keeps its strict `waves === secureWave` equality,
which the engine genuinely guarantees there). So the corpus has **three unpinned baron fights**.

**Why anyone should care, named rather than assumed:** the E1/E2 contracts are the seed corpus the
**AP-10d harness ablation** is measured against. If a baron map's fight length drifts silently, the
ablation's baseline moves underneath a comparison whose entire value is that the game is held fixed
while the harness varies. A drift tripwire is cheap; a bench whose baseline moved without telling
anyone is not recoverable after the fact.

## THE DESIGN DECISION, MADE AND EXPLAINED — DO NOT RE-OPEN IT

The pin goes in **`scripts/gr-sim.test.mjs`**, NOT back into the census spec. Two jobs, two files:

- `er01-e2-census.spec.ts` answers *"is this contract agent-ready, explicitly and deterministically?"*
  Its assertions must be things the **engine guarantees**. Bolting byte-exact tuning numbers onto it
  would make a readiness instrument red every time anyone tunes combat — and it is exactly that
  conflation (asserting an equality the engine never promised) that caused F-1492-1 in the first
  place.
- `gr-sim.test.mjs` is where outcome pinning already lives, where the `e1-baron` precedent sits, and
  where the named-cause discipline (F-1441-3) is already written at the call site for the next person
  who sees a red.

## SCOPE — numbered, each item testable

1. **Add ONE new test to `scripts/gr-sim.test.mjs`**, modelled on the `e1-baron` test, that pins the
   run outcome of the **three E2 baron contracts**: `e2-hill-mine`, `e2-trestle`, `e2-incline`.
   Use **seed index 0 only** for each (`e2-hill-mine-01`, `e2-trestle-01`, `e2-incline-01`) — see the
   budget clause in §4 for why, and do not silently pin both seeds.
2. **Prove determinism BEFORE you pin anything.** For each contract, run the sim to a terminal turn
   **twice in-process** and `assert.deepEqual(second, first)` exactly as the `e1-baron` test does.
   **If any pair disagrees, STOP and report it as a finding — do not pin, and do not "fix" it.** Two
   disagreeing runs mean no pin is legitimate; that is a real discovery about the sim and it is worth
   far more than this task.
3. **Take every number from YOUR OWN run. Never from this file, and never from any review table.**
   This master deliberately states no expected values. Pin the same shape `e1-baron` pins —
   `{ secured, waves, timeMs, gold, kills, calls, eventLogHash }` — for each contract.
4. **Write a named cause at the call site**, in the `e1-baron` block's voice: one comment naming
   **F-1493-2**, this task, the date, and the one-sentence reason ("the census equality that used to
   catch baron-map drift was unsound and was correctly relaxed at `335408077`; this is its
   replacement"). A future reader who sees this red must be able to learn, without leaving the file,
   that **a blind re-pin is forbidden and a named cause is required** (F-1441-3).
5. **Assert `waves >= contract.twist.secureWave` inside the new test too**, with a one-line comment
   that `autoSecureWaveForRun()` returns `Number.MAX_SAFE_INTEGER` while `twist.baron &&
   !baronBeaten` — so the reader knows the declared `secureWave` is a bypassed input on these maps
   and is not tempted to "fix" a pin by editing the contract data.
6. **Give the test an explicit `{ timeout: … }`** sized from your own measurement with real headroom,
   in the style the neighbouring tests already use.

## BUDGET — this is a hard part of the scope, not advice

`scripts/gr-sim.test.mjs` is already the dominant term of `test:node-guards` (~55.6s of it, measured
s1462), and that battery runs on **every fire**. Three new full fights are not free.

- **Measure and report** the file's wall time **before** and **after** your change (`npm run
  test:node-guards` gives a per-file duration; a direct `node --test scripts/gr-sim.test.mjs` is
  fine for attribution as long as you say which you used).
- **If your addition costs more than ~30s**, reduce it — pin `e2-hill-mine` alone (the unique
  baron+`pressureEnabled` cell, and the one whose red started all of this) and report in your summary
  that you did, and by how much you were over. **A smaller honest pin is a success. Silently blowing
  the budget is not** — and neither is dropping coverage without saying so.

## FIREWALL

**TOUCH-ONLY:** `scripts/gr-sim.test.mjs`.

**NO — do not edit any of these, for any reason, even if you believe it would help:**
- `e2e/er01-e2-census.spec.ts` — the readiness/drift separation above is the whole point.
- `assets/contracts/**` — **`contract.twist.secureWave` is REJECTED BY NAME.** s1493 measured that it
  is a bypassed input on a baron map; editing it changes no behaviour it appears to describe, widens
  the sim's tick budget, and rewrites the player-facing "secured wave N" line. That is the F-1441-3
  re-pin reflex wearing a data file's clothes.
- `src/**` — if a pin will not settle, that is a **finding**, not a licence to change the game.
- `STATUS.md`, `tasks/goals.json`, `tasks/queue/**`, `reviews/**`, other lanes.
- The existing `e1-baron` pin and the six `F-1493-1` re-pins — leave every number you find alone.

## SELF-CHECK before you report

1. `npx tsc --noEmit` → clean.
2. `npm run build` → green.
3. `npm run test:node-guards` → **rc=0**, and report `tests / pass / fail / skipped`. This is the
   battery your change lives in; a green here is the deliverable.
4. Run `node --test scripts/gr-sim.test.mjs` **twice** and confirm your new pins are identical both
   times (cross-process determinism, not just the in-process pair from scope item 2).
5. Report the wall-time before/after numbers the BUDGET clause demands.
6. `git -C worktrees/lane-a status --short` → clean apart from the F-1407-1 churn classes.

**READY-FOR-GATES** — report: the commit sha; the pinned object for each contract, verbatim; the two
determinism results (in-process and cross-process); the wall-time delta and whether you stayed inside
the budget; and anything you found and did **not** fix, named as a finding. If you stopped at any
STOP above, report exactly which one and what you found — a truthful stop is a good outcome, and it
costs the factory far less than a wrong pin.
