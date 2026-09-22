# Entry framing — completed handoff, 2026-09-22

**READY-FOR-GATES.** Three declared landmarks receive a 2.5 s camera-only glance; Dead Band and Relay Rush use the explicit already-framed exception and remain undeclared. **No unreachable maps; no remaining implementation.** Seven pre-existing browser cases remain held, reproduced on exact preceding map engines.

Code branch `sol/map-art-campaign-2`; art-store branch `astra/entry-framing`, pushed and read back at `d8938178a7464c637a79bca81d5f788bc8ad954d`. Land both branches together. Engine pins stay drain-owned. [Full machine-readable receipts and hash pairs](handoff.json).

| Map / selected landmark | Why this landmark; declaration | Desktop rest → peak/mid → return | Phone rest → peak/mid → return | In-frame seconds (desktop / phone) |
| --- | --- | ---: | ---: | --- |
| [e6-glow-mesa](e6-glow-mesa/review.md) / `mesa-starstone-derrick` | Raised cap and working derrick; declared. | 0 → 37,168 → 0 | 0 → 41,400 → 0 | 1.416–1.525 / 1.359–1.468 |
| [e7-dead-band](e7-dead-band/review.md) / `iron-shadow-warning-frame` | Paired warning frames introduce the corridor; already visible, undeclared. | 6,714 → 6,718 → 6,718 | 7,570 → 7,570 → 7,570 | ≥3.970 / ≥3.986 |
| [e8-far-side](e8-far-side/review.md) / `earthrise-listening-array` | Isolated horizon dish opposite the landing compound; declared. | 0 → 26,144 → 0 | 0 → 28,996 → 0 | 1.377–1.490 / 1.375–1.491 |
| [e6-half-life-hollow](e6-half-life-hollow/review.md) / `south-countdown-gate` | Foreground clock gate marks the timed crossing; declared. | 0 → 26,671 → 0 | 0 → 29,787 → 0 | 1.700–1.816 / 1.684–1.791 |
| [e7-relay-rush](e7-relay-rush/review.md) / `rush-relay-r2-frame` | Nearest relay shelf identifies the real start; already visible, undeclared. | 21,662 → 21,676 → 21,675 | 24,145 → 24,126 → 24,124 | ≥3.965 / ≥3.957 |

Body counts are depth-tested canvas pixels, excluding DOM HUD coverage. The timed window is 0.7 s in, 1.1 s hold and 0.7 s out. Duration comes from separate uninterrupted boots and ≥50 ms pose sampling, so bounds bracket visibility; the already-visible samples are lower bounds. Small differences on no-op maps are ordinary settling. Each map folder contains the plate/rest/peak/return boards at 1280 and 390. [Ten final uninstrumented entries](plain-entry-contact-sheet.png) have no routing, test hooks or injected camera handles.

The Far Side pan exposed a target-over-camera flip when ordinary lag was applied on top of the authored ease. During that ease alone, the camera follows its focus at the existing offset directly; ordinary tracking retains the original lag. Glow Mesa measurements were refreshed on that final source, with earlier captures preserved. No FOV, offset, zoom, hero start, simulation, input, collision, schema, tape, HUD, assertion or pin changes. Only three mirrored `entryLandmark` objects and one sentence on each existing manifest rule are added. The Game hook is six lines. [Scope proof](scope-proof.json).

## Verification

- Final TypeScript/default/full/E1 builds pass; first-town payload **34,309,830 B < 52,000,000 B**. All E1 maps remain undeclared. [Build receipts](e6-half-life-hollow/build-gates.json).
- Scoped guards **61/61**, named guards **3/3** pass. [Receipts](e6-half-life-hollow/guards-gates.json).
- Final shared browser batch **28 passed / four opt-in skips / zero failures**. Exact Regatta replay **2/2**; all agent-view cases **10/10**. [Command and log](final/e2e-shared-replay-view.json).
- Ten plain boots, all five maps at both widths, have **zero console/page errors**; no test or instrumentation handles. [Receipts](plain-boots.json).
- **1,200 camera poses** exactly match the frozen baseline, including replay-style targets; **600 entry frames** retain the fixed offset/orientation on long pans. Inputs stay unchanged, return and cancellation pass. [Proof](rig-proof.json).
- **30 final `now` snapshots / 109,496 bytes** match baseline byte-for-byte across all five maps plus The Claim. The same-game audit has identical semantics; literal output differs only in source-line citations shifted by the six-line Game hook. All 42 manifests preserve every other field. [Parity](parity-summary.json) · [Manifest](manifest-proof.json).
- Own coverage: Glow Mesa green after the initial extra-rule census defect was fixed by extending the existing rule (eight unchanged census reruns pass); Dead Band suppression/census **12/12**, broader Signal **39/5**; Far Side focused parity/census **6/6**, broader Orbital **22/2**; Hollow **20/20**; Relay **16/16** plus visual census **2/2**. Shared loading **8/8**, repeat **2/2**. No assertion changed.

## Existing failures and retained holds

These are not an all-green own-suite result. All seven cases reproduce on their exact preceding map base:

| Assertion | Projects | Failure | Exact-base evidence |
| --- | --- | --- | --- |
| `e2e/e7-roster.spec.ts:175` | desktop-chrome, mobile-chrome | e7Arsenal.enabled expected true, received false | [Receipt](e7-dead-band/e2e-exact-base.json) |
| `e2e/e7-signal-systems.spec.ts:138` | desktop-chrome, mobile-chrome | activateEpoch(epoch-8-orbital) expected true, received false | [Receipt](e7-dead-band/e2e-exact-base.json) |
| `e2e/e7-playbook-rows.spec.ts:249` | mobile-chrome | Save Tape record button hidden; timeout | [Receipt](e7-dead-band/e2e-exact-base.json) |
| `e2e/e8-roster.spec.ts:183` | desktop-chrome, mobile-chrome | e8Arsenal.available expected true, received false | [Receipt](e8-far-side/exact-base-attribution.json) |

The fuller plate composition remains held: Glow Mesa cap/compound/node ring, Dead Band ridge vista, Far Side lunar compound/array art and rim occlusion, Hollow ravine/crossing slabs/gate and continuation seam, Relay Rush ascending terraces/full-route/charting-station presentation. Ordinary HUD overlap remains visible. This closes entry reach only; each map review retains its named ownership boundaries.

## Per-map commits and engine identities

| Map | Code commit | Store commit | Engine before | Engine after |
| --- | --- | --- | --- | --- |
| e6-glow-mesa | `a36f6ad6870929cd4b4bc8a090df38926aef08dd` | `4e9720b0788ebd6bccb6f2bd1f3945dbd855a50c` | `b7113b37c1a7e10b10f504947a660147c581c22b667aa1df2feb695bbb96100c` | `b13e44ed083d03e30fee4cf9d6e3702ff8b6e167ddb88f20a7d24eae36cd7427` |
| e7-dead-band | `e680325d552193ff42717df36464f0dff3ba1c3d` | `4e9720b0788ebd6bccb6f2bd1f3945dbd855a50c` | `b13e44ed083d03e30fee4cf9d6e3702ff8b6e167ddb88f20a7d24eae36cd7427` | `084df9fa71eef1eb63753addda63d7ee7b34a049e8394acfea11db36d284ae37` |
| e8-far-side | `29e4e8ec9345a1c4c1651f0cef868be2a8c40c98` | `2d1000357f06e44b42b7288ef8682b1919a66e05` | `084df9fa71eef1eb63753addda63d7ee7b34a049e8394acfea11db36d284ae37` | `b3a86513d6b6511e4fa3049104211051d4cddac7fdda6c314a52144cdb98a288` |
| e6-half-life-hollow | `366168294edc07088e467d31433d8132ac1bf598` | `d8938178a7464c637a79bca81d5f788bc8ad954d` | `b3a86513d6b6511e4fa3049104211051d4cddac7fdda6c314a52144cdb98a288` | `a8afc11f313a5bc6567deac76bb40da24aab1ff19d7f935146229510289ad7c1` |
| e7-relay-rush | `9ffbffb38373c9b85258c9cd3a0185d28b74e21a` | `d8938178a7464c637a79bca81d5f788bc8ad954d` | `a8afc11f313a5bc6567deac76bb40da24aab1ff19d7f935146229510289ad7c1` | `a8afc11f313a5bc6567deac76bb40da24aab1ff19d7f935146229510289ad7c1` |

Glow Mesa’s initial hash pair remains the first-map receipt. Its final measurements use the Far Side refinement engine `b3a86513d6b6511e4fa3049104211051d4cddac7fdda6c314a52144cdb98a288`. Final campaign engine is `a8afc11f313a5bc6567deac76bb40da24aab1ff19d7f935146229510289ad7c1`. Dead Band and Relay Rush make no empty store commits. The closeout commit contains these receipts without changing that engine.

Remaining list in order: **none**.
