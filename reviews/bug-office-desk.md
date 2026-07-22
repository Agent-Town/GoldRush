# Review — RF-03b bug-office desk (THE COMPLAINTS DESK)

- **Slice:** RF-03b — the assay-office door opens the Complaints Desk (testing-era; crafting retreats behind `?debug`)
- **Branch/tip:** lane/perf @85e9d7e6 (`feat: open the complaints desk at the Assay Office`)
- **Base:** cacd9ab1 (current main; contains RF-03a `functions/api/bug-report.ts` — the SEQUENCED dependency, satisfied)
- **Merge commit:** 49e5e3fb (`--no-ff`, clean, all lane-touched-only)
- **Drain:** s902 (attempt-3 — the first two false-doned on a STALE lane; refresh-lane-d.req refreshed lane-d before this real run)

## Verdict
**MERGE — with documented adjacent debt.** The feature is correct and owner-directed; its own spec passes 4/4 on both projects. The 10 adjacent failures are (a) intended supersessions of the old bench-in-normal-play behavior RF-03b deliberately reverses, and (b) pre-existing deterministic reds in subsystems this 12-file diff provably does not touch. Neither indicates the desk is broken. A corrective task (`tasks/BACKLOG` RF-03b-specs) is laddered to update the superseded specs. Precedent: drip-02 (s586) landed with baseline-proven pre-existing reds documented + corrective, did not revert a correct feature.

## What it does (one paragraph)
In normal play the Assay Office door now opens THE COMPLAINTS DESK instead of the crafting bench: the clerk takes a description + optional prospector name, auto-attaches THE MOMENT (a canvas screenshot captured on desk entry via a new render-frame hook, downscaled to a ≤1024px JPEG shown as a retakeable thumbnail), and shows the honest diagnostics the clerk "notes" (contract, wave, position, tier, build). Submit POSTs to `/api/bug-report` (the RF-03a stack) and renders the claim ticket + THE BOUNTY line from data; offline/decline states are in-world. Crafting is unhurt — it simply retreats behind `?debug`, signposted in-world at the door ("debug crafting door" / the prompt reads "Complaints Desk" vs "Crafting"). Both the town-scene assay door and the in-game assay bench route through the shared `AssayBench.install()`, which now returns `ComplaintDeskPanel` unless `?debug`.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.23s |
| `bug-office-desk.spec.ts` (own spec) | **4/4 PASS** desktop + mobile (7.4s) — door copy, desk opens, bench absent, thumbnail data-URI ≤1024w + non-blank (range>20), diagnostics, ticket+bounty, POST body (screenshot ≤245760B jpeg), reset-on-reopen, `?debug` keeps crafting intact, zero console/page errors |
| adjacent battery (7 assay-surface specs, both projects) | 64 pass / 2 skip / 10 fail (9.9m) — see classification |
| boot probe (zero console/page errors, desktop + 390px) | covered by the own-spec's `expect(errors).toEqual({console:[],page:[]})` on both projects |
| canon | clean — frontier-office speak (the clerk / the county / THE BOUNTY / the trail); no firearms; NO token/price talk (bounty = a non-monetary prize notice) |

## Merge classification
Base cacd9ab1. main advanced only by the s902 STATUS lock commit (b07a6678, STATUS.md only) since the base → every desk file is **LANE-TOUCHED-only** → clean `--no-ff`, zero conflicts.
| File | Class |
|------|-------|
| `src/ui/ComplaintDesk.ts` | NEW (242) |
| `e2e/bug-office-desk.spec.ts` | NEW (139) |
| `artifacts/bug-office-desk/*.png` (×4) | NEW (empty+filed, desktop+mobile) |
| `src/crafting/AssayBench.ts` | LANE — `install()` returns ComplaintDesk unless `?debug` (door swap); adds `data-assay-office-surface` marker. Crafting logic (AssayBenchPanel) untouched. |
| `src/core/Renderer.ts` | LANE — additive `captureNextRenderedFrame`/`flushRenderedFrameCaptures` hooks |
| `src/game/Game.ts` | LANE — flush hook in render + `benchOpen` selector generalized to `[data-assay-office-surface]` (2 lines) |
| `src/town/TownScene.ts` | LANE — prompt copy swap + close/root selectors generalized + flush hook |
| `src/ui/AssayOfficePrompt.ts` | LANE — prompt copy swap (debug vs desk) |
| `src/styles.css` | LANE — additive desk styles (191) |
No committed code removed outside firewall (031 gate rider satisfied — selector generalizations support BOTH surfaces, no functionality dropped).

## Findings
- **F-902-1 (INTENDED SUPERSESSION — corrective laddered):** `task-037-assay-bench-ungate:142`, `town-assay-office-blender:140`, `town-assay-office-blender:207` open the assay surface in **normal (no-`?debug`) play** and assert `assay-bench` visible. RF-03b deliberately reverses this (normal play → the desk; bench behind `?debug`). These specs assert the owner-reversed behavior and are now stale. Corrective `tasks/BACKLOG` RF-03b-specs updates them to the new reality (add `?debug` where they mean to exercise the bench; rewrite task-037:142 to assert the desk — already covered by the own spec, so it is a candidate for retirement). NOT a desk defect.
- **F-902-2 (PRE-EXISTING RED — merge-independent, proof):** `task-037:171`, `task-037:192` fail at `debugPlaceAssayOffice` (line 129: `build.assayOffices` timeout) — a debug **building-placement** step that executes BEFORE any bench/desk branch (line 174+). `lane-c-activations-assay-office:80` ("claim jumpers 8-way rotation matrix") runs under `?debug`, sets enemy speed/hp, and never touches the bench/desk. All fail **deterministically** (confirmed 2× on retry) at assertions in subsystems (building placement; enemy rotation) this diff does not modify. They would fail identically at base. Fingerprint-matched known-reds; documented, not desk-caused. A follow-up may investigate these placement/rotation reds separately (not this drain's concern).
