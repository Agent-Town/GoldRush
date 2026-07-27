# t037-ghost-settle-confirm — settle the assay ghost before the debug confirm

- **Slice:** `lane-t037-ghost-settle-confirm`
- **Branch / tip:** `lane/m3` @ `d84d4d56` (`test: settle assay ghost before debug confirm`, 2026-07-27T22:11:54+07:00)
- **Drained by:** s1141 fire, 2026-07-27
- **§3.0 drain-block-check:** ✅ CLEAR (`lane-t037-ghost-settle-confirm`, status `queued`)

## VERDICT: **ACCEPT — merged.** The cure works and its own STOP gate proved the premise. One new deterministic finding (F-1141-3) spawned, product-side and outside the task's firewall.

## What it does

s1140 root-caused `task-037:171/:192` to `debugPlaceAssayOffice` firing all six
`__GR_TEST__` hooks in one synchronous `page.evaluate`: in the same tick as
`teleport(0,9)`, the ghost sits at an invalid z and `confirmBuild()` returns **`false`** —
which the helper **discarded**. This slice waits for a fresh `build.ghostValid`, then
captures and asserts the returned boolean:

```ts
await expect.poll(() => page.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.build.ghostValid ?? false)).toBe(true);
const placed = await page.evaluate(() => window.__GR_TEST__?.confirmBuild());
expect(placed, 'confirmBuild() refused: ghost invalid at the requested position').toBe(true);
```

5 insertions / 1 deletion, one file, **zero `src/`**.

## 🔑 The STOP gate did its job — the premise was independently reproduced, not inherited

Scope 1 required the runner to reproduce s1140's control **before** fixing anything, and
to contradict it if the numbers disagreed. It reproduced it exactly: **`:171` desktop
0/3 before → 3/3 after.** An authored premise that survives an adversarial re-measurement
by the implementer is the strongest form this factory produces.

## Evidence (s1141, re-run on main after merge — not inherited)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | ✅ clean |
| `npm run build` | ✅ green (1.49s) |
| `task-037-assay-bench-ungate` desktop+mobile `--workers=1` | 2 passed / 2 skipped / **2 failed** (1.2m) |
| **`:171` prompt-hides-in-build-mode, desktop + mobile** | ✅ **GREEN both** — this was s1140's bar and it is met (`0/3 → 3/3` per the runner; green in my run) |
| `:115` / `:133` `assayOffices).toBe(1)` | ✅ **present and unweakened** (`git grep` on the tip — the bar's second clause) |
| `:146` desktop (was `:142`) | 🟠 red — **the known load-sensitive intermittent.** Measured `--repeat-each=4`: **1 fail / 4 = 25%**, *identical to F-1140-3's pre-change rate*, so the merge did not move it. 30 s test timeout; the runner passed it at **29.1 s**, i.e. right at the edge. |
| `:196` mobile (was `:192`) | 🔴 red — **a NEW, different, deterministic cause.** See F-1141-3. |
| `test.retry` / `skip` added? | ✅ none — the two `test.skip`s at `:147`/`:197` are pre-existing project scoping; the diff is a single hunk at `:122` |
| Adjacent suites | Runner: `town-t6-surfaces` + `m5-04-offline-queue` **32/32** both projects. Not re-run here **by construction** — the diff is one `e2e/` file with zero `src/`, so no shared module exists through which another suite could regress. Stated, not skipped. |
| Console/page errors | ✅ asserted zero in the passing `:171` runs |
| Dev server | scratch port **5253**, external server — 5188 belongs to the lane runners (Mistake #12) |

## Merge classification

Single file, `e2e/task-037-assay-bench-ungate.spec.ts`. `git log <mergeBase>..main -- <file>`
is **empty** — main never moved it, so LANE-TOUCHED-ONLY, no 3-way graft. Applied with
`git checkout d84d4d56 -- <file>`.

## Why I merged a slice the runner marked "Not READY-FOR-GATES"

The runner's refusal was **honest and correct about its own firewall**: it could not repair
what it found without touching `src/`. But the drain decision is a different question, and
the answer is that this merge is a strict improvement:

- `:171` goes from **deterministically red to green** on both projects.
- `:196` was **already red** before this change. It does not regress — it now fails at a
  *later, named* assertion that identifies a real product defect instead of dying early on
  a test-harness artifact. That is the "repairing a stale test uncovers a real bug behind
  it" pattern, and the uncovering is the value.
- `:146` is unchanged at its measured 25%.

Nothing that passed before fails now.

## Findings

### F-1141-3 (🔴 deterministic, product-side, owner-facing) — the mobile Assay Office prompt **overlaps the touch controls** at 390×844

Measured, stable through **63 rendered frames** (so not a settle race):

| Element | y-range at 390×844 |
|---|---|
| Assay Office prompt | **600.86 – 636** |
| `#touch-controls` | **594 – 826** |

The prompt sits **inside the thumb region**. `:196` asserts
`intersects(promptBox, touchControls) === false` at `:205` and fails **0/3**.

**Root cause is two independent changes that were never reconciled:** the prompt stack's
mobile bottom offset (**+190 px, 2026-07-06**) and the touch region's height (**232 px,
2026-07-08**). Neither is wrong alone; together they collide.

⚠️ **This is a real mobile defect, not a test problem** — on a phone the build prompt renders
under where the player's thumb rests. It was invisible until now because `:196` died earlier
on the ghost-settle artifact this slice just removed.

➡️ **Routed to the OWNER'S DESK, not auto-fixed.** The contract is already written (the
`intersects(...) === false` assertion), so the *goal* is unambiguous — but *which* element
yields at 390 px is a mobile-UX call Robin playtests and has opinions about. Options:
**(a)** raise the prompt stack's bottom offset above 232 px; **(b)** shrink or reshape the
touch region; **(c)** dock the prompt to the top on mobile only.
**Recommendation: (a)** — smallest blast radius, touches one offset constant, leaves the
control ergonomics Robin already tuned alone. One word reverses it.

## Gazette

Test-only merge, no player-visible change → **no GZ-01 item**. (F-1141-3 *describes* a
player-visible defect, but nothing shipped that a player can see.)
