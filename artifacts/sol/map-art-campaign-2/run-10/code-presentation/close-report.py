from pathlib import Path
import json
r=Path(__file__).parent
h=json.loads((r/'hash-pair.json').read_text())
s='''# Gold Rush — three code-owned presentation holds

2026-09-24 **run 10: code. READY-FOR-GATES — implementation complete; full browser/release acceptance HELD on reproduced baseline failures.**

All three requested render clauses are implemented. No sim, contract, collision, route/station, tape, view schema, HUD, CameraRig or store bytes changed. Game has one conditional mount line and its import. Each existing e2e file is extended by one test with its original prefix byte-identical. Engine pin untouched.

| Clause | Answer and measured result |
| --- | --- |
| Twin Banks: “Sparse prop cards lack riparian density” / “generic scatter cards remain scatter-owner scope” | Replaced 248 desktop / 102 phone cards with reeds, willow and driftwood from the existing atlas. Counts and 6 scatter draws unchanged; roots embed 0.025 m in delivered terrain; build zones and fords retain 1 m footprint exclusion. [Full review and boards](e1-twin-banks/review.md). |
| Trestle: “Intersecting/abruptly ending rails dominate” / “HELD for shared route joins/ends” | 1 shared 5-sleeper junction, 4 frogs with 0.17 m flangeways and 4 buffer stops; 2 draws unchanged. Rail instances 320→348; ties 160→157. [Full review and boards](e2-trestle/review.md). |
| Relay Rush: “static frames do not claim a relay is active” / “Relay Rush's active signal” | 4 frame materials read existing lit/muted/suppressed state. Active authored lamps pulse at 0.75 Hz, amplitude 0.75–1.35; inactive/muted/suppressed emission 0. No added objects, lights, draws or view fields. [Full review and boards](e7-relay-rush/review.md). |

All 41 non-Twin scatter captures are byte-identical. All 38 supported complete headless view captures match at ticks 0/30/180 without normalization; four unsupported contracts are explicitly N/A. All 42 authored contracts receive scatter/rail checks. Routes/stations are unchanged. Other rail maps: Hill Mine gains 6 stops; Incline gains 4; Canyon Works gains 1 junction, 4 frogs and 4 stops with retrace/gauge correction; Eclipse, Mare Claim and Dome Basin are byte-identical. [Every map, method and hashes](headless-proof.md).

## Performance and visual evidence

Four interleaved runs per arm/width, 180 frames per run, fixed seed, frozen sim, Chromium DPR 1. Relay measurements include an active R2 beacon. The table reports medians of each run's frame p95; draw columns include all observed values. These are local paired comparisons, not real-device FPS guarantees.

| Map / width | p95 before → after | Change | Total draw calls before → after |
| --- | --- | --- | --- |
'''
for p in json.loads((r/'performance-summary.json').read_text()):
 s+=f"| {p['map']} / {p['width']} | {p['beforeP95']:.2f} → {p['afterP95']:.2f} ms | {p['deltaPercent']:+.2f}% | {'/'.join(map(str,p['beforeCalls']))} → {'/'.join(map(str,p['afterCalls']))} |\n"
s+='''
Largest p95 increase **1.53%**, within 15%; draw calls are also within 15%. All final **84 captured boots report zero console/page errors**, including **12 plain 10-second entries** without debug/test hooks, 24 diagnostic boards and 48 performance arms. Before/after boards at 1280 and 390 live in each map folder, with raw images and JSON. Other changed rail maps have their own paired boards. Canyon's phone crossing capture was re-centred on the actual intersection, and its retraced endpoint has a separate view; no production camera changed.

The visible improvements do not clear full plate fidelity, offscreen landscape, HUD, route-objective or persistence holds. Trestle's existing worksite partly obscures its junction. These are documented in the per-map reviews.

## Gates and attribution

| Check | Result |
| --- | --- |
| Preflight install + baseline default build | PASS; clean source tree at 91ededde0, allowed logs churn only. |
| Final TypeScript + three new unit checks | PASS (3/3); terrain swap/hidden-card, rail reversal and relay lifetime cases included. |
| Default / full / E1 builds | PASS; final E1 restored after baseline controls. |
| First-town payload | **34,341,349 → 34,341,349 B (+0 B)**, under 52,000,000 B; saved-source baseline control independently agrees. |
| Entire E1 dist output | **97,361,455 → 97,678,105 B (+316,650 B)**: reused atlas WebP +307,650 B, JS +9,000 B. The first-town declaration excludes this lazy game content. |
| Requested development suites, both chrome projects, workers=1 | Full run **47 pass / 7 fail**; final frozen-source Twin/Trestle/Relay/Dead Band run **24 pass / 6 fail**. The other 24 bandit/build-menu cases passed the full run. All 6 added browser cases pass. |
| Saved-source Twin Banks controls | **2 pass / 6 fail**: the same river-zone, stockpile ghost and ford-route failures at the same assertions on both projects; both seeded-diagnostics cases pass. Initial candidate mobile hero.y drift clears on the final rerun and is recorded as transient. |
| Owning E1 release harness | **26 pass / 4 fail**. Both Dry Gulch harvest cases and both motor-hauler asset guard cases reproduce on the saved-source build (**4/4 selected baseline failures**). Release assertion remains RED. |
| Scoped same-game/skillmd/view-schema guards | **29/29 PASS**. Same-game audit content/counts unchanged: 1,763 rows, 1,252 equal, 511 agent-lacks, 0 agent-exceeds. Only source-line citations shift by the two inserted Game lines. |
| Named task/citation/caller guards | **2/3 PASS**; existing `tasks/e1-spec-truth-1.md:21` lacks a test title beside its Twin Banks line-110 citation. Reproduced on untouched main; no out-of-scope edit. |
| Independent read-only code review | Findings fixed; bounded follow-up found no remaining concrete issue. [Review disposition](independent-review-summary.md). |

[Exact failure fingerprints and attribution](failure-attribution.md). The release wrapper inherits `playwright.release.config.ts` and changes its server to the mandated port 5312. Its build/assertion receipts are separate: the known-red assertion is retained, while the browser diagnostics are allowed to run. The dev-only external-server guard is disabled for this owned production-preview harness. Assertions are unchanged.

Baseline control substitutes only the three saved preflight TS modules through a Vite pre-transform; it never restores source in the working tree. The served-module receipt verifies all new-code markers absent. The same store and all untouched engine inputs are shared by both arms. Builds and browsers run with `/opt/homebrew/bin` first, Node 26, one worker and port 5312. See the saved helpers and raw logs beside this note.

## Engine and store boundaries

The hash helper feeds identical immutable bytes for every shared corpus member into both hash streams, substitutes the saved source on the before arm and omits the new owner until Relay's stage. The final hash is cross-checked with canonical computeEngineHash. Per-map cumulative boundaries follow the three source commits:

| Map | Engine before | Engine after |
| --- | --- | --- |
'''
for p in h['maps']:s+=f"| {p['id']} | `{p['before']}` | `{p['after']}` |\n"
s+=f"\nStore before/after: `{h['storeBefore']}` / `{h['storeAfter']}`. No store branch or store push belongs to this task. Engine era pin untouched. [Machine hash receipt](hash-pair.json).\n"
s+='''
## Remaining list in order

**Requested implementation: EMPTY.** No half-finished map is committed. Remaining gate-owner work, outside this task's firewall:

1. Repair the pre-existing task citation in `tasks/e1-spec-truth-1.md` (task/citation owner).
2. Reconcile Twin Banks' stale center-water expectation, stockpile placement fixture and west-ford route test with current map truth (sim/contract/test owners). Keep the transient async height-readiness observation with those fixtures.
3. Repair the E1 release motor-hauler asset boundary and Dry Gulch harvest channeling fixture/runtime issue (release and gameplay owners), then rerun full acceptance.

These failures were not weakened, waived or described as green. Main's orchestrator owns integration and all remaining camera/UI/art/objective holds.

## Workspace and evidence hygiene

Preflight branch was not ahead; fast-forwarded safely to main's 91ededde0. The only initial dirt was `logs/guard-stats.jsonl`. Final source changes stay inside the task firewall. Existing e2e prefixes are byte-identical (`e2e-extend-only.json`). Store paths are untouched.

Regenerated Trestle test PNGs were restored; untracked `artifacts/056` and `artifacts/mill-horizon-copy` outputs were removed after recording hashes. Task-specific paired boards remain here. Thirteen redundant generated failure trace ZIPs (1,496,103,254 B) were removed; assertion logs, error contexts, failure screenshots and trace hash receipts remain. See `discarded-churn.json` and `discarded-traces.json`. Allowed guard log churn remains uncommitted. Generated log/context trailing whitespace was normalized for git; saved baseline TS/JS and measured JSON are untouched. No dev or preview server remains running.
'''
(r/'run-note.md').write_text(s)
