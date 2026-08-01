# lane-b — AP-07: admit `e1-night-shift` to GR-SIM, **and place its seven lanterns before you do**
**FIRE-AUTHORED (attended review welcome) — s1319, 2026-08-01.**

Role: you are the lane-b runner. Workdir: `worktrees/lane-b` (branch `lane/m4`).

## READ FIRST (paths, not memory)
- `src/sim/HeadlessContractSim.ts` — the whole file. It is 475 lines and has **no contract branch anywhere**; that is the property this task must preserve.
- `src/game/Game.ts` → `placeContractFixtures()` — the reference implementation you are transplanting. Find it by name, not by line.
- `src/agent/MechanicsManifest.ts` — the `tileParams.prePlacedBuildables` loop that publishes fixtures to the agent as `interactables`.
- `assets/contracts/epoch-1-frontier/contracts.json` — the `e1-night-shift` entry (`briefing.goals`, `briefing.rules`, `twist`, `tileParams.prePlacedBuildables`).
- `assets/contracts/bench-seeds.json` — night-shift's three frozen seeds already exist. **Do not author seeds.**
- `scripts/gr-sim.mjs` + `scripts/gr-sim.test.mjs` — the CLI and its node test.
- `reviews/ap-07-the-claim-pin-lift.md` — the predecessor drain (merge `38b20154`). Its firewall precedent is binding here (§Firewall).
- `specs/agent-play/README.md` — the AP-07 slice. Read its `GATES:` line.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)
The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/m4 main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1, s1266): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## Why (measured s1319 at source; every number below was re-derived this fire, not inherited)
**The rung is real and it is NOT owner-gated.** `specs/agent-play/README.md` gates only AP-03/04/05 behind the rehearsal and says verbatim: *"GATES: package publication to the Environments Hub is OWNER-GATED (AP-05 family — public artifact). **GR-SIM itself is engine work, buildable now.**"*

`src/sim/HeadlessContractSim.ts` currently admits two contracts (`SUPPORTED_CONTRACTS = new Set(['e1-dry-gulch', 'the-claim'])`) and scores **both** by one generic rule — reach `twist.secureWave` alive. There is no per-contract objective logic in the file, and none was needed, because for both contracts *survive to wave N* **is** the stated objective.

**`e1-night-shift` is the next contract that shares that property, and it is the only remaining E1 contract that does.** Measured across all five E1 contracts this fire:

| contract | `twist.secureWave` | `stakeMarkers` | `prePlacedBuildables` | admissible? |
|---|---|---|---|---|
| `the-claim` | 10 | 0 | 0 | shipped s1316 |
| `e1-dry-gulch` | 20 | 0 | 0 | shipped s1316 |
| **`e1-night-shift`** | **25** | **0** | **7** | **this task** |
| `e1-twin-banks` | 20 | **2** | 0 | ⛔ owner-gated |
| `e1-baron` | 20 | 0 | 0 | ⛔ needs a real driver |

Night-shift's goal is `briefing.goals[0]` = *"Survive to DAWN at wave 25."* — survival verbatim. It carries **zero** `stakeMarkers`, so the F-1314-1 inert-`lossCondition` blocker that genuinely gates twin-banks **does not apply**. Its three frozen bench seeds already exist in `assets/contracts/bench-seeds.json`.

⚠️ **BUT THE PIN IS NOT THE ONLY THING IN THE WAY, AND THIS IS THE WHOLE POINT OF THE TASK.** Night-shift is the **only** E1 contract with `tileParams.prePlacedBuildables`: **seven wrecked `lantern_post` fixtures**, each `{"wrecked": true, "relightCost": 8}`. Measured this fire: `grep -c prePlacedBuildables src/sim/HeadlessContractSim.ts` = **0**. The sim never places them. Meanwhile `src/agent/MechanicsManifest.ts` publishes those same seven fixtures to the agent as `interactables` with a `relight` operation, and the contract's own `briefing.rules` tells the agent *"Relight cold lanterns or build new posts to see threats."*

➡️ **So a bare pin-lift would ship the F-1314-1 defect one layer up: the agent is briefed about seven objects, manifested seven objects, and dropped into a world containing none of them.** That is a scoring lie of exactly the kind the twin-banks reservation exists to prevent — and unlike twin-banks it needs no invented mechanic, because `Game.ts::placeContractFixtures()` is a five-line reference implementation that already does it correctly.

ⓘ **Two ledger corrections this task rests on, both re-verified at source s1319** (do not re-derive them, but do not be surprised by them either): F-1313-1 claimed *"`e1-twin-banks` has zero bench seeds anywhere"* — **FALSE**, `assets/contracts/bench-seeds.json` has carried three seeds for every E1 contract since `af226e93` (2026-07-29), guarded by `scripts/bench-seeds.test.mjs`. F-1314-5 re-ratified that error. The word that failed was *anywhere*: there are **two** seed artifacts (the frozen bench set, and `env/goldrush-verifiers/goldrush/data/eval_dataset.jsonl`), and only the second one lacks night-shift rows.

## Scope

**1. OBSERVE FIRST — and this scope item can CANCEL the task. Do it before you change one line of shipped code.**
Night-shift has **never been probed headless** — s1314's and s1315's pin-lifted probes covered `the-claim` and `e1-twin-banks` only. In a **scratch, uncommitted** edit, add `'e1-night-shift'` to `SUPPORTED_CONTRACTS`, and run the CLI once per frozen seed (`e1-night-shift-01/02/03`). Report, as a table: exit code, the full outcome JSON, wall time, and tick count for each seed.
- If any seed **crashes, hangs past the horizon, or emits a malformed outcome** → **STOP and report.** That is a live engine defect in a shipped contract and is a bigger finding than the one you were sent for. Revert the scratch edit and write it up.
- If all three boot clean → record the three outcome JSONs; they are your **before** baseline for scope 3. Then `git checkout -- src/sim/HeadlessContractSim.ts` and proceed to scope 2. **Do not keep the scratch edit as your implementation.**

**2. TRANSPLANT THE FIXTURE PLACEMENT INTO THE SIM — generically, with no contract branch.**
In `HeadlessContractSim`'s constructor, **after** `this.build` is constructed, place every `tileParams.prePlacedBuildables` entry through the same `BuildSystem` call `Game.ts::placeContractFixtures()` uses, passing the same options (`wrecked`, `repairCost: relightCost`, `preplaced: true`).
- ⛔ **No `if (contractId === …)` anywhere.** The loop reads `?? []`, so contracts without fixtures are unaffected — that is what keeps the file branch-free and what makes this safe for `the-claim` and `e1-dry-gulch`.
- If `placeFree`'s signature cannot be satisfied headlessly (it takes a camera/canvas in the render path), **STOP and report the exact blocker** rather than stubbing, faking, or widening the sim's constructor surface to make it fit.

**3. THEN LIFT THE PIN, and prove the two halves are independent.**
Add `'e1-night-shift'` to `SUPPORTED_CONTRACTS`. Re-run the three frozen seeds and put the **after** outcomes beside scope 1's **before** table.
- State plainly whether any outcome changed once the seven lanterns exist. **Either answer is acceptable and neither is a failure** — but you must say which, and if nothing changed you must say what that implies about whether the lanterns are load-bearing for the score.
- Determinism: run one seed **twice** and show the two outcome JSONs are byte-identical.

**4. THE GUARD, AND ITS MANUFACTURED RED — THIS IS THE ACCEPTANCE CONDITION.**
Extend `scripts/gr-sim.test.mjs`: (a) the enumerated-throw assertion must be updated (the message interpolates the Set, so it changes again — update it to the new enumeration rather than loosening it to a regex wildcard); (b) add a night-shift case that asserts **the seven fixtures are present in the sim's world**, derived from the contract data rather than hard-coded as the number 7.
> ⚠️ **A hand-typed `7` is a pre-declared REJECT.** Read the count from `tileParams.prePlacedBuildables.length`. s1318's F-1318-1 exists precisely because a guard certified one hard-coded value instead of the producer's contract.
> ⚠️ **REQUIRED PROOF, and a report without it is a pre-declared REJECT:** this new assertion is green the moment scope 2 lands — *including if it is written wrong*. So manufacture the defect: comment out the scope-2 fixture loop, run the test, paste the **RED**; restore, verify `git diff -- src/` is empty and the file's hash is unchanged, run again, paste the **GREEN**.

**5. CURRENT-TRUTH PROSE — the two surfaces the predecessor updated, and one correction.**
Update `env/goldrush-verifiers/README.md` and `docs/bench/agent-playability-census.md` to name the three supported contracts.
- ⓘ The census currently groups *"objective drivers for night-shift, twin-banks, and baron"* into one undifferentiated sentence. **That is now wrong for night-shift** — it needs no objective driver, only fixture placement. Correct that sentence; leave the twin-banks and baron halves standing.
- ⛔ **Do NOT add night-shift rows to `env/goldrush-verifiers/goldrush/data/eval_dataset.jsonl` in this task.** That file interacts with the `num_examples` ordering question the predecessor deliberately reported-not-acted-on; it is a separate slice and mixing them makes both unreviewable. **Report** that it still lacks night-shift rows.

## Firewall
**Touch ONLY:** `src/sim/HeadlessContractSim.ts` · `scripts/gr-sim.test.mjs` · `env/goldrush-verifiers/README.md` · `docs/bench/agent-playability-census.md`.

**NO changes to:**
- `src/game/Game.ts`, `src/agent/MechanicsManifest.ts`, `src/systems/BuildSystem.ts` — you are **reading** the reference implementation, not refactoring toward it. If sharing the loop looks tempting, **report it as a finding; do not do it.**
- `assets/contracts/**` — the contract data is shipped, ratified E1 content. If night-shift's data looks wrong, that is a finding, not an edit.
- `env/goldrush-verifiers/goldrush/data/eval_dataset.jsonl` and `env/goldrush-verifiers/pyproject.toml` (scope 5).
- **Records of a past merge** (the s1316 firewall precedent): `reviews/**`, any shipped `tasks/goals.json` title, `artifacts/gr-sim/ap-07/report.md`. A superseded record is corrected by a **new** row, never by editing the old one.
- `src/systems/Vfx.ts` and `e2e/vfx-float-legibility.spec.ts` — **lane-a was LIVE in both at the time this master was written.**
- Any `e1-twin-banks` or `e1-baron` admission. Both are pre-declared REJECTs: twin-banks is owner-gated on an invented loss mechanic, baron's *"Break his Rocket Cart"* is not survival and a literal lift would reproduce the twin-banks scoring lie.

## Self-check (evidence, not vibes)
- `npx tsc --noEmit` clean · `npm run build` green.
- `node --test scripts/gr-sim.test.mjs` green — with the manufactured RED/GREEN pair from scope 4 pasted in full.
- `node --test scripts/bench-seeds.test.mjs` unmodified-green (it asserts every Frontier contract has a frozen seed set — your change must not disturb it).
- `npm run test:node-guards` — report the count and compare it against the pre-change count you measure yourself. **Derive the baseline; do not inherit a number from any handoff.**
- Every playwright invocation, if you run any, passes `--workers=1` and states the worker count.
- No screenshots required: this slice renders nothing. **Say so explicitly** rather than shipping empty artifact dirs.
- ⓘ Your complete report belongs in the run log — that is the surface every drain reads. If you also write `artifacts/ap07-night-shift-fixtures/report.md`, good; its absence is not a defect (measured s1319: only 43 of 340 artifact dirs carry one).

**End: READY-FOR-GATES** + report, specifically: the scope-1 before-table for three seeds (or the CANCEL), the scope-3 after-table beside it and whether any outcome moved, the determinism pair, the manufactured RED and the restored GREEN, the derived node-guards baseline vs after, and whether `placeFree` fit headlessly without widening the sim's surface.
