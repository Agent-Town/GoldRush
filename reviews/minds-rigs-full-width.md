# minds-rigs-full-width — F-1620-6 cure, owner ruling "B"

**Slice:** `lane-b-minds-rigs-full-width` · **Branch:** `lane/b` · **Tip:** `df156fda7` · **Base:** `4ce0dad4a` (lane `behind=0` at dispatch)
**Merged to main:** `c5687d423931cd57118bb9314482f3ed1b58b784` (`c5687d42`) · **Drained:** s1635, 2026-08-10
**Gated in:** detached worktree `gate-s1635` (§3.0b custody) · **Merged as one act** (§3 / F-1589-5)

## VERDICT: MERGE — scope complete, firewall exactly respected, and the new assertion is proven load-bearing by control.

## What it does

The Field Book's desktop board stops reserving a sidebar track. `renderFieldBookLedger()` now tags its
board container with a new modifier — `claim-ledger__board-layout--field-book` — and a single
`@media (min-width: 561px)` block collapses that container to `grid-template-columns: minmax(0, 1fr)`,
orders the Front Desk card **above** (`order: -1`), and lays its repository links out horizontally as a
strip. The aggregate table then takes its own full-width row beneath. County Standings is untouched:
it renders from a **different** function (`reader.ts:314`, `data-testid="county-standings"`) that never
receives the modifier, so its two-column layout is preserved by construction rather than by care.

The player sees this in a **plain boot** — no `?debug` — at Claim Ledger → The Field Book → Rigs
(Mistake #10 satisfied; the two asserting tests are literally named "plain boot …").

## The substance

The F-1620-6 evidence was a table clipping mid-column at 1280px: `Declared cost` reading
`90,000 in · 8,00`, the sub-line `1 declared · 0 undeclar`, the expanded cell `The Dry Gulc`.
In my own regenerated screenshot on the merged tree that cell now reads
**`90,000 in · 8,000 out · 18 calls`** whole, with the sub-line `1 declared · 0 undeclared` and
`The Dry Gulch` complete. The table spans ~1035px where the reserved sidebar track previously
capped it near ~690px.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean, rc=0 |
| `npm run build` | green, `✓ built in 1.32s` |
| `field-book.spec.ts` own spec | **8/8 passed (21.6s)** — desktop-chrome + mobile-chrome(390px), `--workers=1` |
| Zero console/page errors | asserted **in-spec** at `field-book.spec.ts:296` and `:316`, both plain-boot tests, both projects |
| Adjacent: `lb-01-county-standings`, `en-01-claim-ledger`, `078-ux-hygiene`, `board-era-chapters` | **34/34 passed (3.4m)**, both projects, `--workers=1` |
| Screenshots | `reviews/shots-minds-rigs-full-width/rigs-{desktop,mobile}-chrome.png` |
| `test:node-guards` | **not required** — diff touches `src/encyclopedia/` only, none of `src/sim/`, `src/systems/`, `src/entities/` (F-1460-1 trigger not met) |

### Control — the new assertion is NOT vacuous

Per the house standard that a passing guard never executes its violation path, I reverted **only the two
changed source files** to main (`git checkout 9d0ff27af -- src/encyclopedia/reader.css src/encyclopedia/reader.ts`)
in the same gate tree, keeping the new spec, and re-ran desktop-chrome:

**1 failed / 3 passed.** The failure is `field-book.spec.ts:292` —
`aggregateWrap.evaluate(el => el.scrollWidth <= el.clientWidth)` → `Expected: true, Received: false`.
Without the cure the aggregate wrap genuinely needs horizontal scroll; with it, it does not.

⚠️ **Stated precisely:** the control proves assertion **#1** (`scrollWidth <= clientWidth`) is
load-bearing. Assertion **#2** (`clientWidth >= 900`) was **never reached** in the control run, because
#1 throws first — so #2 is *not independently proven* here. It is very unlikely to be vacuous (the old
`minmax(300px, 340px)` track left the wrap near ~690px, well under 900), but that is reasoning, not
measurement, and this review does not claim otherwise.

## Merge classification

Base `4ce0dad4a`; lane `ahead=1 behind=0` at drain time. `lane-freeze-classify` reported **paths=5, all
HELD LANE-ONLY** — main had moved none of them — so the merge is a clean `ort` with **no graft and no
conflicts**. Post-merge `git log main..lane/b` is **empty**.

| File | Class |
|---|---|
| `src/encyclopedia/reader.ts` | LANE-TOUCHED / MAIN-UNTOUCHED (1 line: modifier class) |
| `src/encyclopedia/reader.css` | LANE-TOUCHED / MAIN-UNTOUCHED (+20, one scoped media block) |
| `e2e/field-book.spec.ts` | LANE-TOUCHED / MAIN-UNTOUCHED (+8) |
| `reviews/shots-minds-rigs-full-width/rigs-desktop-chrome.png` | LANE-TOUCHED (new, binary) |
| `reviews/shots-minds-rigs-full-width/rigs-mobile-chrome.png` | LANE-TOUCHED (new, binary) |

## Findings

**F-1635-1 — NON-BLOCKING, positive.** The runner answered the master's "check; report, don't drift"
instruction on County Standings correctly *and* the cure's scoping makes the answer structural. The
master allowed a shared-layout outcome; the implementation instead introduced a modifier so that
County Standings **cannot** be affected. I verified this by reading both render sites rather than by
trusting the report: `reader.ts:314` (`county-standings`) and `reader.ts:370` (`field-book`) are
separate functions and only the latter carries the modifier. `lb-01-county-standings` 34/34 green
alongside. No action owed.

**F-1635-2 — NON-BLOCKING, method note for future layout slices.** A control that reverts source files
and keeps the new spec is cheap here (~11s) and is the only thing that distinguishes a cure from a
coincidence. It also exposed the ordering limitation recorded above: when a slice ships two assertions
on the same object, the first failure masks the second, so a single control run cannot certify both.
Future layout masters that ask for "assert A **or** B" and receive both should expect only the first to
be control-provable. No corrective task; this is guidance, not a defect.

## Scope audit against the master

1. **Single-column desktop board, Front Desk strip above, table full-width below** — done, scoped to the Field Book. ✓
2. **390px unchanged** — structurally excluded by `@media (min-width: 561px)`; mobile-chrome 4/4 green. ✓
3. **In-container `overflow-x: auto` retained as fallback** — untouched; containment assertions still green. ✓
4. **e2e extended** — both suggested assertions shipped; #1 control-proven. ✓

Firewall respected exactly: only `src/encyclopedia/reader.ts`, `src/encyclopedia/reader.css`,
`e2e/field-book.spec.ts` (plus the screenshots the self-check demanded). `functions/**`, ranking, and
the learn-more/source-link machinery untouched.
