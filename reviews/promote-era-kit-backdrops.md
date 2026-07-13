# Review — promote-era-kit-backdrops (lane-b)

- **Slice:** promote-era-kit-backdrops (every era dresses its menus — promote kit-era 3–10)
- **Branch/tip:** `lane/m4` @ `bf310dfb` (runner auto-commit; TIP of stack main→`648cf3d2`→`bf310dfb`), base `cf006883`
- **Drained by:** s458 fire, 2026-07-13, via TIP-GRAFT of the `bf310dfb^..bf310dfb` delta onto main `fc5ce15e` (after pressure-pill `648cf3d2` beneath it landed as `a9c896be`)
- **Verdict:** ✅ MERGE — spec 6/6 green both projects; additive asset promotion, boot-bytes unchanged.

## What it does
The EraBackdrop system (glob `assets/processed/kit-era-N.png`, one per epoch, consumed by the start menu + town surfaces) shipped but only eras 1–2 were promoted — eras 3–10 fell back to nothing. This promotes the kit-era 3–10 raws into processed full-bleed plates (128-color indexed, each under 600 KB, no keying) so all ten epochs dress their menus. Owner ask: "menu updates to make them visually aligned with the epoch of the player." No logic change — the glob resolves the new files automatically.

## Merge classification — TIP-GRAFT (stale base, additive)
Grafted the isolated `bf310dfb^..bf310dfb` delta. Per-file:
| File | Class | Method |
|------|-------|--------|
| `assets/processed/kit-era-{3,4,5,6,7,8,9,10}.png` | NEW (additive) | cp from idle worktrees/lane-b |
| `assets/LEDGER.md` | LANE-TOUCHED (1 row: kit chain PROMOTED 1–10) | whole-file cp (main untouched vs cf006883 — verified empty) |
| `e2e/ui-era-dressing.spec.ts` | LANE-TOUCHED (+110/-1, all-eras loader assertion) | whole-file cp |
| `artifacts/promote-era-kits/contact-strip.png` | NEW (10-thumb strip) | cp |
Firewall held: no EraBackdrop.ts logic, no menu markup, no raws.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (index 1,177.31 kB — **byte-identical to pre-drain** → backdrops are lazy, boot-bytes budget met) |
| spec `ui-era-dressing` | **6/6 PASS** (desktop + mobile) — menu/schoolhouse dress per era; every promoted era matches the glob contract and returns a PNG; registered eras render on menu + a town surface |
| boot / console | zero console/page errors (exercised by the passing scenarios) |
| per-plate size | kit-era 3–10 = 446–539 KB each, all < 600 KB budget |

## Findings
None blocking. Clean additive promotion; the ten-era backdrop chain is now LIVE 1–10.
