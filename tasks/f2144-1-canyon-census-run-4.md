# Task f2144-1-canyon-census-run-4: run the Canyon Works census — attempt 4, on a harness that finally stands on the right ground (lane-d, commit prefix "docs:")

**FIRE-AUTHORED (attended review welcome)** — s2144, 2026-08-21.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-d`.

READ FIRST: `AGENTS.md`; **`artifacts/f2135-canyon-census/REPORT.md`** (attempt 3's report — ⚠️ **its headline result is now KNOWN FALSE and superseding it is scope item 1**); `reviews/f2142-1-campaign-harness-terrain-binding.md` (the cure that invalidated it, and the run that first saw past it); `reviews/f2141-1-canyon-census-run-3.md` (what attempt 3 did establish); `artifacts/f2086-canyon-census/REPORT.md` (the drained predecessor whose inputs you **CITE and must NOT re-derive**); `scripts/gr-sim-campaign.mjs` (the sanctioned harness — read, never edit); `scripts/f2135-canyon-census-player.mjs` and `scripts/f2135-canyon-epoch3-checkpoint.mjs` (both on main, both yours to RUN and never to edit).

## Sequencing law — the cure this attempt stands on must be present, by CONTENT

`f2142-1` merged to main at **`8656ca1f1f1d71edcfec33fd3467ed45a31e4d59`**. Do not gate on `git log -N`; gate on content. After the pre-flight, each of these must return **exactly 1**. **Zero means your lane is not what this master was written against — STOP and report the count, do not proceed and do not "fix" it:**

- `grep -Fc "encodeURIComponent(args.contract)" scripts/gr-sim-campaign.mjs`
- `grep -Fc "view.now.canyonConnect = this.canyonConnectDiagnostics()" src/sim/HeadlessContractSim.ts`
- `grep -Fc "const connect = view.canyonConnect ?? view.now.canyonConnect;" scripts/f2135-canyon-census-player.mjs`

All three were measured at **1 on main** by the authoring fire at 2026-08-21T22:56Z.

## Pre-flight (LANE-SAFETY, runner-auto-commit aware)

The lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/d main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, and any `.png` screenshot — are NEVER "work" and NEVER a STOP, whether they sit as uncommitted dirt or as the entire content of an ahead commit. Screenshots are never byte-identity gated, so their bytes differ from main forever. Discard them (`git checkout -- <paths>` / reset) and PROCEED, listing what you discarded.**

ⓘ The authoring fire measured this lane at **`ahead=0 behind=37`, tracked-dirt 0, untracked 0** (`node scripts/lane-usable.mjs lane-d`, 22:54Z) — so the reset above is expected to be a plain fast-forward onto main and should hold nothing. **If it holds anything, that is new since 22:54Z and IS a STOP.**

Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

Cleanliness: `git -C worktrees/lane-d status --short` (or `git status --short` in the worktree) must be clean, with the **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`.** What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` that you did not make.

## Why (an owner sanction, a cured instrument, and a banked result nobody has written into the census)

The owner **deferred the ruling** and **granted the measurement** in the same row, verbatim: *"I never played that level ever, I can't really decide on that"* … *"a fire MAY run the census MEASUREMENT (fastest possible pylon chain under walk-era economics — a number, zero product change, reversible) so the eventual ruling is informed; the ruling itself waits until the owner has stood on that map."*

**This task is that measurement and NOTHING else.** It changes no product code, takes no fork, and recommends no balance change.

**This is attempt 4, and §7.5 is satisfied because the premise changed in the code, not in anyone's confidence.** Attempt 1 (s2086) could not select the contract — cured by `--contract` (`ce75bc319`). Attempt 2 (s2135) could not read the trace — cured by `f2138-1` (`cd59fb273`). **Attempt 3 read the trace and reported `ended unsecured at wave 2` with `powered 0/2` — and that result is now known to be an ARTIFACT of a fourth defect the census could not see.** `scripts/gr-sim-campaign.mjs` fabricated `globalThis.location` as `?debug` with no `contract=`, so `src/world/Terrain.ts` bound `ACTIVE_CONTRACT` to the **fallback claim** at module evaluation: every leg the harness ever walked ran the right manifest **on the wrong ground**. Cured by `f2142-1`, merged `8656ca1f1`.

📊 **THE CURE'S OWN DRAIN ALREADY RAN THE SANCTIONED COMMAND AND THE RESULT IS BANKED — CITE IT, DO NOT RE-DERIVE IT.** `artifacts/f2142-1-cure/census-s2143.json` and `census-s2143b.json` (two runs, two different bases, **rows byte-identical**, 540 rows each, schema `goldrush.f2135.canyon-census.v1`):

| Observation | Value |
|---|---|
| First row | `{"wave":0,"powered":0,"required":2,"complete":false,"failed":false}` |
| First `powered > 0` | during **wave 4** |
| `failed` first latches `true` | first turn of **wave 7** — i.e. exactly `wave > byWave` for `byWave: 6` |
| **Margin at the latch** | **`powered 1 / required 2` — short by one** |
| Powered never rises above | `1`, through waves 7 and 8 |
| Harness terminal | `Error: e3-canyon-works ended unsecured at wave 8.` |

⚠️ **THAT IS A MEASUREMENT, NOT A BALANCE VERDICT (F-2143-2). Do NOT read `failed:true` as "the contract is unmeetable."** Whether the second gallery is reachable at all — route, cost or deadline — is the fork `F-E2S-4` reserves for the owner, and it stays reserved.

🎯 **SO WHY RUN IT AGAIN AT ALL? BECAUSE THREE THINGS THE CENSUS OWES ARE STILL MISSING, AND ONE ARTIFACT ON MAIN IS ACTIVELY WRONG.** The banked pair above was a **discriminator** for the cure, not a census: its own `comparison` field reads `{"comparedRunIds":[],"identical":null}`, its two runs were taken at **different bases** (so they are not a determinism pair on one tree), and no report was written. Meanwhile `artifacts/f2135-canyon-census/REPORT.md` still headlines *"Canyon Works route terminates before the connection deadline"* with a wave-2 terminal, and `artifacts/f2135-canyon-census/census.json` still holds the 10-row trace that produced it. **A reader trusting the census directory today gets the artifact of a cured defect.**

🔎 **AND THERE IS A GENUINELY NEW QUESTION THE BANKED TRACE RAISES, WHICH THIS ATTEMPT IS THE FIRST THAT CAN ASK: `e3-canyon-works` pins `twist.secureWave: 12`** (`assets/contracts/epoch-3-voltage/contracts.json`, read by `src/sim/HeadlessContractSim.ts` as `this.manifest.twist.secureWave ?? Balance.run.secureWave`). **The run ends at wave 8. Wave 8 is therefore NOT the leg's natural close — it is an early terminal, four waves short of securing.** Nobody has established what ends it. That is scope item 4, and it is an OBSERVATION duty, not a repair duty.

**GATE B (F-2135-1) — the harness can only report a YES, and this is EXPECTED.** `scripts/gr-sim-campaign.mjs` throws `ended unsecured at wave N` at its `if (!outcome.secured)` line, **above** the code that writes any leg artifact. **If the leg does not secure, the harness produces no rows and no hash — only an exception. That is a RESULT, not a failure**, and your player's own per-turn trace is the thing that survives it.

**GATE C (F-2135-2) — the harness runs ONE seed.** It reads `benchSeeds[contract.id]?.[0]`, index zero, always. `assets/contracts/bench-seeds.json` pins **two** seeds (`e3-canyon-works-01`, `e3-canyon-works-02`). A two-seed census is **unsatisfiable through the sanctioned instrument**; say so rather than reporting one seed as if it were the plan.

## Scope

1. **Supersede attempt 3's now-false artifacts before you overwrite anything (Retention Law — move, never delete).** `git mv artifacts/f2135-canyon-census/REPORT.md artifacts/f2135-canyon-census/attempt-3-superseded/REPORT.md` and the same for `census.json`. ⚠️ **This is not housekeeping, it is a correctness fix, and it has a second mechanical reason:** the census player's `persist()` appends into whatever census file it finds, so leaving the 10-row file in place would splice a fresh trace into a superseded one. **Do NOT move `epoch3-checkpoint.json`** — see item 2, and do NOT touch `attempt-2-blocked/`. Add a one-line `attempt-3-superseded/NOTE.md` stating these are attempt 3's artifacts, that their wave-2 terminal is an artifact of the terrain binding cured by `8656ca1f1`, and that they are retained as evidence, not as a result.

2. **Regenerate the checkpoint with the banked script** (`node scripts/f2135-canyon-epoch3-checkpoint.mjs`). Re-generating rather than re-using proves the proven script still works against newer main. If the regenerated bytes differ from the banked `epoch3-checkpoint.json`, that is **EXPECTED and reportable, not a STOP** (main moved). If the script **fails**, that IS a Law 2 stop. State in the report which epochs it activated, in what order, and that no unlock was bypassed and `contractUnlockStatus` was not stubbed.

3. **Run the census through the SANCTIONED harness, TWICE, on ONE tree** (this is the determinism pair the banked evidence does not have), with `--contract e3-canyon-works --resume <your checkpoint>` and a distinct `F2135_CENSUS_RUN` per run, writing both into one `artifacts/f2135-canyon-census/census.json`. **Paste both exact command lines into the report.** The command shape attempt 3 recorded works unchanged. ⚠️ Expect GATE B: capture the harness's exception text **verbatim**. **Do NOT edit `scripts/gr-sim-campaign.mjs` to make it not throw** — it is the sanctioned instrument and its behaviour is the finding. **`census.json` must carry a real `comparison` with both run ids and an honest `identical` boolean; if the two runs diverge, the number is not evidence — report THAT instead.**

4. **Read the trace and report the census proper, in four numbered answers.** All four come from your own rows; cite the banked s2143 pair only for agreement, never as a substitute:
   1. **The margin at the deadline** — how many of `required` were powered on the first turn where `failed` latched `true`, and at which wave that turn sat.
   2. **The power curve** — the wave at which each increment of `powered` occurred, and the highest `powered` the run ever reached.
   3. **The terminal** — the harness's verbatim exception and the final wave, stated **against `secureWave: 12`**, i.e. explicitly whether the run ended early or ran its course.
   4. **What ends the run at that wave** — answer from the trace and from what the harness's outcome object already carries. ⚠️ **THIS IS AN OBSERVATION DUTY WITH A HARD CEILING: if the available evidence does not say, write "NOT ESTABLISHED" and say what instrument would answer it.** Do NOT add instrumentation to `src/**`, do NOT modify the player to survive longer, and do NOT infer a loss condition you cannot point at. Inventing a cause here would be worse than leaving the question open — the whole thread already lost three attempts to confident readings of under-determined evidence.

5. **Write the report.** `artifacts/f2135-canyon-census/REPORT.md`, in the house style of `artifacts/f2086-canyon-census/REPORT.md`, containing: scope-4's four answers; determinism across your two runs; a short section **"what attempt 3 said and why it was wrong"** naming the terrain binding and `8656ca1f1`; and, kept strictly separate, **what you did NOT establish**, naming GATE C explicitly. **CITE** the predecessor's established inputs (`required: 2` counts powered `consumer`/`gallery` nodes; six beacons; 330 g; `byWave` compares the wave index) — re-deriving merged work is how a run burns its budget. State explicitly that you made **no** change to the player, or list every change with its reason if the firewall lift below was exercised.

## Firewall

**TOUCH-ONLY:** `artifacts/f2135-canyon-census/**` · the done-move of this task file.

🔒 **NO FIREWALL LIFT ON THE PLAYER THIS TIME, AND THAT IS A DELIBERATE TIGHTENING WITH EVIDENCE BEHIND IT.** Attempt 3's master lifted `scripts/f2135-canyon-census-player.mjs` because its route logic had never run past turn 1. **It has now flown 540 turns to wave 8, unchanged** (`artifacts/f2142-1-cure/census-s2143.json`). The lift's premise is spent. **If the player nonetheless cannot fly, that is a Law 2 STOP and a finding — not a repair.**

**NO changes to:** **any `src/**`** · **`assets/**`** (the deadline, the seeds and `secureWave` are the SUBJECT of the measurement — moving any of them destroys it) · **`scripts/**` in its entirety**, including `scripts/gr-sim-campaign.mjs`, `scripts/f2135-canyon-census-player.mjs` and `scripts/f2135-canyon-epoch3-checkpoint.mjs` (run them, never edit them) · `artifacts/f2135-canyon-census/attempt-2-blocked/**` (retained evidence) · `artifacts/f2142-1-cure/**` (retained evidence — read it, cite it, never edit it) · `specs/**` · `e2e/**` · `tasks/BACKLOG.md` · `tasks/goals.json` · `STATUS.md` · `package.json` · `reviews/*.md`.

## Law 2 — honesty outranks completion (binding)

If the objective cannot be pursued honestly — the checkpoint cannot be built without a bypass, the runs are non-deterministic, or the trace cannot be read — **STOP and report what you found.** Do NOT tune anything to make the deadline reachable. **A stop with a clear account is a success here**; this task's three predecessors all stopped and all three were right to. ⚠️ **But note what is NOT a Law 2 stop: the harness throwing `ended unsecured` is EXPECTED (GATE B) and is a measurement, not a blocker.** Neither is a regenerated checkpoint whose bytes moved (scope 2), nor a scope-4.4 answer of "NOT ESTABLISHED".

**No-op guard:** if you find yourself about to exit without changes, **WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

## Self-check (evidence, not vibes)

- `npx tsc --noEmit` clean · `npm run build` green.
- `node --test scripts/canyon-connect-view.test.mjs` green ("Canyon Works alone publishes its live connection objective") — proves the trace lever survived the merge; ~4 s.
- `node --test scripts/campaign-harness-terrain.test.mjs` green ("campaign harness URL binds Terrain to its selected contract") — **proves the cure this whole attempt rests on is live in YOUR tree**; it builds two vite servers and asserts `64×64` under `?debug` against `96×112` under `?debug&contract=e3-canyon-works`.
- Both census commands re-run end-to-end, both exact command lines pasted into the report.
- Determinism shown: `census.json`'s `comparison` names both run ids and carries a real boolean.
- `git status --short` shows ONLY the TOUCH-ONLY paths. **No `src/`, no `assets/`, no `scripts/`, no `e2e/`.**
- Confirm in the report that the contract is byte-unchanged: `git diff --quiet assets/contracts/epoch-3-voltage/contracts.json` must be silent.
- No playwright run and no screenshots are owed — this slice renders nothing.

End: **READY-FOR-GATES** + report: (a) that the pre-flight RESET cleanly (or what it held), and the three sequencing grep counts; (b) which epochs the checkpoint activated and that no unlock was bypassed; (c) the harness's verbatim terminal text; (d) **scope 4's four numbered answers, with 4.4 allowed to be "NOT ESTABLISHED"**; (e) determinism across your two runs, and whether your rows agree with the banked s2143 pair; (f) that the player was not changed; (g) anything you could not establish, naming the one-seed constraint.
