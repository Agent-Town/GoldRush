CODEX: model=gpt-5.6-sol effort=high
# f1406-2-widen-the-e1-bench-hash-pins — pin an event-log hash for ALL THREE contracts the headless bench supports, so a divergence cannot sit on main unseen again (FIRE-AUTHORED, attended review welcome)
ROLE: main-slot implementer. WORKDIR: repo root. One task, firewalled.

WHY (F-1406-2, s1406 — measured, and the row has waited five fires for its own slice):
  `scripts/gr-sim.test.mjs` pins exactly **ONE** `eventLogHash`: `:162`, `fnv1a32:b1eeb320`, for `the-claim`.
  · `e1-night-shift` (`:184`) asserts only `firstView.now.works.byKind.lantern_post` against the contract's
    pre-placed buildable count. **It never looks at a hash, and it never runs the sim twice.**
  · `e1-dry-gulch` (`:19`) asserts `second.stdout === first.stdout` — *within-run* determinism — plus schema
    and shape. **No pinned value.** Two runs of the same broken build agree with each other perfectly.
  ➡️ **That is how a live cross-engine divergence sat on main unseen.** F-1405-3 reported *"main is 6/6/0 on
  both engines"*; it was TRUE, and it certified **the one contract that was pinned**, not the tree. s1406 then
  measured `e1-night-shift` at `c832307e` (Node 26) vs `ed5d8203` (Node 23) — a main-side contract, no graft,
  reproduced 3/3 per engine. The bench could not see it. F-1406-1 is the same class one level up: a guard that
  inherited the bench's blind spot instead of closing it.
  ⚠️ **This slice was DELIBERATELY excluded from f1406-1** (F-1406-2, verbatim: *"widening the bench's pin
  coverage moves real gameplay assertions and has a different blast radius from widening a guard that only
  asserts engine agreement; it wants its own slice and its own veto window"*). Honour that: it is why the
  firewall below is one file wide.

  📐 **THE ONE THING THIS MASTER MOST NEEDS YOU TO UNDERSTAND — READ IT BEFORE WRITING A SINGLE PIN.**
  🚫 **DO NOT PASTE A HASH FROM THIS MASTER, FROM A LEDGER ROW, OR FROM A REVIEW FILE. There are no hashes in
  this master, on purpose.** Every hash quoted above is a *historical* observation and at least one of them is
  already stale by construction (`c832307e`/`ed5d8203` are PRE-cure values; `a05171ce` changed them). This is
  not a hypothetical: s1410 gated a slice whose master demanded `fnv1a32:b3706fdc` and warned that a changed
  hash meant the bound was too tight — the real tree produced `14d45400`, the master's value predated the
  s1406 cure, and **a fire that had trusted the master over the tree would have refused a correct slice.**
  ➡️ **DERIVE every value you pin, on YOUR tree, and show the command and its output in your report.**

  🔁 **AND PROVE THE VALUE IS STABLE BEFORE YOU PIN IT — an unreproducible pin is a broken instrument, not a
  finding.** Run each contract **at least 3 times** and show the hash identical every time. If any contract's
  hash is NOT stable across runs on one engine, **STOP and report it**: that is a determinism finding worth
  more than this slice, and pinning a flapping value would hand every future drain a red nobody can act on.

  🧭 **SCOPE BOUNDARY, stated so you do not build the wrong thing:** `scripts/wave-scaling-cross-engine.test.mjs`
  already asks *"do the two installed engines AGREE?"* and is not your job. **You are pinning the VALUE**, which
  is a different question — it catches an unintended change on a single engine, which engine-agreement cannot
  see (two engines can agree on a newly-wrong number). Do not duplicate, extend, or touch that guard.

READ-FIRST (paths, read them, do not skim):
 · `scripts/gr-sim.test.mjs` — the subject. Read all three contract tests before editing any of them. Note
   the shape of the existing pin at `:155-163`: a `deepEqual` on the WHOLE outcome object, not a bare hash.
   Match that shape — it is strictly more informative on failure, because it tells you *which field* moved.
 · `scripts/gr-sim.mjs` — the driver you will invoke. Note it now carries a `secureWave + 2` ceiling (s1410,
   `38f456d3`) and exits non-zero with a diagnostic rather than spinning. A non-zero exit is a real result.
 · `assets/contracts/epoch-1-frontier/contracts.json` — the three E1 contracts. `e1-night-shift` is the one
   that discriminates; it is also the longest, so it is the slowest to run. Budget for that.
 · `reviews/f1410-1-bound-the-guard-battery-concurrency.md` — the battery's per-child budget is **30 s**
   (`gr-sim.test.mjs:23/:41/:51/:103/:190`), and on timeout `spawnSync` returns `status: null` so
   `assert.equal(run.status, 0)` fails on `null !== 0`. **If you add a spawn, give it the same 30 s budget and
   keep the `run.stderr` message argument** — a bare assertion here is unreadable when it fires.

PRE-FLIGHT (main slot, tracked-clean): `git status --porcelain` must show no tracked dirt you did not create.
If tracked dirt exists that belongs to no task, STOP and report.
  ✅ **FACTORY-CHURN EXCEPTION — these two tracked classes are ALWAYS EXPECTED on the main slot and are NEVER a
  STOP; list them and proceed (F-1407-1, s1407):** (a) `logs/**` — the fire/runner accounting
  (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`,
  `.blocked-seen`), rewritten every cycle by the factory itself; (b) `artifacts/**`, `reviews/shots-*` and any
  `.png` — regenerated evidence (the F-1266-1 lane exception, s1266). ⓘ What still STOPs, unchanged and
  load-bearing: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
  ⚠️ **In particular: if `scripts/gr-sim.test.mjs` is dirty on arrival, that IS a STOP — it belongs to someone.**

SCOPE (numbered, each testable):
 1. **Derive the current outcome for all three contracts, on your tree, before changing anything.** For each of
    `e1-dry-gulch`, `the-claim`, `e1-night-shift`, run the driver the way its existing test runs it (same seed,
    same flags — read them out of the test, do not invent them) and capture the terminal outcome object.
    Run each **≥3 times** and show the hash identical across runs. Paste the commands and the raw outcome lines.
 2. **Pin `e1-night-shift`.** Extend its test (`:184`) so that, in addition to the existing fixture assertion,
    it asserts the full terminal outcome object with `deepEqual` — including `eventLogHash` — using the value
    you derived in scope 1. Keep the existing `lantern_post` assertion; it tests contract wiring, which the
    hash does not. Add the second run + `deepEqual(second, first)` repeat that the other tests have, so this
    contract also gets within-run determinism coverage.
 3. **Pin `e1-dry-gulch`.** Its test already runs the sim twice and compares stdout. Add a `deepEqual` on the
    terminal outcome object — including `eventLogHash` — from the value you derived. Do not remove or weaken
    the existing stdout comparison; it catches things the terminal line does not.
 4. **Leave `the-claim` alone.** It is already pinned at `:155-163`. If its derived value in scope 1 does NOT
    match the pinned `fnv1a32:b1eeb320`, **STOP and report** — that is a live regression on main and is a
    finding, not something to "update".
 5. **Write the update procedure where the next reader will hit it, not in this master.** Add a short comment
    block above the three pins saying: these are change-detectors; a red here means the sim's behaviour moved;
    the correct response is to establish WHY it moved and only then re-derive, never to paste the new value
    over the old. Name F-1406-2 so the reason is recoverable. **This is the whole reason the slice has a veto
    window — the pins are only as good as the discipline for changing them.**
 6. **State the cost.** These are three real sim runs inside a battery that every drain gate runs. Report the
    before/after wall time of `node --test scripts/gr-sim.test.mjs` on your machine, and the per-test durations.
    ⚠️ If any single test's duration lands within **3×** of its 30 s per-child budget, say so loudly — that is
    F-1410-2's margin warning and it is the number that decides whether this is affordable.

TOUCH-ONLY: `scripts/gr-sim.test.mjs`.
NO: `scripts/gr-sim.mjs` (the driver is correct; if you think it is wrong, that is a finding, not an edit) ·
`scripts/wave-scaling-cross-engine.test.mjs` and `scripts/cross-engine-skip.mjs` (different question — see the
scope boundary above) · `src/**`, `Balance`, `src/systems/WaveSystem.ts` (a hash that does not match is a
FINDING; changing the sim to match a hash is the failure this slice exists to detect) · `assets/contracts/**` ·
`package.json` · any other test file.

SELF-CHECK (name the exact commands and paste real numbers):
 · `npx tsc --noEmit` clean · `npm run build` green.
 · `node --test scripts/gr-sim.test.mjs` — report rc, wall time, and per-test durations, before AND after.
 · `npm run test:node-guards` — rc and the pass/fail/skipped counts.
 · The scope-1 derivation transcripts: 3 runs per contract, hash identical each time.
 · ⚠️ **BROADCAST, so a red you did not cause is not mistaken for one you did:** `scripts/gr-sim.test.mjs` was
   flaky in a FIRE shell under the full battery (F-1409-1). **That is CURED as of `ada8f48d` (s1411)** — the
   battery now bounds file concurrency to 1 in fire shells — and **you are on the lane engine, where it was
   always green**. You should see nothing. If you DO see a red in a file you did not touch, report it with its
   duration and move on; do not fix it, and do not conclude your change caused it without a control run.
 · `npm run test:ledger-guards` green as your LAST act.

READY-FOR-GATES + report: the three derived outcomes with their stability transcripts, the before/after battery
cost, an explicit statement of whether `the-claim`'s existing pin still matches, and any contract whose hash was
NOT stable across runs.
