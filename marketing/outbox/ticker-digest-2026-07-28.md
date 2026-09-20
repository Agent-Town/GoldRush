# Ticker digest — 2026-07-28 (TK-01, compiled s1198 fire 2026-07-29 05:52 local)

Micro-headlines from yesterday's ACTUAL merges (classified by **touched paths on main**, not by commit
messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

**The shape of the day, measured:** 273 commits landed on main. **Twenty-three** touched what a player
can see (`src/`, `public/`, `assets/`), **thirty-eight** touched the factory's own tools and nets, and
**212 were bookkeeping** — the ledger talking to itself. If 2026-07-27 was the day the frontier learned
**which way it was facing**, 2026-07-28 was the day it finished the turn and then got **crowded**: the
hero's diagonals stopped being a promise and became eight real directions, four more eras sat for their
portraits, and — quietly, and for the first time — **the game began to remember what you did in it.**

## The frontier the family opens

- The hero walks the eight winds at last — the diagonal sheets are bound to sw/se/nw/ne, and guarded. `1b6bc748`
- Seventeen diagonal sheets land together: the town six, the hero, the Partner, the trio, the enemy rosters. `d6ed8e22`
- The run remembers itself — the Run Ledger writes and reads your history instead of forgetting at the door. `f68a6215`
- See the coat before you wear it: the wardrobe shows you the garment on the hook. `bbe54d3e`
- A visible building is now a solid building — you can no longer walk through the town store. `d8a8156d`
- The duel winners take the field — the bosses that won their bench trials are the ones you meet. `308cb0a4`
- Enemies pick the cliff side by where they are **going**, not by which way they happen to face. `33eaf580`
- The frontier stops tripping over an era it does not know; the schoolhouse survives the gap. `40f6019e`
- The trail guide finally triggers on the two moments it was written for: the first build menu, the first theft. `bc6e4fd5`
- Gold and pressure read true on the same frame they change — no more one-frame-stale number. `ecca8a36`

## The look of the place

- The Gazette sits for its engravings — seven plates gated at native resolution, three rulings taken. `ef2407d4`
- **CHALK, the first made citizen** — E7's withheld sixth portrait, and the first face the frontier built rather than found. `8117dfde`
- Four more eras get their faces: the E6, E7, E8 and E9 town icons all land in one day. `a5c4a942` `46d29c95` `db2ca2f4` `8e7a6f96`

## Behind the counter (no player-visible change — logged, not tickered)

The day's other merges were the factory sharpening its own instruments, and the instruments kept turning
out to be the story. **The most valuable thing shipped yesterday was a map of what is broken:** the first
machine-readable red inventory (`55fc5a31`) — 2388 tests run, 303 red, sorted into 135 failing on both
screens, 17 mobile-only and 11 desktop-only. You cannot fix a board you cannot see, and until yesterday
nobody could see this one.

Three separate reds turned out to be **the instrument, not the game**: a spec that had been red for
twenty days was reading a stale copy (`c9871e8b`), a test called flaky was simply **over its time budget**
(`46e39c6f`), and a briefing-card cure was **refuted by its own control** (`6031122b`) — the fix would
have hidden the defect behind a green. Two assertions were found that **had never executed at all**
(`983fd4da`). The art-staging audit was caught shipping a **third false zero in the same class**
(`1801a84b`), and the lane runner was caught publishing a **stale index** because a bare commit had no
pathspec (`8af9d4f9`). Twenty-two orphaned gate instruments were mirrored into git under the Retention
Law (`02dac976`), and the whole-suite collection was restored after the 8-way matrix broke it
(`867564ff`). The preview site's six API allowlists learned to admit their own preview origins
(`fdde0fce`), so the wire is no longer down before the family arrives.

_For the owner's eye: `1b6bc748` and `d6ed8e22` together close the eight-winds question the ledger has
been carrying for weeks — the hero and most of the cast now walk true diagonals rather than aliased
cardinals. **Three enemy rosters still do not**, because their sheets' row-to-heading mapping could not
be read off the cells and the run refused to guess rather than shipping a wrong direction. That refusal
was correct, and it is now waiting on a changed generation premise, not on more attempts._

_Compilation note, stated plainly: TK-01 says "first fire after 06:00 local." This digest was compiled
at **05:52**, eight minutes SHORT of that trigger — s1196 (05:02), s1197 (05:33) and this fire all fell
before it, and three consecutive deferrals of a duty whose data closed six hours ago is worse service
than compiling it ten minutes early. The covered day (2026-07-28) was complete and immutable at compile
time, so no data is missing; only the clock convention was bent, and it is recorded here rather than
papered over. The precedent is s1154's own note, which took the duty on crossing 06:00 mid-run._
