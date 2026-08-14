# fix-e2-railcar-arsenal-floor-v2 — s1755 gate

**Master:** `tasks/fix-e2-railcar-arsenal-floor-v2.md`
**Done-move:** `tasks/done/20260814-064304-fix-e2-railcar-arsenal-floor-v2.md`
**Run log:** `tasks/runs/20260814-064304-main-fix-e2-railcar-arsenal-floor-v2.md.log`
**Policy check:** `BLOCKED` (rc 1), via the gate-side `e2-railcar-arsenal-floor` sibling.

## VERDICT: HOLD — NOT MERGED

The two-file implementation is useful groundwork: browser and headless grant exactly Boiler Lance, Pressure Mortar, and Sky Rocket on Hill Mine, Trestle, and Incline; `boiler_battery` stays research-gated; global balance and admission state stay unchanged. The claimed economy stop is not proved, though, and the directly affected arsenal suite is red.

Main was restored after review. The full rejected diff, probe iterations, and command output remain in the run log.

## Evidence

| Check | Result |
|---|---|
| `drain-block-check --strict` on the done-move | ⛔ rc 1, gate-side sibling still blocks the drain |
| TypeScript + production build + diff check | ✅ runner reports green (`run log:44922-44923`) |
| Identical browser/headless grant | ✅ same three contract ids and same three research ids in the two source files; no `Balance.ts` change |
| Lawful Hill Mine probe | ❌ died wave 7, five waves before the railcar; 396 pressure spent; railcar damage 0 (`run log:44917-44921`) |
| Existing `e2-arsenal` suite | ❌ 2 passed / 1 failed; Hill Mine still asserts Sky Rocket is locked (`run log:44924`) |
| Admission exemptions / ratchet | ✅ retained and unchanged, as required on a stop |

## Finding

### F-1755-1 — BLOCKING: the probe proves its policy loses early, not that the pressure economy cannot beat the railcar

The report compares one boiler's 120 pressure per wave with about 305 pressure per wave of simultaneous arsenal demand, then calls the 185-pressure difference an economy gap. The shipped economy allows **three** boilers (`Balance.boilerHouse.maxCount = 3`), and `PressureSystem.update()` generates pressure independently for every operational boiler. More importantly, the probe builds only one boiler and spends its finite coal from the early waves, dying at wave 7 before the wave-12 railcar exists. Zero damage to an unspawned target cannot establish a 3,489-HP surplus.

The next lawful proof must survive to wave 12, exercise the allowed two/three-boiler configurations, bank coal/pressure for the boss window, and report actual component damage. Only a remaining measured deficit justifies an owner balance fork. The successor must also be allowed to update the now-contradicted Hill Mine arsenal assertion so the directly affected suite is green; a known red cannot ship as a "stale assertion."

## Next lawful slice

Re-cut the harness/master around the existing two-file predicate: keep the exact-three/no-balance rules, permit the one necessary assertion update, and require a wave-12 control with strategic coal timing and up to three boilers. Do not ask the owner for balance numbers until that control fails.
