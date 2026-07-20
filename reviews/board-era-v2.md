# Review — board-era-v2 ("The Book" reorganized into era chapters)

**Slice:** board-era-chapters-v2 (FIRE-AUTHORED s755 corrective — v1 was rejected as a partial that stranded 7 dependent board specs; v2 widened the firewall to migrate all 7)
**Branch/tip:** lane/m3 `6822607f` (single runner commit "feat: reorganize The Book into era chapters"), base `5e9c5da9` (a true ancestor of main)
**Merged as:** `330ba7bb` (real `git merge --no-ff`, drained s757)
**Verdict:** ✅ SHIPPED — all 8 board specs green both projects, clean auto-merge.

## What it does
Reorganizes the Contract Board ("The Book") into per-era chapters (owner directive):
per-contract dots → chapter tabs, gated so a fresh profile opens only the Frontier
chapter and future epochs / Voltage secrets stay out of the DOM; Ride Together and the
Claim Ledger surfaces preserved. TownScene.ts rewrite + town.css. The v1 rejection
stranded 7 dependent board specs against the changed surface; v2 migrated all of them.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ 876ms |
| 8 board specs, single-worker both projects | 47 passed / 1 legit desktop-only skip / 0 fail |
| `_s99-combat-readability-boot-probe` | 2/2, zero console/page errors, both projects |

The 8: `board-era-chapters` · `072-era-activation` · `board-card-images` ·
`board-gating-and-profiles` · `board-upcoming-surveys` · `contract-briefings` ·
`fresh-scene-render-state` · `town-t3-board`.

**Contention note:** the 16-way batch (both projects × 8 specs × 4 workers) threw 13
reds. Fingerprinted as gate-battery contention — every failing file re-ran green
single-worker (board-gating + town-t3 desktop 7/7 first, then all 7 failing files both
projects 47/47). The strict s755/s756 partial-reject bar ("ALL 8 green both projects,
reject if any stays red") is met on the clean single-worker signal. The 1 skip is a
deliberate `072-era-activation.spec.ts:203` desktop-only conditional ("one deterministic
proof is enough"), present identically in both runs — not a regression.

## Merge classification (base `5e9c5da9` = ancestor of main)
- `src/town/TownScene.ts`, `src/town/town.css` — 3-WAY, git AUTO-MERGED clean (main's collision-depenetration +22 TownScene edits are disjoint from v2's chapter-surface regions, as predicted s754).
- 7 dependent board specs — LANE-modified, main untouched → clean.
- `e2e/board-era-chapters.spec.ts` — special case: base had the real spec; main changed it to a `test.skip` placeholder (s755's `023abf30`, after it comingled the spec onto main and the surface was off-main); v2 left it == base. The 3-way therefore kept main's skip. **Restored the real spec from lane/m3 (`git checkout lane/m3 -- …`)** since the chapter surface is now landing — it passes against the merged surface.

## Findings
None blocking. `save/chapters-v1` (`1cf4b57b`) is the now-superseded v1 salvage — archive/delete it. The 8 `artifacts/board-era-chapters/*.png` clutter that s755 comingled onto main remains (fire can't `rm`) — owner/attended cleanup.
