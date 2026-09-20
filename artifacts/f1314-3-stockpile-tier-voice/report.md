# F-1314-3 / F-1314-4 — Stockpile tier voice

## Scope 1 trace (recorded before implementation)

`tierGain` does **not** reach a player. `BuildSystem.upgradeCandidate` assigns its result only to
`UpgradeCandidate.gain` at `src/systems/BuildSystem.ts:1931`. The candidate reaches
`BuildingContextPrompt.update` through `Game.updateBuildingContextCandidates`
(`src/game/Game.ts:5898-5900`), but the prompt renders only the candidate's tier, cost, availability,
reason, and maximum tier (`src/ui/BuildingContextPrompt.ts:57-104`). Repository search finds no read
of `UpgradeCandidate.gain`. Per scope 1, `tierGain` remains unchanged.

## Implementation

Four decision points changed, all inside the two allowed helpers:

1. `BuildSystem.upgradeFloatText` now has an explicit `stockpile` branch
   (`src/systems/BuildSystem.ts:2000`).
2. Its existing turret result is now an explicit `turret` branch (`:2001`).
3. Its former silent turret fallback is now a compile-time exhaustive `never` check (`:2002`).
4. `buildableTierEffectLine` now has a `stockpile` branch
   (`src/game/buildables.ts:192-195`) that reads `Balance.stockpile.capBonus` and the selected
   `Balance.tiers.stockpile` rung, then uses `Math.round` like the live cap path.

No branch was added to `tierGain`: its result is dead player copy, as traced above. No Balance value,
economy write, cap path, registry structure, or unrelated assertion changed.

New player strings, verbatim:

- `Stockpile Yard II - the yard holds more gold`
- `T2: +240 gold capacity` at the current Balance-backed Tier 2 rung

## Automated evidence

| Check | Result |
| --- | --- |
| Focused new case, both projects | `2 passed` — desktop Chrome and mobile Chrome |
| Full `e2e/bt-01-tiers.spec.ts`, one worker | New case green; `20 passed`, `4 failed`, with only the two known-red cases below in both projects |
| Adjacent menu + encyclopedia coverage | `24 passed` across `m2-01-build-menu.spec.ts` and derived `en-02-e1-coverage.spec.ts` |
| Node guards | `203 passed`, `0 failed` |
| Plain boot, desktop + mobile | `2 passed`, zero console/page errors |
| TypeScript | `npx tsc --noEmit` clean |
| Production build | `npm run build` green; existing chunk-size advisory only |
| Playwright collection | `2454` to `2456` tests across `345` files: one added case times two projects |

Expected pre-existing reds, unchanged and not repaired:

- `Enter tears down after clicking upgrade instead of re-clicking the focused upgrade button`
- `insufficient gold leaves tier and gold unchanged`

## Mistake #10 — plain-boot player path

The test uses debug controls only to seed a resumable Tier 1 yard, persists that snapshot, then navigates to
`/` and clicks the normal **Continue** control. Before any acceptance assertion it verifies that the URL has
no `debug` query parameter. The player enters build mode, approaches the Stockpile Yard, and upgrades it.
The upgrade text emits above the yard, while opening the build menu and highlighting Stockpile Yard shows the
Balance-backed `T2: +240 gold capacity` line. All four screenshots below come from that plain resumed boot:

- `desktop-chrome-float.png`
- `desktop-chrome-menu.png`
- `mobile-chrome-float.png`
- `mobile-chrome-menu.png`

## Firewalled finding

The exact upgrade string is emitted and asserted through `lastFloatText`, and the nearby context prompt names
`Stockpile Yard · Tier 2`. However, the existing float renderer uses a fixed 192 px canvas and 64 px font
(`src/systems/Vfx.ts:142,158`), so long upgrade labels are visibly clipped in both float screenshots. An
independent uncommitted review surfaced the same concern. Fixing the renderer would require touching a
forbidden file, so this slice records the issue and leaves it unchanged.
