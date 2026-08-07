CODEX: model=gpt-5.6-sol effort=high
# lane-a-f1525-1-gr-sim-preset-flag — the ratified difficulty tiers must be reachable from the shipped gr-sim CLI (F-ER02-3)

**FIRE-AUTHORED s1525 (attended review welcome)**

ROLE: lane implementer. WORKDIR: this lane worktree (`worktrees/lane-a`, branch `lane/a`). Commit prefix `f1525-1:`. One task, firewalled. Never touch STATUS.md, reviews/, tasks/queue/, other lanes.

## WHY (F-ER02-3, from the ER-02 Steamworks rehearsal, `reviews/standing-orders-rehearsal-e2.md`, merged `bb969fb3`)

The rehearsal card asked for both ratified difficulty tiers. **It could not ask the shipped CLI for either.**
`scripts/gr-sim.mjs` parses arguments against a hard allowlist and throws `Unknown argument` for anything
outside it, so `--preset` and `--difficulty` are both rejected. The rehearsal had to reach the tier by
running the sim **in-process** through the game's own read+apply path instead, and had to license that
detour with a separate control proving the in-process transport matched the CLI byte-for-byte.

**A measurement instrument that cannot be pointed at the thing being measured is the finding.** The
rehearsal's own verdict on the tier (§8: *"the tier is nearly a no-op in this door"*) rests on a transport
nobody should have had to build.

**The cure is small and the pieces already exist, exported and pure** — read them, do not take my word:
- `src/game/Balance.ts` — `applyDifficultyPreset(preset)` resets every tunable to TRAIL and then applies the
  tier's deltas; `normalizeDifficultyPreset(value)` maps `greenhorn` / `trail` / `vein-hunter` (plus the
  aliases `vein_hunter`, `hard`). **Neither touches storage, `location`, or the DOM** — unlike
  `applyStoredDifficultyPreset()`, which is the browser entry point and is NOT what you want here.
- `scripts/gr-sim.mjs` — the allowlist and the solo construction site (see READ-FIRST).

⚠️ **THE ONE REAL HAZARD, AND THE REASON THIS IS NOT A ONE-LINE CHANGE: `applyDifficultyPreset` MUTATES A
SHARED MODULE-LEVEL OBJECT.** It rewrites fields on the `Balance` singleton. It therefore only affects the
sim if it is applied (a) to **the same module instance** the sim reads — i.e. loaded through the same
`vite.ssrLoadModule` graph, not by a bare `import` — and (b) **before** the sim is constructed. Get either
wrong and you will ship a flag that parses, exits 0, prints a plausible run, and changes nothing. **That
failure mode is silent and it is exactly what this task exists to prevent**, so scope item 3 makes you prove
the tier actually bit.

## READ-FIRST (open each; do not work from this summary)
- `scripts/gr-sim.mjs` — the whole file. In particular: the `SOLO_KEYS` / `SEAT_KEYS` allowlist, `parseArgs`
  (note it throws `Unknown argument` for any key not in the union, and that `--key value` and `--key=value`
  are both accepted), the solo branch where `HeadlessContractSim` is loaded and constructed, and the seated
  branch (`rideSeated`).
- `src/game/Balance.ts` — `applyDifficultyPreset`, `normalizeDifficultyPreset`, `readDifficultyPreset`,
  `applyStoredDifficultyPreset`. **READ ONLY — you may not edit this file.** Note what
  `normalizeDifficultyPreset` does with an unrecognised value; scope item 2 depends on it.
- `reviews/standing-orders-rehearsal-e2.md` §2 and §8 — the finding's origin and the tier's measured effect
  in this door (`enemy.hp 25.2 → 28` is the entire live delta; `xp.perKill` and `offers.investBonus` are
  both inert here). §8 records that on `e2-incline` seed `e2-incline-01` **only the event-log hash moved,
  `fnv1a32:9cc451af` → `fnv1a32:f766c986`**.

CITE BY CONTENT, NOT BY LINE (F-1310-1). **Each of these was measured to return exactly `1` on main at
authoring time (F-1425-2).** Verify each returns **1** in the lane before starting:
- `grep -c "const SOLO_KEYS = \['contract', 'seed', 'policy', 'mode'\];" scripts/gr-sim.mjs` → 1
- `grep -c "const sim = new HeadlessContractSim({ contractId: options.contract, seed: options.seed, mode: options.mode });" scripts/gr-sim.mjs` → 1
- `grep -c "export function applyDifficultyPreset(preset: DifficultyPresetId): DifficultyPresetId {" src/game/Balance.ts` → 1

**If any returns 0, STOP and report which one — the lane drifted after dispatch. Do not "fix" it by editing the citation.**

PRE-FLIGHT (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/a main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP. Discard them and PROCEED, listing what you discarded.**
> **FACTORY-CHURN EXCEPTION (F-1407-1) — ALWAYS EXPECTED, NEVER A STOP; list them and proceed:** `logs/**` (`factory-usage.json`, `usage-history.jsonl`, `task-stats.jsonl`, `dashboard.html`, `.goal-tree.html`, `.blocked-seen`) and `artifacts/**` / `reviews/shots-*` / any `.png`. What still STOPs, unchanged: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.
Then `git -C . status --short` → clean modulo the two churn classes above. Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything.

## SCOPE (each item separately checkable, in this order)

1. **ACCEPT `--preset` AND `--difficulty` ON THE SOLO PATH.** Add both keys to the solo allowlist so
   `parseArgs` stops rejecting them, and resolve them to one value (they are aliases; `--preset` wins if both
   are given, and giving both with *different* values is an error, not a silent preference — see item 2).
   **SOLO ONLY.** Do not wire either flag into the seated path: a seated ride's balance is the host room's
   business, and silently re-tuning `Balance` under a live relay room is a different and much larger change.
   If a preset flag is passed together with a seat flag, **reject it with a message saying so** rather than
   accepting it and doing nothing.

2. **AN UNRECOGNISED PRESET MUST BE A LOUD ERROR, NOT A SILENT FALLBACK.** `normalizeDifficultyPreset`
   deliberately returns `'trail'` for anything it does not recognise — correct for a URL in a browser, and
   **actively dangerous in a measurement instrument**, because `--preset=vien-hunter` (typo) would run TRAIL,
   exit 0, and report a difference of zero. That is a manufactured null result, and a null result nobody can
   distinguish from a typo is worse than a crash. **Validate the raw string against the accepted set BEFORE
   normalising, and exit non-zero with a message naming the accepted values.** Accept exactly what
   `normalizeDifficultyPreset` accepts — read it and enumerate from the source, do not copy a list out of
   this master.

3. **APPLY IT TO THE SIM'S OWN MODULE INSTANCE, BEFORE CONSTRUCTION — AND PROVE IT BIT.** Load `Balance`
   through the same `vite.ssrLoadModule` graph the sim is loaded from, apply the preset, and only then
   construct the sim. Use `applyDifficultyPreset`, **not** `applyStoredDifficultyPreset` (which reads
   `location.search` and storage, neither of which exists here).
   **Proof required, because a wrong wiring is silent:** after applying, read `Balance.enemy.hp` back **from
   the module the sim will use** and print it to stderr as a one-line provenance note (e.g. the resolved
   preset and the resulting `enemy.hp`). Paste that line for both tiers. Per §8 of the review the expected
   values are **trail `25.2`** and **vein-hunter `28`** — if you observe anything else, STOP and report
   rather than adjusting the expectation.

4. **THE DISCRIMINATION RUN — THREE ARMS, AND THE COMPARISON IS THE DELIVERABLE.** On one contract and one
   fixed seed, run the CLI three times and compare the `eventLogHash` in the emitted outcome:
   - **A:** no preset flag at all
   - **B:** `--preset=trail`
   - **C:** `--preset=vein-hunter`

   **Required relationship: `hash(A) == hash(B)` and `hash(A) != hash(C)`.** A proves the default path is
   unchanged by this task (a regression here would be far worse than the bug being fixed); C proves the flag
   actually reaches the sim rather than merely parsing. Report all three hashes.

   ⚠️ **A NON-DISCRIMINATING ARM C IS A REPORT, NOT A FAILURE, AND NOT A LICENCE TO CHANGE THE ASSERTION.**
   Start with `--policy=idle` since it needs no stdin. The tier's only live lever in this door is
   `enemy.hp 25.2 → 28`, so if an idle run is too short or too passive for that to reach the event log,
   `hash(A) == hash(C)` may hold **even when the wiring is perfectly correct.** If that happens: say so
   plainly, keep the item-3 stderr provenance line as the positive proof that the tier was applied, and then
   get discrimination from a longer or order-driven arm — `e2-incline` with seed `e2-incline-01` is the
   rehearsal's own subject and §8 records that tier flip as `fnv1a32:9cc451af` → `fnv1a32:f766c986` under a
   rider. **Do NOT weaken the required relationship to make an arm pass, and do NOT claim you reproduced the
   review's hashes unless you ran the same rider — those two numbers come from a rider-driven run, not an
   idle one.**

5. **`--help` / usage text, if the file has any, learns the new flags.** If it has none, add nothing — say so
   in your report. Do not invent a help system in this task.

## FIREWALL
Touch ONLY: `scripts/gr-sim.mjs`.
NO changes to: **`src/game/Balance.ts` — READ-ONLY here; you consume its exported functions. If they cannot do the job, STOP and report rather than editing them** · `src/sim/HeadlessContractSim.ts` · `src/sim/SeatedLockstepSim.ts` · `src/main.ts` · any other `src/**` · `e2e/**` · `playwright.config.ts` · `package.json` · `scripts/lane-runner-v3.sh` and every other `scripts/*.sh` · `tasks/**`, `specs/**`, `reviews/**`.
**Do not re-tune any balance VALUE.** This task changes who can *select* a tier, never what a tier *is* — the tiers are ratified. If you believe a value is wrong, that is a finding for your report.

## SELF-CHECK (name the exact commands and paste real output)
- `npx tsc --noEmit` → 0 errors. `npm run build` → green.
- `node scripts/gr-sim.mjs --preset=vien-hunter …` (deliberate typo) → **non-zero exit** with a message naming the accepted values. Paste it.
- A seat flag combined with a preset flag → rejected with a message. Paste it.
- The item-3 provenance line for **both** tiers (resolved preset + observed `Balance.enemy.hp`), read from the sim's own module instance.
- The item-4 three-arm table: A / B / C with their `eventLogHash` values and the exit code of each, plus an explicit statement of whether `hash(A) == hash(B)` and whether `hash(A) != hash(C)` held.
- `npm run test:node-guards` → report the result. ⚠️ **This battery contains a pinned `gr-sim` Baron test (`scripts/gr-sim.test.mjs`). If it moves, that is a FINDING — report it with the before/after numbers. DO NOT re-pin it**; F-1441-3 and the comment at the pin site forbid re-pinning to make a red go away, and this task has no business changing sim behaviour at all. A change here moving that pin means the wiring leaked outside the flag.
- `git diff --stat` → **exactly one file changed**, `scripts/gr-sim.mjs` (or say precisely why it differs).

**If you find yourself about to exit without changes, WRITE WHY into your report first** — a silent no-op wastes a queue slot and a gate.

End your report with **READY-FOR-GATES** plus: the accepted preset values you enumerated from the source · the two provenance lines · the three-arm hash table with the two relationships stated explicitly · whether arm C discriminated under `--policy=idle` and what you did if it did not · the `test:node-guards` result including the Baron pin · confirmation that `src/` is untouched (`git diff --name-only` output).
