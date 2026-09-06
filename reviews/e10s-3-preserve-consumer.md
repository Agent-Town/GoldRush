# Review: e10s-3-preserve-consumer — the Ember Shore's vent, warmth, stoke, loss and secure latch (E10S-3; lane-a worktree, Claude Opus 5 implementer, attended drain 2026-09-06 morning)

**Slice/branch/tip:** `e10s-3-preserve-consumer` · `feat/e10s-3-preserve` · commits `0f223898f`, `915a0b42e` on base `0c3188493` · merged to main: see the ledger row.
**Verdict:** MERGED, with the implementer's honesty-guard STOP recorded as the ladder's next rung rather than tuned past. The preserve consumer is in both engines: the `last-warm-vent` as structure-state (WARMTH 100, decaying only while the squall blows at the authored 4/s), STOKE as a targetless `CONTEXT_ACTION` (`{ action: 'stoke' }`, gold at `twist.emberShore.preserve.stoke.goldCost`), the LOSS terminal `vent_guttered`, the doubled mote pressure now APPLIED during the squall, and the secure latch (vent alight at the check AND one whole squall survived). Law 2 holds by measurement: idle dies at 93.0 s on both seeds, and it is the vent that ends the run, 19.5 s before the motes would have.

**F-E10S3-1, the stop:** 100 warmth ÷ 4/s = 25.0 s against a 25 s squall, so an unstoked vent reaches zero on the squall's last tick, and the contract declares `harvestAnchors: []` until E10S-4, so a run has no income (the public-verb ride measured `insufficient-gold: 2`, `already-warm: 4`, `stokes: 0`). With gold the vent IS kept: a stoke at 20 warmth carries it through and `objectiveMet` flips after one squall (the guard and the browser both prove it). The cure is the spec's own §3 "Anchors" (four cooling-vein anchors ARE the stoking economy): E10S-4.

## Evidence
| Gate | Where | Result |
|---|---|---|
| State table, both seeds | worktree | calm 100 / telegraph 100 / squall decaying from tick 2041 (99.867) / 52 at 2400 / guttered at 2790 (93.0 s); pressShare 0.25 → 0.50 during the squall; identical field for field across two runs per seed |
| Law 2 terminals | worktree | `-01` secured false, w3, 93,000 ms, 43 kills, `vent_guttered`, `fnv1a32:1b73c4b7`; `-02` the same shape, `fnv1a32:5c8b38ac`; each run twice, identical |
| Public-verb stoke ride | worktree | `fnv1a32:51793370` twice; browser both viewports 3/3 |
| Floors | worktree | 79 rows across 34 contracts byte-identical (the eraStamp aside); the E10 maps have no floor rows (`bench-seeds.json` has no e10 key); E1 untouched; no seeds, anchors or admission added |
| Guards | worktree | new `e10-preserve-consumer` 17/17; `e10-squall-scheduler` 12/12 (one assertion re-pointed: `applies` is now phase-and-pressure); `view-schema-guard` 3/3; `board-launchable-guard` 5/5; `same-game-audit` 3/3; `door-admission-ratchet` 1/1; `e3-mask-tables` 30/30; `skillmd-contracts-guard` 4/4; `skillmd-guard` 16/16 (one machine-derived grammar line for the new verb); `no-emdash` 1/1; `law-pointer-guard` red on the predicted `fire.md` pointer only (F-E10S3-6, re-based by the drain) |
| tsc / build | worktree | clean / green |
| e2e | worktree, own port 5301, both projects | `e10-ember-shore-preserve` 3/3 + 3/3; `e10-ember-shore-squall` 2/2 + 2/2 (its clock test now grants the purse the map lacks and stokes inside its loop); `e10-river-boot-guard` 1/1 + 1/1; the smoke cell 1/1 + 1/1; `er01-e10-census` 4 failed, PROVEN pre-existing at `0c3188493` (`mechanics.buildables` for every E10 contract, F-E10S3-7), with two other stale clauses re-pointed with citations |
| Engine era | worktree hash `9127fd31…` | re-measured on the merged tree by the drain and pinned there |
| Attended on the merged tree | see the drain commit and the ledger row | tsc, the guards, the pointer re-base, build, the four E10 specs at one worker on both projects |

Screenshots: `artifacts/e10s-3-preserve/shots/{desktop,mobile}-chrome-{plain-boot-vent-alight,squall-draining-the-vent,stoked-vent-survived,vent-guttered}.png`.

## Merge classification
Base `0c3188493`; main moved by the gold cure (`HeadlessContractSim.ts`, `standings.ts`), the portraits, the story gaps (`Game.ts`, `Hud.ts`, `vite-env.d.ts`) and the receipts. `src/systems/E10PreserveSystem.ts`, `scripts/e10-preserve-consumer.test.mjs`, `e2e/e10-ember-shore-preserve.spec.ts`, `artifacts/e10s-3-preserve/*`: NEW. `Game.ts`, `HeadlessContractSim.ts`, `View.ts`, `MechanicsManifest.ts`, `StandingOrders.ts`, `Economy.ts` (one additive `BuildSink` prefix, F-E10S3-2), `ContractFamilies.ts` (the `landed` dependency status with a required `landedBy`, F-E10S2-1 cured), `Hud.ts`, `vite-env.d.ts`, the contract row, `public/skill.md` (one grammar line inside the machine-derived fence), `package.json`, two specs: LANE-TOUCHED, unioned where main moved. `tasks/BACKLOG.md`: MAIN-MOVED, unioned.

## Findings
- **F-E10S3-1 (the honesty stop, E10S-4's premise):** un-keepable without income; the anchors are the cure and are specced.
- **F-E10S3-3 (naming):** the view row is `now.emberShore.preserve`, because `now.preserve` is already `e10-last-claim`'s damageable warm vent; the guard asserts the two never merge.
- **F-E10S3-8 (declared gap, precedent A8/A10):** a stoke records no run-tape action (`LockstepAction` carries only upgrade/demolish/fund/recover), like the seed plant and the canal verdicts; widening that union is a multiplayer-wire change for a later slice, so a replayed Ember Shore tape would not re-stoke. E10S-4's prover must state this.
- **F-E10S3-7 (pre-existing census red):** `er01-e10-census.spec.ts:87` expects no buildables for E10 contracts while the manifest derives six; fire-authorable.
- **F-E10S3-6 (pointer rot, cured by the drain):** the Game.ts hook moved `placeBuilding`/`panAt` again.
