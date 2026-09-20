# Ticker digest — 2026-07-26 (TK-01, compiled s1106 fire 2026-07-27 06:05 local)

Micro-headlines from yesterday's ACTUAL merges (verified on main's first-parent history by hash and **diff**, not by commit messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

**The shape of the day, measured:** 233 commits landed on main. Fourteen touched what a player can see (`src/`, `public/`, `assets/`), twenty-four touched the factory's own tools and nets, and **195 were bookkeeping** — the ledger talking to itself. Where 2026-07-25 was the biggest *build* day of the saga, 2026-07-26 was the day the frontier got **honest**: three separate lies about how a map is won or lost were closed, the game learned to survive a browser that refuses it, and the wardrobe arc reached the Prospector's own back.

## The frontier the family opens

- Dry Gulch and Twin Banks now say how they are won — the briefing states the secure-wave, instead of leaving it to be guessed. `12bc9099`
- The river camp stops winning itself — the hero can no longer wade the deep channel, so the passive victory is closed. `5bad5def`
- The E1 climb is walkable again — the first seven entry waves hit at a fifth strength, waves eight through eleven at half. `eb7278ac`
- The Double-Tap Coil stops stacking to six — capped at three, in **both** places the number was written. `d2279d32`
- The game boots when the browser refuses to remember — blocked storage no longer throws on the plain boot path. `2cd221d1` `7be9ce7b`
- The county pays honest eyes — cosmetic grants and prize-stub redemption arrive at the complaint desk. `52fa15ad`
- The claim learns its own address: the game now lives correctly at its published path, with the API on its own line. `5b61349e`

## The look of the place

- The night shift: the town cast's walk sheets mended and re-cut — clerk, preacher, schoolteacher, tavernkeeper, two outlaws. `626d9631`
- The tailor's wagon opens, and it dresses the Prospector and the hero both. `925a0c3b`
- The heroine puts on the Claim-Day outfit — thirty-four frames processed, the wagon's sign held back for a second look. `1a5410b7`
- The last era's outlaws sit for their portraits — E10 roster raws banked, kept as reference until a map asks for them. `58fb998b`

## Behind the counter (no player-visible change — logged, not tickered)

The day's other merges were the factory auditing its instruments, and again the instruments were the problem. **The deploy's false green took four more merges to fully kill:** success now demands a captured URL, an immutable snapshot, and a live confirmation (`00f5d464`), then the production alias plus the contract test that had stopped guarding it (`e7423018`), then the same untreated defect found hiding in the *sibling* script (`4b095e35`), then the guard for the second script the cure had been applied to but never watched (`0ed94c49`). **The art-staging audit shipped a false zero twice in one night** — first because it classified by name instead of blob hash (`4051bf31`), then because "in git" had meant "on this disk" while 36.5 MB sat on an unpushed branch (`c8034384`). The goal tree stopped rendering merged leaves as planned (`e7e9e1ca`), the depth instrument's projection was repaired (`fa645b6c`), and a fire **retracted its own overstated law** rather than let a wrong clock stand (`73799a2d`). The prize clerk's ledger was hardened (`29625771`) and the rate limiter hoisted to one shared window (`d16000a9`, `e4ec2a13`). Five regression nets closed the rf-26…rf-30 run: the entry-damage ladder (`dc483d74`), the rehearsal rig failing closed on a foreign server (`a9fccf75`), an assertion the fail-closed resolver never had (`8fb97691`), a boot probe that had been measuring strangers (`46db455c`), and a guard that now defends its own launch ordering (`b78234a3`). Nine cosmetics raws were salvaged into git under the Retention Law (`0f9270b0`).

_For the owner's eye: `5b61349e` names a public address for the claim. It is a code path, not a publication — nothing is announced anywhere by this merge — but it is the first commit that assumes a front door, and that is a decision worth confirming rather than inheriting._

_Compilation note: TK-01 says "first fire after 06:00 local." s1105 finished at 05:56, four minutes short, and flagged this digest as owed rather than compiling it early; this fire took it at 06:05. The duty was deferred once, deliberately, and named both times — the covered day closed six hours prior, so the data is complete._
