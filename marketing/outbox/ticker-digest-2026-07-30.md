# Ticker digest — 2026-07-30 (TK-01, compiled s1279 fire 2026-07-31 07:00 local)

Micro-headlines from yesterday's ACTUAL merges (classified by **touched paths on main**, not by commit
messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

**The shape of the day, measured:** 244 commits landed on main. **Six** touched player-visible paths
(`src/`, `public/`, `assets/`), **thirty** touched the factory's own tools and nets, and **208 were
bookkeeping** — the ledger talking to itself.

**Two of those six are not player news, and reading the paths alone would have said they were.**
`a087cbcd` adds a read-only diagnostics getter so a test can watch the newsie's *state* instead of
sleeping 50 ms — the commit says "behaviour-neutral" and the diff agrees, two added lines over an
existing phase. `b33afb04` is 488 lines of pure addition, 475 of them a new headless sim file, with
one-to-four-line seams in five others. Both are real work; neither changes what the family sees. They
are counted below with the tools, where they belong. **A path is a hint about audience, not a verdict —
open the diff.**

So: **four** merges the family can see, and a day whose real subject was the factory auditing its own
instruments and finding most of them blind.

## The frontier the family opens

- The town asks your name and nothing else — and a fresh ledger arms its own welcome, only a fresh one. `c5a00849`
- Eight class plates come off the press in a single run — the Gazette's engravings, generated whole. `9f8d11c9`
- The Herald's eighth engraving lands: ceremony joins the class boards, decode proved on camera. `5e129079`
- First-run Trail Guide beats get room to breathe — a four-second dwell, later word queues behind. `6f343a6e`

## The tools and the nets

**The day's through-line: nine guards were asked what they could actually see, and nine answers were
smaller than the claim.**

- `site/` ships to players and no gate had ever read it — a planted syntax error passed tsc, build and every guard. `c7cb7792`
- The site guard shipped one fire earlier still couldn't see news.html's inline script or any asset reference. `1f4a4d97`
- Then it turned out that gate had TWO mechanisms for its one cross-tree reference, and neither had ever executed. `f611c1ea`
- run-guards' own header claimed it covered `scripts/**`. It reached 31 of 174; a SyntaxError sailed through. `8ceaf269`
- A comment justifying the type net said tsc never reads `functions/**`. It reads 4 of 22 — 18 were checked by nothing. `a4bf69dd`
- All 22 Cloudflare worker files come under tsc, and the claim gets a guard that rejects `@ts-ignore` escapes. `d606946d` `8b08f9c5`
- The citation guard greened over an empty subject, and covered 26% of the citations it spoke for. `fc0c4689` `cf55c281`
- The E1 release-door guard refused a subject it had never read. `793932d7`
- Four repairs to the drain's block-check: terminal-closed leaves, exact-name matching, stated causes, a false UNKNOWN. `52189299` `c46da16b` `598987e0` `7de3576e`
- run-guards now goes loud when its untracked listing fails, instead of quietly covering less. `e66af39d`
- A finding may no longer be declared closed and open at the same time. `82f0b394`
- Every run-log row must still have a readable log — and the floor becomes a high-water ratchet, not HEAD. `15505222` `07822d90`
- The structural assertions get a fixture harness, so proving them stops meaning deleting real files. `ac12332c` `032eca5a` `dc3aecc8`
- Fire-shell gates had been running six browsers into a ceiling; one worker is both correct AND 8% faster. `17c6c26d` `d1a0846d`
- The three frozen lanes get classified at line level — two of them were never at risk. `0db281e0`
- A measurement task had forbidden its own command's side effect: three deaths, zero readings. `25fa7018`
- The Prospector gets a body that runs without a screen — Dry Gulch boots sim-only and repeats byte for byte. `b33afb04`
- The newsie-release assertion stops sleeping and starts observing state. `a087cbcd`
- The release suite's duplicated hero-approach helper retires onto one converging path. `74ef8c66` `af48a749`

## Notes for the owner

- Nothing here is published. This is the digest; the approval is the one action.
- **You ruled, and it unblocked four things.** `9c621751` records the agent verb rungs (harvest 2 /
  build 3, panel blessed) and npm lockfile-locked for fires — F-1219-1, F-1217-1, F-1212-3 and F-1024-4
  all came off the blocked list on that ruling alone.
- **Your plist ask got cheaper while you slept.** `da18c074` pre-stages `ProcessType` in the repo's copy
  of the fire plist, so the outstanding item (F-1270-4) is now a copy-paste, not a hand-edit.
- The eight class plates (`9f8d11c9`) were generated and the ceremony board wired the same day
  (`5e129079`) — that arc opened and closed inside the coverage day, which is rare.
