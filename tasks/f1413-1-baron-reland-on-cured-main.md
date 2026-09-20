# f1413-1 — re-land the Baron headless driver on cured main (E1 driver 5 of 5, the FIRST boss driver)

**FIRE-AUTHORED s1413 (attended review welcome).**

ROLE: main-slot implementer. WORKDIR: repo root. One task, firewalled.

WHY (this slice was refused for TWO defects; one is mechanically fixable and one has since been CURED on main — dated evidence, each item verified s1413 by reading the commit, not inherited from a handoff):

  `e1-headless-baron` (E1 driver 5 of 5) has been `blocked` since s1400. Its `blockClass` is **`gate-side`,
  NOT `owner-fork`** — `tasks/goals.json` says so in its own words: *"GATE-SIDE HOLD, NOT AN OWNER GATE — no
  owner word will lift this; a fire lifts it by landing the cure."* **Nobody is waiting on Robin here.** The
  two refusals:

  · **F-1400-1 (mechanical)** — the lane branched at `fbcaa7a4`, which predates `b6a6b613`, so both of its new
    `HeadlessContractSim` call sites use the **old positional constructor** `new HeadlessContractSim('e1-baron',
    'e1-baron-01')`. `git` merges it clean and `tsc` is blind to it; it throws `Unknown contract: undefined` at
    runtime. s1400 proved this half curable: *with only the 2-line rewrite applied, the baron headline test
    PASSES and its pinned hashes reproduce*, so **the baron measurements themselves were sound at that time.**
  · **F-1400-3 (behavioural, and the reason this needed its own master)** — merged onto the main of that day,
    `node scripts/gr-sim.mjs --contract e2-hill-mine --mode escort` spun at 99.4% CPU and **never terminated**,
    while the identical command on clean main exited in seconds. Control-proven merge-induced, and proven NOT a
    consequence of F-1400-1 (it reproduced with the call sites already fixed).

  ✅ **F-1400-3's mechanism was cured on main by `38f456d3` (s1410, "bound the gr-sim driver with a secureWave+2
  ceiling").** The driver loop had no bound at all — `advanceToTurn`'s `maxTicks` returns early on every wave
  change — so any contract that never auto-secures spun forever and was immune to the caller's `spawnSync`
  timeout. It now throws a diagnostic naming contract/mode/seed/wave/ceiling and exits non-zero. That commit
  also filed **F-1410-3: "lane/e2-arsenal unblocked; RE-GRAFT, never reset."**

  ⚠️ **BUT READ THE NEXT PARAGRAPH BEFORE YOU TREAT F-1400-3 AS CLOSED — THIS IS THE MOST IMPORTANT
  INSTRUCTION IN THIS MASTER, AND IT IS THE ONE THING THIS SLICE HAS NEVER BEEN TESTED FOR.**

  🔍 **A BOUND CONVERTS A HANG INTO A RED. IT DOES NOT PROVE THE BEHAVIOUR CHANGE IS GONE.** F-1400-3's finding
  was that *merging this slice changed what escort mode does on `e2-hill-mine`* — a contract that declares BOTH
  a baron block (`escortCount: 8` on `e1-baron`; `e2-hill-mine` declares its own) and an escort mode, while this
  slice threads a new `escortsSpawned` count through `spawnBaronWave` / `spawnComponentBossWave` /
  `onBaronSpawned`. `38f456d3` did not touch any of those; it put a ceiling under the loop they were spinning.
  **So the honest state is: the SYMPTOM is bounded, the CAUSE is UNVERIFIED.** If the behaviour change is still
  present, this graft now turns a hang into a ceiling throw — which is a red in every future drain gate rather
  than a hang, i.e. better, but still a defect this slice introduced. **Scope 3 exists to answer that question
  with a control run, and it is a STOP condition, not a formality.** Do not report F-1400-3 as closed on the
  strength of `38f456d3` existing; report it closed only if your own control run says so.

  🚫 **EVERY PINNED VALUE IN THIS GRAFT IS STALE BY CONSTRUCTION, AND YOU MUST NOT CARRY ONE FORWARD.** The
  grafted test pins `kills: 869` and `eventLogHash: 'fnv1a32:b9566c6d'`. **Both were derived before `a05171ce`**
  (s1406, "make wave scaling cross-engine deterministic: `Math.pow` → repeated multiplication"), which changed
  the wave-scaling arithmetic and therefore changes kill counts. Measured on `the-claim`, that same cure moved
  `kills` 140 → 137 and moved its pinned hash. **This is a wave-20 boss contract with `escortCount: 8` and
  `tauntWaves [5, 12, 18]` — it will move at least as much. Expect both values to be different, and treat a
  match as the surprise that needs explaining, not as the default.** Two of the last three attempts at the
  neighbouring twin-banks slice died by re-pinning a pasted value; the one that landed (`f1412-1`) derived
  every value on its own tree. **Do the second thing. Derive, never paste.**

READ-FIRST (paths — read them, do not skim):
 · `lane/e2-arsenal` tip `9a9fb2bb` — the graft. Read the whole diff before you touch anything:
   `git diff fbcaa7a4 lane/e2-arsenal`. It is **one commit, four files, +260/−10**.
 · `reviews/e1-headless-bench-twin-banks-baron-s1400.md` — the refusal, in its own words. Read what it PROVED
   (the control runs) and not only what it concluded.
 · `reviews/f1401-1-bound-the-headless-driver.md` — the F-1400-3 cure and, crucially, **its escort canary**:
   that review states the control it measured for `--contract e2-hill-mine --mode escort` on main. Read it, then
   **re-derive it yourself** per scope 3 rather than trusting the number in it.
 · `tasks/f1412-1-twin-banks-reland-on-cured-main.md` and `reviews/f1412-1*.md` (if present) — the sibling
   re-land that landed cleanly one slot before you. **You are the same shape, one map over.** Match its
   derivation discipline exactly.
 · `src/systems/WaveSystem.ts` on **current main** — this is where your care is needed. See scope 2.

⛓️ **DEPENDENCY — CHECK THIS FIRST AND STOP IF IT IS UNMET.** This slice and `f1412-1` (Twin Banks, E1 driver
4 of 5) touch **the same three files**: `scripts/gr-sim.test.mjs`, `src/sim/HeadlessContractSim.ts`,
`assets/contracts/bench-seeds.json`. `f1412-1` was dispatched first and must be **merged to main** before you
begin. Verify with `git log --oneline -20 main` and by confirming `'e1-twin-banks'` is present in
`SUPPORTED_CONTRACTS` in `src/sim/HeadlessContractSim.ts` on your tree. **If it is absent, STOP and report —
grafting on top of an unmerged sibling produces a conflict nobody can attribute.**

PRE-FLIGHT (main slot, tracked-clean): `git status --porcelain` must show no tracked dirt you did not create.
If tracked dirt exists that belongs to no task, STOP and report.
  ✅ **FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a
  STOP; list them and proceed (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting
  (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`,
  `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any
  `.png` — regenerated evidence (the F-1266-1 lane exception, s1266). ⓘ What still STOPs, unchanged and
  load-bearing: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
  ⚠️ **In particular: if `scripts/gr-sim.test.mjs`, `src/sim/HeadlessContractSim.ts` or
  `src/systems/WaveSystem.ts` is dirty on arrival, that IS a STOP — it belongs to someone.**

SCOPE (numbered, each testable):

 1. **Fix F-1400-1 as you graft: convert BOTH positional call sites to the boot-object constructor.** The graft
    contains two occurrences of the form `new HeadlessContractSim('e1-baron', 'e1-baron-01')`; current main's
    constructor takes a single object. Rewrite both to `new HeadlessContractSim({ contractId: 'e1-baron', seed:
    'e1-baron-01' })` — **match the exact shape the tests already on main use**, read it from the file rather
    than from this sentence. ⓘ Coordinates are deliberately NOT given: the s1400 review cites these sites as
    `:220/:281`, and every line number in this repo's ledger has rotted at least once. **Find them by content.**
    Verify by running, not by reading: a missed site throws `Unknown contract: undefined` at runtime and `tsc`
    will not tell you.

 2. **Graft `src/systems/WaveSystem.ts` HUNK BY HUNK. A raw checkout of this file is an automatic rejection.**
    Main has moved here since the graft's base: `a05171ce` replaced all five sim-reachable `Math.pow(base, wave)`
    sites with repeated multiplication, and **that cure is correct, merged, and load-bearing for the entire E1
    bench.** `git checkout lane/e2-arsenal -- src/systems/WaveSystem.ts` would silently discard it and re-open
    the exact cross-engine divergence that cost this thread four fires. The lane's own change to this file is
    **small and orthogonal**: it threads an `escortsSpawned: number` parameter through the `onBaronSpawned`
    callback signature, `spawnBaronWave`, and `spawnComponentBossWave`. **Apply exactly that, and nothing else.**
    Then prove you did no harm: `git diff main -- src/systems/WaveSystem.ts` must show **only** the
    `escortsSpawned` threading, and **no** reappearance of `Math.pow` anywhere in the file. Say so in your report
    with the grep output.

 3. **THE ESCORT CANARY — a CONTROL RUN, and a STOP condition. This is the scope that decides the slice.**
    Answer the F-1400-3 question the bound did not answer, by measuring the same command on two trees:
      (a) **BEFORE** you graft anything, on clean main: run
          `node scripts/gr-sim.mjs --contract e2-hill-mine --mode escort` and record rc, wall time, wave count,
          `secured`, and the `eventLogHash`. **This is your control. Derive it; do not read it out of a review.**
      (b) **AFTER** the graft, run the identical command and record the identical fields.
    Then rule, in your report, on the evidence:
      · **Identical on both** → F-1400-3 is genuinely closed by the cure plus this graft. Say so, with both
        transcripts side by side. This is the outcome that lets the slice land.
      · **Terminates but DIFFERS** (different hash, wave count, or `secured`) → **STOP and report.** The
        behaviour change F-1400-3 named is still present and merely bounded. That is a finding worth more than
        this slice, and it is exactly what a ceiling would hide from a casual reader.
      · **Hits the ceiling / non-zero exit** → **STOP and report** with the full diagnostic line. The bound is
        doing its job and telling you the cause is live.
    ⚠️ **Run (a) BEFORE touching the tree.** A control measured after the change is not a control.

 4. **Derive BOTH baron values on YOUR tree, before pinning either.** Run the grafted headline test's secure
    path exactly as the test runs it, and the CLI path for the seeds you add. Paste the commands and the raw
    outcome lines. **Do not pin `kills: 869` or `fnv1a32:b9566c6d`** — those are the pre-`a05171ce` values and
    carrying either one forward is the precise failure this thread exists to detect.

 5. **Prove each value is stable before you pin it — an unreproducible pin is a broken instrument, not a
    finding.** Run each path **≥3 times** and show the outcome identical every time. If either flaps, **STOP and
    report**: a flapping pin hands every future drain a red nobody can act on, and on a boss contract with eight
    escorts a determinism defect is worth far more than this slice.

 6. **Report the deltas against the graft's stale pins explicitly** — old vs new `eventLogHash`, old vs new
    `kills` (the graft says 869). This is the evidence that `a05171ce` reached this contract, and it is the
    single most useful line in your report. **If a value is UNCHANGED, say so and flag it as unexpected**, and
    do not hand-wave it: on a wave-20 contract an unmoved kill count needs a mechanism.

 7. **Check the second engine.** Re-derive both values under `~/.nvm/versions/node/v23.11.1/bin/node` as well as
    your own, and report whether they agree. ⚠️ **If they DISAGREE, STOP and report** — that means `a05171ce` did
    not fully reach this path, which is a live cure defect on the boss path and is worth far more than landing
    this slice. Do not pin a value that differs per engine. ⓘ This is not ceremony: the cross-engine guard is
    deliberately SKIPPED in a fire shell (F-1408-2), so the drain that gates you **structurally cannot** produce
    this evidence. If you do not produce it, nobody will.

 8. **State the cost, and do not bury it.** This adds a wave-20 boss run with eight escorts — almost certainly
    the longest test in the file. Report the per-test duration and the before/after wall time of
    `node --test scripts/gr-sim.test.mjs`. ⚠️ Report the grafted test's own `timeout` value and **say loudly if
    the measured duration lands within 3× of it** — F-1408-2 measured the 25-wave `e1-night-shift` at **35.8 s in
    a fire shell**, and the fire shell is the slower instrument (F-1269-1). **A test that fits on the runner and
    times out in every drain gate is worse than no test.** If the margin is thin, say what timeout it needs; do
    not raise it silently.

 9. **Report, do not fix, the shared-state hazard you will notice.** The grafted test mutates `Balance.sparkRig`
    in place and restores it in a `finally`. Under `node --test` that is a shared-module mutation visible to any
    concurrently-running test in the same process. Name it in your report as a finding with your assessment;
    **do not restructure it in this slice** — that is a separate question and this firewall does not cover it.

 10. **Do not touch the block.** Flipping `e1-headless-baron` out of `blocked` is the DRAINING FIRE's act, paired
     with the merge, per `scripts/fire.md` §3.0 and F-1384-1 (a commit cannot contain its own hash, so it is two
     commits in one fire: code, then leaf). Say in your report that the leaf is ready to be flipped; **do not
     edit `tasks/goals.json`.**

TOUCH-ONLY: `scripts/gr-sim.test.mjs` · `src/sim/HeadlessContractSim.ts` · `assets/contracts/bench-seeds.json` ·
`src/systems/WaveSystem.ts` (scope 2 only — the `escortsSpawned` threading, nothing else).
NO: `scripts/gr-sim.mjs` (the driver and its ceiling are correct and were just cured; if you think otherwise
that is a finding, not an edit) · `scripts/wave-scaling-cross-engine.test.mjs` and `scripts/cross-engine-skip.mjs`
(different question — they ask whether two engines AGREE; you are pinning a VALUE) ·
`assets/contracts/epoch-1-frontier/contracts.json` (the baron block is data-declared and already correct;
changing the contract to make a hash match is the failure mode, not the fix) · `package.json` · `Balance` (see
scope 9 — report it) · any other test file · `tasks/goals.json` (see scope 10) · `lane/e2-arsenal` itself
(**RE-GRAFT, NEVER RESET** — F-1410-3; the branch is the only copy of this work and a lane pre-flight reset
would destroy it).

SELF-CHECK (name the exact commands and paste real numbers):
 · `npx tsc --noEmit` clean · `npm run build` green.
 · `node --test scripts/gr-sim.test.mjs` — all pass, 0 fail. Paste the test count and the per-test durations.
 · `npm run test:node-guards` — full battery, paste tests/pass/fail/skipped and wall time. The 3 skips are the
   F-1408-2 fire-shell cross-engine guards and are expected; anything else skipped is a finding.
 · `npm run test:ledger-guards` — paste the result.
 · The scope-3 escort canary: BOTH transcripts, before and after, side by side, with your ruling.
 · The scope-4/5 derivation transcripts (≥3 runs per path) and the scope-7 second-engine comparison, in full.
 · `grep -n "Math.pow" src/systems/WaveSystem.ts` — paste the output (expect none on the sim-reachable paths).
 · `git diff --stat` proving the firewall: exactly four files, and no removal of committed code outside them.

READY-FOR-GATES + report: the scope-3 escort canary ruling (this is the headline — it decides the slice) · the
derived values and their stability transcripts · the old-vs-new delta table from scope 6 · the second-engine
comparison from scope 7 · the cost numbers and margin verdict from scope 8 · the scope-9 shared-state finding ·
a one-line statement that `e1-headless-baron` is ready to be flipped out of `blocked` by the draining fire ·
anything you were tempted to fix outside the firewall, named but not fixed.
