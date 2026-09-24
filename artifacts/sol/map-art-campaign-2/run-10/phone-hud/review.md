# Phone entry HUD extension — READY-FOR-GATES, acceptance held

2026-09-24, run 10. Task `sol-phone-hud-entry-2`, branch `sol/wave-lane-b`. The census and three phone layout cures are complete. **Browser and release acceptance remain HELD** on reproduced failures outside the CSS firewall; this is not an all-green handoff.

## Result

| Entry body at 390×844 | Persistent coverage before → after | Result |
|---|---:|---|
| Night Shift — `lampworks_yard` | 13.09% → 8.03% | 60px confirmation target, same centre |
| Twin Banks — `channel-water` | 22.84% → 6.16% | Same compact target; joystick backing/glow removed |
| Baron — `fortified_far_bank` | 68.14% → 0% | Complete status rail below the visible parapet |
| Trestle — `trestle-crossing` | OFFSCREEN → OFFSCREEN | Camera hold; no Trestle CSS change |

The rules match exactly 390px within the existing tall-phone range. Numbers, testids, controls and joystick input are preserved. The joystick ring, knob, centre and bounds stay unchanged. Only `src/ui/theme.css` changes at runtime. Game, simulation, camera, e2e assertions and store files are untouched by this lane.

The six original phone painted unions remain exactly **13.405639 / 12.122980 / 14.558877 / 14.228339 / 13.820634 / 11.277190%** (Low Orbit / Seed Run / Archive World / Dead Band / Relay Rush / Glow Mesa). Their desktop unions remain exactly **15.895605 / 14.625684 / 15.577734 / 15.768262 / 15.768262 / 13.917676%**. All original-six panel boxes and every desktop panel box are unchanged. Small live body-mask differences are recorded, not credited to this CSS. [Full census and boards](census.md).

## Verification and gate holds

| Check | Result |
|---|---|
| TypeScript; default / full / E1 compile, bundle and asset diet | PASS |
| Census guard | 3/3 PASS |
| Skillmd + same-game guards | 25/25 PASS |
| Named task / citation / gate-caller guards | 3/3 PASS; closing run in `named-guards-final.log` |
| Six 390/430 layout cases | PASS; reachable targets ≥44px, high-value numbers fit; Pause/Build/Prospector access |
| Plain before/after captures | 40/40 with no test hook and zero console/page errors |
| Same-game audit | Before / after / final byte-identical: 604,632 B, SHA256 `5f89a504552dced6885cd4f080da25d682980648a67d2cdfd86bb5d34aced1df` |
| Build menu, both Chrome projects | 14/14 PASS |
| Full current HUD roster, 69 files | 532 passed / 50 failed / 114 existing skips |
| Four own-map specs, mobile | 19 passed / 7 failed |
| CSS controls for 56 unique failed cases | 49 reproduce at the same assertion; other 7 pass candidate reruns |
| E1 release browser spec, both Chrome projects | 26 passed / 4 failed; no skips |
| Release asset guard | HELD: emitted `motor-hauler` is classified as a later plate/GLB asset |

[Failure attribution](failure-attribution.md) preserves every original result, exact assertion and control. All seven own-map failures reproduce with pre-cure CSS: Baron animation-loaded; Night Shift fog, luminance and suspend; Twin Banks zone, placement and ford route. Trestle's mobile spec passes. No persistent candidate-only HUD failure remains in the controls. Existing skips are enumerated in `existing-skip-inventory.json`; optional playability matrices and measurement rigs were not enabled.

Release failures are Dry Gulch harvest channeling (`release-build.spec.ts:330`) and the asset guard (`:245`) in both projects. Desktop initially times out dismissing the briefing (`:79`), then its candidate rerun reaches the same harvest failure as the control. The control removes only the compiled run-10 media block from the same E1 build; JavaScript and assets are identical. All four control cases fail. The exact original CSS is restored and hash-verified in `release-css-control.json`. `assert-release-build` fails with or without the CSS block. The release harness uses the existing spec/projects on port 5312, with the already-built E1 dist and the failing asset assertion recorded separately so browser diagnostics can run; this does not waive release eligibility.

E1 first-town payload: **34,318,546 → 34,319,307 B (+761 B)**, under 52,000,000 B. The family ledger splits the delta into **index.css +543 B** and **Terrain3dClaimPilot.js +218 B**. Its TypeScript source is unchanged while shared store inputs moved; +761 is the measured whole-build delta, not an isolated CSS size. Final restored payload matches. See `payload-delta.json` and `payload-final.json`.

## Method and provenance

The before census was committed as `0aaa67564` before any cure. The clean lane began at `e191530e6921b4664d94b2df58f8934ed747fda5` after confirming its old head was 135 commits behind main with no undrained work. Install and baseline build passed; post-build status was empty. No preflight evidence was discarded. The census polling predicate now tolerates diagnostics not yet being published; the initial startup-race log is retained.

Run-6 selectors and the magenta threshold are unchanged. The river uses the existing run-3 alpha/depth-preserving shader mask. The inherited union backdrop at z-index 4 excludes lower-stacked touch controls; the retained selector also omits the prompt-stack parent backing. Body-specific persistent masks retain touch controls and establish the measured improvement. Painted-union equality does not mean touch-button paint is unchanged. Rejected Twin Banks candidate evidence is retained under `candidate-1/`.

Preflight engine/store: `14d5fe939541356c466b5025d72599f5e9885bb63c71f3c4207adec717d24d59` / `c092e3de241f34163e903279bf071fe1f4fa6d56`. Final: `6eeb451c4cc8cab46792e89dd2b690566e8621285dca6fa084fb78b2b4c2bcc2` / `5793a967da46e8f00c0ba16f92f17dc10d36558d`. The engine digest includes store JSON, which advanced in the concurrent lane. Lane-b never wrote or committed the store. CSS controls verify served hashes and record store heads; both control arms disable HMR. They isolate stylesheet bytes, not a frozen historical asset tree.

Test-generated churn was preserved under `regenerated/`: 95 tracked outputs restored to their prior bytes and 198 new outputs moved here. `regenerated-evidence-receipt.json` records paths and hashes. Failure images, error contexts, reports and reproducers are committed. 115 large traces (11,239,715,998 B) stay local and ignored from Git; `local-trace-inventory.json` records their hashes. Factory `logs/guard-stats.jsonl` is left alone.

## Remaining list in order

1. Runtime/test owners resolve the 49 reproduced unique browser failures and the release Dry Gulch/asset holds listed in the attribution files; existing assertions were not weakened here. Then rerun the named browser gates to establish acceptance.
2. Integrate the separate entry-framing work and rerun the ten-map census on the combined tree. The guard hashes UI sources, not camera/store inputs; these masks cannot certify a later camera merge.
3. Keep Trestle bridge, Glow Mesa cooling rack, and Relay Rush west dishes/charting station as phone OFFSCREEN holds. Relay west dishes are also OFFSCREEN on desktop. Baron entry rigs remain the prior run-3 camera hold; this census measures its fort only. Preserve all other art/contract/desktop holds in the status rows.

No remaining implementation inside this task's CSS/census firewall. READY-FOR-GATES means ready for orchestrator review with the holds above, not permission to mark the maps accepted.
