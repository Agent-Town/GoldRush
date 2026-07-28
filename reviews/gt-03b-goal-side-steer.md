# gt-03b — goal-side steer (GT-03 scope 2)

**Slice:** `lane-gt-03b-goal-side-steer` · **branch:** `lane/m3` · **tip:** `c49f42be` · **base:** `831a8ea5`
**Drained:** s1181 fire, 2026-07-28 · **Verdict: MERGE**

## What it does

GT-03 shipped its spec file but never its scope 2. When a Claim Jumper met a cliff, the resolver
picked which way to slide by the sign of its own **position** — the goal appeared nowhere in the
expression — so an enemy whose target sat on the far side of the ridge committed to the wrong
side and latched (F-1130-5: 8 of 29 Hill Mine Rail Toughs). Both resolver sites in
`ClaimJumperEnemy` now pick the side from the **goal delta** instead:

```ts
(northSouth ? Math.sign(goalX) : Math.sign(goalZ)) || this.avoidanceSide()
```

✓ Verified at source, not inherited: `goalX`/`goalZ` are the goal-relative deltas computed at
`src/entities/Enemy.ts:1235-1236` (`moveTarget - previous`), in scope at both use sites (`:1254`,
`:1267`), and the same deltas already drove `northSouth` (`:1237`) and the neighbouring fallback
(`:1284-1285`). The change makes the side-pick consistent with the routing law around it.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green, 1.50 s** |
| Slice gate `gt-03:155` (widened, 4-case goal-side table) | **PASS desktop + mobile (390px)** |
| Zero console/page errors | asserted inside the passing `:155` test, both projects |
| Adjacent `gt-02-slope.spec.ts` | 4 passed / `:254` red — **fingerprinted pre-existing** (below) |
| Merge classification | both files **LANE-TOUCHED only** — `git log 831a8ea5..main -- src/entities/Enemy.ts e2e/gt-03-enemy-elevation.spec.ts` **EMPTY** |

Gated on **scratch port 5234 with an external server** — lane-c was LIVE (`wardrobe-preview`,
started 20:29) and lane worktrees share 5188 (Mistake #12).

### The deliverable, measured (`artifacts/gt-03/goal-side-report-*.json`)

Identical on desktop and mobile — **both "opposite" polarity cases, the ones that latched, now correct**:

| Spawn → goal | Polarity | Expected | Measured | Samples |
|---|---|---|---|---|
| -38 → -46 | same | west | **west** | 12 |
| -38 → -28 | **opposite** | east | **east** | 13 |
| 38 → 46 | same | east | **east** | 12 |
| 38 → 28 | **opposite** | west | **west** | 13 |

The spec's existing four assertions were kept and the pass-side assertion was **strengthened**,
not loosened: `expect(passSide).not.toBe('cliff')` → `expect(passSide).toBe('west')`.

### Red fingerprinting — single-variable control, restored by blob hash

Control = clean-main `Enemy.ts` (`8276763c`) with the **lane's spec kept** (`225b0c72`), so the only
variable is the behavioural file. Treatment restored and re-verified `cd190349` / `225b0c72` after
every arm.

| Red | Treatment | Control (clean-main `Enemy.ts`) | Verdict |
|---|---|---|---|
| `gt-03:125` slope diagnostics (`uphillVsFlatSpeed < 0.85`) | fail desktop + mobile | **fail 4/4**, identical assertion (2.228 / 3.847) | **pre-existing** |
| `gt-03:254` flat-claim neutrality (`:280`) | fail 3/3 desktop (mobile skips) | **fail 3/3 desktop**, identical assertion | **pre-existing** |
| `gt-02:254` slope/cliff/visual height | fail desktop + mobile | **fail 2/2**, identical fault site `waitForX :44:122` | **pre-existing** |

## Findings

- **F-1181-1 (methodology, closed in-flight, no corrective owed).** My first control ran
  `gt-03:254` against **main's** spec, where line 254 is not a test start — playwright matched
  nothing and the arm reported "0 failures" for `:254`, which reads exactly like a pass. A probe
  that executes nothing reports zero. The line-number control is only valid when the arm keeps the
  spec that defines those lines; reverting the spec silently changes *which tests exist*. Re-run
  correctly, `:254` failed identically in both arms.
- **F-1181-2 (non-blocking, scope note).** The master asked the runner to *"reuse/extend the hero's
  gt-02b resolver functions — do not fork a second movement law."* It instead made a minimal
  in-place substitution at the two sites. The result is correct and measured, and it introduces no
  second law (the expression now matches the fallback beside it), but the hero and enemy resolvers
  remain **two implementations of one movement law**. Consolidation is still owed and is the right
  shape for a later GT rung, not a blocker here.
- **F-1181-3 (bookkeeping).** This master registered **no leaf in `tasks/goals.json`** — the §3.0
  block-check returned `? UNKNOWN`. Registered in this drain commit. Two sibling done-moves
  (`lane-boss-detail-adoption`, `lane-town-store-collider`) have the same gap; see the s1181 handoff.
- The runner's own report claimed the inherited reds were *"GT-02 on both projects and the GT-03
  **mobile** timing failure."* That undercounts: GT-03 `:125` fails on **desktop too**, and `:254`
  is desktop-only. The conclusion (all pre-existing) survives; the enumeration did not. Re-derived
  here rather than inherited.
