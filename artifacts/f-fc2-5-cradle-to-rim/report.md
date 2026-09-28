# F-FC2-5 — the Far Side's probe recovery cradle moves to the recovery zone's rim and becomes solid

Owner ruling 2026-09-22, verbatim: **"F-FC2-5: lets move it"**, on the desk's recommendation
*"move the recovery point to the cradle's rim, then make it solid"*. Executed on the CRADLE's
side, because the recovery zone is also the E8 air crossing (`src/systems/E8SuitAirSystem.ts:264`):
moving the zone would move the crossing, its credits and the map's contract. Moving the mount
leaves every gameplay number untouched and puts the solid exactly where the ruling wants it.

Worktree `/Users/robin/Claude/Projects/wt-fc25` on `fix/f-fc2-5-cradle-to-rim` (cut from main at
`985e581dc`); store branch `fix/f-fc2-5` on `/Users/robin/Claude/Projects/GoldRush-assets` (cut
from the store's main at `d5e2552`). Dev server 5307 only; the store was clean on main at
pre-flight.

---

## 1. The mechanism, measured (scope 1)

**It is not what the desk item assumed.** The desk read "its footprint keeps the hero off the
point". What actually happens is that the hero **never takes a single step**.

`ProbeRecovery.zoneAt` is generous — the crater rect is x -14..14, z 38..52 with a 2.2 m `REACH`
slack, so anywhere in a 28 x 14 m rectangle recovers. The hero could not reach ANY of it, because
the failure is upstream of walking:

1. `Terrain.sample()` marks a point inside a landmark blocker **unwalkable**
   (`src/world/Terrain.ts:178`, padded by `Balance.hero.radius` 0.5 + 0.08 = 0.58).
2. `crossingRide`'s shuttle steers with `MOVE_HERO` to the **centre of the crossing zone**, which
   is `(0, 45)` — the cradle's old mount.
3. The `MOVE_HERO` executor checks the target's walkability **before it steers**
   (`src/agent/StandingOrders.ts:623`), so the order is refused outright:
   `UNREACHABLE_TERRAIN: MOVE_HERO target is outside walkable terrain.` `heroSteer` is never set
   and `heroOrderIntents()` returns `IDLE_INTENTS`.

Measured with the cradle restored at (0,45) (`with-cradle-0-45.json`, `refusal-with-cradle.txt`):
the hero sat on its start stake at **(0, -36) for all 47 decisions**, `movedBy` 0.000 every turn,
closest approach to the zone **74 m**; `recover` refused `probe-out-of-reach` **47 times**; the
crossing credited **0 of 4 required**; the run died unsecured at **wave 28** (860 100 ms, 335
kills). `Terrain.sample(0,45).walkable = false`; the unwalkable band at x = 0 was z 43..47.

Two controls ride the identical policy:

| Ride | hero reaches | recovered | crossing | outcome |
| --- | --- | --- | --- | --- |
| cradle solid at (0,45) | z -36 (never moves) | never | 0/4 | **not secured**, wave 28 |
| cradle absent (main today) | z 51.5 | decision 3 | complete 5/4 | **secured**, wave 20 |
| cradle solid at (0,50.5) | z 48.1 | decision 3 | complete 5/4 | **secured**, wave 20 |

So the answer to the master's question — *refused, stalled outside the rect, depenetrated
sideways, or something else* — is **refused, at the order gate, before any movement**. The
footprint did not block a walk; it made the walk's destination illegal, and the ride had no
fallback. (A human at the keys is not refused this way — they steer by hand — but they would walk
into the same solid sitting on the point.)

## 2. The move (scope 2)

**Final mount: `(0, 0, 50.5)`** — the position the master named, adopted unchanged. Same rotation
pi, same scale 1, `contractIds: ["e8-far-side"]`, footprint unchanged at 5.04 x 3.6.

* The footprint spans **z 48.7..52.3**, straddling the zone's north rim at z 52, and x +/-2.52.
* **Clearance:** `far-horizon-listening-post` spans z 54.488..57.512 -> **2.188 m** of daylight.
  The visual bodies are further apart than the footprints: cradle bounds z 48.00..53.00, post
  bounds z 53.90..58.10, **0.90 m** clear, no intersection (`walk-proof.json`, cycle bodies).
* **Walkable ground, not crater wall:** all **25 of 25** sampled footprint cells at (0, 50.5) are
  walkable (`terrain-under-mount.txt`).
* **No float or sink, no y delta:** the pack's `landmarkMountSpace` defines `positionY` as "local
  offset added to `Terrain.visualY` at the mount X/Z", so y = 0 grounds the body wherever it
  stands. The sculpt at the new mount is as flat as the old one — `visualY` span **0.052 m**
  across the footprint at (0,50.5) versus **0.049 m** at (0,45) — so **y stays 0** and no
  adjustment was needed. (The ground itself is 0.084 m lower there, which the convention absorbs.)
* **Why the NORTH rim and not the south:** the hero starts at `far-side-landing-stake` (0, -36)
  and walks in from the south. A south-rim mount (approx (0, 36.2), also flat and walkable —
  measured) would stand *in the approach*: the ride's `MOVE_HERO` to (0,45) would be accepted, the
  hero has no pathfinder, and it would walk straight into the cradle's south face at z ~ 33.9 and
  stall outside the rect until `UNREACHABLE_APPROACH` — reproducing the very failure this cures
  with a different refusal code. The north rim is behind the point, so the walk in is clear and
  the body still reads as the thing the probe sits in.

Mirrored in `far-side-landmark-pack-contract.json`, `far-side-terrain-contract.json` and
`landmark-collision-contract.json`; the `heldMounts` entry removed (`{}`, the store's convention
for empty) and `additionalSolids` amended with the ruling. Edited **in place, values only** —
**12 changed lines** for the mount move across both contracts and **17 insertions, 0 deletions**
for the registry entry (F-FC2-6: the drain's rewrite churned 113 lines for three edits).

**No `src/` edit was needed.** `LandmarkCollision.ts:1` imports the registry JSON through the
`assets/pilots` symlink and `Terrain3dClaimPilot.ts:30` imports `far-side-terrain-contract.json`
the same way, so both the blocker and the rendered body followed the store edit. Astra's run 7 was
right that the tables compose.

## 3. Proofs (scope 3)

### The judge — the crossing test, UNMODIFIED
`scripts/e8-remaining-maps.test.mjs` `tests 10 / pass 10 / fail 0` (`logs/e8-remaining-maps.log`).
`:512` "the secure turns on the crossing: same seed, same orders, two latches" is **green**:
latch closed -> refused at wave 22; latch open -> `{"secured":true,"waves":20,"timeMs":600000,
"kills":172,"eventLogHash":"fnv1a32:83d1cf7e"}`, `probeRecovery.recovered` true. Not one number in
that file was touched.

### The walk probes (run 7's shape, plus the one run 7 did not do)
`probe/walk-proof.mjs`, adapted from `artifacts/sol/map-art-campaign-2/run-7/walk-proof.mjs`
(port 5307, live registry, recovery probe added). `walk-proof.json`, both widths:

| Check | 1280 | 390 |
| --- | --- | --- |
| spawn walkable / reachable cells | yes / 63 126 | yes / 63 126 |
| own solids probed | 4 | 4 |
| faces stopped (4 per body, 16 total) | all, boundary distance **0.0088 m** | same |
| outside all blockers after each face | yes | yes |
| embedded hero depenetrates | 4/4 | 4/4 |
| published destinations reachable | **10 / 10** | **10 / 10** |
| console / page errors | 0 | 0 |

The cradle's own four faces stop the hero at 0.0088 m — including the **north** face, whose probe
starts at z 53.48 in the 1.03 m padded corridor between the cradle and the listening post.

**The recovery probe (new).** The hero is teleported to the start stake and walked north on the
keys (`KeyS` — measured, not assumed: `KeyW` is the -z key in the face probes) for 14 s of sim:
(0, -36) -> **(0, 45.117)**, the recovery zone's centre. `ProbeRecovery.inReach` is **true** there
and `recover` returns
`{ok: true, zoneId: "listening-probe-crater", fragment: "First tower up. A wrong number answered,
confused and kind. The line stays open."}`, `playbackCount` 1, `refusals` 0/0. The navigation flood
also now records `centreReachable` for every zone — true for both `listening-probe-recovery` and
`listening-probe-crater`, and the nearest reachable cell to the crater centre **is the centre**.
This is the row that would have caught F-FC2-5 in run 7.

### Mount / dispose
**Six cycles** (3 per width): each retains **10 bodies**, `terrain3dPilotLandmarkSkipped` 0,
`remainingSceneChildren` 0, and every body's x/z, rotation and scale equal the registry's —
the cradle at `[0, 50.5]`, rotation `[0, 3.1416, 0]`, scale `[1,1,1]`.

### Plain boot and boards
`probe/plain-board.mjs`, plain boot (no `?debug`, `__GR_TEST__` undefined, launched through the
game's own `gr.contract.launch.v1` key): `activeId e8-far-side`, **10 landmarks, 0 skipped, state
ready, 0 console and 0 page errors** at 1280 and 390 (`plain-board-after.json`). The before state
(the store checked out at main for the capture, then restored) reads **9 landmarks** — the
difference is the cradle.

Boards in `shots/`: `before-board-{1280,390}.png` show the recovery point as bare regolith;
`after-board-{1280,390}.png` show the hero standing on the point with the cradle and its plate at
the rim just beyond. Per-body walk shots `walk-*-{1280,390}.png`, recovery shots
`recovery-point-{1280,390}.png`.

### Null floors — NOT re-recorded
`node scripts/null-floor-anchors.mjs --check` ->
**`83 of 83 null floors match assets/contracts/null-floors.json (303.3s).`**
The Far Side floor did **not** move: the floor rides idle, the hero never leaves its stake, and the
rim mount does not perturb that seed's enemy paths. (The log's `eraStamp` line — "pin taken at
`df5261526`, this tree is `985e581dc`" — is marked PROVENANCE ONLY by the tool itself, not a floor
difference.) The floors file was not touched; the drain owns it.

### Same-game audit — unchanged
`node scripts/same-game-audit.mjs` run on both trees: **byte-identical** (`diff` rc 0, 0 lines;
`logs/same-game-audit-base.md` vs `logs/same-game-audit-candidate.md`).
`agent-exceeds 0 / agent-lacks 511 / equal 1252 / not-offered 0 / divergence rows 511 / total
measured rows 1763` on base and candidate alike.

## 4. Self-check battery

| Gate | Result |
| --- | --- |
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | rc 0 |
| `node --test landmark-collision / e8-remaining-maps / glb-contract-guard / landmark-walk-surfaces` | `tests 40 / pass 40 / fail 0` (`logs/node-guards-4.log`) |
| e2e `e8-far-side-probe / e8-remaining-maps-parity / landmark-collision / fort-landmark-collision`, both projects, `--workers=1` | **26 passed (2.9m)**, 0 failed (`logs/e2e.log`) |
| `map-landmark-loading-check.mjs` | rc 0, 8/8 PASS |
| `map-landmark-repeat-check.mjs` | rc 0, expected 9 / actual 9, distinct, no shared materials, 0 errors |
| plain boot `e8-far-side` @ 1280 and 390 | 0 console, 0 page errors |
| null floors | 83/83 match |
| same-game audit | byte-identical to base |

## 5. Adaptations from the master, and why

1. **`npm run build` ran after the store edit, not before it.** The pre-flight's baseline build was
   skipped; tsc and build were both run green on the finished tree instead. The edits are data-only
   JSON in the store plus one test comment, fully reverted by git, so a red would have been
   attributable either way.
2. **`map-landmark-loading-check.mjs` is not parameterisable by map** — it is hardcoded to the
   Deepwater family and `the-claim` (`scripts/map-landmark-loading-check.mjs:11,15`). It was run
   green as a fleet regression; the Far Side's own equivalent assertions (`activeId`,
   `terrain3dPilotLandmarks` 10, `...Skipped` 0, `state ready`) are covered by the mount/dispose
   cycles and the plain boot above.
3. **The recovery probe asserts `ProbeRecovery.inReach` + `recover` off the live run** rather than
   a browser `CONTEXT_ACTION`: `__GR_TEST__` exposes `teleport`/`advanceSim`, not the order verb.
   The headless half of the same gate is the crossing test itself, which is green.
4. **The north-walking key was measured, not assumed.** The first run of the recovery probe used
   `KeyW` (the face probes' +z key) and walked the hero to the map's south edge at z -63.5.
5. **Gate runs rewrote three other tasks' artifact directories** (`artifacts/fort-solidity/`,
   `artifacts/lane-landmark-collision/`, `artifacts/map-art-repairs-20260908/deepwater/` — the e2e
   specs and the loading check write their screenshots there). Those are outside this task's
   firewall, so they were restored with `git checkout --`; only `artifacts/f-fc2-5-cradle-to-rim/`
   and `scripts/landmark-collision.test.mjs` are committed here.

## 6. Commits

| Repo | Branch | Commit |
| --- | --- | --- |
| store `GoldRush-assets` | `fix/f-fc2-5` | `aee63ba` — the mount move, the registry entry, the interlock text |
| code `wt-fc25` | `fix/f-fc2-5-cradle-to-rim` | `1e54f63e1` — the union test's Far Side row and comment; evidence commit follows |

The store was returned to `main` at the end of the task; the work stays on `fix/f-fc2-5` for the
drain.
