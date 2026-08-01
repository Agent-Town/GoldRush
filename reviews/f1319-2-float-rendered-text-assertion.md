# f1319-2 — the float legibility guard stops asserting a theorem

- **Slice:** `f1319-2-float-rendered-text-assertion`
- **Branch:** `lane/m3` — tip `20c07baf`
- **Base at drain:** `69fa8462` (main, after the s1323 Drill Yard merge)
- **Drained by:** s1323 fire, 2026-08-01
- **Verdict:** ✅ **ACCEPT — merged.** Small, exact, and it did the one thing the master demanded: proved the new
  assertion RED by mutation before claiming it guards anything.

## What it does

F-1319-2 found that the float-legibility guard's primary assertion, `renderedWidthPx <= budget`, is a
**theorem**: `Vfx.ts:199` and `:203` compute the same quantity, so the assertion cannot fail no matter what the
renderer does. A guard that cannot go red is decoration.

The cure surfaces `renderedText` — what was actually rasterised, as opposed to the string the game *intended* —
through the vfx diagnostics, and asserts the property an over-budget line must have: it ends in an ellipsis. A
fitting line is the control: it must come back byte-identical to its input and must **not** contain one.

That is the F-1316-1 lesson applied one layer further in. The old instrument read `lastFloatText.text`, the
intent recorded before rasterisation, so a green certified a message the player provably did not receive. This
one reads the rendering.

⚠️ **The truncation path is unreachable with real content** — all eight upgrade sentences fit — so the test drives
it through a debug-gated `__GR_TEST__.emitFloatText` hook. The master firewalled OUT the tempting alternative of
lengthening a real upgrade sentence to make the test fire, because that changes player copy to serve a test. The
runner respected that: *"No real upgrade sentence truncates."*

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, `✓ built in 1.24s` |
| `vfx-float-legibility` desktop + mobile-390 | **4/4** (inside a 24-passed run) |
| Adjacent `bt-01-tiers` desktop + mobile | 24 passed / **4 failed — pre-existing, see below** |
| Console/page errors | zero |
| Merge | clean auto-merge on `Game.ts` + `vite-env.d.ts`, **no conflicts** |

**Mutation proof, taken on MY merged tree rather than inherited from the runner's:** removing the ellipsis from
`Vfx.ts:210` (truncate silently) turns the spec **RED**; `Vfx.ts` restored **byte-exact**, sha256
`d2a57b97e412cb72…` — which matches the hash the runner independently reported, so both measurements agree on
the same file state. Restored tree GREEN.

**Debug-gating verified at source, not assumed:** `emitFloatText` is added inside the `window.__GR_TEST__` block
at `Game.ts:1698`, whose gate is `!__GR_RELEASE_E1__ && new URLSearchParams(window.location.search).has('debug')`
(`Game.ts:1696`). The hook cannot exist in a plain boot or in a release build, so it adds no player-facing
surface.

## Findings

### F-1323-5 — the 4 `bt-01-tiers` reds are pre-existing, and I proved it in two directions. **Not this slice's.**

`bt-01-tiers.spec.ts:205` (*Enter tears down after clicking upgrade…*) and `:430` (*insufficient gold leaves tier
and gold unchanged*) fail on both projects. The second names gold, and the Drill Yard merge earlier this fire
touched `Economy.ts` — so this had to be checked rather than waved past.

Two controls, because one would not have separated the two candidate causes:

1. **Aborted the `lane/m3` merge and re-ran on main** (Drill Yard present, this slice absent) → **both still
   fail.** Not this slice.
2. **Ran them in a detached worktree at `5f81a36d`** (before *either* merge) → **both still fail.** Not the Drill
   Yard either.

They belong to the long-standing build-mode-prompt red family already on the board (F-1171-1, F-1167-2), and
s1318's drain fingerprinted the same pair on main by the same method. Nothing owed here beyond not mistaking
them for new.

⚠️ Worth recording for the next reader: the runner reported *"Adjacent stockpile tests: desktop 2/2, mobile
2/2"* and that was true — it ran the two named stockpile cases, not the whole file the master's stale path list
pointed into. Running the file surfaced four reds the narrower command could not see. The reds are not the
slice's, but the **denominator difference is the reusable part**.
