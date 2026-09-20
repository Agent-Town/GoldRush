# Ticker digest — 2026-07-30 (TK-01, compiled s1279 fire 2026-07-31 07:00 local)

Micro-headlines from yesterday's ACTUAL merges (classified by **touched paths on main**, not by commit
messages — Mistake #16 guard). Owner approves the whole digest in one action; publication owner-only.

**The shape of the day, measured:** 244 commits landed on main. **Six** touched player-visible paths
(`src/`, `public/`, `assets/`), **thirty** touched the factory's own tools and nets, and **208 were
bookkeeping** — the ledger talking to itself.

**Two of those six are not player news, and reading the paths alone would have said they were.**
`8f3974a5` adds a read-only diagnostics getter so a test can watch the newsie's *state* instead of
sleeping 50 ms — the commit says "behaviour-neutral" and the diff agrees, two added lines over an
existing phase. `d705cf9c` is 488 lines of pure addition, 475 of them a new headless sim file, with
one-to-four-line seams in five others. Both are real work; neither changes what the family sees. They
are counted below with the tools, where they belong. **A path is a hint about audience, not a verdict —
open the diff.**

So: **four** merges the family can see, and a day whose real subject was the factory auditing its own
instruments and finding most of them blind.

## The frontier the family opens

- The town asks your name and nothing else — and a fresh ledger arms its own welcome, only a fresh one. `bd4c5c18`
- Eight class plates come off the press in a single run — the Gazette's engravings, generated whole. `b00194fa`
- The Herald's eighth engraving lands: ceremony joins the class boards, decode proved on camera. `8133dd91`
- First-run Trail Guide beats get room to breathe — a four-second dwell, later word queues behind. `e3ee53d6`

## The tools and the nets

**The day's through-line: nine guards were asked what they could actually see, and nine answers were
smaller than the claim.**

- `site/` ships to players and no gate had ever read it — a planted syntax error passed tsc, build and every guard. `a5d57960`
- The site guard shipped one fire earlier still couldn't see news.html's inline script or any asset reference. `c6bb60c5`
- Then it turned out that gate had TWO mechanisms for its one cross-tree reference, and neither had ever executed. `567ee14e`
- run-guards' own header claimed it covered `scripts/**`. It reached 31 of 174; a SyntaxError sailed through. `b7e9f3f6`
- A comment justifying the type net said tsc never reads `functions/**`. It reads 4 of 22 — 18 were checked by nothing. `a41566e7`
- All 22 Cloudflare worker files come under tsc, and the claim gets a guard that rejects `@ts-ignore` escapes. `f8eddce8` `0b66d361`
- The citation guard greened over an empty subject, and covered 26% of the citations it spoke for. `cb9a757c` `0cdaecdb`
- The E1 release-door guard refused a subject it had never read. `e739d04a`
- Four repairs to the drain's block-check: terminal-closed leaves, exact-name matching, stated causes, a false UNKNOWN. `a269c7cf` `2359f96d` `cca9d791` `7fa19aa7`
- run-guards now goes loud when its untracked listing fails, instead of quietly covering less. `dd903122`
- A finding may no longer be declared closed and open at the same time. `54438991`
- Every run-log row must still have a readable log — and the floor becomes a high-water ratchet, not HEAD. `67d87bc4` `3675e7e6`
- The structural assertions get a fixture harness, so proving them stops meaning deleting real files. `47538c08` `7ed72bc0` `89e3d9c2`
- Fire-shell gates had been running six browsers into a ceiling; one worker is both correct AND 8% faster. `f57aeb15` `20fda8a5`
- The three frozen lanes get classified at line level — two of them were never at risk. `adfa280a`
- A measurement task had forbidden its own command's side effect: three deaths, zero readings. `108f0bed`
- The Prospector gets a body that runs without a screen — Dry Gulch boots sim-only and repeats byte for byte. `d705cf9c`
- The newsie-release assertion stops sleeping and starts observing state. `8f3974a5`
- The release suite's duplicated hero-approach helper retires onto one converging path. `616f82c6` `ca64bf26`

## Notes for the owner

- Nothing here is published. This is the digest; the approval is the one action.
- **You ruled, and it unblocked four things.** `27346d6d` records the agent verb rungs (harvest 2 /
  build 3, panel blessed) and npm lockfile-locked for fires — F-1219-1, F-1217-1, F-1212-3 and F-1024-4
  all came off the blocked list on that ruling alone.
- **Your plist ask got cheaper while you slept.** `59eae6a8` pre-stages `ProcessType` in the repo's copy
  of the fire plist, so the outstanding item (F-1270-4) is now a copy-paste, not a hand-edit.
- The eight class plates (`b00194fa`) were generated and the ceremony board wired the same day
  (`8133dd91`) — that arc opened and closed inside the coverage day, which is rare.
