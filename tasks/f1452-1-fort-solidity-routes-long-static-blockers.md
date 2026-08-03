CODEX: model=gpt-5.6-sol effort=high
# f1452-1 — F-BW-19 successor: the fort's walls say no to the hero AND enemies walk around them
**FIRE-AUTHORED (attended review welcome)** — s1452, 2026-08-04

ROLE: lane implementer. WORKDIR: this lane worktree (lane-c). One task, firewalled.

## READ FIRST (paths, not memory — read these before writing a line)
- `artifacts/fort-solidity/STOP-report.md` — the predecessor's STOP. Its census table and its
  measured stall coordinates are your starting evidence. **Read the whole file.**
- `tasks/done/stopped-s1439-100bafe7-20260803-180134-lane-baron-fort-solidity.md` — the master that
  stopped. **It is NOT to be re-run**; its stop was CORRECT.
- `src/world/LandmarkCollision.ts` — the registry loader. One function builds every landmark AABB.
- `assets/pilots/map-rebuild-spike/landmark-collision-contract.json` — the registry data.
- `src/systems/BuildSystem.ts` — `palisadeRoute` and its three private helpers.
- `src/entities/Enemy.ts` — `updateGapFlow` (routing) and `resolveBlocker` (collision response).
- `src/game/Game.ts` — the two lines that decide who receives which blockers.

## WHY (owner verbatim, gate walk 2026-08-03)

> "I was also able to walk through its fortress walls"

The Baron's fort landmarks have no collision. The obvious cure — add the missing registry entries —
was attempted at s1439 and **STOPPED, correctly**, because it trades a walk-through wall for a
**permanent enemy stall**. The STOP measured it: a full-body `fortified_far_bank` rectangle settled an
enemy at ~`(6.675, -13.080)` against a target at `(0, -5.8)` with a stationary run **exceeding 1,400
fixed ticks**, and the honest component split still oscillated around ~`(2.35, -13.01)`.

## THE MECHANISM, RE-DERIVED AT s1452 BY READING THE CODE (do not take this on trust — verify each
## line below before you rely on it; they are quoted so you can grep them, and every one was proved
## to match exactly once on main at authoring time)

The defect is an **asymmetry between collision and routing**, and it is four lines wide.

1. Enemies already receive every registered landmark as a collider. `Game.ts` passes them in:
   `[...this.buildSystem.palisadeBlockers, ...this.heroBlockers()],`
   and `heroBlockers()` is
   `return [...this.e6TileConsumers.blockers, ...Terrain.landmarkBlockers()];`
   So the moment a landmark gains a registry entry it becomes solid for **enemies as well as the
   hero**. There is no hero-only path today.
2. Enemy **collision response** to any such blocker is local slide + depenetration:
   `private resolveBlocker(blocker: PalisadeBlocker, stepDistance: number, moveTarget: THREE.Vector3): void {`
3. Enemy **routing** — the part that produces a waypoint around a long obstacle — asks:
   `const route = context.palisadeRoute(this.group.position, target, clearance);`
4. …and that route scans **player-built palisades only**:
   `palisadeRoute(from: THREE.Vector3, to: THREE.Vector3, clearance: number): PalisadeRoute | null {`
   iterates `this.targets.palisade`, as do its three helpers (`pointInsidePalisade`,
   `palisadeComponent`, `palisadeOpeningDistances`). Landmarks are **structurally invisible** to it.
   Note the contrast one screen above, where the *collision* getter deliberately admits static
   footprints: `if (footprint.active && footprint.blocksRouting !== false) this.filteredBlockers.push(footprint);`

**So a long landmark wall is a thing enemies can bump into and slide along, but never a thing they can
plan around.** Short bodies resolve by sliding off an end; a 29.8 m fort wall does not. That is the
stall, and it is why registry entries alone are a regression, not a fix.

## ⚠️ THE CONSTRAINT THAT WILL BITE YOU IF YOU DO NOT PLAN FOR IT

`PalisadeRoute.blocker` is **consumed as a gnaw target**:
`if (route.open || route.blocker !== this.gnawTarget || !this.isBuildingValid(this.gnawTarget)) {`
Wreckers latch onto `route.blocker`, check its HP, and chew it down. A `LandmarkBlocker` is
`{ id, x, z, halfX, halfZ }` — it has **no `hp`, no `family`, no `position`** and is not a building.

**A static landmark must therefore be able to produce a WAYPOINT without becoming a GNAW TARGET.**
Design the route result so that consumers can tell the two apart (an added field, a nullable
`blocker`, a discriminated result — your call, argue it in the report). Do **not** make landmarks
gnawable to make the types line up.

🚫 **Whether enemies may ever damage or siege a landmark fort is an OWNER/CANON question and is OUT OF
SCOPE. Report it, do not decide it.** If your design forces the question, STOP and say so.

## SCOPE (in this order — 1 and 2 are the task; 3 is the point of the whole thing)

1. **Give the route graph a static-blocker source.** Long static bodies must yield a waypoint that
   takes an enemy around the end of the wall, the same way a player palisade run does. Reuse the
   existing component/opening-distance machinery rather than writing a second router if you can;
   if you cannot, say why in the report.
2. **Then, and only then, close the four registry gaps** the STOP census measured. Its footprints are
   already honest and measured from the mounted bodies — use them, do not re-derive from scratch, but
   do sanity-check each against the mount:
   | Landmark | Map | Footprint the STOP measured |
   |---|---|---|
   | `active_headframe` | The Claim | rect `3.168 × 2.016` |
   | `seized_headframe` | Baron | rect `3.168 × 2.016`, then authored mount scale `1.2` |
   | `fortified_far_bank` | Baron | five palisades `5.8 × 1.0` + two platforms `3.0 × 2.8` |
   | `siege_line` | Baron | five palisades `5.6 × 0.9` at the pack's authored rotations |
   The STOP's census also names what is **intentionally walkable** (`claim_stake`,
   `riparian_dressing_pack`, `floodplain_dressing_pack`, `seven_lantern_terraces`,
   `dark_rock_shoulders`, `central_ford`, `night_work_road`, `oxblood_banners`) — **do not make those
   solid.**
3. **Prove the stall is gone with the predecessor's own measurement, not with a green.** An e2e that
   spawns an enemy behind `fortified_far_bank` with a target across it and asserts it **reaches** the
   target (or at minimum that its longest stationary run stays far below the STOP's 1,400 fixed
   ticks). ⚠️ **This test must be shown to FAIL without your scope-1 change** — manufacture the
   regression by reverting scope 1 alone, record the red, restore. A test that passes both ways
   proves nothing about a stall, and a stall is exactly the defect that got the predecessor stopped.
4. **Never-trap + four-face walk probes** for each new registry entry, per the town census pattern in
   `reviews/town-store-collider.md` (MQ-3 law: solid AND never-trap — a hero standing inside at fix
   time must resolve OUT, not be sealed in).

## TOUCH-ONLY
- `src/systems/BuildSystem.ts` (the route graph and its private helpers)
- `src/entities/Enemy.ts` (only the routing seam — the call site and whatever the new result shape
  requires)
- `src/world/LandmarkCollision.ts` (only if a mechanism gap forces it; data first)
- `assets/pilots/map-rebuild-spike/landmark-collision-contract.json` (the four entries)
- up to two e2e specs (the stall regression + the walk/never-trap probes)
- `artifacts/fort-solidity/` for your evidence

## NO (firewall)
- ❌ **`blockerSlideDirection`** — main's version is s1445's control-proven F-BW-10 fix for the
  owner's *"opponents get stuck"*. Do not restore any archived variant of it (F-1446-3).
- ❌ landmark art, mounts, or `.glb` files · ❌ town colliders · ❌ fight/damage balance
- ❌ making landmarks gnawable or destructible (see the OUT OF SCOPE ruling above)
- ❌ making the walkable scenery in the STOP's census solid
- ❌ widening the hero's collision to compensate for an enemy routing gap, or vice versa
- ❌ any change to `playwright.config.ts` (do not add or ignore specs there)

## PRE-FLIGHT (LANE-SAFETY, run from the repo root of THIS lane worktree)
1. `git status --porcelain` — if any **tracked** file is dirty, STOP and report.
2. Confirm the seam you are about to edit is present, by content and not by line number. All eight
   must return exactly **1**; if any returns 0 the lane is stale — STOP and report, do not adapt:
   - `grep -c "\[\.\.\.this\.buildSystem\.palisadeBlockers, \.\.\.this\.heroBlockers()\]," src/game/Game.ts`
   - `grep -c "return \[\.\.\.this\.e6TileConsumers\.blockers, \.\.\.Terrain\.landmarkBlockers()\];" src/game/Game.ts`
   - `grep -c "palisadeRoute(from: THREE.Vector3, to: THREE.Vector3, clearance: number): PalisadeRoute | null {" src/systems/BuildSystem.ts`
   - `grep -c "if (footprint.active && footprint.blocksRouting !== false) this.filteredBlockers.push(footprint);" src/systems/BuildSystem.ts`
   - `grep -c "const route = context.palisadeRoute(this.group.position, target, clearance);" src/entities/Enemy.ts`
   - `grep -c "if (route.open || route.blocker !== this.gnawTarget || !this.isBuildingValid(this.gnawTarget)) {" src/entities/Enemy.ts`
   - `grep -c "private resolveBlocker(blocker: PalisadeBlocker, stepDistance: number, moveTarget: THREE.Vector3): void {" src/entities/Enemy.ts`
   - `grep -c "export function landmarkBlockersFor(contractId: string): LandmarkBlocker\[\] {" src/world/LandmarkCollision.ts`
3. Confirm `artifacts/fort-solidity/STOP-report.md` exists and is readable. If absent, STOP.

## SELF-CHECK (name the suites; run both projects; `--workers=1`)
- `npx tsc --noEmit` clean · `npm run build` green.
- The new stall regression spec, **plus its manufactured-red transcript** (scope 1 reverted → RED;
  restored → GREEN). Both transcripts in the report.
- The new walk/never-trap probe spec, desktop **and** mobile (390px).
- Baron suite + the E1 map suites (`e1-baron`, `e1-twin-banks`, `e1-dry-gulch`, `e1-night-shift`,
  `the-claim` — derive the exact filenames by grep, do not guess) green both projects, or each red
  fingerprint-matched to a KNOWN-RED with its inventory row quoted. ⚠️ `node scripts/red-inventory-lookup.mjs`
  answers this — but **`KNOWN-RED` is not exoneration** (F-1444-2): if your slice touches what the red
  touches, prove it on clean main too.
- `npx playwright test --project=desktop-chrome --project=mobile-chrome` zero console/page errors on a
  plain boot with no `?debug` (Mistake #10: where does the PLAYER see this?).
- Walk-probe screenshots into `artifacts/fort-solidity/`.

## FACTORY-CHURN EXCEPTION (F-1407-1)
`logs/dashboard.html`, `logs/.goal-tree.html`, `logs/factory-usage.json`, `logs/task-stats.jsonl` and
`logs/usage-history.jsonl` are written by the factory's own tooling while you work. If they are dirty,
that is **not** your change and **not** a pre-flight STOP — leave them alone and do not commit them.

READY-FOR-GATES + report: the routing design and why you chose it · the manufactured-red transcript
proving the stall test is load-bearing · the four registry entries with each footprint sanity-checked
against its mount · the walk/never-trap results · and anything you had to leave for the owner.
