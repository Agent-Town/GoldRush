# Ticker digest — 2026-09-24 (TK-01, compiled s2678 fire 2026-09-25 06:45 local)

*Filed ON TIME, and that is worth one line because the four files before it were not: TK-01 wants the first
fire after 06:00 local, this fire started at 06:39 and s2677 ended at 05:39 having correctly deferred the
window ("TK-01 window opens at 06:00 local", `2e653b003`). The 2026-09-20/21/22 gap that F-FIRE-1 opened was
closed by s2669 and the 09-23 day by s2668; **with this file the news pipeline has no owed digest at all.***

Micro-headlines from the day's ACTUAL merges, classified by **touched paths on main** and never by commit
messages (Mistake #16). Owner approves the whole digest in one action; publication stays owner-only.

**Method, re-run rather than inherited.** The day's commits were bucketed on their own `%cs` with **no
`--since`/`--until` window at all** (F-2562-2: git fills a bare date with the current time-of-day, so a bare
window slides through the day). A control was asserted before any count was believed: **11,855** first-parent
commits in the whole history, so a zero here would have been an answer and not a failed read. The player-path
test is **imported** from `scripts/gazette-backfill-sweep.mjs` (`isPlayerPath`), never re-typed (F-1261-1).
The script is s2668's, re-run from this fire's own copy at `artifacts/s2678/day.mjs`; its output is banked at
`artifacts/s2678/day-2026-09-24.txt`.

**The day was asked twice, per F-2623-1.** On the first-parent walk it holds **120** commits; asked of ALL
commits reachable from HEAD it holds **184**, so **64 sit off the walk, 23 of those touch a player path** —
and each of the 23 was then tested for containment: **all 23 are contained in a walk commit, 0 orphaned**.
The day is whole and nothing of it is unreachable or unreported.

**A caution about dates on this day, because a reader WILL hit it — twice.** The machine runs at **UTC+07**
and these buckets are local, as TK-01's own window rule requires.
① `reviews/sol-map-art-fidelity-2.md` stamps its slices in **Z**, so its slices 10 to 16 head themselves
"2026-09-23 17:26Z" through "21:10Z" for merges that bucket on **2026-09-24** local (00:05 through 03:48).
The review is not wrong and neither is this file: slices 1 to 9 are told in the 23rd's digest, slices 10 to 16
here. ② The day's **last** landing straddles midnight the other way: `ux-entry-robustness-1` merged at 23:55
local as `3f5bc0456` and is reported here, but its drain cure `960cbb249` (00:28) and its era pin `1b977e055`
(01:18) bucket on the **25th** and will be counted there. The gazette item for it already cites both halves.

**The shape of the day: 120 first-parent commits, 2,786 files changed, and 25 distinct player-path files.**
Eighteen of the 120 touched one of those 25. **Twenty-seven of the 120 carry a fire's session prefix** —
s2668 once, then s2669 (6), s2670 (4), s2671 (7), s2672 (4) and s2673 (5) — and that is the day's other
story: the fires came back at 15:35 local after F-FIRE-1's four dead days, so this is the first day since
2026-09-19 with both an attended session and a live fire loop writing to main. Everything before 15:35 is
attended; the bookkeeping, the law edits and the duty work after it are the fires'.

**And the shape of the work: the day emptied a queue that had been running for three days.** Astra's
twenty-two-map fidelity run **finished** here (its last seven maps), the two follow-on Astra masters landed
(entry framing and the phone HUD), a third Astra slice answered the code-owned holds, and three Opus
implementer slices landed against an outside review — the sign-in door, the release gate and the way into the
game. Nine slices, plus one test-truth landing and one late rotation mint.

## The county's news

**Astra's second fidelity pass reached its last seven maps and ended.** `114eb2b98` (the Dead Band),
`a383a8d3d` (the Far Side), `0f78c83a2` (Low Orbit), `ce288f378` (the Dome Basin), `f3e95539c` (the Seed Run
and Devil's Alley) and `9f842f2a0` (the Old Canal) close the run the owner opened on 2026-09-22. Every map
answers a clause quoted from its own earlier review with a number against that run, and every one keeps
bounds, mounts, collision footprints and station authority exact. `reviews/sol-map-art-fidelity-2.md`.

- **The Dead Band's two silent frames become layered antenna architecture.** The iron-shadow warning frame
  goes **156 → 1,464** of 3,000 triangles and the north silence gate **180 → 1,548**, bounds exact; at the
  unchanged 3 m stations luminance rises **0.104 → 0.189** desktop and **0.110 → 0.192** phone at the warning
  frame, **0.137 → 0.167** and **0.130 → 0.167** at the north gate.
- **The Far Side's landing frame gets a real pressure vessel** — **600 → 2,966** triangles on a native metal
  atlas, source bounds and gameplay authority unchanged, station luminance **0.296 → 0.348** on both
  viewports. Its phone HUD falls from 5.77% to 0.012%, and the review **declines to claim that for art**: the
  wave's HUD cure is in that number.
- **Low Orbit's salvage rig reads as one joined machine** at **2,964** of 3,000 triangles; the station median
  rises **0.319 → 0.404** on both viewports and the dark-body share falls **7.7% → 0%**.
- **The Dome Basin's three lock bodies stop shimmering.** UV distortion drops from a median **3.75** and p95
  **38.52** to **1.00** and **1.08** with no collapsed face, triangles **1,580 → 2,308**, station luminance
  **0.327 → 0.466** desktop and **0.325 → 0.460** phone, ground retained within **0.004%** RMS.
- **The Seed Run's vault and gate gain door hardware and framed windows** (**2,148 → 2,828** triangles, UV
  median **1.82 → 1.00**, collapsed area **0.8% → 0%**, body median **0.259 → 0.443**), and the convoy's ruts
  become quieter tapered marks that keep all **110** centres and four rings.
- **Devil's Alley's three wind anchors take native surfaces** at **2,284 / 2,628 / 2,972** triangles; the
  upper-station median rises **0.193 → 0.353** desktop and **0.192 → 0.352** phone, the dark share falls from
  **12.9%** and **9.7%** to **0%**, and UV p95 falls from **31–50** to **1.44**.
- **The Old Canal's three drives gain upper wheel drives and coursed masonry** (**1,444–1,468 → 2,156–2,180**,
  the bands **552 → 2,184**) and its inherited edges sharpen: the bed's paint transition narrows from
  **0.80 m to 0.25 m** while the six route segments and three choice bands stay exact. Station median
  **0.190 → 0.384** desktop and **0.190 → 0.386** phone.
- **The frame budget held on all seven, and the one map whose numbers moved most is named.** On the five maps
  that report milliseconds, desktop p95 ran between **−0.10 and +0.65 ms** and the phone between **−0.35 and
  +0.35**; the Seed Run and Devil's Alley report theirs as percentages (**−1.0% / +0.5%** and
  **+1.6% / −0.5%**). Draws are unchanged on every one of the seven, with zero capture errors. The largest
  single rise is the Dead Band's north-gate view (**9.00 → 9.65 ms**), **7.2%** of its own base and well
  inside the 15% bar.
- **The run's closing account, in its own words.** Sixteen of twenty-two maps carried an art-owned clause and
  all sixteen are answered; **six were skipped by the master's own rule** — Night Shift, Twin Banks, the
  Baron, the Trestle, the Glow Mesa and Relay Rush — *without promoting their verdicts*. No gameplay contract,
  sim table, collision footprint, height, mask, route, spawn or null floor moved across the whole run, and the
  E1 first-town payload moved **2,036 B** over all of it. What it cost is raw runtime outside the E1 release:
  roughly **60 MB** over the run, of which the Canyon Works' panorama (15.7 MB) and the Picnic's cloth and
  ground (11.8 MB) are nearly half, and the E8 leg's two native metal atlases another **6.5 MB** (F-F2-29,
  F-F2-36). That total is filed for the owner's eye before any fidelity-3, not spent again.

**The plain entry now turns to the landmark each map leads with, on the four maps the first pass skipped.**
`26e4a5a9c` lands entry framing on Night Shift, Twin Banks, the Baron and the Trestle, with a *second* stop on
the Glow Mesa and Relay Rush — `entryLandmarks`, a list of at most two, inside the unchanged 2.5 s window; a
second stop splits the old 1.1 s hold into 0.2 s, a 0.7 s transit and 0.2 s. The view, every order and every
tape replay are unchanged (ADR-005). `reviews/sol-entry-framing-2.md`.

- **Four phones gained a look they did not have.** Twin Banks' south-bank homestead **0 → 49,902 → 0** body
  pixels at 390, the Baron's seized headframe **0 → 22,185 → 0** (about 1.9 s), the Trestle's span
  **0 → 52,732 → 0**, and the Glow Mesa takes two stops in one window — the starstone derrick
  (**0 → 37,168 → 0** desktop, **0 → 41,400 → 0** phone) then the isotope cooling rack
  (**0 → 35,096 → 0** phone). Relay Rush reaches both of its bodies at 390: the charting station
  **0 → 21,955 → 0** and the west ridge dishes **0 → 24,726 → 0**.
- **Where a body was already on screen, the camera correctly did nothing** — that is the rule, not a miss.
  The desktop homestead (44,748 px), headframe (24,267), Trestle fragment (8,161), cooling rack (5,390) and
  Relay Rush station (8,548) are all skipped by the zero-pixel trigger.
- **And on one map the owner's ask is NOT yet visibly answered, which the review says first rather than
  last.** Night Shift declares `lampworks_yard` and takes no glance at all, because the yard already shows
  **77,509 px** at 1280 and **9,127** at 390 — cropped and HUD-covered, not absent. The follow-up is named
  (F-SEF2-4): a partial-visibility trigger, which would also give the Glow Mesa's desktop rack and Relay
  Rush's desktop station their glance.

**On a 390 px phone the HUD stops covering the thing you just arrived to look at, on four more maps.**
`d8705dc6e` extends the census and cure to Night Shift, Twin Banks, the Baron and the Trestle: 25 lines of
390 px rules inside the first pass's bounds, **no testid, number, control or sim rule moved**, desktop
coverage unchanged everywhere. `reviews/sol-phone-hud-entry-2.md`.

- **The Baron's fort goes from two-thirds covered to clear**: persistent coverage **68.14% → 0%** at 390 (the
  status rail now begins below the fort's visible parapet), desktop 19.71% unchanged. Twin Banks' river
  **22.84% → 6.16%** (the joystick's backing and glow go; its bounds, ring, knob and input stay fixed), Night
  Shift's rig **13.09% → 8.03%** (the confirmation target compacts 76 → 60 px).
- **The Trestle needed no rule, and the review says so instead of writing one.** The bridge is offscreen at
  the plain phone entry before and after, so the hold moves to the camera owner (F-HUD2-1) — where the entry
  glance above now shows the span for 2.5 s.

**Three maps show what they were always supposed to show.** `00e4e98c1` answers the code-owned presentation
holds: Twin Banks' banks draw **248 desktop / 102 phone** scatter cards of reeds, willow and driftwood from
the existing atlas at the same six draws (roots embedded 0.025 m, a 1 m exclusion around build zones and the
fords); the Trestle's rails end in **four buffer stops** and join on **five-sleeper junctions** with four
frogs at 0.17 m flangeways, at two unchanged draws; and Relay Rush's **active** relay lamp pulses (0.75 Hz,
0.75–1.35) while the inactive, muted and suppressed lamps stay dark — zero added objects, lights, draws or
view fields. Frame p95 moved **−0.30 to +0.15 ms**. Hill Mine, the Incline and the Canyon Works improve for
free under the same rail rule. `reviews/sol-code-presentation-1.md`.

**A link from outside stops staking a claim in your name.** `3f5bc0456` inverts the boot router from a
six-key safe set to an **allowlist of run routes**, so a tracking or share link (`?utm_source=`, `?fbclid=`,
a shared `?contract=`) lands on the start menu and mints no profile, where it used to skip onboarding and
create one named after the owner. A new `BootGuard`, armed as the first import, wraps the seventeen runtime
dynamic imports and probes WebGL2 once, so a failed chunk or a refused display **draws a parchment card
instead of a blank page**. Losing focus releases held keys and re-arms the edge detectors, and the solo pick
clock is a remaining-time budget: ten seconds on the clock, 3.2 s hidden, ten seconds still on the clock.
The unnamed-prospector fallback stops greeting strangers by the owner's first name.
`reviews/ux-entry-robustness-1.md`.

- **The verdict names what it did NOT ship.** Item 4 (the first-boot signal at the profile's creation) was
  implemented, **measured** to reorder story beats through the runtime's FIFO queue (`ledger-page:the_claim`
  ahead of `founding-welcome`, 2 failed of 12), and **reverted**, because the cure lives in `StoryRuntime`,
  outside the firewall (F-UX7-1, laddered). The allowlist was proved against **759 `goto` calls across 482
  e2e files** with zero verdict flips.

**The sign-in door was hardened, and the before-and-after is a measurement rather than a claim.**
`78934b5b7`: fifty parallel wrong guesses against a budget of five were **all fifty evaluated** before, with
the real code accepted afterwards; now **five are evaluated and forty-six refused with 429**, and the real
code is refused until the window passes. Asking for a fresh code after three wrong guesses used to delete the
counter and accept the new code; now the counter is kept (at 7) and the fresh code is refused. `/api/verify`
gains a per-address cap of 60 an hour beside the per-email five per ten minutes, the TTL is not re-armed on
conflict so a flood cannot extend a victim's lockout, and dev login codes require an environment binding that
a forwarded `Host` cannot spoof. Five mutants, each red on a named assertion.
`reviews/sec-signin-hardening-1.md`.

**The era-4 hauler stopped riding along in the era-1 download, and the door that keeps later eras out is
finally on the path production walks.** `459c21394` makes the motor hauler's body a lazy `?url` glob the
release plugin already narrows — **0 hauler files in the E1 dist, want 0** — after the implementer measured
that a build-flag ternary does *not* keep the asset out (Vite emits in its transform hook, before dead
branches fold). `scripts/deploy.sh` now runs the release assertion after the build with the same abort shape,
so a later-era leak stops a deploy instead of shipping one: **`rc=0 … 1126 files, 97,650,548 bytes, zero
later manifest ids or plate/GLB assets`** against 283 later-asset stems. The full build still loads the
hauler on the Long Road. `reviews/release-gate-on-deploy-1.md`.

- **The first thing the new gate caught was a false positive, and it was narrowed rather than loosened.** The
  Claim Jumper's **east** walk plate `char-jumper-e4-…` matched the era token ("e4" = east, the owner's naming
  of 2026-09-19). The drain excuses compass-token sprite plates by their exact shape and nothing else
  (F-RGD-1).

**The week's six claims are back on the board, three days late.** `b541ac711` mints `r2026w39` (RT-01),
which no fire minted because no fire ran: the 21 September window opened with **no seeds standing**, so for
three days the county had nothing to post. Six claims are staked now — the Claim, Dry Gulch, Twin Banks,
Night Shift, Hill Mine and the Baron — running to 28 September, with `public/skill.md` refreshed with the
**whole** registry, closed weeks kept as public history.

**The era seal was re-pinned nine times, and it is still era 6.** `36aa9fa6c` (#50), `37a7141c8` (#51),
`3edb6efd1` (#52), `208863d39` (#53), `eed03c91d` (#54), `55db53d86` (#55), `3a9628385` (#56), `23e50fc53`
(#57) and `3079d5db0` (#58) append a row apiece. **Verified in the registry, not read off the subject lines:**
`assets/engine-era.json` parses to `era: 6` on both sides of the day's first pin and its last, and the pin
array goes **49 → 58** across the day — nine rows appended, no bump. So **no rider's existing reel was
re-hashed and nothing they already earned changed underneath them.** Two of the day's landings moved no engine
file and correctly took no pin at all (`sec-signin-hardening-1`, `e1-spec-truth-1`).

## Not player-visible

NOT PLAYER-VISIBLE — `348521f4d`: `e1-spec-truth-1` re-pins six E1 map tests that were asserting a world the
game no longer builds (stockpile targets inside solids that a 2026-07-19 landing made real, a fog pin two
pins deep, an animator field deleted by a later per-body animator, an 810 ms storage race). Test-side only;
the engine hash did not move. The seven reds it leaves are each ruled in its own review, four of them because
passing them would ratify the Twin Banks braid mask **by test** while the owner's ruling sends it through the
HM-06 master instead.

NOT PLAYER-VISIBLE — the day's law and ledger work: `4aec81efe` and `6e246f26b` write F-E1T-2 (a fresh
`tasks/.fire.lock` is a wait condition beside STATUS line 1) and F-E1T-3 (no depth or filter fetches into the
working repo) into the law files; `12ccef83a`, `308df91d4`, `0ca07d31c` and `79594d039` cure four factory
guards; `add9bf38e` and `cdfca600c` home the fire memory's mirror in the private archive. No `src/`, no
assets, no rendered surface.

The rest of the day's 120 commits are the factory's own paper: nine reviews, the per-slice ledger rows and
leaf entries, six fires' lock and handoff lines, handover sections 13z-12 to 13z-16 plus 13z-19 and 13z-20
(17, 18 and 21 are not this day's), the queueing of each
leg on the owner's word, and the recording of his seventeen rulings of 2026-09-24 (`ce2771aeb`). None of it is
news; it is named so the day is whole.

## What this digest does NOT cover

Nothing is owed behind it. The GZ-01 sweep run before this file reports **0 candidates** — 488 player-path
first-parent commits in the window, **all 488 cited** in `marketing/outbox/` (337 reported, 151 dismissed) —
so F-2668-1's backlog of uncited merges — **70** when s2668 first counted it, **51** after its digest, **17**
after s2669's three — is now **empty**. The 2026-09-25 landings named above (`960cbb249`, `1b977e055`, `0bfb168ea`, `aa4ccf975`) belong
to the next coverage day and are told there.

---
*Compiled by the s2678 fire. Day boundary `114eb2b98^..3f5bc0456` (00:05 to 23:55 local). 120 first-parent
commits (bucketed on their own `%cs`, no window), 184 reachable on the day with 64 off-walk — 23 player-path,
all 23 contained, 0 orphaned — 2,786 files changed, 25 distinct player-path files, 18 walk commits touching
one of them, 27 commits carrying a fire session prefix (s2668–s2673). Nine slices landed plus one test-truth
landing and one late rotation mint; nine era pins, #50 to #58, era 6 on both sides of the span, verified by
parsing the registry. No commit message was used to classify anything.*
