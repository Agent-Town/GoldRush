# Drain review — `sol-phone-hud-entry`: the persistent HUD at 390 px stops hiding the entry landmark (Astra's wave, lane-b)

**Task:** `sol-phone-hud-entry` · lane-b, gpt-6-astra xhigh on the owner's ChatGPT subscription, fast mode · branch `sol/wave-lane-b` · queued 2026-09-22T09:40Z on the owner's word (verbatim: "There will be a reset in the next 24 hours. Lets hit it! Full Codex power.") beside the lane-c fidelity run. UI code only: a coverage census with a guard, then the 390 px layout cure, every testid kept; no sim rule, contract or null floor moves; no store change.

## LANDED `b017ebdbb` (2026-09-22 13:19Z)

**Branch tip** `ca69148e6` · **store main** `75bdd35` (unchanged; the scratch store worktree at it) · **merge** `b017ebdbb` · same-era pin #35 `ac5caf75`

### What it does
**The persistent phone HUD at 390 px — CENSUS PASS, full browser acceptance HELD (Astra's own verdict).** One file changes runtime behaviour, `src/ui/theme.css`, inside a bounded 390–430 px by ≥701 px phone range: vitals and gold share the top rail with a 44 × 44 Pause target, Weapon, Prospector and Tape Reel become small separate surfaces, Build moves 40 px inward, the world notes take a 154 px column, the joystick and action anchors stay where they were, and no TypeScript, number source, testid, input mapping, camera or asset moves. The census (`scripts/phone-hud-entry-census.mjs`, guarded through the existing `test:node-guards` roster) measures the six maps at their plain entry with run 6's exact selector and threshold: every phone union falls by 39.45% to 44.70% (Low Orbit 24.24% → 13.41%, the Seed Run 21.45% → 12.12%, the Archive World 24.05% → 14.56%, the Dead Band 24.50% → 14.23%, Relay Rush 24.50% → 13.82%, the Glow Mesa 19.19% → 11.28%), every visible entry body ends at or under 9.59% covered (Low Orbit's claw rig 46.89% → 7.66%, the Seed Run's vault 23.18% → 2.12%, the Archive gate 15.32% → 7.27%, the Dead Band's warning frame 22.81% → 0%), and every desktop panel rectangle is byte-identical. Bodies that were offscreen before the task (the Glow Mesa's cooling rack, Relay Rush's charting station and west dishes) stay recorded as OFFSCREEN, never as 0%, and the guard refuses an omitted or vanished body. Astra found and corrected two regressions of its own before committing (the debug dock intercepting Pause, the compact Prospector hiding its portrait), reproduced every remaining browser red with the original CSS as the control, and kept the same-game audit byte-identical at 378,541 B per arm; the E1 first-town payload grows by 4,351 B to 34,277,296 B.
Where the player sees it: on a phone at 390 px, at the plain entry of every map — the persistent panels fold or compact so the entry landmark is not hidden; desktop unchanged.

### Evidence (this drain's gates on the merged tree)
| Check | Result |
| --- | --- |
| merge | `clean, no conflicts` |
| tsc / build / e1 | `0 / 0 / 0` (rc) · payload `34279221 bytes` |
| engine hash | `ac5caf75c8186240…`; same-era pin #35 `ac5caf75`, era guards in the chain `ℹ pass 9 ℹ fail 0` |
| halo / null floors / law-pointer | `rc=0 halo re-extraction PASS: 315 cured, 0 held, 760 regenerated-and-cured, 2127 scanned; alpha and opaque RGB unchanged` · `rc=0 83 of 83 null floors match assets/contracts/null-floors.json (362.8s).` · `rc=0 law-pointer-guard — do the law surfaces still point at what they claim?` |
| named guards (skill.md, same-game audit, view schema, gate callers, citations, no-emdash) + the new census guard in the battery | `ℹ pass 90 ℹ fail 0` |
| e2e both projects, `--workers=1` (m2-01 build menu, Low Orbit, the Seed Run, Relay Rush, the Dead Band, the E6 beats, task-025, the agent view) | `rc=0   74 passed (7.1m)  13:00Z` |
| e2e reds | none<br>Attribution: none needed |
| full `npm run test:node-guards` (before the pin) | `rc=0 ℹ tests 950 ℹ pass 945 ℹ fail 0 ℹ skipped 5 ℹ tests 48 ℹ pass 48 ℹ fail 0 ℹ skipped 0  13:19Z` |
| battery reds | none (the engine-era, bench-seeds and fixture-sweep rows are the pre-pin hash class, cured by the pin above) |

### Merge classification
Code: `src/ui/*` (layout and fold behaviour), `src/styles.css` and `src/ui/theme.css` (the phone media queries), the census script and its guard under `scripts/` with the `package.json` roster line, the status doc, the campaign report and `run-8/phone-hud/**`.

### Findings
- **F-HUD-1 (HELD by design, already queued):** the Glow Mesa's cooling rack and Relay Rush's charting station and west dishes are OFFSCREEN at the plain phone entry before and after the cure; framing them is camera work outside this firewall, and it is exactly what `sol-entry-framing` (queued behind fidelity-1 on the same word) does. No new task.
- **F-HUD-2 (information, no desk row):** desktop body coverage is unchanged by this CSS and stays high where the entry frame puts the landmark behind the panels (the Archive gate 22.71%, the Dead Band radio 43.24%, Relay Rush's charting station 96.42%, the Glow Mesa rack 52.51%); the task was the 390 px layout by its master, and the desktop question folds into the entry-framing task's five maps rather than a desktop HUD task.
- **F-HUD-3 (pre-existing, attributed by Astra with CSS-off controls, outside this drain's gate):** `release-build.spec.ts:330` (Dry Gulch harvesting, both projects) reds with and without the cure; the enemy-stat ledger case and the mobile plain Tape Reel patrol red with the original CSS too; the release asset assertion's four E4 jumper PNGs are the inherited F-FID1-2 class. Recorded, not re-attributed here.
- **F-HUD-4 (information):** the Dead Band's radio rises from 3.75% to 9.59% covered while its warning frame clears from 22.81% to 0%; Astra reports it inside the requested 10% ceiling and does not claim every body improved.
- **F-HUD-5 (information):** one mobile Seed Run case ("the caravan paused") failed once in Astra's required five-suite run and passed the final recheck; `e2e/e9-seed-run-caravan.spec.ts` is in this drain's gate, so a red there is re-run alone on a warmed server before any attribution.
