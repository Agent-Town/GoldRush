# water-shore-truth — F-BW-7: painted water ends where sim water ends

- **Slice:** `lane-water-shore-truth` (F-BW-7)
- **Branch / tip:** `lane/e2-arsenal` @ `0751fda4186492c9b35a0bf2d91643ffaf8b8993`
- **Lane base:** `75b8afb5287c0e4e2770bd6be65ad1605da2cea7`
- **Gated by:** s1434, in detached worktree `gate-s1434` (§3.0b — main's working tree never held undecided content). Every playwright command `--workers=1` (§3.1).
- **VERDICT: MERGE.**

## What it does

The owner playtested Dry Gulch and reported: *"Can't build sluices next to the pond in Dry Gulch — will have to win by kiting now"* (2026-08-03). The diagnosis was a visual lie, not a rules bug. The live spring pond drew its **water surface** at `radius × POND_MARGIN_SCALE` (1.42) while sluice legality (`Terrain.isWaterSourceAdjacent`) hugs the **sim** radius. On Dry Gulch that is water painted out to **3.337 m** around a spring the sim declares at **1.4 m** — a 138% overdraw. Every placement aimed at the visible shore landed on ground the sim calls dry, and the release spec never caught it because it aims by coordinates, not by eye.

This slice makes the water surface exactly the sim radius and demotes the 1.42 margin to a **separate matte ground ring** (`SpringPondDampGround`, `RingGeometry(radius, outerRadius)`, plain `MeshStandardMaterial`, no water shader). The wet-sand look survives; it just stops claiming to be water. The wet-margin alpha hack that existed to cover the landmark's baked cyan cap is replaced by the opaque ground ring, which covers the same cap by geometry instead of by shader alpha.

**The law this mints (visual-shore truth):** a water VISUAL never exceeds its sim water boundary. Wetness beyond the boundary is GROUND dressing, never water surface.

The slice also audited the other two live-water surfaces rather than assuming them, and publishes the measured boundaries as dataset keys so the law is testable rather than asserted.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.26s** |
| `e2e/shore-truth.spec.ts`, desktop + mobile | **2 passed (18.2s)**, 0 console/page errors |
| Adjacent battery (6 specs, both projects) | 8 failed / 45 passed / 1 skipped (9.7m) |
| **Control, same 3 red specs on clean main** | **8 failed / 18 passed (6.8m) — identical set** |
| `release-build.spec.ts` (owning config) | **28 passed (2.0m)** |

### Shore-truth audit (measured, `artifacts/shore-truth/audit-*.json`)

| Surface | Sim boundary | Visual boundary | Verdict |
|---|---:|---:|---|
| Dry Gulch pond | 1.4 m radius | **1.4 m** | exact; outer **3.337 m** ring is matte ground |
| Claim river | 6.25 m half-width | **6.25 m** | exact |
| Twin Banks ribbons | 7.8 m legacy band | **1.5 m** each | contained; exact to the authored 1.5 m masks |

Eye-aim proof: the first data-legal cell `(-18, -15)` reads `zone: 'bank'`, `isWaterSourceAdjacent: true`, ghost `VALID`, and `confirmBuild()` returned `true` on **both** projects — the contract tested where eyes actually aim.

### The two controls that carry this verdict

**1. The new spec is load-bearing, proven by manufacturing the defect — not by its green.** A passing test never executes its violation path, so its green says nothing about the red (s1299/s1300 standard). This mattered more than usual here because `shore-truth.spec.ts` asserts against **dataset keys the slice itself introduces**, so a green could have meant nothing but "new telemetry agrees with itself". I reverted the fix in the gate tree by one line — `radius: source.radius` → `radius: pool.dampBaseRadius` in `createLiveSpringPonds` — reproducing the pre-fix condition while leaving the telemetry intact. The spec **failed at `shore-truth.spec.ts:43`**, the `|visual − sim| ≤ ε` assertion. Probe reverted and verified **byte-identical to the lane blob** before gating continued.

**2. The 8 adjacent reds are main's, not the merge's.** Merged tree and clean main were run through the same three specs in the same shell. Not merely matching totals — the failing set is **identical by test name AND line number, on both projects**:

- `e1-twin-banks.spec.ts:103` · `:122` (×2 projects)
- `terrain3d-claim-pilot.spec.ts:166` — the 115% p95 budget (×2)
- `water-mask-engine.spec.ts:23` — legacy water contract byte-for-byte (×2)

The third of those is the one that *looked* attributable — a water-contract byte-for-byte test, on a slice that edits water — which is exactly why the control was run rather than reasoned about. It reds identically without the slice.

## Merge classification

Base `75b8afb5`. `git diff --stat 75b8afb5..main` over all three paths is **empty** — main never moved any of them since the lane base. This is the rare fully clean case:

| File | Class | Resolution |
|---|---|---|
| `src/world/Water.ts` | LANE-TOUCHED only | direct copy |
| `src/world/Terrain3dClaimPilot.ts` | LANE-TOUCHED only | direct copy |
| `e2e/shore-truth.spec.ts` | **pure add** (absent on main) | direct copy |
| `artifacts/shore-truth/*` | pure add | direct copy |

No graft was needed and none was performed. Both symbols the pilot newly calls — `Terrain.visualWaterHalfWidth()` (`src/world/Terrain.ts:264`) and `userData.visualHalfWidth` (`src/world/Terrain.ts:667`) — were verified present on main before gating, so the slice adds no unlanded dependency.

## Findings

**F-1434-1 (non-blocking, telemetry fidelity).** The dataset key the spec trusts reports **intent, not geometry**. `waterRadius: config.radius` and `new THREE.CircleGeometry(config.radius, 56)` are both read from the same `config.radius`, so the assertion proves *"the pilot passed the sim radius to the pond"* — one level of indirection away from *"the drawn circle is the sim radius"*. A future edit to the mesh geometry that left the reported field alone would pass this gate while re-opening exactly the bug it was written for. Cheap cure when someone is next in the file: report the mesh's own `geometry.parameters.radius`. Not blocking — today the two are the same expression, one line apart.

**F-1434-2 (non-blocking, pre-existing, worth a name).** `water-mask-engine.spec.ts:23` — "the Claim keeps its legacy water contract byte-for-byte when no mask is authored" — is red on main on both projects, and has been through this drain's control. A byte-for-byte contract guard sitting red is a guard that cannot warn anyone; it should be either fixed or explicitly retired rather than left as background noise. Same for `terrain3d-claim-pilot.spec.ts:166` (p95 budget) and `e1-twin-banks.spec.ts:103`/`:122`. Filed as observation, not as this slice's debt.

**F-1434-3 (non-blocking, scope note).** `POND_MARGIN_SCALE` is now applied to `max(simRadius, dampBaseRadius)` rather than to the sim radius, so the damp ring's outer edge is still keyed to the **atlas cap** (2.35 → 3.337). That is deliberate and correct — the ring's job is to cover the landmark's baked cyan cap — but it means the ground dressing's size is a measured art constant, not a sim quantity. If the Dry Gulch landmark body is ever rebuilt, `LIVE_SPRING_POND_CONTRACTS.dampBaseRadius` must be re-measured with `scripts/beauty-spring-pool.mjs`. The comment in `Terrain3dClaimPilot.ts` says so; this records it in the ledger too.

## Where the player sees this, in a plain boot

Boot Dry Gulch with no `?debug`: the spring pool is visibly smaller and ringed by damp sand instead of a wide water disc, and a sluice ghost turns green at the visible waterline instead of three metres inside it. Screenshots (before/after, both projects) in `artifacts/shore-truth/`.
