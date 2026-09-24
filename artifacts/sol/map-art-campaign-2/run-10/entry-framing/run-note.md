# Entry framing pass two — 2026-09-24

**READY-FOR-GATES. All six map slices are implemented and measured; full browser/release acceptance remains HELD.**

**REMAINING LIST IN ORDER: EMPTY.** The holds below require work outside this task firewall; they are not silently waived.

## Scope and behavior

The four E1/E2 maps use the existing zero-body-pixel entry trigger. Glow Mesa and Relay Rush accept an ordered list of at most two landmarks, retaining the singular as its first element. Only zero-body landmarks enter the tour. A two-stop tour keeps the original 2.5 s window and 0.7 s entry/return eases, replacing the old 1.1 s hold with 0.2 s hold / 0.7 s transit / 0.2 s hold. Single-stop poses remain exact. The shorter phone dwell is measured below; HUD clearance and full landscape fidelity are not claimed.

Source changes are limited to CameraRig and MechanicsManifest. The Game hook, sim, View, Balance, every heroStart, tests/assertions/fixtures, pins, GLBs and atlases are untouched. The store has exactly 12 changed contract files, with paired entry metadata equal and all other JSON values unchanged. See [final proof](final-proof.json).

## Landmarks, reasons and holds

### e1-night-shift

`lampworks_yard`. The plate's foreground working yard and lamp rig establish the night work beside the lantern route; this is the declared yard mount at (8,18).

**DECLARED / HELD: already partly visible, so no glance.** lampworks_yard has nonzero body pixels at both widths. The unchanged zero-pixel trigger cannot cure partial cropping or HUD coverage; no improvement is credited to the live count variation. The phone yard and full lantern procession remain held.

[Boards, raw measurements and map-specific gates](e1-night-shift/review.md).

### e1-twin-banks

`south_bank_homestead`. The plate pairs worked homesteads across the braids; the southern homestead supplies one bounded landmark without pretending the fixed camera can frame both banks.

**IMPROVED: phone homestead revealed; desktop already visible.** The phone-only 2.5-second glance reveals south_bank_homestead and returns to the unchanged rider. Desktop correctly skips the already-visible house. Both braids, both banks, the other rig and HUD clearance remain separate holds; the single homestead does not establish full plate fidelity.

[Boards, raw measurements and map-specific gates](e1-twin-banks/review.md).

### e1-baron

`seized_headframe`. The seized headframe identifies the Baron's occupied workings and fits a single glance; the 55.21 m fort remains a separate layout hold.

**IMPROVED: phone headframe revealed; desktop already partly visible.** The phone glance frames seized_headframe for about 1.9 seconds and returns to the rider. Desktop skips its already-visible body. The 55.21 m fort, second cart, broad occupied valley, desktop headframe crop and remaining HUD overlap are HELD outside this bounded reveal.

[Boards, raw measurements and map-specific gates](e1-baron/review.md).

### e2-trestle

`trestle-crossing`. The plate leads with the bridge span over the gorge; the existing crossing mount is the view's central structure.

**IMPROVED: phone bridge body revealed; desktop already partly visible.** The bridge span is the declared trestle-crossing body. Phone gains a 2.5-second glance and returns to the rider; desktop skips the existing visible fragment. Full span composition, gorge vista, rail stock and HUD clearance remain separate holds under the unchanged offset, zoom and zero-pixel rule.

[Boards, raw measurements and map-specific gates](e2-trestle/review.md).

### e6-glow-mesa

`mesa-starstone-derrick`, `isotope-cooling-rack`. The cooling rack is the offscreen facility the first derrick glance did not reveal.

**IMPROVED: phone derrick then cooling rack fit one window; desktop rack HELD.** entryLandmarks keeps mesa-starstone-derrick first and adds isotope-cooling-rack. The phone tour preserves the 0.7 s entry/return eases and uses the old 1.1 s hold for 0.2 s first hold, 0.7 s transit and 0.2 s second hold. The phone bodies are visible about 0.45–0.55 s and 0.58–0.68 s; this trades dwell time for two views. Desktop rack already has body pixels, so it is skipped; its zero peak count is at the derrick stop, not a claimed rack glance. Cropping, desktop rack HUD coverage, full mesa grouping and active node-ring presentation remain HELD.

[Boards, raw measurements and map-specific gates](e6-glow-mesa/review.md).

### e7-relay-rush

`dead-gap-charting-station`, `west-ridge-dish-cluster`. The charting station and west dishes explain the relay route beyond the already-visible R2 frame.

**Phone charting station and west dishes REVEALED; desktop west dishes REVEALED; desktop charting station HELD.** The charting station and west dish cluster are the two inherited Relay Valley bodies named by the run-6 hold. At 390, both are zero-body at rest and the ordered list reaches each inside the unchanged 2.5 s window. At 1280, 8,548 charting-station pixels already exist at the cropped left edge, so the unchanged zero-body rule skips it; only the west dishes are targeted. The charting-station body disappears during that desktop glance and returns afterward. Persistent HUD and broad plateau composition remain held. The list uses the former hold for two 0.2 s stops with a 0.7 s transit; it does not extend the tour or move the spawn.

[Boards, raw measurements and map-specific gates](e7-relay-rush/review.md).

## Measured body visibility

Depth-tested unique-magenta counts use a fixed DPR-1 viewport render target: 1280×800 or 390×844. Counts exclude the HUD; the companion screenshots keep it. Durations sum visible intervals in recorded live camera poses against a frozen final scene, with sampling bounds. An asterisk means visibility reaches an observation edge. For a skipped body, “peak” is the other landmark’s stop, not a claimed glance at that body.

| Map / landmark | Width | Rest → peak → return pixels | Seconds observed visible | Targeted |
| --- | ---: | ---: | --- | --- |
| e1-night-shift / `lampworks_yard` | 1280 | 77,509 → 77,506 → 77,505 | 3.988–3.988 * | False |
| e1-night-shift / `lampworks_yard` | 390 | 9,127 → 9,128 → 9,128 | 3.990–3.990 * | False |
| e1-twin-banks / `south_bank_homestead` | 1280 | 44,748 → 44,746 → 44,746 | 3.996–3.996 * | False |
| e1-twin-banks / `south_bank_homestead` | 390 | 0 → 49,902 → 0 | 1.900–2.015 | True |
| e1-baron / `seized_headframe` | 1280 | 24,267 → 24,265 → 24,264 | 4.000–4.000 * | False |
| e1-baron / `seized_headframe` | 390 | 0 → 22,185 → 0 | 1.858–1.966 | True |
| e2-trestle / `trestle-crossing` | 1280 | 8,161 → 8,155 → 8,148 | 3.997–3.997 * | False |
| e2-trestle / `trestle-crossing` | 390 | 0 → 52,732 → 0 | 1.833–1.950 | True |
| e6-glow-mesa / `mesa-starstone-derrick` | 1280 | 0 → 37,168 → 0 | 1.392–1.509 | True |
| e6-glow-mesa / `mesa-starstone-derrick` | 390 | 0 → 41,400 → 0 | 0.448–0.550 | True |
| e6-glow-mesa / `isotope-cooling-rack` | 1280 | 5,390 → 0 → 5,389 | 1.600–1.709 * | False |
| e6-glow-mesa / `isotope-cooling-rack` | 390 | 0 → 35,096 → 0 | 0.575–0.684 | True |
| e7-relay-rush / `dead-gap-charting-station` | 1280 | 8,548 → 0 → 8,549 | 1.839–1.942 * | False |
| e7-relay-rush / `dead-gap-charting-station` | 390 | 0 → 21,955 → 0 | 0.609–0.725 | True |
| e7-relay-rush / `west-ridge-dish-cluster` | 1280 | 0 → 22,216 → 0 | 2.107–2.223 | True |
| e7-relay-rush / `west-ridge-dish-cluster` | 390 | 0 → 24,726 → 0 | 0.558–0.667 | True |

Superseded `native-buffer` and `difference-census` measurements are retained only as audit history. Adaptive drawing-buffer resolution changes the pixel denominator; two-render RGB differences can count animated water. Final tables use the corrected evidence-only census. The production trigger census remains byte-identical to the first pass.

## Validation and gate holds

- TypeScript, default, full and E1 builds: PASS after each map. All requested scoped node guards and named task/citation/gate-caller guards: PASS, including a final rerun after Relay Rush.
- All 12 final uninjected plain boots: PASS, zero console/page errors, no test hook or injected entry handle. [Receipt](all-plain-boots.json); each map folder has `plain-window-*` and `plain-return-*` screenshots.
- Exact boat replay test `e2e/e5-regatta-boat.spec.ts:196`: PASS 2/2, desktop/mobile. [Combined parity receipt](e7-relay-rush/e2e-parity.json).
- Camera baseline: 1,200 ordinary/replay/multiplayer/moving/zoom/impulse poses and 540 single-entry poses match exactly; 600 long-pan frames retain orientation. Two-stop timing and all four visibility combinations PASS. [Rig proof](rig-proof.json), [list proof](list-proof.json).
- 50 deterministic headless `now` snapshots: byte-identical. Across 42 manifests, everything except the required landmark prose is byte-identical. The complete same-game audit is byte-identical: 1,763 rows, 1,252 equal and 511 existing agent-lacks rows. This is unchanged audit output, not a claim that those existing gaps are closed. [Proof](final-proof.json), [audit](audit-proof.json).
- **Introduced fixture mismatch:** agent-view passes 10/12. The two `:439` failures are exactly the three required E1 landmark sentences absent from the protected fixture. Pre-task source matches that fixture; removing only those sentences makes the candidate match byte-for-byte. [Attribution](manifest-fixture-attribution.json). The fixture remains untouched under the firewall.
- **Release acceptance HELD:** strict `GR_RELEASE=e1 npm run build:release` exits 1 because `motor-hauler-DGEx9v27-diet-c2bea0ac.glb` is emitted. A build with both pre-task TS modules reproduces the identical leak. The unchanged static asset URL is at `src/entities/Vehicle.ts:10`. [Build receipt](release-build.json), [control receipt](release-baseline.json).
- The unchanged release suite passes 26/30. Its two dist assertions fail on that leak; both first-player tests also fail at Dry Gulch harvest channeling (`release-build.spec.ts:330`). An isolated pre-task-source build, with the same asset-diet step, reproduces both harvest failures at the identical assertion. [Candidate](e7-relay-rush/e2e-release.log), [control](release-baseline-browser.log). All 12 E1 release-door boots pass. The artifact-only release config uses port 5303 and leaves the existing suite/assertions unchanged.

| Map own suite | Passed | Failed |
| --- | ---: | ---: |
| e1-night-shift | 13 | 5 |
| e1-twin-banks | 4 | 6 |
| e1-baron | 20 | 2 |
| e2-trestle | 2 | 0 |
| e6-glow-mesa | 10 | 0 |
| e7-relay-rush | 8 | 0 |

- **e1-night-shift:** Own suite: 13 passed / 5 failed. Corrected pre-task CameraRig/manifest control: 3 failed / 3 passed. Both fog mismatches reproduce exactly (34/58 vs 18/42). The mobile sprite-lighting test also fails at base, but on its in-radius lower bound rather than the candidate out-of-radius upper bound; the exact pixel fingerprint is not reproduced. Both suspend timeouts pass at base; the unchanged candidate suspend retry passes 2/2. Initial base-control is invalid (evidence-server raw-JSON boot error) and is not attribution. Full browser acceptance remains HELD.
- **e1-twin-banks:** Own suite 4 passed / 6 failed. All six exact test/project failures reproduce under the pre-task CameraRig/manifest control: center bank-versus-river classification at line 96, invalid build ghost at line 48, ford-route timeout at line 228. See e2e-base-verified.log. Full existing-suite acceptance remains HELD; no assertion was changed.
- **e1-baron:** Own suite 20 passed / 2 failed. Both failures reproduce at the identical prefetch assertion under the pre-task CameraRig/manifest control: baronAnimationLoaded false instead of true, line 302 in the test at line 411, desktop and mobile. See e2e-base-verified.log. Full suite acceptance remains HELD; no assertions changed.

The initial Night Shift `base-control` attempt was INVALID because an evidence-server loader error prevented boot. Attribution uses only the corrected `base-verified` controls. The first release-baseline attempt also failed to load Vite configuration and supplies no attribution; the corrected control uses Vite’s config loader. No protected assertion or fixture was edited to make a gate green.

## Payload and engine receipts

| Map | Standard E1 build bytes | Delta from prior map/build |
| --- | ---: | ---: |
| e1-night-shift | 34,322,816 | +4,270 |
| e1-twin-banks | 34,329,072 | +6,256 |
| e1-baron | 34,333,649 | +4,577 |
| e2-trestle | 34,339,545 | +5,896 |
| e6-glow-mesa | 34,340,281 | +736 |
| e7-relay-rush | 34,340,806 | +525 |

Baseline first-town payload: 34,318,546 B. Every build stays below 52,000,000 B. Deltas are measured before the separate strict release asset-diet step.

| Map | Engine before | Engine after |
| --- | --- | --- |
| e1-night-shift | `d4e4bfb1167e66755209b2f679bf8682e03286b48dc9f8d1b929a1465f264959` | `9c2ee0ea822710505d86a59da361d42c2362729ef5feeded0ce7bff33100e47b` |
| e1-twin-banks | `9c2ee0ea822710505d86a59da361d42c2362729ef5feeded0ce7bff33100e47b` | `97855ed9d083ec03a2057dfc9f33b0618f6c8cb28fcfac99952fa1e2e6000a97` |
| e1-baron | `97855ed9d083ec03a2057dfc9f33b0618f6c8cb28fcfac99952fa1e2e6000a97` | `3791c3f04a2941cd2b03a1b34883ef4ddee1c09d7d5e57630ef58416db65113b` |
| e2-trestle | `3791c3f04a2941cd2b03a1b34883ef4ddee1c09d7d5e57630ef58416db65113b` | `2b0d52300abd6a7558c4d4a818e8bc61f0f3ffbde92984685d8f77a8aa653de4` |
| e6-glow-mesa | `2b0d52300abd6a7558c4d4a818e8bc61f0f3ffbde92984685d8f77a8aa653de4` | `13fb20763655460af233764b4bb4ad960b2a1e758c3476473bd353e5b4203aa1` |
| e7-relay-rush | `13fb20763655460af233764b4bb4ad960b2a1e758c3476473bd353e5b4203aa1` | `dcc407bec54d01d4040d835f8140c21368c4cec8c445400d346cda59220b3d0b` |

The engine pin remains drain-owned.

## Commits and handoff

Lane branch: `sol/map-art-campaign-2`. Store branch: `astra/entry-framing-2`, pushed after each map. The specific firewall takes precedence over the copied first-pass store branch name. No mid-run reset/rebase or main/pin mutation was performed.

| Map | Lane commit | Pushed store commit |
| --- | --- | --- |
| e1-night-shift | `ce01994cc902c7d278059d9f023409344cf855d1` | `ad930189d3da6740260186ac79a677656df677cc` |
| e1-twin-banks | `55c3d10a731e4467d27062c4956cc1b10aa376c5` | `56a49f57cb52481465612893b03855b2d01ec3d7` |
| e1-baron | `3dcd4a561c1c32c59b7c13c001bf1ad980b17cde` | `b6d2ebf6c508fdcd0536fc9460e642510a55b7bf` |
| e2-trestle | `3cbe2fdb7f969a1991bf90fdc1b70abc8e917c20` | `7a20139d19d42adb97e8fbfd591f4a80e6792128` |
| e6-glow-mesa | `1631489853c9ea6018fd1c0c8b7716094f5e6229` | `9896e1df5265e7b68ec99e90d66dfe8c95074250` |
| e7-relay-rush | `this commit` | `5793a967da46e8f00c0ba16f92f17dc10d36558d` |

The Relay Rush lane commit carries this closing note and the common proofs. Preflight had only expected `logs/guard-stats.jsonl` churn. Regenerated unrelated test screenshots were retained inside this evidence tree and their prior tracked files restored. All task servers are stopped after validation.

Drain follow-ups: decide the three E1 fixture additions; handle the existing release asset leak and Dry Gulch harvest failure; retain the Night Shift/Twin Banks/Baron test holds and visual holds stated above. This branch does not widen the firewall to repair them.
