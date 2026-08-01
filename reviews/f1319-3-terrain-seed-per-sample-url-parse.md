# f1319-3-terrain-seed-per-sample-url-parse — the terrain seed stops being re-parsed from the URL

- **Slice:** F-1319-3 / F-1320-1 cure, master `tasks/lane-d-f1319-3-terrain-seed-per-sample-url-parse.md` (FIRE-AUTHORED s1320)
- **Branch / tip:** `lane/perf` @ `3ad6cc9d` (`runner(lane-d)`, 2026-08-01T08:25:03+07:00)
- **Merge-base:** `99372ed7` (2026-08-01T08:05:36+07:00) — fresh, 20 minutes old
- **Merged to main:** **`992f40661abb437faba6fc2a7ddb8c5f6706f7db`**
- **Drained by:** s1321 fire, 2026-08-01
- **VERDICT: ACCEPT.** Four lines of cure, one guard with real teeth, determinism preserved byte-for-byte. This is the second dispatch of this master; the first cancelled itself lawfully (F-1320-2) and the premise genuinely changed in between.

## What it does

`terrainSeed()` derived the run seed by constructing **a new `URLSearchParams` from `window.location.search` and re-running `normalizeSeed` — on every call**. `terrainHash()` calls it once per hash, `valueNoise()` calls `terrainHash` four times, and `sample()`/`terrainFeatures()` call `valueNoise` about nine times, so a single terrain sample cost tens of URL parses to re-derive a constant. It now caches the derived seed keyed on the search string:

```ts
let terrainSeedCache: [string, number] | undefined;

function terrainSeed(): number {
  if (typeof window === 'undefined') return 0;
  const search = window.location.search;
  if (terrainSeedCache?.[0] !== search) terrainSeedCache = [search, normalizeSeed(new URLSearchParams(search).get('seed')) / 4294967296];
  return terrainSeedCache[1];
}
```

This is the **safe** one of the two cures s1320 measured. The naive memoise-once was faster (8.8× vs 5.1× on the headless episode) but needed explicit invalidation at four `replaceState`/`pushState` seed-rewriting sites, where a single missed site produces *wrong terrain*. Keying on `search` makes invalidation a property of the code rather than a checklist. The runner took the recommendation and said so.

⚡ Worth restating because it is easy to file this as a tooling fix: **`window` is always defined in a browser**, so the shipped game paid this on every terrain sample too — including `Terrain.sample`, which the hero's ground-height lookup walks every frame. The headless runner did not create the cost, it merely had no frame budget to hide it in.

## Evidence (all measured by me on the merged tree, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean** |
| `npm run build` | **green** — `✓ built in 1.90s` |
| `e2e/terrain-seed-cache.spec.ts` desktop-chrome | **1 passed (4.1s)**, zero console errors |
| `e2e/terrain-seed-cache.spec.ts` mobile-chrome (390px) | **1 passed (4.2s)**, zero console errors |
| `npm run test:node-guards` | **205 tests / 205 pass / 0 fail** (no delta vs s1319's 205 — the new guard is a playwright spec, not a node test) |
| `gr-sim` determinism | ✅ *"gr-sim replays the same contract, seed, and orders byte-for-byte"* — **the cure changes no simulation output** |
| `gr-sim` Night Shift fixtures | **6,635 ms** (s1319/s1320 measured the same case at ~19.9 s) |
| `e2e/terrain3d-default.spec.ts` + `e2e/never-trap.spec.ts` | **5 passed (1.1m)**, run on scratch port 5199 |
| Screenshots | 4 delivered (`artifacts/f1319-3-terrain-seed-per-sample-url-parse/`, baseline + after, desktop + mobile) + a 133-line `report.md` |

## The guard has teeth, and I proved it by mutation rather than by argument

The master demanded a guard that **REDs at its own birth commit** — F-1319-2's lesson, since a perf cure guarded only by wall time is exactly the thing whose timeout gets raised later. The delivered guard does not assert wall time at all; it proxies `URLSearchParams`' constructor and counts derivations across 200 `sampleHeight` calls, asserting **exactly 1**. It also calls `history.replaceState` to a *different* seed before sampling, so it exercises the invalidation path rather than just the hit path.

I reverted `terrainSeed()` to its pre-cure form on the merged tree and re-ran it:

```
Error: 200 sampleHeight calls took 6.50 ms
Expected: 1
Received: 5600
```

**5,600 / 200 = 28 URLSearchParams constructions per `sampleHeight` call**, which independently corroborates s1320's "roughly 36 URL parses per terrain sample" attribution (`sampleHeight` is a lighter path than a full `sample()`). The probe was reverted and `src/world/Terrain.ts` verified **byte-exact**: sha256 `4ec3c755e2c59feb` before the probe and after the restore.

## Merge classification

Base `99372ed7`; 7 paths moved on the lane, **all 7 LANE-ONLY** (main had not touched any of them since the base), so the graft is a faithful path-scoped checkout with zero conflict surface and zero collateral. No `BOTH-MOVED`, no absorbed duplicates.

## Findings

### F-1321-5 — non-blocking, recorded so the next reader is not surprised: the cache is module-level and process-wide.

`terrainSeedCache` is a module-scoped binding, so it is shared by every consumer in the page for the life of the module. That is correct here — the seed genuinely is a per-URL constant, and keying on `search` means any seed rewrite (the four `replaceState`/`pushState` sites) invalidates it automatically, which the guard exercises. The residual shape worth knowing: **if a future caller ever derives terrain from something other than `?seed`, this cache will not see that change**, because its key is the search string alone. No action owed today; it is a one-line assumption that deserves to be written down rather than rediscovered.

### F-1320-2 remains open and is not closed by this merge.

The instrument gap that made the first dispatch fail — `lane-usable` reporting `USABLE` for a lane 153 commits behind main, because it asks about safety and cleanliness but never about freshness — is untouched by this slice. The cure (a fourth verdict word, `STALE-BASE`, or at minimum printing the behind-count beside `ahead=`) is still fire-authorable and still owed. **This drain is evidence for it, not against it:** the master succeeded on its second dispatch only because s1320 hand-checked `git merge-base --is-ancestor 07854e6b lane/perf`, which is precisely the check the tool should be making.
