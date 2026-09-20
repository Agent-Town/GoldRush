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

- The hero faces where she is going — explicit rotation cells now outrank the walk-sheet's guesses. `e6961aee`
- Standing still, east and west keep their own idle pose instead of borrowing a neighbour's. `07eed37b`
- The Prospector's coats arrive on her back — sixty-six processed frames, the hover wardrobe wired in. `26f69c09`
- The board and the ledger take focus properly again, so the encyclopedia stops losing the reader's place. `58ef3478`
- The menu opens for a browser that refuses to remember — the blocked-storage probe is deliberate now. `53d260ff`
- The town's era props survive collection, so the streets keep their dressing. `adaacdca`

## The look of the place

- The townsfolk sit for the first time: six engraved-sepia busts and a contact sheet **set the portrait convention** every later era will cite. `1d85c6e6`

## Behind the counter (no player-visible change — logged, not tickered)

The day's other merges were the factory sharpening its own instruments, and once again the instruments
were the story. **A guard that had been failing silently was found and shipped:** seven non-browser
guards had no automated caller at all until `npm run test:guards` existed (`9a2e4842`), the node-guard
suite had been exiting 1 since a URL helper changed shape (`109a11ba`), and the vocabulary guard was
**blind to 16% of the goal tree — which is how every defect it should have caught got written**
(`b53a653c`). The master-visibility sweep became a ratchet that only fails when a *new* master goes
invisible (`a5f8d3bb`), the goal tracker learned the word *blocked* and now demands a reason
(`1d425752`), and a new check answers **"is this drain even allowed?"** before any drain begins
(`ee855c47`). Two guards learned to refuse work they should never have taken: already-shipped masters
(`d39e831a`) and the ancestry union that closed the same class without losing a refusal (`773c3991`).
The art-staging audit was widened **by discovery rather than another hardcoded path** after it proved
blind to 566 MB (`677ca028`). Blind timed walks through town were replaced by steer-to-arrival at ten
sites (`e52b4fde`, `70ce6e50`). The lane runner stopped sweeping scratch into lane commits
(`019e943a`) — a cure whose *sibling half* went unfixed until this morning. Two drains landed the
vp-02 capture timeout reason (`8cab8791`) and retired the census-glow-mesa downgrades (`8bfa549c`),
and a merge that turned out to be **owner-gated was reverted the same day, byte-identical, with the
work preserved on its lane** (`8970b493`).

_For the owner's eye: `1d85c6e6` is the first art in the game with **no consumer** — six townsfolk
portraits banked deliberately as reference, wired to nothing. That was the right call and it is
working (the E6 cast was batched from it this morning), but it means the ledger now carries art the
player cannot reach, and how long that is allowed to sit is a judgement, not a rule._

_Compilation note: TK-01 says "first fire after 06:00 local." Four fires (s1149–s1152) ran between
02:51 and 04:59 and correctly deferred; s1153 ran 05:10–05:39 and deferred with the trigger named.
This fire crossed 06:00 mid-run and took the duty. The covered day closed six hours prior, so the data
is complete._
