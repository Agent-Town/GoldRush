# vp-02e — diagonal clip resolution (the F-1135-1 cure)

- **Slice:** `lane-vp-02e-diagonal-clip-resolution`
- **Branch/tip:** `lane/m4` @ `6683a2d7` (base `ccdf0668`)
- **Drained by:** s1137 fire, 2026-07-27
- **Verdict:** **ACCEPT (merge) — with two test-side debts recorded as F-1137-1 / F-1137-2, both proven cure-caused by a controlled A/B.**

## What it does

One line in `SpriteAnimator.createRuntimeSlot`'s alias loop:

```ts
if (slotId === assetSlots.charHero && slot?.rotations?.directions?.[targetDirection]) continue;
```

The hero's walk-sheet **aliases** were overwriting directions that the hero's own
`rotations.directions` contract had already defined explicitly. The four diagonals
(`se`/`ne`/`nw`/`sw`) therefore rendered the *east/west* alias art instead of their own
cells — the defect s1135 root-caused as F-1135-1. The guard makes explicit contract art
win over an alias, and is deliberately scoped to `char.hero`: the runner's own review pass
found a generic guard would also preempt Claim Jumper's walk8 aliases, so that slot's
contract is left untouched. `OrientationResolver` and the coarse fallback are unchanged.

This confirms s1136's discriminator from the other side: the four directions with `walk`
and **no** `idle` were exactly the four broken ones.

## Merge classification

Base `ccdf0668`; three-dot LANE-TOUCHED = **6 files, +122 lines**:
`src/assets/SpriteAnimator.ts` (**+1 line**), `reviews/vp-02e-runner-report.md`, and 4
diagonal screenshots. `git log ccdf0668..main -- src/assets/SpriteAnimator.ts` is **empty**
— main never moved the file since the base, so this is **LANE-TOUCHED clean, no graft**.
The two-dot diff additionally lists `STATUS.md`, `e2e/vp-02-sprite-animation.spec.ts`,
`tasks/*` — all **MAIN-MOVED-ONLY** (the s1136 merges), correctly not taken.

## Evidence

Gated on **scratch port 5237** with an external dev server (Mistake #12), `--workers=1`,
desktop-chrome + mobile-chrome (390px).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 1.31s** |
| `e2e/vp-02b-rotation-resolver.spec.ts` (own spec) | **10 passed / 4 failed** |
| `e2e/vp-02-sprite-animation.spec.ts` (adjacent) | **19 passed / 3 failed** (was **13/9** on main at `96568621`) |

### ⚠️ The runner's adjacent-suite baseline was stale — and re-measuring is what found the win

The runner measured "before" in a detached worktree at base `ccdf0668` and reported the
whole `-f-` cluster as **unchanged RED**. That base predates `96568621` (the s1136 `-f-`
repair), which landed ~28 min *after* this lane started. Re-measured on **real main**, the
picture is the opposite of the runner's report — the cluster *moves*:

| Test | main @ `96568621` | + vp-02e |
|---|---|---|
| `:453` hero rotation contract fires both stride cells, all 8 headings | RED ×2 | **PASS ×2** |
| `:512` hero walk frameKey alternates while each heading is held | RED ×2 | **PASS ×2** |
| `:388` warmed clip swaps (the F-1136-1 flaky one) | flaky | PASS ×2 |
| `:705` captures VP-02 screenshots | RED ×2 | RED ×2 — **pre-existing**, waits for absent `char.claim_jumper` |

s1136 set the success criterion explicitly: *"a vp-02e that greens vp-02b while leaving
`:453` red at `se` has **not** finished."* `:453` and `:512` are green on both projects.
**The criterion is met.** `:113` (*hero locomotion resolves all 8 contract directions*)
passes on desktop and mobile for the first time.

Boot probes: every passing test above runs `openGame`, which asserts zero console/page
errors, on both projects.

## Findings

Both new reds were separated from contention by an **A/B under identical conditions** —
the same 4-test isolated invocation, run once with the cure reverted (`git checkout HEAD --`)
and once restored. Not a full-suite-vs-isolation comparison, which would have been a
contaminated control.

| Test | control (no cure) | treatment (cure) |
|---|---|---|
| `vp-02b:292` desktop / mobile | PASS / PASS | **FAIL / FAIL** |
| `vp-02:547` desktop / mobile | PASS / PASS | PASS / **FAIL** |

### F-1137-1 — `vp-02b:292` asserts the defect this slice cured (non-blocking, test-side)

`:292` waits for **NE** to emit `char-hero-sheet-rotation2-f-r0c2/c3.png` — the *east*
keys. That expectation is only satisfiable while the alias bug is present; after the cure
NE correctly emits its own `rotation-f-r1c2/c3`. It is an **intended supersession**, not a
regression: the test passed *because* the defect existed, and `:113` in the same file now
asserts the correct contract. The runner reported it rather than rewriting it because the
task firewall excluded that file — **the right call**, and the mirror of the vp-02d
runner's error that s1135 caught.
➡️ Owed: retarget `:292`'s NE frame keys to the contract cells.

### F-1137-2 — `vp-02:547` west capture goes null on **mobile only** (cure-caused, cause NOT yet determined)

`west` is `canvasCaptureAtHeroFrame(page, 'w', 'char-hero-sheet-rotation-f-r1c0.png')` with
`.catch(() => null)` — so null means the runtime **never served that exact frameKey at
held-west within the window**, across the test's own 2-attempt reload retry. Desktop passes
(west resolves to `rotation-f-r1c0`, unmirrored, pixel-distinct from east), so this is
**mobile-only**.

**✗ I am NOT claiming a diagnosis.** It is reproducible and cure-caused; whether it is a
capture-window artifact on the 390px viewport or a genuine mobile west-resolution
regression is **unresolved**. This is the sharpened form of s1136's F-1136-2, which asked
for exactly this probe and correctly refused to guess. Note `w` is a pure side with its own
explicit block, and vp-02d made its **idle** cell live for the first time — so "the runtime
serves an idle/other cell at held-west on mobile" remains the leading hypothesis, **still a
hypothesis**.
➡️ Owed: a probe printing what the runtime *actually* serves at held-west on mobile, then
repair whichever side is wrong.

## Why merge rather than block

Without this line all four diagonals render the wrong art on **both** platforms — a
certain, player-visible defect. Against that: one stale assertion that encoded the bug, and
one mobile capture whose cause is open, with desktop west proven correct. Holding a cure
for four broken diagonals on that balance would be the wrong trade. Both debts are queued,
not waved through.
