# f1512-1 — the blocker-slide geometry gate generalises: measured green fire-side

**Fire:** s1512 · **Date:** 2026-08-07 · **Base commit:** `6d1810dbd` · **Status:** POSITIVE RESULT,
corrective authored and dispatched (`tasks/lane-f1511-2-blocker-slide-geometry-gate.md`).

## Question

F-1511-2 proposed that the slide policy already shipped at `src/entities/Enemy.ts:1363–1369` —
fenced behind `ACTIVE_TILE_ID === 'e1-twin-banks'` — would cure `e2e/landmark-collision.spec.ts:68`
without regressing `e2e/never-trap.spec.ts:88`, where the scalar deadband axis (F-1511-3) had failed.
It was explicitly **not authored** s1511 because the generalisation might depend on tile-specific
footprint geometry, so a negative result had to stay licensed.

s1510 and s1511 each spent a lane run on this thread. This fire measured the hypothesis directly
before spending a third.

## Method

Detached worktree `gate-s1512/` inside the repo root (§3.0b — undecided content never enters main's
working tree), `node_modules` symlinked, external vite dev server on scratch port **5199**
(`strictPort`, so a collision fails loudly rather than silently retargeting; 5188 was free but
lane-b was live). Every playwright command `--workers=1` (F-1270-1). Both projects
(desktop-chrome + mobile-chrome).

**Treatment** — two lines, the tile fence deleted from both ternaries:

```
-    const slideX = ACTIVE_TILE_ID === 'e1-twin-banks' && moveTarget.x >= minX && moveTarget.x <= maxX
+    const slideX = moveTarget.x >= minX && moveTarget.x <= maxX
-    const slideZ = ACTIVE_TILE_ID === 'e1-twin-banks' && moveTarget.z >= minZ && moveTarget.z <= maxZ
+    const slideZ = moveTarget.z >= minZ && moveTarget.z <= maxZ
```

## Result — the headline, isolated and controlled

| Arm | `landmark-collision:68`, isolated (`--grep`) | rc |
|---|---|---|
| baseline (`6d1810dbd`, unmodified) | **2 failed** (desktop + mobile) | 1 |
| treated | **2 passed** | 0 |
| baseline, repeat | **2 failed** (desktop + mobile) | 1 |

Full pair (`landmark-collision` + `never-trap`), both projects:

| Arm | Result |
|---|---|
| baseline | **rc=1 — 4 failed / 14 passed** |
| treated | **rc=0 — 18/18 passed** (2.5m) |
| treated, repeat | **rc=0 — 18/18 passed** (2.4m) |

`never-trap` **8/8 green on every arm**, including treated. The wedge case is preserved because the
span gate falls through to `blockerSlideDirection()` whenever the goal lies *outside* the padded span,
which is exactly the geometry F-BW-10 was about.

Adjacent: `npx tsc --noEmit` rc=0. `npm run test:node-guards` rc=0 on the treated tree — **no Baron
sim pin moved**, checked explicitly because F-1460-1 was born from a routing change silently moving
one.

## Why it works (read from the code, not inferred)

`pad = Balance.palisade.avoidancePad + hitRadius - Balance.enemy.touchRadius`. When the goal lies
inside `[blocker.x - halfX - pad, blocker.x + halfX + pad]` the approach is **head-on**, so
`Math.sign(moveTarget.x - blocker.x)` is ~0 and the `|| this.avoidanceSide()` fallback restores the
stable, position-derived go-around — the pre-`531bd923a` behaviour, but **scoped to the geometry that
needs it**. Outside the span the enemy-relative sign from `blockerSlideDirection()` still applies, so
the F-BW-10 cure is untouched.

This is the difference from the failed deadband: the deadband asked *how big is the delta* (a
magnitude, which the head-on case makes **large**, not small — the geometry is backwards, F-1511-3);
the span gate asks *where is the goal relative to the blocker* (the head-on condition itself).

## Two negative findings, stated because both nearly became false claims

**F-1512-1 — `landmark-collision:157` is a batch-load flake, NOT a second thing this change cures.**
The baseline pair run showed `:157` ("later-era modeled plaza props use their authored Town
footprints") red on **both** projects, and both treated runs showed it green. That reads as a second
cure, and this report's first draft said so. It is false: `:157` **passes isolated on the baseline
tree** (rc=0, 2 passed, 9.4s). It also asserts *hero* position, while the change is in
`ClaimJumperEnemy.resolveBlocker()` — there is no mechanism by which it could be affected. The
apparent cure was batch ordering.

**F-1512-2 — `map-census.spec.ts:43` has a wandering mobile-chrome flake under batch load.**
The consumer batch (`map-census` + `fort-landmark-collision`, 96 tests) came in at **95 passed /
1 failed on BOTH arms**, at an identical 8.6m — but the red **moved between maps**:
`e5-deepwater-claim mobile spot` on the treated arm, `e2-pressure-garden mobile spot` on the
composition-matched baseline. It passes isolated on both arms. A red that wanders across parameterised
cases under identical load is a load ceiling, not a line. The red inventory reports
`CLEAN-IN-INVENTORY` for the file, which means green on the snapshot's date (2026-07-28) and says
nothing about today.

⚠️ **Method note worth keeping:** the first control run for the map-census red was *isolated* while
the failure had occurred inside a 96-test batch. That control would have exonerated the treatment for
the wrong reason. The composition-matched baseline — same two specs, same order, same flags — is what
actually settled it, and it settled it by showing the red had **moved**.

## What this does NOT establish

The measurement is a 2-line patch in a detached worktree, gated on the two named judges plus the
consumer battery. It does not establish behaviour across all 25+ campaign maps, and it does not
establish the live-play read the owner asked about (F-1510-1: "is *the enemy goes around the landmark*
still the intended read?"). That question is unchanged and still parked.
