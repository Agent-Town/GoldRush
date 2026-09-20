# Review: relay-valley-winnable — the claim grit; Relay Valley secures wave 20 (scratch worktree, Claude Opus 5 implementer, attended drain 2026-09-06 morning)

**Slice/branch/tip:** `relay-valley-winnable` · `fix/relay-valley-winnable` · commits `202ede238`, `af2d7b9ba`, `b2415c086` on base `0a120edd3` · merged to main: see the ledger row (first-parent merge).
**Verdict:** MERGED. The master's preference order was worked in order and measured: (a) a heal reach and (b) an earlier heal card were built, measured and reverted (neither crosses wave 18); (c) a per-contract hero grit, `twist.hero.maxHpBonus = 300` on `e7-relay-valley` only, is the first lever that secures wave 20, and it is landed. The blocker's "80 seconds of HP" was wrong in kind: at wave 18 the board holds 57 live enemies, 37 of them thieves, against one welded hero and one turret, and the hero loses its whole pool inside one wave; three unrelated levers all stop at wave 18 and only hit points cross wave 19 (F-RVW-5).

## What it does
`contractHeroMaxHpBonus` (`src/meta/ContractFamilies.ts:2613-2667`, `validateContractHero`, `twist.hero` in `AUTHORED_TWIST_KEYS`), one read site per engine (`src/game/Game.ts:9434`, `src/sim/HeadlessContractSim.ts:2672`), `Balance.hero.maxHp` untouched; the `contract_hero_grit` mechanics rule (`MechanicsManifest.ts:814`) and the briefing rule on the card; four lines on the contract row. F-RVW-1 cured in the landed code: `applyProgressionStats`'s clamp re-reads any bonus added outside `maxHpBonus` on every stat change and compounds (a +70 probe reached a 1990 ceiling by wave 20); the grit is subtracted inside the clamp and added back outside.

## Evidence
| Gate | Where | Result |
|---|---|---|
| Baseline, the rider's `ctrl-v3` verbatim | worktree | wave 15, t = 460.333 s, 40 g, 537 kills, tape `fnv1a32:f9866fc8`, identical to heat 12's promoted attempt; hero 18.2 → 0 of 175 between 453.8 and 460.3 s; 21 draft offers, zero fillers, `field_dressing` never eligible |
| Proof, the same controller unmodified | worktree | secures wave 20 at t = 600.000 s, 90 g, 749 kills, 82 calls, tape `fnv1a32:bf2ad127`, +139.667 s past the death point, hero never below 90.6 hp; byte-identical to the +300 env-var probe |
| Bisection | worktree | +225 dies at 579.4 s, +250 secures with 10.6 hp (a knife edge), +300 with 90.6, +400 with 242.2: 300 is priced, not tuned |
| Floors | worktree, `null-floor-anchors.mjs --check` | exactly this contract's two rows moved and still LOSE (`-01` w2/79.3 s → w7/231.4 s, `-02` w2/79.5 s → w4/140.6 s), re-pinned; everything else byte-identical (the eraStamp aside) |
| Guards | worktree | new `contract-hero-grit-override` 6/6 (one reader both engines, no ratchet under 10 idle re-syncs and 3 plating stacks, 3 control contracts unchanged, card-vs-engine drift, 9 malformed grits refused, `Balance.hero.maxHp` still 100); the six named 63/63; `law-pointer-guard.mjs` PASS (60 pointers, every edit in the four heavily cited files rides an existing line); `no-emdash` 1/1; tsc clean; build green |
| e2e | worktree, own port 5306, both projects | `e7-playbook-rows` + `e7-signal-systems` + `e7-roster` 22 passed; `e7-boss` + `board-gating-and-profiles` 12 passed; `e7-dead-band-suppression` + `e7-echo-canyon-mirror` + `ss-08-e7-beats` + `terrain3d-registry` 31 passed, 1 skipped; plain-boot card at both viewports (the 390px HUD shows HP 400/400), zero console errors |
| Left red on purpose | worktree | `er01-e7-census.spec.ts:105` pins `EXPECTED_RULES['e7-relay-valley'] = ['build_zones']`; publishing the rule adds `contract_hero_grit` (F-RVW-3): the drain re-points that one line with the reason; `:326`'s `e7-echo-canyon` Three.js double-import warning is pre-existing on a pristine tree (F-RVW-4) |
| Engine era | worktree hash `2a6f4a17…` | re-measured on the merged tree by the drain and pinned there |
| Attended on the merged tree | see the drain commit and the ledger row | tsc, the guards, build, `e7-relay-valley`'s suites and `er01-e7-census` at one worker on both projects |

Screenshots and the ladder: `artifacts/relay-valley-winnable/` (`MEASUREMENT.md`, `card-desktop-chrome.png`, `card-mobile-chrome.png`, `card-shots.log`).

## Merge classification
Base `0a120edd3`; main moved by the Canyon Works levers, the squall, the gold cure, the portraits and the story gaps, some touching `Game.ts`, `HeadlessContractSim.ts`, `ContractFamilies.ts`, `MechanicsManifest.ts`, `package.json` at other sites. `assets/contracts/epoch-7-signal/contracts.json` (four lines), `assets/contracts/null-floors.json` (two rows), the four engine files, `package.json`: LANE-TOUCHED, unioned where main moved. `scripts/contract-hero-grit-override.test.mjs`, `artifacts/relay-valley-winnable/*`: NEW. `tasks/BACKLOG.md`: MAIN-MOVED, unioned. Attended in the landing commit: `e2e/er01-e7-census.spec.ts:105` re-pointed (F-RVW-3).

## Findings
- **F-RVW-5 (blocker corrected):** not attrition but a wave-18 wall of 57 enemies (37 thieves) on one welded hero; only hit points cross it.
- **F-RVW-6 (structural, OWNER'S DESK):** the hero is welded because no verb in the agent union moves it (`MOVE_TO`/`HOLD` move the Prospector, `src/agent/StandingOrders.ts:351`). A human kites; a rider cannot. That asymmetry, not this map, is why "no building reaches the hero" is fatal; a hero-move verb is a design decision.
- **F-RVW-7 (measured):** the buildZones are the constraint (`Terrain.isBuildable`, `src/world/Terrain.ts:238-240`) but no buildable in the registry heals a hero; only two cards do. Lever (a) can only ever buy defence (+96.5 s at best).
- **F-RVW-2 (module hazard, documented in code):** `ContractFamilies.ts` validates the bundle at top level (`:1799`), so a `const` at the file's end is still in TDZ when the door first runs; bounds in file-end validators must be literals (`:2632`).
- **F-RVW-3 / F-RVW-4:** the census spec's rule pin (re-pointed by the drain) and its pre-existing order-dependent Three.js warning.
