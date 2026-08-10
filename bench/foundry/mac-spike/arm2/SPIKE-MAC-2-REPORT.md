# SPIKE-MAC-2 REPORT — verdict: SECOND NEGATIVE (2026-08-10)

Owner question: was deepseek-v4-flash the bottleneck, or is MAC? **The sharper
mind did not produce a true cart. MAC's orchestration and CAD-repair boundary
remained the bottleneck.** Three retained attempts were enough to reproduce the
failure at schema, assembly, semantic, and repair layers. No artifact passed the
required volume-plus-visual semantic gate, so the GLB/render tail did not run and
`READY-FOR-STYLE-VERDICT` is not claimed.

## Environment contract

- Working pin: `build123d==0.9.1`
- Compatible kernel binding: `cadquery-ocp==7.8.1.1.post1`
- Required smoke test: **PASS** — `from build123d import Rectangle, import_step; Rectangle(700.0, 400.0)`
- All MAC LLM roles were configured as OpenRouter `deepseek/deepseek-v4-pro`.
- Arm 1 evidence under `mac-app/attempts/` was not changed.

## Attempt results

| attempt/artifact | mesh volume | frame+hopper spec | mesh/spec fill | bbox fill | visual | gate |
|---|---:|---:|---:|---:|---|---|
| 0 — Arm 1 retained mesh | 1,704.533 cm³ | 14,000 cm³ | **12.175%** | **2.332%** | no frame/open hopper | **FAIL** |
| 1 | — | — | N/A | N/A | no STL | **FAIL** — architect schema validation exhausted |
| 2 — terminal STL | 93,360.000 cm³ | 84,000.000 cm³ | **111.143%** | 80.538% | closed trapezoid block; no open top or cart parts | **FAIL** |
| 3 — initial STL | 18,897.894 cm³ | 13,860.000 cm³ | **136.348%** | 12.433% | flat tray with central pulley/rod, not an open-top cart | **FAIL** |
| 3 — repair 1 | 702.807 cm³ | 21,073.728 cm³ | **3.335%** | 1.268% | four scattered pillar-like bodies | **FAIL** |
| 3 — terminal retained repair | 817.484 cm³ | 21,073.728 cm³ | **3.879%** | 1.219% | six scattered bodies | **FAIL** |

The Arm 1 brief calls 2.33% its spec fill, but the retained numbers show that
2.332% is mesh volume divided by bounding-box volume. The comparable value for
the new gate is 1,704.533 / 14,000 = 12.175%. Both are shown so row zero preserves
the historical figure without treating it as a different calculation.

### Attempt 1

The planner succeeded, but the geometric architect never produced a valid
contract: one response omitted all 16 required labels, a correction used invalid
`revolve_axis` objects, and the final response omitted all 29 labels. MAC returned
`error_type: dimension` before CAD execution. Exact retained usage: 69,317 tokens
across four priced v4-pro calls, costing $0.066817547672.

Evidence: `mac-app/attempts2/attempt-1/{run.log,result.json,tokens.json,fill-percent.txt}`.

### Attempt 2

The first architect response used the unsupported `translate` step; its correction
reached CAD. The retained 16-vertex STL passed the numeric volume half of the gate
at 111.143%, but the render was a closed solid block without an open top, wheels,
axles, lever, hitches, or a recognizable cart. It failed the required visual half.

During repair, Aider interpreted an `ezdxf` warning URL as something to browse and
started a Playwright Chromium installation. That violated the brief's OpenRouter-
only network boundary, so the driver interrupted it immediately. The tracker did
not flush; its exact token/cost total is therefore unknown. The retained log shows
approximately 39k tokens for two Aider calls, plus uncounted planner, architect,
correction, and direct-fallback calls. No exact total is invented.

The shared root cause was closed minimally at both Aider entry points in
`mac-app/src/multi_agent_cad/nodes.py`: URL extraction is disabled, preventing
warning text from triggering arbitrary network fetch/install behavior. Attempt 3
then emitted the same warning repeatedly without scraping it. The file also passes
`py_compile`, and the source contains exactly two guards.

Evidence: `mac-app/attempts2/attempt-2/` including `semantic-gate.json` and
`semantic-gate-views.png`.

### Attempt 3

Attempt 2's exact fill and missing-part diagnosis were included in the request.
The initial code reached CAD but produced a non-watertight tray/pulley shape. MAC's
repair loop then consumed fifteen logged Aider calls, repeatedly rewrote the full
design, collapsed the visible mass to four and then six disconnected bodies,
segfaulted twice in the CAD kernel, and finally imported a `shell` API unavailable
in the working 0.9.1 pin. The last API retry stalled and was interrupted only after
all retained executable states had already failed the semantic gate.

The fifteen rounded Aider log lines sum to approximately 427k input + 137.8k
output = 564.8k tokens. Planner, architect, correction, direct-fallback, and the
interrupted call are additional; exact total and cost were not flushed and are
reported as unknown. Attempt 4 was not spent: attempt 3 had already exhausted its
five internal repair checkpoints and reproduced the same missing-assembly failure
in three independently rendered executable states. The brief allows at most four;
it does not require spending a fourth after the negative is established.

Evidence: `mac-app/attempts2/attempt-3/`. The terminal retained artifact is
`temp_output_autonomous_2.stl`; all three fill lines, gate JSON files, and renders
are retained beside it.

## Effort Law

| layer | Arm 1 | Arm 2 |
|---|---:|---:|
| driver | **3,879,651 tokens** | exact session token total is not exposed to this driver |
| MAC attempt 1 | per-call usage not retained | **69,317 exact; $0.066817547672** |
| MAC attempt 2 | — | exact total/cost unknown; logs expose ~39k tokens for only two calls |
| MAC attempt 3 | — | exact total/cost unknown; fifteen Aider lines expose ~564.8k tokens, with other calls additional |
| environment | build123d/OCP mismatch killed attempt 3 | `build123d==0.9.1` smoke-tested and stable enough to execute CAD |

The only defensible Arm 2 spend floor is $0.066817547672; attempts 2 and 3 did
make v4-pro calls but their interrupted trackers did not retain provider cost.
Arm 1's flash cost is also unlogged, so a numeric v4-pro-versus-flash cost ratio is
not available. Unknown values are not treated as zero.

## Verdict

**Second negative.** V4-pro improved neither the end-to-end reliability nor the
semantic result enough to reach style review. It sometimes generated more mass,
but mass was not meaning: the two >100% meshes were still visibly not ore carts,
and repair turned the latter into sparse disconnected parts. The sharper driver
made the failure legible by enforcing assembly-level visual semantics; the sharper
internal model could not make MAC preserve a valid open hopper, frame, wheels, and
mechanisms through schema validation, boolean assembly, QA, and repair.

The bottleneck is therefore MAC's harness boundary, not merely flash: brittle
architect schemas, whole-file repair churn, version-incompatible generated APIs,
and QA that cannot answer "is the exported assembly the requested object?" The
county should keep the hand-built low-poly prop path. Revisit MAC only when the
harness demonstrates assembly-level semantic QA and repair on the exported object.
