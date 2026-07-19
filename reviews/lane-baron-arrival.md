# reviews/lane-baron-arrival.md — the Baron comes from the NORTH + the palisade tax ends

- **Slice:** lane-baron-arrival (E1 Baron playtest corrective)
- **Branch / tip:** `lane/perf` @ `49679628`
- **Merge commit:** `691bc9e0` (`git merge --no-ff lane/perf` onto clean main `1e9ffa1c`)
- **Base:** `c988d704` (fresh — 3 main commits back; main moved NONE of the 7 touched files since base → clean apply, no 3-way)
- **Drained by:** s744 fire, 2026-07-20 ~02:50 local

## Verdict: PASS — merged.

## What it does (one paragraph)
Implements OWNER PLAYTEST 2026-07-19 (verbatim): *"he should come from the north as that is where his castle/fort is. I destroy the prebuilt pallisades each game as otherwise my Prospector spends all my gold to repair them. repairing is great, just these palisades are not needed."* Two fixes on the Claim-Jumper Baron contract: (1) the boss-arrival story signal + banner now carry the spawn edge (`baron.spawnEdge`), so the Baron and his announced arrival read from the NORTH (his fort); the banner threads `edge` through `queueBaronBanner`/`showBaronBanner` into `uiBridge.announce`. (2) the prebuilt palisades are removed from the e1-baron contract fixtures, and `applyMetaProgress` now honours `tileParams.prebuiltPalisades === false` so the Territory-tier auto-placement no longer conscripts the Prospector's repair budget on that contract. Agent repair logic is untouched (repairing stays great) — only the unwanted prebuilts are gone.

## Evidence
| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 2.82s |
| slice spec `e2e/lane-baron-arrival.spec.ts` | **4/4 passed** (desktop + mobile), zero console/page errors — scratch cfg `playwright.s744-scratch.config.ts` port 5244, `--workers=1` |
| adjacent `e2e/e1-baron.spec.ts` | 14/22 (both projects) — 8 reds ALL fingerprinted PRE-EXISTING (see F-1) |
| boot probe | slice spec boots the e1-baron contract plain (via its test door) desktop 1280×800 + mobile 390×844, asserts no palisade tax + north arrival + zero console |
| perf | no new rendering — the change REMOVES entities (8 prebuilt palisades) and threads a data field; no draw-call/frame regression risk |

The two slice assertions are the player-facing proof (Mistake #10): "Baron boot has no palisade tax and spends no repair gold" + "Baron and his arrival card come from the north".

## Merge classification (base `c988d704`)
`git diff c988d704 main -- <all 7 files>` = EMPTY → main byte-identical to base for every touched file. Clean apply, no conflicts.

| File | Class | Note |
|---|---|---|
| `assets/contracts/epoch-1-frontier/contracts.json` | LANE-TOUCHED | +2: remove Baron prebuilts, add north spawnEdge |
| `src/game/Game.ts` | LANE-TOUCHED | banner `edge` threading + `prebuiltPalisades===false` guard in `applyMetaProgress` |
| `src/systems/WaveSystem.ts` | LANE-TOUCHED | +1 |
| `src/meta/ContractFamilies.ts` | LANE-TOUCHED | +2 |
| `src/story/signals.ts` | LANE-TOUCHED | boss-arrival signal carries `edge` |
| `e2e/e1-baron.spec.ts` | LANE-TOUCHED | banner-edge assertion `'north'` (+6) |
| `e2e/lane-baron-arrival.spec.ts` | NEW | +72, the arrival/tax coverage |

## Findings
- **F-1 (non-blocking, PROVEN pre-existing):** `e2e/e1-baron.spec.ts` has 8 stale reds (4 cases × 2 projects): `:331` board-locks/profile-medal (board-copy), `:387` taunt-waves manifest (`toMatchObject` expects old `unlock:"science-complete"`, app returns `"science-complete+2-secured"`), `:464` wave-20 "stable seed data" (`toBeCloseTo` expects `35564.60`, app produces `53346.89`), `:617` art-fallback (art-readiness). **Fingerprint (decisive):** reverted all 6 changed src/data/spec files to pre-merge main `1e9ffa1c` in-tree and re-ran `:464` → **identical failure, identical received value `53346.89295292784`** → the palisade removal does NOT perturb the wave-20 seed; the reds are stale snapshots from older boss/board/art changes, unaffected by this slice. The runner's own log documented the same 14/22 baseline. Owner scope was e1-baron contract data only; these expectations were not rewritten (out of firewall). A future e1-baron snapshot-refresh corrective should re-bless the seed float + `+2-secured` unlock string + art-fallback + medal copy — NOT this fire.
- **F-2 (audit, owner-visible — the prebuilt-palisade tax pattern across maps):** the runner audited every e1 contract's prebuilt palisades and changed ONLY the Baron per owner scope. The same repair-tax risk exists on the other maps if the Prospector auto-repairs them:

  | Contract | Prebuilts w/ Territory I | Decision |
  |---|---:|---|
  | The Claim | 8 inherited palisades | Keep (outside owner scope) — same tax risk if damaged |
  | Dry Gulch | 8 inherited palisades | Keep — same risk flagged |
  | Night Shift | 8 palisades + 7 authored wrecked lanterns | Keep — lanterns are intentional teaching fixtures; ring risk flagged |
  | Twin Banks | 8 inherited palisades | Keep — same risk flagged |
  | Claim-Jumper Baron | 8 → **0** | **Remove** — owner directive |

  → OWNER'S DESK item: if the palisade repair-tax bothers the owner on the other four maps too, a follow-up slice removes them per the same ruling. Not assumed — flagged for owner.
