# Phone entry HUD — run 8

2026-09-22. Task `sol-phone-hud-entry`; branch `sol/wave-lane-b`; starting code `debcc5001cc365b64d74f4ce2a1f7dcb0388646b`. The before census was committed **before** the cure as `11ec9b7b1`; its existing-runner roster correction is `b95e2c4f0`.

**READY-FOR-GATES — CENSUS PASS / FULL BROWSER ACCEPTANCE HELD.** All six phone unions fall by 39.45–44.70%; every visible entry body is ≤9.59% covered. The final twelve plain boots have zero console/page errors, and all desktop panel rectangles remain identical. Offscreen bodies do not satisfy visible-body acceptance; they remain explicitly HELD. Coverage acceptance here is limited to the requested run-6 mask, whose prompt-stack backing omission is documented below; it is not a full-paint occlusion claim.

## Census

| Map | Phone union before → after | Reduction | Desktop union before → after |
|---|---:|---:|---:|
| Low Orbit | 24.24% → 13.41% | 44.70% | 15.90% → 15.90% |
| Seed Run | 21.45% → 12.12% | 43.49% | 14.63% → 14.63% |
| Archive World | 24.05% → 14.56% | 39.45% | 15.58% → 15.58% |
| Dead Band | 24.50% → 14.23% | 41.93% | 15.77% → 15.77% |
| Relay Rush | 24.50% → 13.82% | 43.60% | 15.77% → 15.77% |
| Glow Mesa | 19.19% → 11.28% | 41.23% | 13.92% → 13.92% |

| Phone entry body | Before → after persistent coverage |
|---|---:|
| Low Orbit claw rig | 46.89% → 7.66% |
| Seed Run vault | 23.18% → 2.12% |
| Archive World gate | 15.32% → 7.27% |
| Dead Band radio / warning frame | 3.75% → 9.59% / 22.81% → 0% |
| Relay Rush relay frame | 2.74% → 0.44% |
| Relay Rush charting station / west dishes | OFFSCREEN in both arms |
| Glow Mesa cooling rack | OFFSCREEN in both arms |

Dead Band's radio overlap rises while staying within the requested 10% ceiling; its warning frame is cleared. No claim that every body improved. Desktop body coverage is unchanged by this CSS: Archive gate 22.71%, Dead Band radio 43.24%, Relay charting station 96.42%, Glow Mesa rack 52.51% remain unresolved. The current ordinary-boot denominators differ from run-6's frozen diagnostic stations. Across this task's own before/after arms, all body masks are pixel-identical except the Relay Rush relay frame (9 differing phone pixels and 13 desktop pixels). [Body-mask comparison](body-mask-comparison.json).

[All twelve views, every panel box and area, every body denominator, and the six boards](census.md). Raw measurements: [before](before.json), [after](after.json). Normal frames are unretouched; boards place those native 390px frames beside the existing concept plate.

## Cure by panel

Only `src/ui/theme.css` changes runtime behavior, inside `390px ≤ width ≤ 430px` / `min-height: 701px`. The existing layout remains responsible below 390px width or 701px height; the compact layout is bounded to the tested phone range. No TypeScript, number source, testid, input mapping, camera or asset changes.

- Vitals and gold share the top rail with a 44×44 Pause button. HP, time and wave remain directly visible; XP and era resources sit below. The 96px gold column gives Archive's restored count and current light enough room without text overlap.
- Weapon, Prospector and Tape Reel become small separate surfaces. The Prospector keeps its portrait, name, level, permission and existing panel. No new combat-driven timer or fold state is needed.
- The Exchange retains its state and disclosure beside the other controls on Signal maps.
- Build moves inward by 40px; world notes move to a 154px-wide column starting at x54. Joystick and action-button anchors stay unchanged. Existing note disclosure behavior stays intact.
- The optional debug tuning dock moves left to keep the new Pause target reachable. Plain boots have no tuning dock.

The independent diagnostic check passes at 390×844 and 430×932: visible persistent controls have ≥44px targets, remain inside the viewport, and their centers receive hits. Pause/resume works with the debug dock visible; Build, Prospector and Exchange open through touch. A detached HUD clone verifies large HP/gold/XP/time/wave/air/permission strings stay inside their panels, and resource text does not overlap. [Results](layout-check.json), [checker](check-layout.mjs), and `controls-*` / `diagnostic-high-values-*` screenshots.

## Measurement boundary

`node scripts/phone-hud-entry-census.mjs before|after` selects each contract with the existing preview-unlock/stage helper, then launches `/?contract=…&seed=map-art-campaign-2` without debug flags. It captures the normal frame at about 10 simulation seconds. Rendering-only model handles permit subsequent magenta masks; `window.__GR_TEST__` remains undefined. The script verifies the served CSS matches the working source before capture.

The persistent selector and RGB threshold are run-6's exact ones: ordinary HUD panels, Pause, world notes, touch controls and building prompts; transient story/announcement cards excluded only in labelled masks. Painted union counts non-magenta pixels over a magenta backdrop. Per-panel percentages are clipped rectangle areas, so they must not be summed. The inherited selector excludes the prompt-stack parent's backing; its child note text is counted, while unretouched normal frames retain the real backing. This is a consistent campaign metric, not a claim that every actual panel-background pixel is included.

A zero-pixel body is **OFFSCREEN**, never 0% covered. Glow Mesa's rack and Relay Rush's charting station/west dishes were already offscreen before this task. Their framing requires camera/art work outside this firewall. The guard rejects omitted bodies or formerly visible bodies disappearing; it preserves the honest null values.

The census guard also verifies UI-source freshness, all twelve views, PNG-derived percentages, fixed per-map phone union ceilings, at least one-third reduction, ≤10% coverage of visible phone bodies, and exact desktop boxes. It runs through the existing `test:node-guards` roster, not a new runner.

## Verification

- Install/pre-edit build: PASS. npm replaced the initial `node_modules` symlink with ignored local dependencies; the post-build worktree was clean. No source dirt, ahead work or discarded evidence at preflight.
- Final TypeScript/default/full/E1 builds: PASS. E1 first-town payload **34,272,945 → 34,277,296 B (+4,351 B)**, below 52,000,000 B. [Build exits](build-exits.json), [payload](payload-after.json), [build fingerprint](build-source-hash.txt).
- Final scoped node battery: **61/61 PASS**, including the census, skillmd, same-game, GLB, terrain sampler, walk-surface, open-sea and shared-atlas guards. [Log](node-gates-final.log).
- Same-game audit: **byte-identical**, 378,541 B per arm. [Before](same-game-before.txt), [after](same-game-after.txt).
- Initial broad HUD browser run: **342 pass / 44 fail / 120 skip**, 506 collected cases across both Chromium projects, one worker. Two real regressions were found and corrected: the debug dock intercepted Pause, and the compact Prospector hid its portrait. Both corrected cases now pass their original assertions on both projects; no assertion was weakened.
- Required five mobile campaign suites: **19 pass / 1 fail**. Seed Run expected the caravan to be paused but found it moving. That mobile case passes the final recheck; no gameplay fix is claimed.
- Supplemental HUD/pause/Tape Reel browser roster: **97 pass / 3 fail / 0 skip**. Corrected Pause and portrait cases pass both projects. Failures are enemy-stat ledger on both projects and the mobile plain Tape Reel patrol; the mobile patrol reproduces at the same hidden Save Tape assertion with pre-cure CSS, and the enemy-stat ledger fails with pre-cure CSS too. The separately selected multiplayer HUD case is **1 pass / 1 intentional mobile skip**.
- Final CSS recheck (full Build/mobile-layout specs plus eight prior failure locations): **24 pass / 6 fail / 2 skip**. The full `m2-01-build-menu` and `polish-03-mobile-hud` suites pass on both projects. Every remaining failed case also fails in an original-CSS control. Across the initial 48 failures: **43 reproduced baseline cases, 2 corrected HUD regressions, 3 final passes without a claimed causal fix**. Of the 43, 42 reproduce the same assertion line; the desktop world-note case fails at a different assertion. [Case-by-case attribution](failure-attribution.md), [raw reports and all counts](test-summary.json).
- E1 release-owned browser suite: **26 pass / 4 fail**. Dry Gulch harvesting fails at `release-build.spec.ts:330` on both projects, also with the compiled cure media query removed from the same E1 build. The other two failures are the known asset audit. [Release run](e2e-release.json), [CSS-off control](e2e-release-control.json). The control removes exactly 4,351 CSS bytes, matching the entire E1 payload increase; all original assertions and other build bytes stay intact.
- Named task/citation/gate-caller roster: final **3/3 PASS**. [Log](roster-gates-final.log).
- Extra E1 release asset assertion finds four E4-named jumper PNGs; the same four occur in the pre-edit E1 build. [Assertion](assert-release.log), [baseline proof](release-leak-baseline.txt). The required E1 build itself passes. No asset or assertion change is authorized here.

### Stable harness and failure attribution

Concurrent lane-c store edits triggered Vite full-page reloads even on unrelated maps. The mobile Canyon Works canvas detached during one of those navigations. Preserve the original broad-run result; final captures and controls use [the artifact-local Vite config](vite-control.config.ts) with HMR disabled, on port 5312 only. A `HUD_CONTROL_ARM=before` server substitutes only the exact committed pre-cure CSS before Vite transforms it. All original test files and assertions remain unchanged.

The final helper run corrected two diagnostic-harness issues: closed disclosure descendants are not visible touch targets, and the synthetic colour-key fixture needs explicit dimensions after dimension checking was added. The final guard passes 3/3. Board composition uses the existing Python environment with Pillow; no image generation or new raster art is involved.

Raw command rosters: [HUD suites](hud-spec-roster.json), [supplemental locations](additional-hud-specs.json), [five mobile campaign suites](campaign-test-list.txt), [final development commands and exit codes](final-dev-exits.json). Earlier candidate logs remain historical evidence; final logs and the attributed results above are authoritative.

## Integration boundary

Factory cleanup restored 63 tracked generated artifacts and removed 146 untracked generated files outside this task; `logs/guard-stats.jsonl` remains allowed factory churn. [Exact path inventory](factory-churn-cleanup.json). No writes under the shared art-store symlinks. Concurrent Last Claim/Ember Shore work changes the engine inventory independently; [engine/store pair](engine-pair.json) records the measured close state. This lane's runtime diff is CSS only, which the engine source inventory excludes. Same-game semantics are unchanged. Do not reset, rebase, restore or push the concurrent lane-c store.

## Remaining list in order

1. The drain reviews the known failing browser cases and the E1 harvesting / four-asset leak holds before full acceptance. No existing assertion, gameplay, story, statistics, parity or asset repair is included in this HUD task.
2. Camera/art owners resolve the offscreen Glow Mesa rack and Relay Rush charting station/west dishes. Null coverage is not a visible-body pass. Desktop body occlusion remains unchanged.
3. The measurement owner may supersede the run-6 mask to include the prompt-stack backing; this run deliberately preserves the mandated comparison mask.

No remaining phone-layout implementation is planned in this slice. The completed census and cure are ready for the orchestrator's gates with these holds, not an all-green release claim.
