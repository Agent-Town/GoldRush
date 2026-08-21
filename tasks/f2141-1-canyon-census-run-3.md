# Task f2141-1-canyon-census-run-3: run the Canyon Works census — attempt 3, on a lever that has now been MEASURED (lane-d, prefix "docs:")

**FIRE-AUTHORED (attended review welcome)** — s2141, 2026-08-21.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; **`artifacts/f2135-canyon-census/REPORT.md`** (your own predecessor's Law 2 stop — it is banked on THIS LANE and it tells you exactly what is already proved); `artifacts/f2086-canyon-census/REPORT.md` (the drained predecessor whose inputs you CITE and must NOT re-derive); `scripts/gr-sim-campaign.mjs` (the sanctioned harness — read, never edit); `scripts/f2135-canyon-census-player.mjs` and `scripts/f2135-canyon-epoch3-checkpoint.mjs` (both banked on this lane, both yours to run).

## Pre-flight — READ THIS ENTIRE SECTION BEFORE RUNNING ANY GIT COMMAND

⚠️ **THIS LANE IS INTENTIONALLY AHEAD OF MAIN AND ITS AHEAD CONTENT IS YOUR OWN BASE. DO NOT RESET IT. DO NOT `git checkout -B lane/d main`. DO NOT `git clean -fd`.** The usual SAFE-DUPE template is WRONG for this task and following it would destroy the proven epoch-3 checkpoint and census player that this task exists to re-use — the exact shape of Mistake #2.

```
LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR
EXPECTED-HOLDS: artifacts/f2135-canyon-census/REPORT.md
EXPECTED-HOLDS: artifacts/f2135-canyon-census/census.json
EXPECTED-HOLDS: artifacts/f2135-canyon-census/epoch3-checkpoint.json
EXPECTED-HOLDS: scripts/f2135-canyon-census-player.mjs
EXPECTED-HOLDS: scripts/f2135-canyon-epoch3-checkpoint.mjs
```

Those five paths are the complete held set, measured live against `node scripts/lane-usable.mjs lane-d` by the authoring fire at 2026-08-21T20:52Z. If the lane holds anything else, **STOP and report it** — an unanticipated held path is precisely the state the lane-safety guard exists to refuse.

**Step 1 — acquire main without losing the lane.** Run `git merge --no-edit main`. The authoring fire proved this merge is CLEAN before dispatching (`git merge-tree --write-tree main lane/d` → rc 0, tree `c242fc164ad1d81068d8d7f4c31fb266e812d2f1`, no conflict list), so a conflict here means the board moved under you: **STOP and report it**, do not resolve by hand.

**Step 2 — prove you have both halves, by content.** Each of these must return **exactly 1**; **zero means your lane is not what this master was written against — STOP and report the count, do not proceed and do not "fix" it**:
- `grep -Fc "view.now.canyonConnect = this.canyonConnectDiagnostics()" src/sim/HeadlessContractSim.ts`
- `grep -Fc "const orders = await player(turn.view" scripts/gr-sim-campaign.mjs`
- `grep -Fc "const connect = view.canyonConnect ?? view.now.canyonConnect;" scripts/f2135-canyon-census-player.mjs`

**Step 3 — cleanliness.** `git -C worktrees/lane-d status --short` (or `git status --short` in the worktree) must be clean, with the **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`.** What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` that you did not make.

**Step 4** — `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (an owner sanction, two proved gates, and a lever that is no longer a claim)

The owner **deferred the ruling** and **granted the measurement** in the same row, verbatim: *"I never played that level ever, I can't really decide on that"* … *"a fire MAY run the census MEASUREMENT (fastest possible pylon chain under walk-era economics — a number, zero product change, reversible) so the eventual ruling is informed; the ruling itself waits until the owner has stood on that map."*

**This task is that measurement and NOTHING else.** It changes no product code, takes no fork, and recommends no balance change.

**This is attempt 3, and §7.5 is satisfied because the premise changed in the code, not in anyone's confidence.** Attempt 1 (s2086) stopped: the harness could not select an E3 contract — CURED by `--contract` (`ce75bc31970404a9a48c8e94a70c542739739112`). Attempt 2 (s2135) stopped: **the master's central lever pointed at the wrong object** — it cited `HeadlessContractSim.ts:1837`, a real line inside `private diagnostics()`, which is *not* the view the player receives (F-2135-4). That is CURED by `f2138-1`, merged **`cd59fb273ed34a3905ac32bb9d4907322ad33109`**.

✅ **THE LEVER IS MEASURED, NOT REASONED — and it was measured at YOUR parameterisation, not only at the test's.** The authoring fire ran it three ways before writing this line. `src/sim/HeadlessContractSim.ts:1503` now assigns `view.now.canyonConnect`, and `scripts/gr-sim-campaign.mjs:106` hands the player exactly `turn.view` from `sim.currentTurn()`. Constructing `e3-canyon-works` and reading `sim.currentTurn().view.now.canyonConnect` returns `{"powered":0,"required":2,"byWave":6,"complete":false,"failed":false}` — **PRESENT with `admissionProbe: true`, PRESENT with `admissionProbe` absent (the census parameterisation), and PRESENT on seed `-02`.** The pinned guard `scripts/canyon-connect-view.test.mjs` ("Canyon Works alone publishes its live connection objective") passes 1/1 in 3.7 s and asserts both directions — present on `e3-canyon-works`, **absent** on `e1-dry-gulch`.

⚠️ **WHAT IS STILL UNPROVEN, STATED PLAINLY SO YOU DO NOT INHERIT MY CONFIDENCE: the census player has never executed past its first turn.** Attempt 2 threw on turn 1. Its six-site route, its harvest/poll fallback and its pair-buying logic are **banked, not proved**. If that logic cannot pursue the objective honestly, that is a Law 2 stop and a finding — see the firewall lift below.

**GATE B (F-2135-1) — the harness can only report a YES, and this is EXPECTED.** `scripts/gr-sim-campaign.mjs:113` throws `ended unsecured at wave N` **above** the code that writes any leg artifact, and securing is itself gated on this very objective (`src/sim/HeadlessContractSim.ts:1701`, `objectiveAllowsSecure`). **If the deadline is missed the harness produces no rows and no hash — only an exception. That is a RESULT, not a failure**, and your player's own per-turn trace is the thing that survives it.

**GATE C (F-2135-2) — the harness runs ONE seed.** `scripts/gr-sim-campaign.mjs:93` reads `benchSeeds[contract.id]?.[0]`, index zero, always. `assets/contracts/bench-seeds.json` pins **two** seeds (`e3-canyon-works-01`, `e3-canyon-works-02`). A two-seed census is **unsatisfiable through the sanctioned instrument**; say so rather than reporting one seed as if it were the plan.

## Scope

1. **Preserve attempt 2's evidence before you overwrite anything (Retention Law — move, never delete).** `git mv artifacts/f2135-canyon-census/REPORT.md artifacts/f2135-canyon-census/attempt-2-blocked/REPORT.md` and the same for `census.json`. ⚠️ **This is not housekeeping, it is a correctness fix**: the banked `census.json` carries `"status": "blocked"` and a `blockedReason` that is **now false**, and the player's `persist()` appends into whatever file it finds — so leaving it in place would publish a fresh census still labelled blocked. **Do NOT move `epoch3-checkpoint.json`** — see item 2. Add a one-line `attempt-2-blocked/NOTE.md` saying these are the Law 2 stop artifacts of attempt 2, superseded by this run, retained as evidence.
2. **Regenerate the checkpoint with the banked script** (`node scripts/f2135-canyon-epoch3-checkpoint.mjs`). Re-generating rather than re-using proves the proven script still works against 29 commits of newer main. If the regenerated bytes differ from the banked `epoch3-checkpoint.json`, that is **EXPECTED and reportable, not a STOP** (main moved). If the script **fails**, that IS a Law 2 stop. State in the report which epochs it activated, in what order, and that no unlock was bypassed and `contractUnlockStatus` was not stubbed.
3. **Run the census through the SANCTIONED harness, twice** (determinism), using the command shape attempt 2 recorded, with `--contract e3-canyon-works --resume <your checkpoint>` and a distinct `F2135_CENSUS_RUN` per run. **Paste both exact command lines into the report.** ⚠️ Expect GATE B: capture the harness's exception text **verbatim** if it throws. **Do NOT edit `scripts/gr-sim-campaign.mjs` to make it not throw** — it is the sanctioned instrument and its behaviour is the finding.
4. **Write the report.** `artifacts/f2135-canyon-census/census.json` (raw rows: per turn `wave`, `powered`, `required`, `complete`, `failed`) and `artifacts/f2135-canyon-census/REPORT.md` in the house style of `artifacts/f2086-canyon-census/REPORT.md`. It must state: whether the objective completed and at which wave; **THE MARGIN — how many of `required` were powered when `wave > byWave` latched failure, or the wave of completion if it succeeded**; determinism (identical runs → identical trace; **if the two runs diverge, the number is not evidence — report THAT instead**); and, kept strictly separate, **what you did NOT establish**, naming GATE C explicitly. **CITE** the predecessor's established inputs (`required: 2` counts powered `consumer`/`gallery` nodes; six beacons; 330 g; `byWave` compares the wave index) — re-deriving merged work is how a run burns its budget.
5. **Report every change you made to the player** (see the lift below), each with its reason, in a dedicated REPORT.md section. If you changed nothing, say so.

## Firewall

**TOUCH-ONLY:** `artifacts/f2135-canyon-census/**` · `scripts/f2135-canyon-census-player.mjs` (conditionally — see the lift) · the done-move of this task file.

🔓 **FIREWALL LIFT: `scripts/f2135-canyon-census-player.mjs`.** Its route logic has never run past turn 1, so you MAY repair it to pursue the objective — but under three binding limits: (a) **every change is listed in the report with its reason** (scope 5); (b) **no change may touch the objective, the deadline, the seed, the contract or the harness** — you are measuring a number, not moving it; (c) **you may not invent a routing policy to manufacture a number.** If the honest route cannot be flown, STOP and report — see Law 2.

**NO changes to:** **any `src/**`** · **`assets/**`** (the deadline and the seeds are the SUBJECT of the measurement — moving either destroys it) · **`scripts/gr-sim-campaign.mjs`** · **`scripts/f2135-canyon-epoch3-checkpoint.mjs`** (proven; run it, never edit it) · `scripts/f2086-canyon-census-player.mjs` (retained evidence — read it, copy from it, never edit it) · every other existing `scripts/*` file · `specs/**` · `e2e/**` · `tasks/BACKLOG.md` · `tasks/goals.json` · `STATUS.md` · `package.json`.

## Law 2 — honesty outranks completion (binding)

If the objective cannot be pursued honestly — the checkpoint cannot be built without a bypass, the runs are non-deterministic, the trace cannot be read, or the route logic cannot be repaired within the lift above — **STOP and report what you found.** Do NOT tune anything to make the deadline reachable. **A stop with a clear account is a success here**; this task's own two predecessors stopped exactly this way and both were right to. ⚠️ **But note what is NOT a Law 2 stop: the harness throwing `ended unsecured` is EXPECTED (GATE B) and is a measurement, not a blocker.** Neither is a regenerated checkpoint whose bytes moved (scope 2).

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `node --test scripts/canyon-connect-view.test.mjs` green **on your merged lane** (proves the lever survived the merge; ~4 s).
- Both census commands re-run end-to-end, both exact command lines pasted into the report.
- Determinism shown: the two runs' traces compared explicitly in `census.json`.
- `git status --short` shows ONLY the TOUCH-ONLY paths. **No `src/`, no `assets/`, no existing script other than the lifted player.**
- Confirm in the report that the contract is byte-unchanged: `git diff --quiet assets/contracts/epoch-3-voltage/contracts.json` must be silent.

End: **READY-FOR-GATES** + report: (a) that the pre-flight MERGED rather than reset, and the three grep counts; (b) which epochs the checkpoint activated and that no unlock was bypassed; (c) whether the leg secured and the harness's verbatim text if it threw; (d) **THE MARGIN AT THE DEADLINE, per the trace**; (e) determinism across the two runs; (f) every player change and its reason; (g) anything you could not establish, naming the one-seed constraint.
