# Run 9 — E1/E2 fidelity handoff

2026-09-23. Branch `sol/map-art-campaign-2`; art store `astra/fidelity-2` in `/Users/robin/Claude/Projects/Gold Rush/worktrees/GoldRush-assets`. **READY-FOR-GATES. Both permitted art-owned maps are complete; four maps are scope-skipped.** Full concept fidelity is not accepted by this handoff.

## Ordered disposition

| Map | Disposition |
| --- | --- |
| e1-night-shift | SKIPPED: latest run-3 holds only contract/sim/UI/camera; no permitted art-owned residue. |
| e1-twin-banks | SKIPPED: latest run-3 holds camera/UI and excluded Scatter owner. |
| e1-baron | SKIPPED: latest run-3 holds camera/UI/contract-layout/geography. |
| e2-pressure-garden | IMPROVED / HELD: native gravel, irregular current marks and 78 grounded bank stones; straight channel, wet contact, rock variety and full vista remain held. |
| e2-incline | IMPROVED / HELD: clear spoked sheave, cable returns, exposed drum, deck/fascia and chimney; material/contact fidelity, route integration and entry/UI remain held. |
| e2-trestle | SKIPPED: latest run-3 holds camera/UI and excluded RailPath owner. |

[Scope audit](run-note.md). No E1 art assets change. A skipped map is not promoted to accepted. Remaining implementation list in this E1/E2 leg: **none**; other epochs are outside this leg.

## Verbatim clauses and comparable numbers

Every art-owned carried clause and independent retained limitation is quoted and answered FIXED / IMPROVED / HELD in the per-map review:

- [Pressure Garden](e2-pressure-garden/review.md): "remaining baked dark patches" / "thin flow lines can look mechanically uniform" — centre/margin contrast **0.118660→0.020086 desktop / 0.119494→0.015064 phone** (−83.1% / −87.4%). Panorama **2,112→3,672 / 4,000 triangles**; nearest stone remains **8.329 m** from ford centre, outside its ±6 m band. Run-4 ground RMS stays **0.02328385 desktop**, phone **0.03124792→0.03321705** (+6.30%, added stone silhouette, not reduced noise). Whole-body emission stays **0.45**. Full wet/rock fidelity remains art-owned; geography remains contract-owned.
- [Incline](e2-incline/review.md): "Further terminal silhouette/platform fidelity remains campaign art-owned" — body **2,028→2,136 / 3,000 triangles**, deck fascia **0.24→0.48 m**, 576 retained wheel UV loops corrected. "lower assembly is a dark crossed cluster" — whole duplicated winch removed, two returns visibly meet the exposed drum. Body median versus run 4 **0.134155→0.164056 desktop / 0.137296→0.166027 phone**, unchanged emission **0.375**. The phone station's persistent HUD coverage **0.270133%→0.246094%** stays within its earlier value; desktop **0.008406%→0.058934%** rises and is explicitly held/reported. All sibling increases and brightness changes are disclosed in the review. Entry body stays offscreen.

Original heights, masks, collision, footprints, mounts, inspection stations and gameplay authorities remain exact. Incline's four sibling GLBs and atlas pixels are byte-identical. Both independent final critiques prefer the bounded changes; neither awards full concept acceptance.

## Timing and release bytes

Four fresh runs per arm/width, alternating before/after, single observed mode per arm:

| Map | Desktop p95 | Phone p95 | Draw calls desktop / phone |
| --- | ---: | ---: | ---: |
| Pressure Garden | 9.50→9.30 ms | 8.85→9.20 ms | 90 / 58 unchanged |
| Incline | 9.65→9.60 ms | 9.80→9.55 ms | 76 / 58 unchanged |

All paired changes stay within +15%. Incline timing is an entry measurement with its edited terminal offscreen; visible-body complexity is separately bounded by the asset contract.

E1 first-town release: **34,309,830 B base → 34,311,865 B Pressure Garden (+2,035) → 34,311,866 B Incline (+1)**; total **+2,036 B**, below 52,000,000 B. Only shared render-code bytes account for this delta; no E1 art changes.

## Verification and integration

Incline: **62 browser passes / six skips / six exact-base-attributed registry failures**, loading **8/8**, repeat **2/2**. [Final receipts](e2-incline/final-verification.json) · [Exact failure fingerprints](e2-incline/browser-failure-attribution.json). Both maps already pass TypeScript/default/full/E1 builds, 34 scoped render tests and three named guards, source re-export and ownership/budget checks. Plain/station/performance captures report zero console/page errors.

Pressure Garden: final focused browser **26 pass / four skips**, loading **8/8**, repeat **2/2**, six native sampler disposal cycles. Broader batch **162 pass / six skips / six failures**, all six registry fingerprints reproduced on its exact base; corrected embedded-atlas packaging then passed final focused checks.

**Retain main's deployment mirror fixes `214a54568` and `82c226185`.** This lane predates them and its original mirror test is red. The exact current-main deployment script passes the byte-identical test assertion against the final source inventory in an isolated tree: [Pressure proof](mirror-prerequisite-proof.json), [Incline proof](e2-incline/mirror-prerequisite-proof.json). No deployment script or test assertion is edited in this leg. Store source PNG lives under the task-mandated `sources/**` location. This is a verified integration prerequisite, not a green claim about the original lane.

The attended drain may already have landed Pressure Garden. Do not reset/rebase either branch; select only undrained content, retain main's fixes, integrate store and game together, then measure/pin through the drain's normal procedure. No engine pin, STATUS, task/spec, gameplay or test assertion was edited.

## Commit and engine chain

| Map | Game commit | Store commit |
| --- | --- | --- |
| Pressure Garden | `6e306d1a0c8ebec7ac44d19a5c066518e3e48817` | `25fed85ea017ff54abd78d5e4186dddf1dea6efc` |
| Incline | This handoff's final map commit (`git log -1 --format=%H -- artifacts/sol/map-art-campaign-2/run-9/e2-incline/review.md`) | `d76ee141dcac825aa29cf4e5d4a868fe845fb1c8` |

Store commits are pushed and remotely read back per completed map. Game branch publication/integration is drain-owned.

Pressure Garden engine:
`a8afc11f313a5bc6567deac76bb40da24aab1ff19d7f935146229510289ad7c1`
→ `e300ac0f43d653be8b76c3f65610264ad5c2db023a9dd15a115a275cad6ea6f7`.

Incline engine:
`e300ac0f43d653be8b76c3f65610264ad5c2db023a9dd15a115a275cad6ea6f7`
→ `72968f9ab06af85b2754a57ba175fb04a106f60db887103b4cf8f494584ea3c2`.

No rate-limit refusal, quota refusal or disconnect occurred. Raw attempts, logs and scratch remain under ignored `_raw/run-9/`; only reviewable boards/receipts and reproducible helper sources are committed. Original `logs/guard-stats.jsonl` factory churn is retained and not staged.
