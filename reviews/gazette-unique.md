# gazette-unique — every edition its own ink, stale local news retired

**Slice:** `lane-gazette-unique` · **Branch:** `lane/c` · **Tip:** `8ad412fb3b2188e0e7fb2dbaad4147a5160f96c3` · **Base:** `590d688d833f29e17b1a3941872620ee90a5172d` · **Drained:** s1589, 2026-08-09

## Verdict

**MERGED.** The slice does what the owner asked, and its own spec is green on both projects. It also manufactured exactly one adjacent red, which the runner reported honestly and its firewall correctly forbade it from touching; the drain repaired that spec rather than landing a red board or re-deriving the slice (F-1589-1 below).

## What it does

Answers the owner's 2026-08-09 playtest note verbatim — *"I noticed some repeat content for some E1 issues. Also the local information repeated for each entry... the local news are from July 10th, I think this part either has to be updated continuously or (better) left out for now as it is not current."*

Two moving parts:

1. **The stale local news retires itself.** `readHeraldItems()` gains a freshness window — `HERALD_FRESHNESS_DAYS = 14`, a named constant carrying the owner ruling in its docstring. The four 2026-07-10 items stop rendering; `THE COUNTY OPENS ITS DOOR` (2026-08-07) survives, so the section thins rather than dies. Per the RETENTION LAW the July items are **not deleted** from `news/herald.json` — they are filtered at read time and stay as history. Test feeds are exempted deliberately: an override feed uses its own newest item as its clock, so dated fixtures keep working forever.
2. **The bespoke E1 editions get their citations.** The bespoke copy for The Claim / Dry Gulch / Night Shift / Twin Banks already existed on main; this slice adds the per-line lore citations (`contracts.json` and `lore/STORYBOOK.md` line refs) that the lore law requires, and — the durable half — **guards uniqueness** so the paper cannot silently regress to a shared template as eras grow.

The uniqueness guard is the piece worth keeping: across all printable E1 editions it asserts no two share a headline, standfirst, or **any** lead paragraph (6 headlines, 6 standfirsts, 17 lead paragraphs).

## Evidence

Gated on the **merged tree in a detached worktree** (§3.0b custody) — undecided content never entered main's working tree. All Playwright at `--workers=1` (§3.1).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, clean |
| `npm run build` | **green**, vite built in 1.26s (28.0s incl. asset-diet) |
| `e2e/gazette-living.spec.ts` (own spec) | **green**, desktop + 390px mobile |
| `e2e/gazette-art-wiring.spec.ts` (adjacent) | **2 failed → repaired → green**; see F-1589-1 |
| Both of the above, post-repair | **30/30 passed**, 1.6m, rc=0 |
| Adjacent sweep (6 news specs) | 32 passed / 4 failed — **all 4 attributed off this slice**, below |
| Console/page errors | **zero** (`expectNoErrors` on every boot probe in both specs) |
| Screenshots | `reviews/shots-gazette-unique/` — 10 shots, 5 desktop + 5 mobile |

`npm run test:node-guards` is **not owed**: the diff touches `src/news/` only — no `src/sim/`, `src/systems/` or `src/entities/` path — so F-1460-1 does not bind. No sim behaviour moves here.

### The four adjacent failures, attributed

Adjacent sweep = `gazette-first-issue`, `gazette-welcome`, `gz-02-news-page`, `gz-h1-newsie`, `ss-03-beats`, `wd02-barks`.

- **`ss-03-beats.spec.ts:52`, both projects — KNOWN-RED, fingerprint matched.** `red-inventory-lookup` returns `KNOWN-RED` for this spec (snapshot 2026-07-28) with the same test name, the same both-projects blast radius and the same `expect(received).toEqual(expected) // deep equality` error at the same ~1–3 ms. Not this slice.
- **`wd02-barks.spec.ts:104`, both projects — PRE-EXISTING, proved by control.** Run on **clean main** (`gate-s1589-control` at `8d4ab6207`) it fails identically on both projects. Not this slice. ⚠️ But the inventory says `CLEAN-IN-INVENTORY` for this spec — that is a stale exoneration, filed as **F-1589-2**.
- **`wd02-barks.spec.ts:139`, mobile only — ORDER/LOAD-SENSITIVE FLAKE, not a regression.** It reddened only inside the 6-spec, 7.0-minute batch. Run **alone on the merged tree** it passes on both projects (14.3s desktop / 11.5s mobile), matching the clean-main control exactly. Filed as **F-1589-3**.

The isolated merged-tree run and the clean-main control produce **identical** fingerprints — `:104` red on both projects, `:139` green on both — which is what exonerates the merge.

## Merge classification

Base `590d688d`; three-way merge, no conflicts, `ort` strategy.

| Path | Class | Note |
|---|---|---|
| `src/news/herald.ts` | **LANE-ONLY** | main never moved it since base |
| `src/news/editionLadder.ts` | **LANE-ONLY** | citation comments only; copy unchanged |
| `e2e/gazette-living.spec.ts` | **LANE-ONLY** | +2 tests, retargeted shot dir |
| `reviews/shots-gazette-unique/*.png` (10) | **LANE-ONLY** | new evidence, no main counterpart |
| `e2e/gazette-art-wiring.spec.ts` | **DRAIN-REPAIRED** | not lane-touched; see F-1589-1 |

`git diff --name-only 590d688d main -- <the three source paths>` returned empty, so no graft was owed.

## Findings

**F-1589-1 — the firewall did its job and handed the casualty to the drain. NON-BLOCKING, CURED HERE.**
The freshness filter retires the four July items, and `gazette-art-wiring.spec.ts` asserted exactly those four are visible on a plain boot (`LIVE_CUTS`). So the slice manufactured a 2-test red — one per project — and the runner **could not fix it**: the master's firewall named one spec, and the runner reported the casualty in its own words (*"still explicitly expects all four July items and is now obsolete"*) instead of reaching outside scope. That is the firewall working as designed, and the report was accurate — verified by reproducing the red before touching anything (2 failed / 26 passed, rc=1).

The repair keeps the spec's real subject. That spec is about the **engraving class map**, not about the feed's freshness, so the four items are now supplied **verbatim from `news/herald.json`** as a dated snapshot through `seedTown`'s existing override path — the same mechanism the unclassified-markup test in that file already relies on. Class-map coverage is unchanged; only the delivery of the items moved.

Because that would have thinned what a *player* actually sees (Mistake #10), the repair **adds** a test rather than only relocating one: `the freshest live item still prints its engraving on an unseeded boot` asserts, on a genuinely unseeded feed, that whatever survives the freshness window still prints its engraving. It resolves the item by scanning for the first classified item inside the window rather than naming today's front page, so it **skips** instead of reddening when the paper eventually turns over — a test that names the current headline is a time bomb.

**F-1589-2 — the red inventory's exoneration of `wd02-barks` is stale. OPEN, non-blocking.**
`red-inventory-lookup` reports `CLEAN-IN-INVENTORY` (snapshot 2026-07-28) for a spec whose `:104` test fails on both projects on clean main today. "Clean" means green on the snapshot date, and this one has rotted since. Nothing in the sweep flags a clean-in-inventory spec that now fails; a drain that trusted the label without a control would have concluded its own merge caused it — the opposite error to the one the inventory exists to prevent. No cure authored: the honest cure is a re-snapshot, which is a whole-suite run and outside a drain's budget.

**F-1589-3 — `wd02-barks:139` is order/load-sensitive, not deterministic. OPEN, non-blocking.**
Green alone on both trees and both projects; red at mobile only when run sixth in a 7-minute batch. This is the documented load-ceiling shape rather than a line defect, and it is recorded so the next fire that meets it in a batch does not attribute it to its own slice. `:104`, by contrast, is deterministic across every arrangement measured here.

## Where the player sees it

Plain no-`?debug` boot → walk into town → the newsie → open the Herald. The July items are gone from the local-news column; the surviving 2026-08-07 item still carries its engraving (asserted, unseeded); each E1 back-issue reads in its own words. Screenshots for both viewports in `reviews/shots-gazette-unique/`.
