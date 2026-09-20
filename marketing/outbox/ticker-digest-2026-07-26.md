# Ticker digest — 2026-07-26 (TK-01, compiled s1106 fire 2026-07-27 06:05 local)

Micro-headlines from yesterday's ACTUAL merges (verified on main's first-parent history by hash and **diff**, not by commit messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

**The shape of the day, measured:** 233 commits landed on main. Fourteen touched what a player can see (`src/`, `public/`, `assets/`), twenty-four touched the factory's own tools and nets, and **195 were bookkeeping** — the ledger talking to itself. Where 2026-07-25 was the biggest *build* day of the saga, 2026-07-26 was the day the frontier got **honest**: three separate lies about how a map is won or lost were closed, the game learned to survive a browser that refuses it, and the wardrobe arc reached the Prospector's own back.

## The frontier the family opens

- Dry Gulch and Twin Banks now say how they are won — the briefing states the secure-wave, instead of leaving it to be guessed. `79de56f4`
- The river camp stops winning itself — the hero can no longer wade the deep channel, so the passive victory is closed. `e886150a`
- The E1 climb is walkable again — the first seven entry waves hit at a fifth strength, waves eight through eleven at half. `1dbd0120`
- The Double-Tap Coil stops stacking to six — capped at three, in **both** places the number was written. `4154da9e`
- The game boots when the browser refuses to remember — blocked storage no longer throws on the plain boot path. `7aec8369` `a736500c`
- The county pays honest eyes — cosmetic grants and prize-stub redemption arrive at the complaint desk. `2dfa0b4d`
- The claim learns its own address: the game now lives correctly at its published path, with the API on its own line. `50acfeff`

## The look of the place

- The night shift: the town cast's walk sheets mended and re-cut — clerk, preacher, schoolteacher, tavernkeeper, two outlaws. `ccc712e1`
- The tailor's wagon opens, and it dresses the Prospector and the hero both. `33aac820`
- The heroine puts on the Claim-Day outfit — thirty-four frames processed, the wagon's sign held back for a second look. `a8183041`
- The last era's outlaws sit for their portraits — E10 roster raws banked, kept as reference until a map asks for them. `d2aaa863`

## Behind the counter (no player-visible change — logged, not tickered)

The day's other merges were the factory auditing its instruments, and again the instruments were the problem. **The deploy's false green took four more merges to fully kill:** success now demands a captured URL, an immutable snapshot, and a live confirmation (`445ba24d`), then the production alias plus the contract test that had stopped guarding it (`011b47f6`), then the same untreated defect found hiding in the *sibling* script (`c2c314b8`), then the guard for the second script the cure had been applied to but never watched (`2bc592cc`). **The art-staging audit shipped a false zero twice in one night** — first because it classified by name instead of blob hash (`81b6ac54`), then because "in git" had meant "on this disk" while 36.5 MB sat on an unpushed branch (`4c897f9c`). The goal tree stopped rendering merged leaves as planned (`3b13c1dd`), the depth instrument's projection was repaired (`f8812586`), and a fire **retracted its own overstated law** rather than let a wrong clock stand (`52c00cad`). The prize clerk's ledger was hardened (`6f6345c1`) and the rate limiter hoisted to one shared window (`5ed2e210`, `48d0d90b`). Five regression nets closed the rf-26…rf-30 run: the entry-damage ladder (`38795ba0`), the rehearsal rig failing closed on a foreign server (`b99681a1`), an assertion the fail-closed resolver never had (`b095fcbe`), a boot probe that had been measuring strangers (`0a504757`), and a guard that now defends its own launch ordering (`a8e26fef`). Nine cosmetics raws were salvaged into git under the Retention Law (`0f9270b0 (archive: pruned by the A3 rewrite)`).

_For the owner's eye: `50acfeff` names a public address for the claim. It is a code path, not a publication — nothing is announced anywhere by this merge — but it is the first commit that assumes a front door, and that is a decision worth confirming rather than inheriting._

_Compilation note: TK-01 says "first fire after 06:00 local." s1105 finished at 05:56, four minutes short, and flagged this digest as owed rather than compiling it early; this fire took it at 06:05. The duty was deferred once, deliberately, and named both times — the covered day closed six hours prior, so the data is complete._
