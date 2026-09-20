# GZ-L1 — THE LIVING PAPER: the Herald prints what the player did

**Slice:** GZ-L1 (`specs/gazette-house/living-paper.md`) · **Branch:** `beauty2/gazette-living` · **Base:** `c020bfaa` · **Tip:** `680b21f3` (+ this review's commit) · **Merged main at:** `56d11adb`

## VERDICT: READY TO DRAIN — the ladder, the reader, and the door all ship green; one owner ruling landed mid-shift and is implemented; no finding blocks.

## What it does
The newspaper is no longer a fixed page. `editionLadder(profile)` derives the whole paper from progression facts the game already stores: the welcome prints **№1 NEW HANDS, WELCOME** (the arrival, folded above the greenhorn tutorial, which is untouched), every secured E1 contract prints its own edition in the player's own clear order (the Drill Yard never prints — it is training), and beating the epoch prints **THE BARON IS TURNED BACK** with the canon defeat line and the authored E2 postscript. The top-right town badge — the door the owner found himself — opens an **index of every edition**, newest on top, unread marked; picking one opens it, and any edition can walk back to the index. `herald.json` demotes to the "around town" filler column beneath the lead.

Zero sim bytes; nothing in `src/game`, Balance, Economy, contracts or the welcome flow was touched. The one new persisted key is a read-marker, written only when the reader actually renders an edition — never on boot, never on merely listing the news.

## Evidence

| Gate | Result | Numbers |
|---|---|---|
| `tsc --noEmit` | **clean** | 0 errors, re-run 4× across the shift |
| `npm run build` | **green** | vite build ✓ + asset-diet ✓ (Herald dev-path art 1,158,214 B under the 1,500,000 B ceiling) |
| **Own spec** `e2e/gazette-living.spec.ts` | **20/20 pass** | 10 tests × desktop-chrome + mobile-chrome, 30.4 s. **Plain boot, no `?debug` anywhere in the file.** |
| Adjacent: `gazette-first-issue` · `gazette-welcome` · `gazette-art-wiring` · `gz-h1-newsie` | **24/24 pass, specs UNMODIFIED** | both projects, 1.5 min — re-run after the door change |
| Console / page errors | **zero** | asserted in every page test in the own spec |
| Screenshots | desktop + 390 px | `reviews/shots-gazette-living/` — №1 arrival, mid-ladder (reserved-plate path), Baron finale, the editions index, the town badge |
| Adjacent town batch (9 specs, both projects) | 16 red — **all control-proven not-mine** | see Findings F-GZL-1 |

**Ladder as shipped** (verified by `e2e/gazette-living.spec.ts:322`, which asserts the copy table against the shipped E1 manifest so a renamed contract fails the suite, not the player):

| № | Unlock fact | Headline | Plate |
|---|---|---|---|
| 1 | always (the welcome) | NEW HANDS, WELCOME | `herald-engraving-ledger` (a claim book — an exact class match) |
| 2 | first secured contract, any | THE FIRST CLAIM HOLDS | that contract's plate |
| n | `the-claim` | THE RIVER CLAIM HOLDS | `river` |
| n | `e1-dry-gulch` | THE DRY GULCH ANSWERS | `trail` |
| n | `e1-night-shift` | THE CLAIM KEEPS ITS LIGHT | **none — "Engraving reserved"** (no existing plate fits a night claim; GZ-L2 owes it) |
| n | `e1-twin-banks` | BOTH BANKS HELD | `river` |
| final | `e1-baron` secured | THE BARON IS TURNED BACK | `boss` |
| — | `e1-drill-yard` | **never prints** | — |

## Merge classification
- **Base** `c020bfaa`; main moved 4 commits during the shift and was **merged in cleanly** (no conflicts) at `56d11adb`.
- **LANE-TOUCHED (mine, new):** `src/news/editionLadder.ts` · `e2e/gazette-living.spec.ts` · `lore/claim-herald.md` · `reviews/shots-gazette-living/*`.
- **LANE-TOUCHED (mine, edited):** `src/news/heraldReader.ts` · `src/news/heraldReader.css` · `src/news/herald.ts` (+1 exported predicate) · `src/town/TownScene.ts` (badge only) · `lore/README.md` (+1 index line).
- **MAIN-MOVED, auto-merged, no conflict:** `src/news/heraldReader.ts` — main's `25023b3a` edited `firstIssuePanels` (the key-dedupe ruling); my edits are in the imports, `openClaimHerald`, `claimHeraldTownStatus` and the render functions. Disjoint regions, git merged them without a marker; verified by the 24 adjacent assertions passing after the merge.
- **Sibling shifts:** untouched. Nothing in this branch reaches render internals or the panorama/terrain builders.

## The owner ruling that landed mid-shift
`c8e6da20` added **The door** to my own spec while I was building against it (owner, verbatim): *"There is a button now in the top right of the screen for the first edition (while in town) - this could be extended into a menu for the other editions."* Implemented in `680b21f3`. Two design calls worth the owner's eye:

1. **With a single edition the badge still opens the paper directly.** A one-item menu is a worse button — and it is also what keeps the greenhorn first-issue and welcome suites green unmodified. Reverse with one word and I will make the index unconditional.
2. **The index does not mark anything read.** Listing an edition is not reading it, so a player who opens the door and skips the newest issue keeps the nudge. This forced a real fix: the badge had been hardcoding `data-unread="false"` the moment the paper opened, which was correct when there was one issue and wrong the moment there were five.

## Findings

**F-GZL-1 — the 16 adjacent reds are pre-existing; the machine, not the paper. NON-BLOCKING, no corrective task owed by this slice.**
A 9-spec town batch (both projects) returned 16 failures. Attribution, in three steps, all measured:
- **Control at main tip** (`56d11adb`, detached worktree `/tmp/gz-control`, scratch port 5234, identical command): **9 of the same tests fail with none of my code present.** The dominant signature is a stale character literal — `Expected: "Marta Vale" / Received: "Elder Rowan"` ×5 — the same class as the `Pip Quick` literal killed in s1335. Worth its own corrective task; it is not mine to spawn from this slice, but it is real and it is currently red on main.
- **Seven of the deltas were contention flakes.** Re-run serially (`--workers=1`), `wd02-barks` (×2), `town-t6-surfaces` and `trail-guide-plain-boot` all pass. This box was running seven other worktrees' vite servers during the batch; the dev server logged `pilot-load-failed: Failed to fetch` under load.
- **The last delta, `town-t2-naming.spec.ts:83`, is a boot flake and provably cannot be mine.** Measured on identical warm external servers: **mine 5/6 pass (1 failure, ~17 %), control 3/3** — indistinguishable at these n (a true 17 % rate yields 0-in-3 about 57 % of the time). An intermediate 3/3 run with main's `TownScene.ts` swapped in briefly looked like attribution; it was noise, and the mechanism settles it: the test times out clicking **`start-menu-enter-town`**, and `src/ui/menu/StartMenu.ts` imports nothing from `src/news/`, while `TownScene` — the only module that reaches my code — is *dynamically* imported at `src/main.ts:346`, i.e. only after that click succeeds. **My code cannot execute before the assertion that fails.** ✓ VERIFIED by reading both files. The failure page-snapshot shows the create-profile card where Enter Town should be, i.e. the test's own `localStorage.clear()`-then-navigate race, under a box running seven other vite servers.

**F-GZL-2 — `e1-night-shift` prints with no engraving. NON-BLOCKING, by design, owed to GZ-L2.**
The existing pool has no plate that honestly reads as a night claim, so that edition renders the `Engraving reserved` placeholder (placeholder-first law). It is visible in `desktop-chrome-edition-3-mid-ladder.png` and, frankly, reads well. GZ-L2's masthead batch clears it.

**F-GZL-3 — two editions share the `river` plate.** `the-claim` and `e1-twin-banks` both map to `herald-engraving-river`. Correct by class, but a player who reads both sees the same picture twice. GZ-L2 resolves; no gameplay impact.

**F-GZL-4 — the rarity canon did not exist and had to be written.** The spec asked for copy "tied to the Calculating House canon", but `lore/STORYBOOK.md:44` is explicit that **the Calculating House does not exist at E1** — it is six eras away — and no line anywhere in `lore/` said arrivals are rare. Rather than invent, the arrival lead is built on canon that *was* already there and is stronger: **THE SPARING** (`lore/STORYBOOK.md:33`) — the Baron declared this valley spent on his own survey maps and "the world's money reads them like scripture", so the road brings wagons that do not stop. The same wrong opinion that shelters the town also empties its road, which is why a new name in the clerk's ledger is front-page news. Landed same-commit as new canon in **`lore/claim-herald.md`**, cited and dated, with an index line in `lore/README.md`. **This is the one place I wrote canon rather than quoting it — it wants an owner nod.**

**F-GZL-5 — three premises in the dispatch were wrong, and the copy would have broken canon if followed.** Recorded so the next writer does not repeat them:
- The dispatch called the player "the Prospector". `lore/characters.md:4` forbids it: the player is **the hero, the claim-holder**; "prospector" is the brass agent's word. The paper names the player and never uses it — mechanized as an assertion over every printed line.
- **The Clock Law** (`lore/canon-rules.md:24`): no year printed, no arithmetic performable on a face. Editions carry an issue number and no date. Also mechanized.
- **The cure-arms lexicon**: the Baron's fevered are **freed** and **turned back**, never killed. Asserted in the Baron test.

## Ratification questions (defaults taken, non-blocking, one word flips any)
1. **Defeat editions** — spec default NO, taken: only progress prints; losses stay in the tavern keeper's voice.
2. **Baron edition teases E2** — spec default YES, taken: one paragraph, no mechanics named, and it is the *authored* postscript from `lore/world-dispatches.md:35` **verbatim** (that file's own law is "never invent lines"), not new prose.
3. **The single-edition door** — see The door §1 above.

## What GZ-L1 does NOT do
Per-edition masthead art (GZ-L2) · world-dispatch fragments on mid-ladder editions (GZ-L3) · any edition for epochs past E1 — the ladder is E1-shaped and the copy table is guarded against the E1 manifest, so an E2 contract would print through the generic fallback rather than silently vanish.

## Ledger line for the drain
`GZ-L1 THE LIVING PAPER — SHIPPED <merge sha>: editionLadder + reader + editions door; e2e gazette-living 20/20 both projects; adjacent gazette 24/24 unmodified; owner door ruling c8e6da20 implemented; new canon lore/claim-herald.md. OWED: GZ-L2 masthead plates (F-GZL-2, F-GZL-3). OPEN ON MAIN, NOT MINE: the "Marta Vale"/"Elder Rowan" stale-literal class, 9 tests red at 56d11adb (F-GZL-1).`
