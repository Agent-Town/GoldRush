# fix-party-pot-orphan — SHARED POT belongs to the party HUD

**Slice:** `fix-party-pot-orphan` · **Branch:** `lane/lane-c` · **Tip:** `a220c69ee0b07ce4570343577a69201b3eecb7e7` · **Base:** `0caeb33a1b30b88734246c8da201fb5b43d95551`
**Merged to main:** `c9b35f07be7d7e54082a1ce6bb199afe0f839668` · **Drained:** s1788, 2026-08-15
**Gated in:** detached worktree `/tmp/gr-s1788-party-pot.5VfGv2`; merged to main as one act

## VERDICT: MERGE — the shared pot now reads as part of the riders panel at both breakpoints.

## What it does

The header keeps its existing markup, spacing, typography, and transparent treatment. One CSS declaration changes the full-width `space-between` composition to `flex-start`, placing `SHARED POT` beside `RIDERS` instead of over bare world at the far edge of an invisible 560px row. No new panel, wrapper, state, or responsive branch was added.

## Visual comparison

The target was concrete: the pot label must sit beside the riders title and remain within the two-card visual footprint on desktop and 390px mobile, while the cards and world stay unchanged. The paired captures use matching scene state and viewport within each breakpoint.

Before, the pot label sits far beyond the cards over open terrain. After, it shares the title line with `RIDERS`. The browser assertion measures a non-negative title-to-pot gap no larger than 16px and requires the pot's right edge not to exceed the second rider card; it passes in both projects.

Evidence: `artifacts/party-pot-anchor/desktop-before-after.png` and `artifacts/party-pot-anchor/mobile-before-after.png`, with full before/after frames alongside them.

## Evidence

| Gate | Result |
|---|---|
| Policy | exact done-move `drain-block-check --strict` **CLEAR**, rechecked immediately before merge |
| `npx tsc --noEmit` | clean, rc=0, 5.3s |
| `npm run build` | green, rc=0, 18.3s; Vite built in 1.45s and asset-diet passed |
| Focused party geometry | **4/4 passed** across desktop + 390px mobile, `--workers=1` |
| Adjacent `task-025` + `m1-01` + `m2-01` | **32/32 passed** across both projects, `--workers=1` |
| Plain boot hygiene | **2/2 passed**, desktop + mobile, zero console/page errors |
| Combined browser battery | **38/38 passed** on isolated port 5234 |
| Broad diff-selected guards | task, citation, and caller arms passed; Node guards reproduced the pre-existing `news.html` → missing `index.html#teaser` failure on untouched main |
| Power timing | loaded broad run: 1.010ms red; quiet untouched-main control: 0.379ms pass; quiet candidate rerun: 0.373ms pass against the 0.500ms cap |
| Transcript | `artifacts/party-pot-anchor/gate-s1788.txt` |

The power red was load contamination, not a candidate regression: the candidate and untouched-main controls both pass once the nine-minute Node battery is no longer competing. This static CSS change adds no per-frame code, DOM node, or render object.

## Merge classification

Main moved none of the touched source/spec paths after base `0caeb33a`. Detached custody and the final main merge were clean `ort` merges with no conflict or graft.

| Path | Classification |
|---|---|
| `src/ui/PartyOverview.css` | LANE-TOUCHED / MAIN-UNTOUCHED — one header alignment declaration |
| `e2e/mp-06-party-overview.spec.ts` | LANE-TOUCHED / MAIN-UNTOUCHED — existing two-rider spec gains the geometry assertion and retained after-shot |
| `artifacts/party-pot-anchor/*.png` | new, lane-only visual evidence |

## Findings

No blocking or corrective finding. The site-anchor red is pre-existing, reproduced on untouched main, and already documented in `reviews/prep-bench-seeds-flagships.md`; this slice changes no site path. The firewall is exact: shared-gold plumbing, multiplayer protocol, functions, balance, and every other HUD placement are untouched.
