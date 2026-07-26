# DRAFT — THE RIVER CAMP: three of the five release maps are won by standing still in the water
STATUS: DRAFT (E1-depth review, leg 2, 2026-07-26). Not queued. **Release-blocking.** Smallest known fix is one boolean in a manifest.
WHY: `reviews/e1-gameplay-depth.md` F-E1-5. Verified by play, no debug assists beyond the two the review cites: **the Claim is secured in 77 seconds with 0 kills, 0 damage taken, 0 gold spent and 0 buildings** — walk into the river, stop pressing keys.

## THE EVIDENCE (✓ VERIFIED — play + source, do not re-derive)
| Map | Tile | Camp result | Report |
|---|---|---|---|
| the-claim | frontier-river-claim | **SECURED wave 10, hp 100/100, 0 kills, 77 s** | `reviews/shots-e1-depth/camp-claim-report.json` |
| e1-night-shift | frontier-river-claim | **SECURED wave 25, hp 100/100, 0 kills** | `camp-nightshift-report.json` |
| e1-baron | frontier-river-claim | untouched waves 0–20, then **died wave 21** — the Baron reaches in | `camp-baron-report.json` |
| e1-twin-banks | e1-twin-banks | **died wave 3** — no deep water to hide in | `camp-twinbanks-report.json` |
| e1-dry-gulch | e1-dry-gulch | n/a — no river | — |

The mechanism, four facts that only bite when combined:
1. `src/world/Terrain.ts:214` — the hero may walk **deep** water when `TILE_WATER.heroCanWadeDeep === true` **and** the tile is `frontier-river-claim`. `assets/contracts/epoch-1-frontier/manifest.json:217` sets it true. `the-claim`, `e1-night-shift` and `e1-baron` all ride that tile (`tileParams.tileId`).
2. `e2e/task-025-bandits-dont-swim.spec.ts` — enemies do not enter deep water; they cross at fords. So deep water is unreachable to them.
3. `src/game/Game.ts:6536` — deep water disarms both hero weapons outside epoch-5 ("Wet powder.", `Game.ts:6523`). This is the intended price.
4. `src/game/Game.ts:6352` — `endRun()` is reached **only** by hero death. There is no other defeat in E1: no base loss, no stake loss (see F-E1-6), no timer.
So the price is not a price. You give up an offense you do not need, and buy the only thing that can lose you the run.

## THE FIX (smallest first)
**Primary — one datum.** `assets/contracts/epoch-1-frontier/manifest.json:217` → `"heroCanWadeDeep": false`. The hero keeps the shallows (`Balance.terrainSim.wadeDepth: 0.35`) and loses only the deep channel, which is where the exploit lives. Cost to real play is near zero and is checkable: every E1 gold seam sits at |z| ≈ 6.4–7.0 (`Terrain.ts:155` `DEFAULT_NODE_ANCHORS`, and no E1 contract overrides `harvestAnchors`), i.e. **on the banks, never in the deep channel** — nothing about panning needs deep water.

It also makes the Claim's own card true. It promises *"The river splits the claim around one center ford"*; today the river splits nothing, because the player walks straight through it. After the change the ford is the crossing, exactly as written.

**If the owner wants deep wading kept** (it is thematic — a prospector in the river), the alternatives in ascending cost:
- **b.** Give the disarm teeth by making the water itself a clock: hero takes a small drown/cold tick per second in deep water past ~3 s. Standing still stops being free without touching pathing.
- **c.** Make the secure condition mean what the card says — no securing while N+ jumpers are alive on the claim. This is the honest reading of "hold the claim", and it fixes the same class on any future map.
- **d.** Follow the Baron's example: he already refuses to respect the river (verified — the camp dies at wave 21). Giving the ordinary wrecker archetype the same reach kills the camp with a design answer rather than a wall.

Recommend **(a)** for the release and **(c)** as the E2-era design fix, because (c) is the one that generalises.

## HOW TO VERIFY
1. `node rehearsal/segments/e1-depth-rivercamp.mjs the-claim camp-fix 4 8` → expects `reachedDeepRiver: false` and outcome `dead`, not `secured`.
2. Same for `e1-night-shift` and `e1-baron`.
3. `node rehearsal/segments/e1-depth-play.mjs the-claim regress 1 8` → still SECURES at wave 10 by playing (the pre-fix baseline is `ghostfix2-report.json`: secured, 8 builds, 90 gold panned, hp 92/100), proving the change removed the exploit and not the map.
4. `npx playwright test e2e/m1-05-sentry-beacon-build.spec.ts e2e/task-025-bandits-dont-swim.spec.ts e2e/e1-night-shift.spec.ts` green — these are the suites that encode river truth.
5. Zero console/page errors on all boots; desktop and 390 px.

## FIREWALL
TOUCH-ONLY: `assets/contracts/epoch-1-frontier/manifest.json` (the one boolean) + whatever e2e assertion is added to lock it.
NO: `src/world/Terrain.ts` (the gate logic is correct — it is the datum that is wrong) · `Balance.ts` · other epochs' manifests (E10 sets the same flag for its own reasons — leave it).
