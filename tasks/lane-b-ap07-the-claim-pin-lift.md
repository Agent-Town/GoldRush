# lane-b — AP-07 pin-lift: teach GR-SIM `the-claim`, the contract whose objective the engine already evaluates

**FIRE-AUTHORED (attended review welcome) — s1315, 2026-08-01.**
**Role:** implementer. **Workdir:** `worktrees/lane-b` (branch `lane/m4`). One task, one branch, path-scoped commits.

## READ FIRST (paths, in this order)

1. `src/sim/HeadlessContractSim.ts:34` and `:119-120` — **the pin itself**:
   `const SUPPORTED_CONTRACT = 'e1-dry-gulch';` and the single-equality gate that throws
   `` `AP-07 currently supports only ${SUPPORTED_CONTRACT}; received ${contractId}.` ``.
   ⚠️ **These coordinates were measured s1315 and drift whenever anything above them moves — find the
   symbols by name, and if a coordinate misses, trust the name.**
2. `src/sim/HeadlessContractSim.ts:309` — `startWave`, the objective driver:
   `if (wave < (this.manifest.twist.secureWave ?? Balance.run.secureWave)) return;`
   **Read it and satisfy yourself there is no contract branch anywhere in it.** This is the whole reason
   this task is small.
3. `src/meta/ContractFamilies.ts:1868-1899` — `defaultContractFor`, which builds `the-claim`
   (`DEFAULT_CONTRACT_ID`, `:705`). Its `twist` is **exactly** `{ secureWave: 10 }` (`:1884`) and its
   briefing goal is `'Hold the claim through wave 10.'` (`:1892`). Objective and driver already agree.
4. `scripts/gr-sim.test.mjs` — the whole file, it is 42 lines. Note `:36` uses `e5-deepwater-claim` as the
   **still-unsupported control** and `:40` asserts the rejection message text.
5. `env/goldrush-verifiers/README.md:13` — the sentence that goes false. Quoted in WHY below.
6. `env/goldrush-verifiers/goldrush/__init__.py:282-303` — `load_environment`. Confirm for yourself that
   the only validation is on **difficulty** (`:288-289`) and that `contracts` is a *filter* over frozen
   rows (`:296-299`), **not an allowlist**. This is why scope has no Python step.
7. `docs/bench/agent-playability-census.md:5` and `:21` — the two census lines that state the pin as
   current truth.

PRE-FLIGHT (LANE-SAFETY invariant): `node scripts/lane-usable.mjs lane-b` must print **USABLE**. If it prints
AHEAD-BUT-ABSORBED, HOLDS, DIRTY or BUSY: **STOP** and report the word verbatim. Dirty tracked blobs must be
reachable in git, else STOP.

## WHY (measured s1315 by RUNNING the sim, not by reading about it)

s1314 re-scoped this rung by executing it (F-1314-5, `tasks/BACKLOG.md:41`); s1315 re-derived every claim at
source **and re-ran the probe independently**. With the pin temporarily lifted in the main worktree and
restored byte-exact afterwards (sha256 `6303d754…de438` before and after, `git status src/` clean):

| contract / seed | rc | summary |
|---|---|---|
| `the-claim` / `e1-the-claim-01` | **0** | `{secured:false, waves:2, gold:0, kills:36, calls:3, eventLogHash:"fnv1a32:bcff0c12"}` |
| `the-claim` / `e1-the-claim-01` (repeat) | **0** | byte-identical hash `fnv1a32:bcff0c12` — **deterministic** |
| `the-claim` / `e1-the-claim-02` | **0** | distinct hash `fnv1a32:1e4aef01` — seed actually varies the run |
| `e1-dry-gulch` / `bench-001` (control) | **0** | `fnv1a32:3d75c580` — unchanged from the shipped leaf's recorded value |
| `e5-deepwater-claim` (control) | **1** | still rejected |

**The pin guards no crash.** `the-claim`'s declared objective *is* `twist.secureWave: 10`, and `startWave`
reads exactly that datum with no contract branch. Nothing needs to be invented for this contract.

The frozen eval data already expects this. `env/goldrush-verifiers/goldrush/data/eval_dataset.jsonl` holds
**10 rows — five `e1-dry-gulch` (`e1-dry-gulch-01…05`) and five `the-claim` (`e1-the-claim-01…05`)**,
asserted by `env/goldrush-verifiers/tests/test_goldrush.py:28`. Today five of those ten rows fail closed.
`env/goldrush-verifiers/README.md:13` says so verbatim:

> "The frozen evaluation data contains five Trail seeds each for `e1-dry-gulch` and `the-claim`. GR-SIM
> currently implements only `e1-dry-gulch`; Claim rows are frozen now for comparability but fail closed until
> its real objective driver exists. The default five-example ordering is therefore the five runnable Dry
> Gulch rows."

That sentence is the deliverable's other half: after this slice, **two of its three clauses are false.**

## ⚠️ TWO HAZARDS, BOTH MEASURED THIS FIRE — READ BEFORE WRITING CODE

**H1 — F-1315-1: the obvious lift leaves a GREEN TEST CERTIFYING A LYING MESSAGE.**
s1314 recorded, as a named consequence, that `scripts/gr-sim.test.mjs:40` "**will** red on the lift". **That
is implementation-dependent, and the implementation where it does *not* red is the dangerous one.** Measured
s1315: adding a `SUPPORTED_CONTRACTS` Set while leaving `SUPPORTED_CONTRACT = 'e1-dry-gulch'` inside the
thrown string makes `the-claim` run rc=0 **and leaves `:40` passing**, because the message still reads
"currently supports only e1-dry-gulch" — an error message that now lies, with a test certifying it.
➡️ **The message MUST name the supported set.** `:40` then reds *because you changed the message*, and you
update it in the same slice. Do not treat that red as automatic; treat it as something you are required to
cause.

**H2 — the order tape can manufacture a phantom red on your control.**
`gr-sim` exits **rc=1 at `scripts/gr-sim.mjs:44`** when the stdin order tape runs out before the run ends.
Measured: `e1-dry-gulch` / `e1-dry-gulch-01` with the 5-turn tape from `gr-sim.test.mjs` → **rc=1**; the same
contract and seed with a 25-turn tape → **rc=0** (`calls:7`). The canonical test seed `bench-001` happens to
finish inside 5 turns, which is why the shipped test is green. ➡️ **Any determinism or smoke check you write
must use `--policy=idle` (no stdin at all) or a tape long enough for the run**, else you will report a red
that is your harness, not the code.

## SCOPE (numbered; each item testable)

1. **Lift the pin.** In `src/sim/HeadlessContractSim.ts`, replace the single-contract constant + equality
   gate with a supported **set** containing `e1-dry-gulch` and `the-claim`. The thrown message must name the
   supported set (e.g. `AP-07 supports only e1-dry-gulch, the-claim; received <id>.`) — exact wording is
   yours, but it must be **true and enumerative**. Nothing else in this file changes: no objective driver,
   no new branch, no twist handling. If you find yourself adding contract-specific logic, **STOP and report**
   — that would mean the WHY above is wrong and this task must be re-scoped.
2. **`scripts/gr-sim.test.mjs`:** update `:40` to match your new message, and **add a positive case** for
   `the-claim`: it exits 0, its final line has the summary key set, and **two runs of the same seed produce
   byte-identical stdout** (this is the determinism guarantee the bench rests on). Keep the
   `e5-deepwater-claim` case as the still-rejected control — **do not remove it**; it is the only proof the
   gate still closes at all. Heed **H2** when choosing the tape.
3. **`env/goldrush-verifiers/README.md:13`:** rewrite to the per-contract truth. All ten rows are now
   runnable; say which contracts are implemented and drop the "fail closed" and "the default ordering is
   therefore…" claims. **Do not change the row order or `num_examples`** — see scope 5.
4. **`docs/bench/agent-playability-census.md:5` and `:21`:** update the AGENT-READY count and the E1
   headless-drivers line so they state the post-lift truth. `:21` currently lists `the-claim` among the
   contracts still needing an objective driver — it does not need one; the other three named there
   (`night-shift`, `twin-banks`, `baron`) still do.
5. **Report, do not act, on the ordering question.** `env/goldrush-verifiers/pyproject.toml:19` sets
   `num_examples = 5` and rows 1–5 are the Dry Gulch seeds, so a default eval run will **still not touch the
   newly-runnable Claim rows**. Leaving that alone preserves comparability with the frozen prior results,
   which is the stated reason the rows were frozen — so **leave it alone** and write one paragraph in your
   report on whether it should be interleaved later. That is an owner/attended call, not yours.

## FIREWALL

**TOUCH-ONLY:** `src/sim/HeadlessContractSim.ts` (the gate only) · `scripts/gr-sim.test.mjs` ·
`env/goldrush-verifiers/README.md` · `docs/bench/agent-playability-census.md`.

**NO:**
- ❌ **`e1-twin-banks` — OWNER-GATED, do not add it to the set.** It runs (rc=0, measured s1315), but its
  `twist` declares only `secureWave`, so its card's *"hold both banks"* is briefing prose with **no
  machine-readable objective**. Implementing it means inventing a loss mechanic — which is
  `tasks/DRAFT-e1-hold-the-claim.md`, explicitly **OWNER-BANKED post-release, DO NOT QUEUE**. Adding
  twin-banks to the set would ship a contract whose stated goal the sim cannot score.
- ❌ Any `lossCondition` / stake-loss / defeat-path work (same banked fork).
- ❌ Gameplay code, `Balance.*`, the wave tables, any `e2e/` spec, any other epoch.
- ❌ The dataset rows, their order, or `pyproject.toml`.
- ❌ **Historical records — do not "correct" them.** `reviews/gr-sim.md:11`, the `ap-07-gr-sim` /
  `ap-07-prime-env` titles in `tasks/goals.json`, and `artifacts/gr-sim/ap-07/report.md` all describe **what
  was true at a past merge**. Editing them falsifies the ledger. `tasks/BACKLOG.md:99` is current-truth and
  is the **drain's** job, not yours. The rule: *prose stating current truth changes; prose recording a past
  merge stays.*

## SELF-CHECK (run these, paste real output)

1. `npx tsc --noEmit` → clean.
2. `npm run build` → green, note the time.
3. `node --test scripts/gr-sim.test.mjs` → green, note the test count. **This is the suite this slice owns.**
4. `npm run test:node-guards` → green; **derive the expected count from the current baseline rather than
   inheriting a number from any document**, and state your derivation.
5. Determinism, run it yourself and paste the hashes: `the-claim` on one seed twice → identical
   `eventLogHash`; a second seed → a different one; `e1-dry-gulch` / `bench-001` → still
   `fnv1a32:3d75c580`. Use `--policy=idle` or a long tape (**H2**).
6. `node scripts/gr-sim.mjs --contract e5-deepwater-claim --policy=idle` → still non-zero, and paste the new
   message so the reviewer can see it is true.
7. Confirm no browser surface moved: this slice touches no `src/game`, no `src/systems`, no `e2e/`. State
   that as a grep, not an assertion.

**No playwright run is required** — nothing player-facing changes. If you believe otherwise, **STOP and say
so** rather than running a battery.

READY-FOR-GATES + report: the new message text verbatim · the five hashes from self-check 5 · your
node-guards count derivation · the scope-5 paragraph on ordering · anything you found that contradicts the
WHY.
