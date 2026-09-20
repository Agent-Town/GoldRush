# Ticker digest — 2026-07-27 (TK-01, compiled s1154 fire 2026-07-28 06:0x local)

Micro-headlines from yesterday's ACTUAL merges (classified by **touched paths on main**, not by commit
messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

**The shape of the day, measured:** 287 commits landed on main. **Thirteen** touched what a player can
see (`src/`, `public/`, `assets/`), **thirty** touched the factory's own tools and nets, and **244 were
bookkeeping** — the ledger talking to itself. Where 2026-07-26 was the day the frontier got *honest*,
2026-07-27 was the day it learned **which way it was facing**: three separate merges argued about where
the Prospector's body points, the wardrobe finally reached her back, and the town sat for its first
portraits.

## The frontier the family opens

- The hero faces where she is going — explicit rotation cells now outrank the walk-sheet's guesses. `1a3f1421`
- Standing still, east and west keep their own idle pose instead of borrowing a neighbour's. `925353fe`
- The Prospector's coats arrive on her back — sixty-six processed frames, the hover wardrobe wired in. `dd9c45d3`
- The board and the ledger take focus properly again, so the encyclopedia stops losing the reader's place. `217663ec`
- The menu opens for a browser that refuses to remember — the blocked-storage probe is deliberate now. `1cb42a81`
- The town's era props survive collection, so the streets keep their dressing. `8166497e`

## The look of the place

- The townsfolk sit for the first time: six engraved-sepia busts and a contact sheet **set the portrait convention** every later era will cite. `2a49466c`

## Behind the counter (no player-visible change — logged, not tickered)

The day's other merges were the factory sharpening its own instruments, and once again the instruments
were the story. **A guard that had been failing silently was found and shipped:** seven non-browser
guards had no automated caller at all until `npm run test:guards` existed (`594e9180`), the node-guard
suite had been exiting 1 since a URL helper changed shape (`6d332aa5`), and the vocabulary guard was
**blind to 16% of the goal tree — which is how every defect it should have caught got written**
(`83531b39`). The master-visibility sweep became a ratchet that only fails when a *new* master goes
invisible (`059d7372`), the goal tracker learned the word *blocked* and now demands a reason
(`f1bb62cf`), and a new check answers **"is this drain even allowed?"** before any drain begins
(`1c773297`). Two guards learned to refuse work they should never have taken: already-shipped masters
(`16b6c46e`) and the ancestry union that closed the same class without losing a refusal (`312aaa46`).
The art-staging audit was widened **by discovery rather than another hardcoded path** after it proved
blind to 566 MB (`7a64d278`). Blind timed walks through town were replaced by steer-to-arrival at ten
sites (`d927924c`, `b7fd359f`). The lane runner stopped sweeping scratch into lane commits
(`bdd22640`) — a cure whose *sibling half* went unfixed until this morning. Two drains landed the
vp-02 capture timeout reason (`a250ace0`) and retired the census-glow-mesa downgrades (`3629d0ac`),
and a merge that turned out to be **owner-gated was reverted the same day, byte-identical, with the
work preserved on its lane** (`2e1b9603`).

_For the owner's eye: `2a49466c` is the first art in the game with **no consumer** — six townsfolk
portraits banked deliberately as reference, wired to nothing. That was the right call and it is
working (the E6 cast was batched from it this morning), but it means the ledger now carries art the
player cannot reach, and how long that is allowed to sit is a judgement, not a rule._

_Compilation note: TK-01 says "first fire after 06:00 local." Four fires (s1149–s1152) ran between
02:51 and 04:59 and correctly deferred; s1153 ran 05:10–05:39 and deferred with the trigger named.
This fire crossed 06:00 mid-run and took the duty. The covered day closed six hours prior, so the data
is complete._
