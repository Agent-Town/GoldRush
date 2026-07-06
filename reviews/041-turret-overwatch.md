# Review — 041 turret-overwatch (main-slot drain, s87 fire)

**Verdict: PASS — merged to main.**

## What landed
Turrets now shoot over their own palisades (owner-confirmed bug: "signal towers can't shoot over palisades"). Implementation (Codex, main slot):
- `BuildSystem.hasLineOfSight` → repurposed as `firingLineCrossesPalisade` (inverted logic; the turret shooter was its only consumer). The turret handle no longer sets `canTarget`, so turrets **acquire targets regardless of intervening friendly palisades**. Enemy pathing/collision against palisades is untouched (walls still block enemies).
- Turret shots that cross a friendly palisade spawn as the existing `'lob'` (arc) projectile so the bolt visibly rainbows over the wall; clear lines stay flat `'bolt'`. `airTime` tuned so lob flight ≈ flat-bolt time at equal range (damage timing feel unchanged).
- `CombatSystem`: additive `projectileKind`/`airTime` handle plumbing + shot diagnostics (`shots{bolt,lob}`, `lastShotKind`, `lastShotOwnerId`). A dedicated `ownerId === 'turrets'` branch in blast-application applies damage to the **single closest enemy** in landing radius — preserving turret single-target damage semantics (no AoE splash added; damage math/range/rate unchanged).
- `Balance.projectile.turretLobMinAirTime` — additive knob only.

Firewall respected: no changes to damage math, fire rates, ranges, enemy behavior, palisade collision, or existing e2e assertions.

## Evidence
- `npx tsc --noEmit` — clean.
- `npm run build` — green (`built in 500ms`).
- **NEW `e2e/task-041-turret-overwatch.spec.ts` — 4/4 pass** (desktop + mobile): (a) turret behind a ford palisade line acquires through the wall and kills; (b) crossing shot reports kind `'lob'`, clear-line shot stays `'bolt'`; (c) beacons still fire flat bolts through palisades (byte-identical behavior).
- Adjacent regression: `m2-01-build-menu`, `m1-01-claim-jumpers-death`, `task-025-bandits-dont-swim`, `task-023-victory-palisade` — **42 passed** (both projects). Boot error assertions (zero console/page errors, desktop 1280 + mobile 390) pass inside every spec.

## Env exception (proof attached, NOT a blocker)
`task-023-victory-palisade.spec.ts:104` ("Bank Claim ends secured run and resets into a fresh claim") — 2 failures (`paused===false` after run reset, received `true`), both projects. **Pre-existing, unrelated to 041**: verified by reverting the 3 src files to HEAD (via `git show HEAD:<path>`) and re-running — the same 2 tests fail identically on clean HEAD. 041's src changes were restored afterward (diff verified byte-identical). This is a standing task-023 reset/pause defect, not a 041 regression → flagged for a future corrective; does not block this drain.

## Gate note
Gate ran on a scratch port (5211, temp `playwright.gate041.config.ts`) because the lane-c runner held 5188 (strictPort). Served main's working tree; temp config removed post-gate.
