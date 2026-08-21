# Task f2138-1: publish `canyonConnect` onto the agent view, so the Canyon Works census can be measured at all (LANE-B, commit prefix "feat:")

**FIRE-AUTHORED (attended review welcome)** — s2138, 2026-08-21.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in `worktrees/lane-b`.

READ FIRST: `AGENTS.md`; **`tasks/done/stopped-s2135-law2-view-drops-canyon-connect-20260821-172205-f2135-1-canyon-census-run.md`** (the run this slice unblocks — read its `## Why` and its Law 2 section, and note that its stop was CORRECT); `src/sim/HeadlessContractSim.ts` (your whole subject: the `HeadlessAgentView` type at `:323`, `makeTurn()` at `:1469`, `diagnostics()` at `:1834`, `canyonConnectDiagnostics()` at `:1991`); `tasks/BACKLOG.md` — the F-2135-1 row.

**SEQUENCING LAW / STALENESS CHECK — verify the premise before building. Run:**

```
grep -Fc "if (this.probeRecovery.declared) view.now.probeRecovery = this.probeRecovery.diagnostics;" src/sim/HeadlessContractSim.ts
```

It **must return 1** (verified on main by the authoring fire at dispatch time). That line is the sibling graft your new line sits beside. **If it returns 0, your lane is stale or the seam has moved — STOP and report "probe-recovery graft not found"; do NOT improvise a different insertion point.**

Pre-flight (LANE-SAFETY, runner-auto-commit aware): the lane branch being ahead is NORMAL — the runner auto-commits. For each ahead commit: if its content is already merged to main (verify via git log/diff), it is a SAFE DUPE → `git checkout -B lane/b main && git clean -fd` and PROCEED. STOP-and-report ONLY if an ahead commit's content is NOT on main (undrained work — resetting would DESTROY it), or the worktree holds uncommitted edits you did not make. **EVIDENCE-ARTIFACT EXCEPTION (F-1266-1): changes confined to regenerated evidence — `artifacts/**`, `reviews/shots-*`, any `.png` — are NEVER "work" and NEVER a STOP; discard them and PROCEED, listing what you discarded.** Then `npm install --no-audit --no-fund`; `npm run build` green before touching anything. Then `git -C worktrees/lane-b status --short` → must be clean, with the FACTORY-CHURN EXCEPTION, always expected and never a STOP (F-1407-1): (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. What still STOPs: modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md`.

ⓘ **At authoring time `lane/b` was `ahead=0 behind=24`, tracked-dirt 0, untracked 0 — USABLE** (`node scripts/lane-usable.mjs lane-b`), because s2138 had just drained it. Expect a clean reset.

## Why (F-2135-1, re-derived at source by s2138 — do not trust this paragraph, the greps are in scope 0)

The `f2135-1` Canyon Works census **stopped lawfully under its own Law 2** and its done-move is named for the reason: `stopped-s2135-law2-view-drops-canyon-connect`. **The runner was right and the master was wrong**, and the master was wrong about one specific, checkable thing.

`f2135-1`'s Why section stakes its whole method on a lever it calls *"PROVED BY READING BEFORE YOU WERE ASKED TO USE IT"*:

> **THE LEVER THAT DEFEATS B AND C: the player module already sees everything the census needs.** The turn view carries the objective's live diagnostics — `src/sim/HeadlessContractSim.ts:1837` puts `canyonConnect` … into the view your player is handed every turn.

**That is false, and s2138 measured why.** `:1837` sits inside **`private diagnostics()`** (`:1834`), whose returned object does spread `...(canyonConnect ? { canyonConnect } : {})` at `:1871`. But **`diagnostics()` is not the player's view.** The player's view is built in **`makeTurn()`** (`:1469`) from a completely different object:

```
const receipt = this.surface.tools.view();
const view = receipt.outcome.state as HeadlessAgentView;   // :1476
```

`makeTurn` then grafts individual blocks onto `view.now` **one at a time, by hand** — `deepwater` `:1478`, `atomic` `:1482`, `signalSuppression` `:1490`, `broadcastMirror` `:1493`, `probeRecovery` `:1497`, `fairground` `:1505`, `lowOrbit` `:1512`, `hollowCrossing` `:1513`, `seedCaravan` `:1517`, `canalChoices` `:1522`, `interferenceFront` `:1526`, `devilsAlley` `:1530`. **There is no `canyonConnect` graft among them.** So a rider on `e3-canyon-works` cannot read the objective it is being scored on — the one objective that gates its own secure (`objectiveAllowsSecure`, `:1695`).

💡 **This is the repo's own standing lesson arriving through a third door: a mechanism you can point at in the source is not thereby the one that fires.** Three fires reasoned from `:1837` — s2135 authored the lever, and the census depends on it — and all three were reading a real line in the wrong object.

⭐ **The consequence is not a missing convenience, it is a census that cannot exist.** `f2135-1`'s GATE B is real and unchanged: `scripts/gr-sim-campaign.mjs:113` throws `ended unsecured at wave N` **above** the code that writes any leg artifact, and securing is itself gated on this objective. So when the deadline is missed — the expected outcome — the sanctioned harness produces **no rows, no hash, no margin, only an exception**, and the player's own trace was supposed to be the thing that survived the throw. **With the field absent from the view, there is no trace to survive.** Publishing it is the whole unblock.

## Scope (numbered, each testable)

0. **Re-derive the premise before you build** (three greps, quote all three in your report):
   - `grep -Fc "if (this.probeRecovery.declared) view.now.probeRecovery = this.probeRecovery.diagnostics;" src/sim/HeadlessContractSim.ts` → must be **1** (the staleness check above).
   - `grep -c "view.now.canyonConnect" src/sim/HeadlessContractSim.ts` → must be **0** before your edit. **If it is already ≥1, the work is done — STOP and report that**, do not add a second graft.
   - `grep -n "private canyonConnectDiagnostics" src/sim/HeadlessContractSim.ts` → confirm the producer exists and note its line.

1. **Type the field on the view.** Add an optional `canyonConnect` to `HeadlessAgentView['now']` (the type at `:323`), beside its siblings, typed as `ReturnType<HeadlessContractSim['canyonConnectDiagnostics']>` **narrowed to the non-null arm** — or an explicit `{ powered: number; required: number; byWave: number; complete: boolean; failed: boolean }` if the `ReturnType` form fights the `private` modifier. **Do not widen `canyonConnectDiagnostics` from `private` to `public` merely to name its type** — if the type cannot be referenced, write it out; a visibility change to satisfy a type alias is a product change smuggled in as a convenience.

2. **Write the doc comment in the house voice, and make it say which KIND of field this is.** Every sibling carries one, and they deliberately distinguish contract-constant rows from per-turn state (compare the `signalSuppression` note at `:335-340` — *"the flags are a constant of the contract"* — with `probeRecovery` at `:1494-1496` — *"`recovered` flips mid-run and gates the secure … real per-turn state a rider must be able to poll"*). **`canyonConnect` is the second kind and then some: `powered` moves every turn, and `complete`/`failed` latch mid-run and gate the secure.** Say so, and say that a rider cannot escort what it cannot see.

3. **Graft it in `makeTurn`, under the DECLARED rule.** Add a single line beside its siblings, after the `probeRecovery` graft at `:1497`. `canyonConnectDiagnostics()` already returns `null` unless `twist.powerGrid?.connect` is declared, so the null-check IS the declared-check and **no other contract's view grows a field** — which is the rule every sibling states. Do not restructure the surrounding grafts, do not "tidy" them into a loop, and do not touch `diagnostics()` at `:1834`.

4. **🚨 THE HASH CONTROL — THIS IS THE LOAD-BEARING GATE OF THE SLICE, AND IT OUTRANKS THE FEATURE.** Adding a field to the agent view risks changing the run hash, and **every bench floor, pin and admission exemption in the repo is keyed to those hashes** — a slice that silently moves them is a board-wide re-baseline wearing a one-line diff. The `signalSuppression` comment at `:1487-1489` says its row is *"deliberately absent from the `final` hash"*, which is evidence the hash is computed from a **selected** set rather than the whole view — **evidence, not proof, and you must MEASURE it, not inherit it.**
   **Method:** capture the run hash for **two** contracts on a clean checkout — one that DECLARES the objective (`e3-canyon-works`) and one that does NOT (any e1/e2 bench contract) — then apply your change and capture both again. **All four must be byte-identical across the pair.**
   - **Hashes unchanged → PROCEED** and paste all four into your report.
   - **Any hash MOVED → STOP AND REPORT.** Do not re-pin anything, do not update a fixture, do not "accept" the new hash. A re-pin is only ever lawful with a named cause (F-1441-3), and "my slice moved it" is a finding for a fire to rule on, not a number to overwrite. **A stop here is a success.**

5. **Pin it with a test, both directions.** Assert that a sim on `e3-canyon-works` exposes `view.now.canyonConnect` with all five keys (`powered`, `required`, `byWave`, `complete`, `failed`), **and** that a contract which does not declare `twist.powerGrid.connect` does **not** grow the field. **Both directions are required** — a one-directional test would pass just as happily if you published the row unconditionally onto every contract's view, which is precisely the rule the siblings exist to keep. Prefer a new focused `scripts/canyon-connect-view.test.mjs` **rooted into `test:node-guards` in `package.json`** (the `f2134-1` precedent, merged `88863d3eb`; `gate-caller-audit` will red if you add the script and forget to root it). Adding it to `scripts/gr-sim.test.mjs` is acceptable but discouraged — that file is already the battery's dominant term at ~227 s.

## Firewall

**TOUCH-ONLY:** `src/sim/HeadlessContractSim.ts` · `scripts/canyon-connect-view.test.mjs` (new) · `package.json` (ONLY to root that one test into `test:node-guards`).

**NO:**
- **`src/game/Game.ts`.** The browser engine has its own `canyonConnectDiagnostics()` (`:6794`) and already publishes it as `canyonWorks` (`:5370`) and `connect` (`:6754`). ⚠️ **The two engines therefore name the same objective THREE different ways, and that is a real parity question — but it is NOT this slice.** If you see it, **REPORT it as a finding**; do not rename anything. Renaming a published browser field is a product change and would move the browser's own artifacts.
- **`scripts/gr-sim-campaign.mjs`.** Its `ended unsecured` throw at `:113` is `f2135-1`'s GATE B and is the *subject* of the census, not a bug to fix here. **Do not make it not throw.**
- **`assets/**`** — especially `assets/contracts/bench-seeds.json` and any contract JSON. The deadline and the seeds are what the census MEASURES; moving either destroys it.
- **Any re-pin of any hash, floor, exemption or fixture.** See scope 4: if a number moves, you STOP.
- **`scripts/f2086-canyon-census-player.mjs`** (retained evidence — read it, never edit it) · `scripts/terrain-contract-scope.mjs` and its report/test (just merged) · `specs/**` · `e2e/**` · `tasks/BACKLOG.md` · `tasks/goals.json` · `STATUS.md` · `CLAUDE.md`.
- **Running the census itself.** This slice publishes the field and stops. The re-run is the successor and belongs to a lane with the banked epoch-3 checkpoint.

## Self-check (name the exact commands and quote the outputs)

- The three scope-0 greps, with their counts.
- `npx tsc --noEmit` → rc 0 · `npm run build` → rc 0.
- `node --test scripts/canyon-connect-view.test.mjs` (or your chosen suite) → all pass, both directions.
- **The four hash captures of scope 4, pasted verbatim, with the two contract ids named.** State explicitly: *"all four identical"* or *"MOVED — stopping"*.
- **Prove the new test by manufacturing the defect (the s1299/s1300 standard — a passing test never executes its violation path, so its green says nothing about the red it claims to own):** delete your graft line, confirm the test reds and quote the failure; then restore it and confirm green. **Separately**, make the graft unconditional (drop the null-check) and confirm the *negative* direction reds — that is the assertion protecting every other contract's view, and it is the one most likely to be silently vacuous. Restore byte-identically and verify by content compare, never by `git status` (F-1295-1).
- `npm run test:node-guards` → report the full tally **with the load average**. ⏱️ It is **~405 s** and it is the dominant cost of this slice; **run it ALONE**, never overlapped with another battery (F-1537-1/F-2099-1). ⚠️ A timing red is a question about the arrangement before it is a question about the code (F-2076-1/F-2099-1) — if something reds on wall-clock, re-run it focused and report both results rather than concluding a regression.

**READY-FOR-GATES.** Report: the three greps · the four hashes · both manufactured-defect reds · the full battery tally with load · and — separately and explicitly — **anything you found and did NOT fix**, especially the three-way naming divergence between the engines. Reporting an adjacent defect instead of fixing it is a firewall SUCCESS here (CLAUDE.md §4.5), exactly as `f2134-1`'s runner did when it found both of its own master's defects.
