# Hero pose library — per-cell QA

Owner verdict: “I saw the animations for the weapon/work poses - it looks really, really good! Can we use them as well?”

The 8x4 rows are south, west, east, north. `PATCHABLE` cells were matted with the existing isolated u2net workflow, hard-clipped at 55% alpha, and wired. `EXCLUDED` cells are not registered, so SpriteAnimator falls back to walk/idle. All wired files have zero sampled magenta pixels at alpha ≥ 0.35.

## work8

| Cell | Verdict | Reason |
|---|---|---|
| r0c0 | PATCHABLE | Matte removed; canonical two-hand pan. |
| r0c1 | PATCHABLE | Matte removed; canonical two-hand pan. |
| r0c2 | PATCHABLE | Matte removed; canonical two-hand pan. |
| r0c3 | PATCHABLE | Matte removed; canonical two-hand pan. |
| r0c4 | PATCHABLE | Second matte pass clean; canonical two-hand pan. |
| r0c5 | PATCHABLE | Matte removed; canonical two-hand pan. |
| r0c6 | PATCHABLE | Matte removed; canonical two-hand pan. |
| r0c7 | PATCHABLE | Matte removed; canonical two-hand pan. |
| r1c0 | PATCHABLE | Matte removed; canonical west work pose. |
| r1c1 | PATCHABLE | Matte removed; canonical west work pose. |
| r1c2 | PATCHABLE | Matte removed; canonical west work pose. |
| r1c3 | PATCHABLE | Matte removed; canonical west work pose. |
| r1c4 | PATCHABLE | Matte removed; canonical west work pose. |
| r1c5 | PATCHABLE | Matte removed; canonical west work pose. |
| r1c6 | PATCHABLE | Matte removed; canonical west work pose. |
| r1c7 | PATCHABLE | Matte removed; canonical west work pose. |
| r2c0 | PATCHABLE | Matte removed; canonical east work pose. |
| r2c1 | PATCHABLE | Matte removed; canonical east work pose. |
| r2c2 | PATCHABLE | Matte removed; canonical east work pose. |
| r2c3 | EXCLUDED | Technical fail: parchment fragments survived two passes. |
| r2c4 | PATCHABLE | Matte removed; canonical east work pose. |
| r2c5 | PATCHABLE | Matte removed; canonical east work pose. |
| r2c6 | PATCHABLE | Matte removed; canonical east work pose. |
| r2c7 | EXCLUDED | Technical fail: parchment fragments survived two passes. |
| r3c0 | PATCHABLE | Matte removed; canonical north work pose. |
| r3c1 | PATCHABLE | Matte removed; canonical north work pose. |
| r3c2 | PATCHABLE | Matte removed; canonical north work pose. |
| r3c3 | PATCHABLE | Matte removed; canonical north work pose. |
| r3c4 | PATCHABLE | Matte removed; canonical north work pose. |
| r3c5 | PATCHABLE | Matte removed; canonical north work pose. |
| r3c6 | EXCLUDED | Technical fail: full parchment panel survived two passes. |
| r3c7 | PATCHABLE | Matte removed; canonical north work pose. |

## attack8

| Cell | Verdict | Reason |
|---|---|---|
| r0c0 | EXCLUDED | Canon fail: belt pan on her left hip. |
| r0c1 | EXCLUDED | Canon fail: belt pan on her left hip. |
| r0c2 | EXCLUDED | Canon fail: belt pan on her left hip. |
| r0c3 | EXCLUDED | Canon fail: belt pan on her left hip. |
| r0c4 | EXCLUDED | Canon fail plus key-colored burst. |
| r0c5 | EXCLUDED | Canon fail: belt pan on her left hip. |
| r0c6 | EXCLUDED | Canon fail: belt pan on her left hip. |
| r0c7 | EXCLUDED | Canon fail: belt pan on her left hip. |
| r1c0 | EXCLUDED | Canon fail: west row faces east. |
| r1c1 | EXCLUDED | Canon fail: west row faces east. |
| r1c2 | EXCLUDED | Canon fail plus key-colored burst. |
| r1c3 | EXCLUDED | Canon fail: west row faces east. |
| r1c4 | EXCLUDED | Canon fail: west row faces east. |
| r1c5 | EXCLUDED | Canon fail: west row faces east. |
| r1c6 | EXCLUDED | Canon fail: west row faces east. |
| r1c7 | EXCLUDED | Canon fail: west row faces east. |
| r2c0 | PATCHABLE | Matte removed; canonical east attack pose. |
| r2c1 | EXCLUDED | Technical fail: magenta energy collides with key. |
| r2c2 | PATCHABLE | Matte removed; canonical east attack pose. |
| r2c3 | PATCHABLE | Matte removed; canonical east attack pose. |
| r2c4 | PATCHABLE | Matte removed; canonical east attack pose. |
| r2c5 | EXCLUDED | Technical fail: magenta energy collides with key. |
| r2c6 | PATCHABLE | Matte removed; canonical east attack pose. |
| r2c7 | PATCHABLE | Matte removed; canonical east attack pose. |
| r3c0 | EXCLUDED | Canon fail: back-view pan on her left hip. |
| r3c1 | EXCLUDED | Canon fail: back-view pan on her left hip. |
| r3c2 | EXCLUDED | Canon fail: back-view pan on her left hip. |
| r3c3 | EXCLUDED | Canon fail: back-view pan on her left hip. |
| r3c4 | EXCLUDED | Canon fail: back-view pan on her left hip. |
| r3c5 | EXCLUDED | Canon fail: back-view pan on her left hip. |
| r3c6 | EXCLUDED | Canon fail: back-view pan on her left hip. |
| r3c7 | EXCLUDED | Canon fail: back-view pan on her left hip. |

## In-game visual review

- The final 2x work/attack strip shows no key-colored fringe or strong action-scale mismatch.
- The first independent crop review exposed a real target-facing defect; the firing pose now derives its direction from CombatSystem's existing shot target instead of movement.
- At normal gameplay scale, fine hand/rig detail remains soft and the work silhouette is visually busy against the seam. This is source-art readability debt, not a keying failure; no pose regeneration was authorized here.
- `codex review --uncommitted` was attempted twice. Both local CLI sessions failed liveness without producing findings, so the review gate has no independent code verdict.
