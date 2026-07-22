# Review — RF-02 The Trail Guide

**Slice:** RF-02 (E1 Frontier Edition — the greenhorn first-run teaching track)
**Branch/tip:** lane/m4 @ `e5bd6260` (runner(lane-b): lane-trail-guide.md)
**Base:** `d02a7dc0` · **Merge-base with main:** `d02a7dc0` (exact — clean 3-way)
**Merge:** `9c2c30ea` (real 3-way `--no-ff` onto clean main @ `e703125c`)
**Verdict:** ✅ MERGED — gates green, both overlapping features coexist, canon clean.

## What it does
A first-run teaching layer for greenhorns. Eight barks (`src/story/trailGuide.ts`,
WD-grammar shaped) each fire **once per profile**, era-1 warm voice, dismiss on any input,
never blocking play. Shown as a `Guide:` line prepended to the Prospector receipt feed
(`Game.agentUiState`) and, for the town beat, a `returnGuideLine` in `TownScene`. Veterans
(profiles without `trailGuide:true`) see none. First boot asks the greenhorn question once
(`StartMenu` / profile-title path) and sets the difficulty preset.

Triggers wired: `first-run` (Game.ts:2049), `first-wave` on wave===1 (739), `first-nugget`
(2408), `first-gold` (2412), `first-hurt` (1412), `first-level` (7224), `first-secured`
(secureBarkForRun), `first-return` (TownScene.ts:552). All eight reachable in normal play.

## Merge classification (per file)
Merge-base is exactly the lane base `d02a7dc0`, so this is a textbook 3-way. main moved
**Game.ts** (+5, RF-03b desk `openComplaintDesk`/AssayOffice) and **TownScene.ts** (+12, desk
door) since the base; the lane added its trail-guide hooks in disjoint regions.

| File | Class | Resolution |
|------|-------|-----------|
| src/game/Game.ts | BOTH MOVED | git 3-way auto-merged clean; verified `speakTrailGuide`×7 **and** AssayOffice/ComplaintDesk×12 both present post-merge |
| src/town/TownScene.ts | BOTH MOVED | git 3-way auto-merged clean; `trailGuide`×2 **and** assay-office×7 both present |
| src/story/trailGuide.ts | NEW (lane-only) | added |
| e2e/trail-guide.spec.ts | NEW (lane-only) | added |
| ProfileManager.ts, ProfileStorage.ts, WaveSystem.ts, Hud.ts, StartMenu.ts, theme.css | LANE-TOUCHED-ONLY | taken from lane |

No conflicts. No MAIN-MOVED file was clobbered.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean (0 errors) |
| `npm run build` | green (built in 1.11s) |
| trail-guide.spec.ts (own spec) | **8/8** desktop-chrome + mobile-chrome (390px) |
| — zero console/page errors | asserted in all 4 tests (`errors` toEqual `{[],[]}`) = boot probe |
| bug-office-desk.spec.ts (adjacent, shares Game.ts+TownScene.ts) | **4/4** both projects — desk intact |
| Render proof | spec asserts `guideHints` DOM (toHaveLength 3 fresh / [] veteran) — feature renders; no new draw calls (receipt-feed string only, no perf risk) |

## Findings
- **F-903-1 (non-blocking, owner copy review):** the eight bark lines are tunable data. Full
  script recorded below + in the gazette owner-choice note. No canon issue — frontier voice,
  no firearms, no token/price talk, never lectures.
- No blocking findings.

## Adjacent debt (unchanged, NOT trail-guide-caused)
The F-902-1/F-902-2 assay-bench-visibility reds (task-037, lane-c-activations, town-assay-office-
blender) are pre-existing/intended-supersession from the RF-03b desk drain; trail-guide touches
none of that surface. Still owner/attended-gated per BACKLOG standing order.

## The bark script (owner review — copy is tunable data)
1. first-run: "Take the claim at your own pace. Move with the trail; stand by a river glint and your pan will find the seam."
2. first-nugget: "There is your first color. Raise a sluice beside water and it will keep washing while your boots are elsewhere."
3. first-gold: "Gold in the pouch can raise the claim. Open Build and set timber where it will do honest work."
4. first-wave: "That horn marks their road in. Walls turn the rush; a turret watches the gap you leave."
5. first-hurt: "You took a hard knock. Catch your breath when you need it; the claim will hold still."
6. first-level: "The trail has taught you something. Pick the card that suits the claim you mean to keep."
7. first-secured: "The claim is secured; that win is banked. Ride home now, or stay for the Rush and wager the trail ahead."
8. first-return: "Welcome back. The board keeps every open trail; choose the next card when your outfit is ready."
