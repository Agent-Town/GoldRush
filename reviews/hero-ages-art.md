# Review — hero-ages-art (THE HEROINE'S FOUR AGES, extracted + live)

**Batch:** `art-batch-hero-ages` · **raws:** `worktrees/art/assets/raw/char-hero-{midlife,silver,elder}-sheet-walk4-{a,b}.png` (Codex `image_gen`, done 2026-07-21 00:09–00:13, PRISTINE)
**Drained:** s777 (2026-07-21) · **tier:** full integration (extract → QA → wire-by-name → in-game verify → LEDGER)

## Verdict: PASS — same-person confirmed, canon-correct, wired live

The wiring (`aac5aa93`, `hero-ages-wiring`, drained s775/certified s776) already resolves `char-hero-<age>-sheet-walk4-*` BY NAME with a young fallback, so landing the processed cells is a **zero-code-change** activation: the heroine now visibly ages across eras (young E1–3 → midlife E4–7 → silver E8–9 → elder E10).

## What it does (player-visible)
With the aged cells present, `SpriteAnimator.resolveWalkSheet` stops falling back to young and renders the age-matched sheet. `#game-canvas[data-hero-sheet]` now reads `midlife`/`silver`/`elder` at eras 4/8/10 (previously always `young`). The heroine keeps her identity — braid, wide-brim hat, teal charm, gold pan, coat silhouette — and ages with dignity.

## SAME-PERSON verification (the identity law)
The master warns "she must remain unmistakably HERSELF at every age." Confirmed by direct pixel inspection:
- **Runtime young hero** is the female heroine sheet `char-hero-sheet-walk8` (walk8 is preferred over walk4; boot probe at `&era=1` returned `sourceFrameKey=char-hero-sheet-walk8-r0c0.png`) — young woman, braid, teal charm, pan. Evidence: `reviews/shots-hero-ages/_qa-walk8young-vs-aged.png`.
- **Aged sheets** (midlife/silver/elder) are unmistakably the same woman, weathered — same braid, hat, teal charm, pan, silhouette. Evidence: the four-ages lineup `reviews/shots-hero-ages/four-ages-lineup.png`.
- **Canon:** `docs/CHARACTER-MAP.md` §63 — the Hero is female ("claim-holder, founder, elder stateswoman"). The aged female sheets are canon-correct.
- ⚠️ Note for the record: the **non-`-f` `char-hero-sheet-walk4-a`** sheet is the *superseded pre-flip MALE* prospector (see `art-hero-replacement-package`, owner-gated flip). The game does NOT render it for the hero (walk8 is preferred); the CLOCK LAW regex strips `-f` and targets the female aged names either way. No man→woman break reaches the player.

## Measured self-QA (per sheet, all 6)
| Metric | Result |
|--------|--------|
| Grid | 4×4, cell 512, scale 1 — identical to the young walk4 sheet (16/16 non-empty each) |
| Key purity | true-key (ff00ff-ish) residual < 0.003% after despill (80–82% keyed bg, matches young profile) |
| Height band (bbox) | resting heights 343–349 px vs young 338 (within ~10 px); taller maxes (to ~412) are stride-extension frames, in-band |
| Widths | 207–224 px vs young 219–223 — consistent silhouette |

## Gate evidence (against main + the extracted cells)
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (0 errors) |
| `npm run build` | ✓ built in 1.50s (glob picks up the 96 new processed cells) |
| `e2e/hero-ages.spec.ts` (desktop-chrome + mobile-chrome) | **10/10 passed** (33.2s) — now asserting the REAL age resolution (era 4→midlife, 8→silver, 10→elder) in run AND town, plus young-fallback (`&noheroageart`) and era-1 young binding; every era-seeded boot asserts zero console errors |

The spec is art-presence-aware (`processedSheetExists(age) ? age : 'young'`), so 10/10 with cells present is the definitive in-game verification that the aged sheets load and resolve — desktop + mobile.

## Findings
- **F-1 (non-blocking, informational — for attended):** the young hero renders from **walk8** (8-direction) while the aged sheets are **walk4** (4-direction). So at E4+ the heroine's walk drops from 8 to 4 directions. This is inherent to the placeholder-first wiring + this art batch's scope (walk4 only); it is not a regression of existing behavior and the spec is green. A future rung could add aged walk8 sheets if the 8-dir aged walk is wanted. The lineup also shows the young walk8 figure occupying less of its cell than the aged walk4 figures — a lineup-composition artifact of the differing source grids, not necessarily an in-game scale pop (per-sheet render scaling applies); worth an owner glance during playtest.

## Owner deliverable
`reviews/shots-hero-ages/four-ages-lineup.png` — the four ages side by side (top: front stand, bottom: mid-stride), young → midlife → silver → elder, per the master's END clause. Surfaced to the owner's desk + gazette rather than landed silently.

## Merge classification
Additive only — 96 processed cells + 6 `.frames.json` into `assets/processed/`, 6 raws into `assets/raw/`. No MAIN-MOVED conflict, no src touched (wiring resolves by name). Path-scoped add.
