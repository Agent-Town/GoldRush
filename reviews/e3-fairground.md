# Review — e3-fairground (Voltage-era Ferris Wheel contract)

- **Slice:** e3-fairground (E3 "Voltage" era contract)
- **Lane branch / tip:** lane/e2-arsenal → `da904e31 runner(lane-c): e3-fairground.md` (parent `369a013a`, same task — two runner passes, cumulative diff drained)
- **Base:** `f066289b` (lane reset to main by s590)
- **Merged onto main:** this commit. Base `f066289b` → tip; grafted onto main `32d72c69`.
- **Verdict:** PASS — merged. Player-visible new E3 contract → **GZ item appended**.

## What it does
Adds the **e3-fairground** contract to the Voltage era (`assets/contracts/epoch-3-voltage/contracts.json`): a great Ferris wheel that, while spinning, drives watts into the power grid **and** casts elevated (aerial) light coverage over the fairground — until outlaws damage the wheel and stop both. Crowd flocks circulate with an escort radius; pavilions grow their lit radius each night. Reachable in normal Voltage-era play (`epoch=epoch-3-voltage&contract=e3-fairground`).
- `src/entities/FerrisWheel.ts` (new, 184 lines) — the wheel entity + `FerrisWheelDiagnostics`.
- `src/game/Game.ts` (+65) — wires the fairground contract into the game loop + the `damageFerrisWheel` debug hook.
- `src/meta/ContractFamilies.ts` (+21) — `ContractFairground` type + `fairground?` manifest field.
- `assets/contracts/epoch-3-voltage/contracts.json` (+57) — the contract definition.
- `src/vite-env.d.ts` (+3) — diagnostics + debug-window wiring for the wheel.

## Evidence
| Gate | Result |
|------|--------|
| `npx tsc --noEmit` | clean |
| `npm run build` | ✓ built in 567ms |
| `e2e/e3-fairground.spec.ts` | **2/2** (desktop + mobile): wheel spin drives watts + elevated coverage until damage stops both |
| Regression — e7/e5 (shared files I grafted) | `e7-research-tree` **2/2**, `e5-water-spike` **8/8** — no regression from the ContractFamilies/vite-env graft |
| Adjacent E3 — `e3-power-graph` + `e3-canyon-works` | **12/12**, zero console/page errors — Game.ts + epoch-3 contracts.json changes don't regress existing Voltage-era play |
| Artifacts | `artifacts/e3-fairground/{desktop,mobile}-chrome-wheel-{stopped,turning}.png` + `desktop-wheel-comparison.png` |

## Merge classification
- **Clean (9 files, main == base):** artifacts/e3-fairground/*.png, e2e/e3-fairground.spec.ts, src/entities/FerrisWheel.ts, src/game/Game.ts, assets/contracts/epoch-3-voltage/contracts.json — checked out from the lane tip; verified byte-identical to lane (`git diff --cached lane/e2-arsenal` empty).
- **3-way graft (2 files):** `src/meta/ContractFamilies.ts` (e7-01 added epoch-7 registry entries on main since base) and `src/vite-env.d.ts` (e5-02 + e7-01 added Window/diagnostics lines on main). e3's additions (`ContractFairground` type + `fairground?` field; `fairground` diagnostics + `GrFerrisWheelDiagnostics` type + `damageFerrisWheel` debug hook) are at **disjoint anchors** from e5/e7's — applied surgically onto main's current versions. tsc + build + the e7/e5 specs all green confirm the graft preserved every prior line and added e3's cleanly.

## Findings
- None blocking. Same proven additive-registry graft pattern as e6-01 / cw-02.
