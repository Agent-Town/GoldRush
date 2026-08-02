# f1412-1 — re-land the Twin Banks headless driver on cured main (E1 driver 4 of 5)

**FIRE-AUTHORED s1412 (attended review welcome).**

ROLE: main-slot implementer. WORKDIR: repo root. One task, firewalled.

WHY (the block on this work was a HASH DIVERGENCE, and that divergence has since been CURED — dated evidence):

  `e1-headless-twin-banks` (E1 driver 4 of 5) has been `blocked` since s1400. Its `blockClass` is
  **`gate-side`, NOT `owner-fork`** — `tasks/goals.json` says so in its own words: *"GATE-SIDE HOLD, NOT AN
  OWNER GATE — no owner word lifts this; a fire lifts it by landing the cure."* Nobody is waiting on Robin
  here. Three fires have each refused it for a reason that no longer applies:

  · **s1400 (F-1400-1)** — the lane branched before `372808f0`, so its two new `.mjs` call sites used the old
    positional `HeadlessContractSim` constructor. ✅ **Already fixed in the graft you are re-landing** — it
    calls `new HeadlessContractSim({ contractId, seed })`. Verify, do not redo.
  · **s1400 (F-1400-2) / s1403 (F-1403-1)** — the pinned secure hash `fnv1a32:5f57f7be` would not reproduce;
    every process outside the Codex runner measured `fnv1a32:bfd79d2a`, **eight times**, with eight hypotheses
    eliminated and a positive control reproducing exactly. That was refused as unexplained, correctly.
  · **s1404 `76f7e565` diagnosed it and s1406 `eaefdb24` CURED it**: the sim was inheriting V8's `Math.pow`,
    which differs by up to 3 ULP between Node 23.11.1 and Node 26.4.0. All five sim-reachable
    `Math.pow(base, wave)` sites in `WaveSystem.ts` now use repeated multiplication. **The two hashes were
    never in conflict — they were the same tree read by two interpreters.**

  ➡️ **So the reason this slice was refused is gone, and the graft itself was always correct.** It is preserved
  intact at **`save/f1400-1-twin-banks-reland-s1403` (`2a54c386`)**, verified present s1412. It is **one commit,
  four files, +98/−4**, and its merge-base with main is `91a4473e` — **43 commits behind**.

  🚫 **THE ONE THING THIS MASTER MOST NEEDS YOU TO UNDERSTAND: EVERY HASH IN THAT GRAFT IS STALE BY
  CONSTRUCTION, AND YOU MUST NOT CARRY ONE FORWARD.** The graft pins `fnv1a32:bdd90123` (CLI idle) and
  `fnv1a32:5f57f7be` with `kills: 189` (secure run). **Both were derived BEFORE `eaefdb24`**, which changed the
  wave-scaling arithmetic and therefore changes kill counts — measured on `the-claim`, the same cure moved
  `kills` 140 → 137 (2.1%) and moved its pinned hash. A 20-wave contract will move at least as much.
  **Expect both twin-banks values to be different, and treat a match as the surprise, not the default.**
  ⓘ `fnv1a32:bfd79d2a` is equally stale — it is the *other* pre-cure engine's reading of the same pre-cure tree.
  **Do not paste any of the three.** s1410 nearly refused a correct slice because it trusted a master's stale
  hash over the tree; s1412 landed `f1406-2` cleanly by deriving every value instead. Do the second thing.

READ-FIRST (paths — read them, do not skim):
 · `save/f1400-1-twin-banks-reland-s1403` (`2a54c386`) — the graft. Read the whole diff against `91a4473e`
   before you touch anything: `git diff 91a4473e save/f1400-1-twin-banks-reland-s1403`.
 · `scripts/gr-sim.test.mjs` on **current main** — the file has moved TWICE since the graft's base, and this is
   where your care is needed. `f1401-1` (`e45cf7c5`) added the escort-mode test at `:89`; `f1406-2`
   (`e5a1d545`) added the F-1406-2 comment at `:19`, a full-outcome `deepEqual` inside the Dry Gulch test at
   `:37`, and rewrote the Night Shift test at `:196` to run twice. **The graft's own edit to an existing line
   is the supported-contracts assertion, which now lives at `:56`, not `:41`.**
 · `reviews/e1-headless-bench-twin-banks-baron-s1400.md` and `reviews/e1-twin-banks-reland-s1403.md` — the two
   refusals, in their own words. Read what they proved, not just what they concluded.
 · `reviews/f1406-2.md` — the shape you are matching. Its pins are `deepEqual` on the WHOLE outcome object,
   which names the field that moved when it fires. The graft already uses that shape; keep it.
 · `reviews/f1410-1-bound-the-guard-battery-concurrency.md` — the per-child budget is **30 s**, and on timeout
   `spawnSync` returns `status: null`, so `assert.equal(run.status, 0)` fails on `null !== 0`. Relevant here
   because this slice adds the longest test in the file.

PRE-FLIGHT (main slot, tracked-clean): `git status --porcelain` must show no tracked dirt you did not create.
If tracked dirt exists that belongs to no task, STOP and report.
  ✅ **FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a
  STOP; list them and proceed (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting
  (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`,
  `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any
  `.png` — regenerated evidence (the F-1266-1 lane exception, s1266). ⓘ What still STOPs, unchanged and
  load-bearing: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
  ⚠️ **In particular: if `scripts/gr-sim.test.mjs` or `src/sim/HeadlessContractSim.ts` is dirty on arrival, that
  IS a STOP — it belongs to someone.**

SCOPE (numbered, each testable):
 1. **Graft the four files — never raw-checkout `scripts/gr-sim.test.mjs`.** Three of the four have not moved
    on main since the graft's base and may be taken as-is after you verify that with
    `git diff 91a4473e main -- <path>` returning empty: `src/sim/HeadlessContractSim.ts` (one line — add
    `'e1-twin-banks'` to `SUPPORTED_CONTRACTS`), `assets/contracts/bench-seeds.json` (adds seeds `-04` and
    `-05`), `env/goldrush-verifiers/README.md`. **If any of them HAS moved, graft it too and say so.**
    `scripts/gr-sim.test.mjs` has definitely moved and must be grafted hunk by hunk: append the new
    `Twin Banks…` test, and update the supported-contracts assertion at `:56`. **Do not revert, reorder, or
    reindent anything f1401-1 or f1406-2 added** — a diff that removes committed code outside this firewall is
    a rejection, not a merge conflict.
 2. **Derive BOTH twin-banks values on YOUR tree, before pinning either.** Run the CLI-idle path
    (`--contract e1-twin-banks --seed e1-twin-banks-01 --policy=idle`) and the in-process secure path exactly
    as the grafted test runs them. Paste the commands and the raw outcome lines.
 3. **Prove each value is stable before you pin it — an unreproducible pin is a broken instrument, not a
    finding.** Run each path **≥3 times** and show the outcome identical every time. If either flaps on one
    engine, **STOP and report**: that is a determinism finding worth more than this slice, and pinning a
    flapping value hands every future drain a red nobody can act on.
 4. **Report the deltas against the graft's stale pins explicitly** — old vs new `eventLogHash`, and old vs new
    `kills` (the graft says 189). This is the evidence that `eaefdb24` reached this contract, and it is the
    single most useful line in your report. If a value is UNCHANGED, say so and flag it as unexpected.
 5. **Check the second engine, because this contract is the one that exposed the divergence.** Re-derive both
    values under `~/.nvm/versions/node/v23.11.1/bin/node` as well as your own, and report whether they agree.
    ⚠️ **If they DISAGREE, STOP and report** — that means `eaefdb24` did not fully reach this path, which is a
    live cure defect and is worth far more than landing this slice. Do not pin a value that differs per engine.
 6. **State the cost, and do not bury it.** This adds the longest test in the file: a 20-wave secure run plus a
    vite SSR server. Report the per-test duration and the before/after wall time of
    `node --test scripts/gr-sim.test.mjs`. ⚠️ The grafted test carries `{ timeout: 45_000 }` while its inner
    spawns carry 30 s. **If the test's measured duration lands within 3× of its own 45 s timeout, say so
    loudly** — that is F-1410-2's margin warning, and on this contract it is a live risk rather than a
    formality: F-1408-2 measured the 25-wave `e1-night-shift` at **35.8 s in a fire shell**. A test that fits on
    the runner and times out in every drain gate is worse than no test.
 7. **Do not touch the block.** Flipping `e1-headless-twin-banks` and `f1400-1-twin-banks-rebase-and-repin` out
    of `blocked` is the DRAINING FIRE's act, paired with the merge, per `scripts/fire.md` §3.0 and F-1384-1.
    Say in your report that both leaves are ready to be flipped; do not edit `tasks/goals.json`.

TOUCH-ONLY: `scripts/gr-sim.test.mjs` · `src/sim/HeadlessContractSim.ts` · `assets/contracts/bench-seeds.json` ·
`env/goldrush-verifiers/README.md`.
NO: `src/systems/WaveSystem.ts` (the `eaefdb24` cure is merged and correct; a hash that does not match is a
FINDING, and changing the sim to match a hash is the precise failure this whole thread exists to detect —
it is also HELD by `lane/e2-arsenal`, so an edit here creates a graft collision for the baron) ·
`scripts/gr-sim.mjs` (the driver is correct; if you think otherwise that is a finding, not an edit) ·
`scripts/wave-scaling-cross-engine.test.mjs` and `scripts/cross-engine-skip.mjs` (different question — they ask
whether two engines AGREE; you are pinning a VALUE) · `assets/contracts/epoch-1-frontier/contracts.json` ·
`package.json` · `Balance` · any other test file · `tasks/goals.json` (see scope 7).

SELF-CHECK (name the exact commands and paste real numbers):
 · `npx tsc --noEmit` clean · `npm run build` green.
 · `node --test scripts/gr-sim.test.mjs` — expect **7** tests now, all pass, 0 fail. Paste the count and the
   per-test durations.
 · `npm run test:node-guards` — full battery, paste tests/pass/fail/skipped and wall time. The 3 skips are the
   F-1408-2 fire-shell cross-engine guards and are expected; anything else skipped is a finding.
 · `npm run test:ledger-guards` — paste the result.
 · The scope-2/3 derivation transcripts (≥3 runs per path) and the scope-5 second-engine comparison, in full.
 · `git diff --stat` proving the firewall: exactly four files, and no removal of committed code outside them.

READY-FOR-GATES + report: the derived values and their stability transcripts · the old-vs-new delta table from
scope 4 · the second-engine comparison from scope 5 · the cost numbers and margin verdict from scope 6 · a
one-line statement that both goal leaves are ready to be flipped out of `blocked` by the draining fire ·
anything you were tempted to fix outside the firewall, named but not fixed.
