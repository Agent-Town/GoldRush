# SPIKE-MAC REPORT — verdict: NEGATIVE, and definitive (2026-08-10, attended s1622)

Owner question: does the county's style survive the CAD kernel? **Answer: it never got to style — the kernel's multi-agent QA shipped a cart with no cart.** Per the spike brief §5, a plainly-stated negative is this spike's full success. This report was written by the attended session; the codex driver died (session rollout errors) mid-stage-3 after 3,879,651 tokens, before it could write this file.

## What happened, per attempt (all artifacts kept — retention law)
| attempt | outcome | evidence |
|---|---|---|
| 1 | **Geometry produced, semantically WRONG** | `mac-app/attempts/attempt-1/` — STEP 892KB + STL 428KB + design py + measurements JSON |
| 2 | empty (driver moved on) | empty dir kept |
| 3 | **FATAL: env incompat** — `TopoDS_Shape has no attribute HashCode` (build123d 0.11.1 vs its OCP; their pin, not ours) | `attempts/attempt-3/result.json` |

## The decisive measurement (attempt-1)
- MAC's own per-step measurement JSON records the frame + shelled hopper as **700×400×50mm, 14,000 cm³** (`step-01-extrude-frame`, `step-03-shell-hopper`) — the parts EXISTED mid-pipeline.
- The exported mesh holds **1,704 cm³ — 2.33% bbox fill**: a hub, axles, lever and hitch rods in a starburst; **the hopper and frame (the entire visual mass of an ore cart) are absent from the final union.** One connected body, 8,574 faces, not watertight.
- Render: `spike-mac-verdict/ore-cart-mac-views.png` (3 views, county palette); mesh: `spike-mac-verdict/ore-cart.mac.glb`.
- **The damning part: MAC's twin QA engines passed it.** Their checks are dimensional/topological per step; nothing asks "does the assembled result resemble the thing?" A cart-with-no-cart sailed through the exact machinery that is the harness's selling point.

## Effort Law
| stage | cost |
|---|---|
| install + env (venv, deps, OpenRouter wiring) | heavy friction: macOS `timeout` absent, pip cache perms, build123d API drift (`Box`→bool), OCP HashCode fatal |
| codex driver total | **3,879,651 tokens**, session died before stage 4 |
| MAC LLM calls | deepseek-v4-flash; attempt-3 `tokens.json` shows 0 (died pre-LLM); attempt-1 per-call log not written by MAC before driver death |
| attended tail salvage | STL→GLB + 3-view render, ~15 min (this report) |

## Verdict for the county
1. **PASS on MAC for county props.** Hand-built low-poly + county palette remains the pipeline. Stage 4 (in-game stand-beside) deliberately skipped: standing a starburst next to a hand-built cart proves nothing the render doesn't.
2. The idea (text→CAD→game prop for E4+ machinery) stays on the shelf, not the harness: revisit only if a future tool demonstrates **assembly-level semantic QA**, the precise thing MAC lacks.
3. Gauntlet relevance: MAC is a CAD orchestrator, not a general agent — **not seatable** at the county table; no HARNESSES.md row owed.
4. One transferable lesson for our own gauntlet law: step-level gates can all pass while the assembled artifact is wrong — the county's examiner-replay (whole-run, byte-identical) is the stronger design, keep it.
