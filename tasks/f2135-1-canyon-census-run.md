# Task f2135-1-canyon-census-run: run the Canyon Works census the sanctioned way — and report the margin even when the answer is NO (lane-d, prefix "docs:")

**FIRE-AUTHORED (attended review welcome)** — s2135, 2026-08-21.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-d.

READ FIRST: `AGENTS.md`; **`artifacts/f2086-canyon-census/REPORT.md`** (the predecessor's drained evidence — scopes 1 and 2 of the original census are ALREADY ANSWERED there; you are to CITE them, not re-derive them); `reviews/f2120-1-campaign-harness-contract-select.md` (the cure that unblocked this — find its verdict by content: `grep -Fn "E3+ census slices become fire-authorable" reviews/f2120-1-campaign-harness-contract-select.md`, **must return ≥1; zero means your lane is stale — STOP and report that, do not proceed**); **`tasks/BACKLOG.md`** — the F-2086-1 gate row (`grep -Fn "GATE: an E3+ census slice is not authorable until the harness can select its contract." tasks/BACKLOG.md`, **must return ≥1**; do NOT test for exactly one — this task's own dispatch row quotes the sentence, so the count grows, and a staleness check keyed on a corpus count rots the moment the ledger moves, F-2086-1's own lesson); `scripts/gr-sim-campaign.mjs` (the sanctioned harness); `scripts/f2086-canyon-census-player.mjs` (the predecessor's fixture-shaped player, retained and unused).

Pre-flight (LANE-SAFETY): ahead content on main = SAFE DUPE → `git checkout -B lane/d main && git clean -fd`, PROCEED; STOP on un-merged ahead content or foreign edits. F-1266-1 + F-1407-1 exceptions as usual. `npm install --no-audit --no-fund`; `npm run build` green first.

## Why (owner sanction + a cured blocker + two gates nobody has named)

The owner **deferred** this design fork honestly, verbatim: *"I never played that level ever, I can't really decide on that"* — and granted a standing permission in the same row: *"a fire MAY run the census MEASUREMENT (fastest possible pylon chain under walk-era economics — a number, zero product change, reversible) so the eventual ruling is informed; the ruling itself waits until the owner has stood on that map."*

**This task is that measurement and NOTHING else.** It changes no product code, takes no fork, and recommends no balance change.

Attempt 1 (s2086) reached a lawful **Law 2 STOP**: the sanctioned harness could not select an E3 contract, and it refused to substitute an unsanctioned runner. **That blocker is CURED** — `gr-sim-campaign.mjs` gained `--contract <id>` (merged s2122 `9897aa1e5726ef420fbf65b73c6509fc8b8ee1f0`) and F-2086-1's standing gate is **OPEN**. Your premise is therefore genuinely changed, which is what licenses attempt 2.

⚠️ **THE AUTHORING FIRE RAN THE HARNESS AND READ THE CODE, AND FOUND THREE MORE GATES BETWEEN YOU AND A NUMBER. All three are stated here so they cannot burn your run; two of them are findings that did not exist before this task.**

**GATE A — the epoch lock, and its message is misleading.** Running the obvious command today fails with `Contract "e3-canyon-works" is locked: The Voltage Age awaits — raise the Dynamo Hall.` (measured live, s2135). **Do NOT read that as a building requirement.** `src/meta/ContractUnlock.ts:22` gates on `epochIsActive(epoch.id)` alone; the sentence is flavour text assembled at `:28` from the *predecessor* epoch's `megaproject.raiseActionText`. And this contract's own row is `"unlock": "default"` (`assets/contracts/epoch-3-voltage/contracts.json`, find it by content: `grep -Fn '"unlock": "default"' assets/contracts/epoch-3-voltage/contracts.json`). **Therefore `epochIsActive('epoch-3-voltage')` is the ONLY gate on this contract — no secured predecessor, no science, no building.** Supply it with `--resume <checkpoint>`, exactly as `reviews/f2120-1-campaign-harness-contract-select.md` scope item 5 established from source.

**GATE B (F-2135-1, NEW) — the harness can only report a YES.** `scripts/gr-sim-campaign.mjs:113` throws `ended unsecured at wave N` when a leg does not secure, **above** the code that writes any leg artifact. And securing is *itself* gated on this very objective: `src/sim/HeadlessContractSim.ts:1695` computes `objectiveAllowsSecure = (!this.manifest.twist.powerGrid?.connect || this.canyonConnectCompletedByDeadline)`. **So if the deadline is missed — which is precisely what F-E2S-4's 2.77 s result predicts — the sanctioned harness produces no rows, no hash and no margin, only an exception.** A census that can only publish a positive answer is not a census.

**GATE C (F-2135-2, NEW) — the harness runs ONE seed.** `scripts/gr-sim-campaign.mjs:93` reads `benchSeeds[contract.id]?.[0]` — index zero, always. `assets/contracts/bench-seeds.json` pins **two** seeds for this contract (`e3-canyon-works-01`, `e3-canyon-works-02`). The predecessor master asked for "at least 2 seeds"; **through this harness that is unsatisfiable**, and you must say so rather than quietly report one seed as if it were the plan.

✅ **THE LEVER THAT DEFEATS B AND C, PROVED BY READING BEFORE YOU WERE ASKED TO USE IT: the player module already sees everything the census needs.** The turn view carries the objective's live diagnostics — `src/sim/HeadlessContractSim.ts:1837` puts `canyonConnect` (`{ powered, required, byWave, complete, failed }`, declared at `:1991`) into the view your player is handed every turn, and `:1175` puts the same block on the terminal `outcome()`. **So your player can record the whole margin trace itself, with zero edits to any sanctioned script, and the number survives whether or not the leg secures.**

## Scope (each item is a measurement, a citation, or a new file; none is a product change)

1. **The checkpoint.** Author `scripts/f2135-canyon-epoch3-checkpoint.mjs` (new) that produces a **genuine** epoch-3-active profile checkpoint consumable by `--resume`. Walk the epochs with `activateEpoch` exactly as the in-repo debug seeder does (`src/meta/DebugEraSeed.ts:15-16`) and pack with `packActiveProfile(storage).envelope`. **This must be a real progression, not an unlock bypass:** do not stub `contractUnlockStatus`, do not hand-write an unlocked flag, and do not touch `assets/`. State in the report which epochs it activated and in what order.
2. **The census player.** Author `scripts/f2135-canyon-census-player.mjs` (new; you may lift freely from the retained `scripts/f2086-canyon-census-player.mjs`, which encodes the established six-site, real-walk, 330 g route). It pursues the objective as the predecessor resolved it, and — the point of this task — **records `view.canyonConnect` every turn**, plus the wave index, so the margin is measured directly rather than inferred from secured/unsecured.
3. **The run, through the SANCTIONED harness.** Run `gr-sim-campaign.mjs` with `--contract e3-canyon-works --resume <your checkpoint>`, **2 runs** (determinism), and paste the exact command line into the report. ⚠️ **Expect GATE B: if the leg does not secure the harness throws.** That is a RESULT, not a failure — capture the exception text verbatim, and take the margin from your player's own trace (scope 2), which survives the throw. **Do not edit `gr-sim-campaign.mjs` to make it not throw** — that is the sanctioned instrument and its behaviour is the finding.
4. **The report.** Write `artifacts/f2135-canyon-census/census.json` (raw rows: per turn `wave`, `powered`, `required`, `complete`, `failed`) and `artifacts/f2135-canyon-census/REPORT.md` in the house style of `artifacts/f2086-canyon-census/REPORT.md`. It must state: whether the objective completed and at which wave; **the margin — how many of `required` were powered when `wave > byWave` latched failure, or the wave of completion if it succeeded**; determinism (identical runs → identical trace; if they diverge, the number is not evidence — report THAT instead); and, kept strictly separate, **what you did NOT establish**, naming the one-seed constraint (GATE C) explicitly. **Cite** the predecessor's already-established answers (`required: 2` counts powered `consumer`/`gallery` nodes; six beacons; 330 g; `byWave` compares the wave index) rather than re-deriving them — re-deriving merged work is how a run burns its budget.

## Firewall

TOUCH-ONLY: `scripts/f2135-canyon-epoch3-checkpoint.mjs` (new) · `scripts/f2135-canyon-census-player.mjs` (new) · `artifacts/f2135-canyon-census/**` (new) · the done-move of this task file.

NO changes to: **any `src/**`** · **`assets/**`** (the deadline and the seeds are the SUBJECT of the measurement — moving either destroys it) · **`scripts/gr-sim-campaign.mjs`** and **every other existing `scripts/*` file**, including `scripts/f2086-canyon-census-player.mjs` (retained evidence — read it, copy from it, never edit it) · `specs/**` · `e2e/**` · `tasks/BACKLOG.md` · `tasks/goals.json` · `STATUS.md` · `package.json`. **You are measuring a number, not fixing it.** If the census shows the deadline is unmeetable, that is a RESULT to report — the fork belongs to the owner and he has explicitly reserved it.

## Law 2 — honesty outranks completion (binding)

If the objective cannot be pursued honestly — the checkpoint cannot be built without a bypass, the runs are non-deterministic, or the trace cannot be read — **STOP and report what you found**. Do NOT invent a routing policy to manufacture a number, and do NOT tune anything to make the deadline reachable. A stop with a clear account is a success here; a number that cannot be trusted is worse than no number. This task's own predecessor stopped exactly this way and was right to. ⚠️ **But note what is NOT a Law 2 stop this time: the harness throwing `ended unsecured` is EXPECTED (GATE B) and must be reported as a measurement, not treated as a blocker.**

## Self-check (run before reporting)

- `npx tsc --noEmit` clean · `npm run build` green.
- The census command re-run end-to-end, with the actual command line pasted into the report.
- Determinism shown: the two runs' traces compared explicitly in `census.json`.
- `git status --short` shows ONLY the TOUCH-ONLY paths. No `src/`, no `assets/`, no existing script.
- Confirm in the report that the contract is byte-unchanged: `git diff --quiet assets/contracts/epoch-3-voltage/contracts.json` must be silent.

End: READY-FOR-GATES + report: (a) which epochs the checkpoint activated and that no unlock was bypassed, (b) whether the leg secured and the harness's verbatim text if it threw, (c) **the margin at the deadline, per the trace**, (d) determinism across the two runs, (e) anything you could not establish, naming the one-seed constraint.
