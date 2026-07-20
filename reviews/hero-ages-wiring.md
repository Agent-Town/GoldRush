# Review — hero-ages-wiring (era-keyed hero sheet resolution, young fallback)

**Slice:** lane-hero-age-wiring · **branch:** lane/m4 tip `6fdd5f30` · **merge:** `aac5aa93` (merge commit into main)
**Drained:** s775 (merge landed 2026-07-21 00:40 local) · **certified:** s776 recovery (s775 died post-merge, pre-bookkeeping; this review + goal flip close it out)

## Verdict: PASS (recovery certification)
s775's fire committed the merge `aac5aa93` and then exited before writing the review / flipping the goal leaf / handing off. The merge is immutable and content-complete (`git log main..lane/m4` empty). s776 re-ran the core gate battery against the merged tree to certify it honestly rather than inherit an unverified claim.

## What it does
Placeholder-first: the active epoch now picks the heroine's age band, and `SpriteAnimator` resolves her walk sheet accordingly, falling back to the existing young sheet whenever the aged cells aren't present yet (so the art batch can land later with zero code change).
- **Era → age map (as shipped):** epochs 1–3 → `young`, 4–7 → `midlife`, 8–9 → `silver`, 10 → `elder` (`heroAgeByEpochOrder` in SpriteAnimator, keyed by `activeEpoch().order`).
- **Resolution:** `resolveWalkSheet(slotId, slot)` only diverges for `charHero`; it rewrites the young sheet's cell filenames to `char-hero-<age>-sheet-walk4-*` and uses them ONLY when they have processed cells AND actually load — otherwise silently returns the young sheet.
- **Seam:** the resolved band is written to `#game-canvas[data-hero-sheet]` (young/midlife/silver/elder) for the spec to assert.
- **Cache:** `runtimeCache` key becomes `charHero:<age>` so age bands don't collide; other slots keep their plain slot-id key.
- **Debug bypass:** `&debug&noheroageart` forces the young sheet (art-absence testing).
- Town + run scenes both consult the one data map; no per-scene forks.

## Evidence (s776, against the merged main tree)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (0 errors) |
| `npm run build` | ✓ built in 1.20s |
| `e2e/hero-ages.spec.ts` (desktop-chrome + mobile-chrome) | **10/10 passed** (31.5s, 2 workers) |

Spec coverage confirmed green: era 4→midlife, era 8→silver, era 10→elder resolve in run AND town; missing aged cells fall back silently to young; era 1 keeps the existing young binding. Each era-seeded boot asserts zero console errors (per master); all passed.

## Merge classification
Clean merge commit `aac5aa93` (parents `3cc9639d` + `6fdd5f30`). Two files, both LANE-TOUCHED / additive, no MAIN-MOVED conflict:
- `src/assets/SpriteAnimator.ts` (+68 / −4): data map + `resolveWalkSheet`/`activeHeroAge`/`agedHeroWalkSheet` helpers + cache-key change + dataset seam.
- `e2e/hero-ages.spec.ts` (+81, new file).
Within firewall: no animation-timing changes, no Balance edits. `import { activeEpoch } from '../meta/ContractFamilies'` is the only new dependency.

## Findings
None blocking.
- **F-1 (non-blocking, informational):** the aged sheets (`char-hero-midlife/silver/elder-sheet-walk4-*`) do not exist yet, so in a plain boot at any era the player still sees the young heroine — correct by design (placeholder-first). Player-visible change arrives with the `hero-ages-art` batch (`hero-ages-art` goal leaf, still `queued`). No gazette item this drain (nothing visible changed).

## Gazette
Deliberately none — placeholder-first wiring produces no player-visible change until the art batch lands. Filter law: the review names no visible change.
