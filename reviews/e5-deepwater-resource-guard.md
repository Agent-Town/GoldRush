# e5-deepwater-resource-guard — F-1029-3 corrective

**Slice:** F-1029-3 — the Deepwater resource guard asserts against an empty array
**Branch:** `lane/m3` (lane-a) · **Tip:** `7d1ac416` · **Base:** `main` @ `e6b7bdae`
**Master:** `tasks/lane-e5-deepwater-resource-guard.md` (FIRE-AUTHORED s1031)
**Drained by:** s1032 fire, 2026-07-25

## VERDICT: MERGE — the diagnosis is right, the fix is at the honest end, and the guard still bites.

## What it does

`e2e/e5-deepwater-claim.spec.ts:70` asserts `expect(state.resources).not.toHaveLength(0)` — the
probe that proves the Deepwater tile module was really fetched for this contract. It was returning
`[]` on both projects, intermittently.

**Hypothesis (a) is confirmed, and it is the benign one: the guard was measuring Chromium's Resource
Timing buffer capacity, not asset loading.** The buffer is pinned at its default **250 entries**; now
that the advance stream prefetches 144 assets, `DeepwaterClaimTile.ts` fell outside the retained
window depending on URL ordering. Desktop sometimes kept it (1/3), mobile's retained window ended
around `DeepwaterArsenal.ts` and the E6 modules (0/3). Nothing was ever wrong with the source.

The fix is **one line** in the spec's existing pre-navigation init script:

```ts
performance.setResourceTimingBufferSize(10_000);
```

**The assertion at `:70` is untouched.** No skip, no loosening, no deletion — the master forbade all
three, and the runner obeyed. `src/` did not move by a single byte.

**This settles the s1026 contradiction the master demanded be settled first:** s1026's 3/3 green was
not mis-reported and no code regressed between 10:0xZ and 11:34Z. The guard was order/cache-dependent
all along — it read green when the module happened to land inside the last 250 entries. A test that
passes for a reason unrelated to what it names is the same defect class as F-1026-1 and
F-1026-5/`m2-01:322`; this is the third one this board has found and closed.

## Evidence (all re-run by the drain on main, post-merge)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, no output |
| `npm run build` | green, built in 1.09s; asset-diet 598481088→93596736 B GLB, 183518013→24346570 B PNG |
| **Slice gate** `e5-deepwater-claim.spec.ts` full file, `--workers=1 --repeat-each=3` | **18/18 passed (2.4m)** — 9 desktop-chrome + 9 mobile-chrome |
| **Can-it-still-fail proof** (re-done by the drain, not inherited) | **RED at `:70`**, `Received array: []`, when the watched name is mutated absent |
| Mutation reverted | verified 3 ways: `git diff` shows only the buffer line; `grep MUTANTPROOF` over `e2e/` + `src/` returns nothing; blob resolves to `9beb37d7`, byte-identical to the lane's committed version |
| Adjacent unmodified-green, both projects, `--workers=1` | **30/30 passed (3.1m)** — `e5-boss-dredge-queen`, `e5-arsenal`, `e5-water-spike`, `task-025-bandits-dont-swim` |
| Dredge-Queen frame p95 (the load-sensitive one) | mobile non-boss 10.2ms / boss 10.3ms, **ratio 1.0098** — inside the 15% bar |
| Zero console/page errors, desktop + 390px | enforced **inside** the gate: `expect(errors).toEqual([])` at `:96`, `:132`, `:153`, exercised 3× per viewport |

**On the can-it-still-fail proof:** Codex reported one, and I re-ran it anyway rather than inherit
it. On this board that is not ceremony — `m2-01:322` was a guard everyone believed until someone
mutated it. Independent re-proof is the only thing that distinguishes a repaired guard from a
green line.

**Load-attribution note (Mistake #12):** Codex's own adjacent sweep read 2/30 red on the
Dredge-Queen perf checks *while lane-c was running concurrently*, and passed on isolated recheck
(desktop 0.9903, mobile 0.6645). My battery ran after both lanes went idle and read 30/30 with no
isolation needed. Both lanes' outputs were done-moved before my gate started, so no writer was live
in any file I touched.

## Merge classification

Base `main` @ `e6b7bdae`. `git diff main lane/m3 --stat` = 8 files, but **only one is LANE-TOUCHED**:

| File | Class |
|---|---|
| `e2e/e5-deepwater-claim.spec.ts` | **LANE-TOUCHED** — +1 line, the entire slice |
| `STATUS.md`, `tasks/BACKLOG.md`, `scripts/dashboard-gen.sh`, `.gitignore`, `logs/*` | **MAIN-MOVED-ONLY** — s1031's dashboard/ghost-line work the lane never had |

No conflicts, no 3-way graft needed. Merged by applying the single hunk to main and confirming the
result is byte-identical to the lane's blob (`git diff lane/m3 -- <file>` = empty).

## Findings

**F-1032-1 (NON-BLOCKING, recorded, worth a habit):** *the 250-entry Resource Timing buffer is a
board-wide trap, not a Deepwater one.* Any spec that proves asset loading via
`performance.getEntriesByType('resource')` silently degrades as the asset count grows — it does not
fail loudly, it just stops watching, and it reads green whenever the module happens to sort early.
`grep -rn "getEntriesByType('resource')" e2e/` should be run before trusting any other load guard on
this board. No corrective queued this fire: this drain has no evidence about the other call sites,
and inventing scope to look thorough is exactly what §7 forbids. Recorded in BACKLOG for a fire that
can gather that evidence.

**No blocking findings.** Nothing was weakened, no expected number on this board was touched
(`m2-01`'s 200 draw calls, `m1-01`'s 77 geometries, `asset-diet`'s 25,000,000 bytes all untouched),
and the firewalled `e2e/m2-05-base-damage-repair.spec.ts` was neither read as mine nor edited.
