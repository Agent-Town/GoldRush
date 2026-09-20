# first-town-payload-gate — what was measured, 2026-09-07

Scratch worktree on `feat/first-town-payload-gate`, base `7c52a369` (main), Claude Opus 5 implementer,
macOS, four implementers sharing the host. Preview port 5294 throughout; the deploy's own instrument,
command for command (`GR_ASSET_DIET_BUNDLE=1 GR_ASSET_DIET_REUSE_BUILD=1 playwright test --config
playwright.preview.config.ts e2e/asset-diet.spec.ts --grep "town cue-window budget through player entry$"`),
each run from a throwaway cwd so the committed corpus in `artifacts/asset-diet/` was never touched.

## 1. The swing did NOT reproduce today, and that is not a defence of the instrument

Three runs of the instrument on ONE fixed `GR_RELEASE=e1` release build (`swing/run{1,2,3}.log`,
`swing/run{1,2,3}-<project>.json`):

| run | desktop-chrome | mobile-chrome |
| --- | ---: | ---: |
| 1 | 16,101,435 | 16,101,435 |
| 2 | 16,101,435 | 16,101,435 |
| 3 | 16,101,435 | 16,101,435 |

Six readings, one number, 0.00 % spread. The 2.05x swing F-BUDGET-4 recorded (21,589,212 /
10,540,927 / 21,638,025) is a LOADED-HOST phenomenon — the same review's successor measured "two runs
of the same build 25 % apart under four concurrent implementers" — and this host was quiet.
**Reported as measured: today's runs give no evidence of instability.** They also give no evidence of
stability that a budget could rest on, because the two facts below hold whatever the host is doing.

### 1a. The probe records 2,300,691 bytes of the first town as ZERO

`vite preview` serves the JS and CSS without a `content-length`, and the instrument's own
content-length control already counts them: **25 of the 236 responses inside the cue window are
recorded at 0 bytes** on both projects. Their real weight in `dist/`:

| bytes in dist | family |
| ---: | --- |
| 1,138,813 | index.js |
| 172,469 | TownScene.js |
| 169,963 | dispose.js |
| 159,641 | WorldInfoNotes.js |
| 135,360 | SpriteAnimator.js |
| 100,044 | Terrain3dClaimPilot.js |
| … | 19 more |
| **2,300,691** | **total invisible to the gate** |

That is 14 % of the number the gate was reading, and it is invisible in every run, on every host.

### 1b. 2,853,225 bytes inside the recorded window are not the town's payload

`the-claim-terrain.glb` (966,064) + `the-claim-panorama.glb` (86,344) are the NEXT map, held by the
F-BUDGET-3 scene hold; `era-e1-frontier-loop.mp3` (1,800,881) + its `?url` module (110) are the
deferred music, held by F-AUDIO-3. Both holds work — and both assets still land inside the RECORDED
window, because that window's end is polled over CDP with ~500 ms of skirt (F-AUDIO-4). 17.7 % of the
gated number was work the town had already refused to do.

## 2. The declared payload, computed from the build

`node scripts/first-town-payload.mjs` on the release build (full table in `payload-table.txt`):

| group | gated | families | files | bytes |
| --- | --- | ---: | ---: | ---: |
| hero | yes | 8 | 106 | 4,590,285 |
| cast | no (demand-paged) | 10 | 272 | 16,111,577 |
| plates | yes | 19 | 19 | 4,754,493 |
| models | yes | 16 | 16 | 3,918,764 |
| audio | yes | 1 | 1 | 8,821 |
| code | yes | 33 | 33 | 2,301,823 |
| document | yes | 1 | 1 | 1,087 |
| **GATED TOTAL** | | 78 | 176 | **15,575,273** |
| DECLARED TOTAL (gated + demand-paged) | | 88 | 448 | 31,686,850 |

**The gated total lands 3.3 % below what the browser measured for the same build** (15,575,273 vs
16,101,489 desktop / 16,052,799 mobile), and the difference is mostly the cast's ten entry cells,
which the gated total deliberately omits. Two independent instruments, one answer: the build-derived
one is the reproducible half.

### 2a. THE FORK ON THE OWNER'S DESK: the cast

The ten town-actor sheets weigh 16,111,577 B in `dist/` — 272 cells, every one of them reachable
(`TownScene.applyFullBodyFrame` fetches `-r<row>c<frame>` as an actor turns). Measured: exactly ONE
cell of each sheet is inside the cue window; after a 12.7 s settle the busiest sheet had reached 9 of
its 32. So they are the first town's payload in the sense that the build commits to them, and are not
in the sense that nobody waits for them. The declaration marks the group `demandPaged` and the gate
does not judge it; flipping that one boolean puts the budget on the upper bound, **31,686,850 B
against a 25,000,000 B budget — 127 %**. That is a calibration question about a unit that changed, and
the budget is the owner's number, so the fork is recorded rather than decided.

## 3. Determinism

Three consecutive runs of `scripts/first-town-payload.mjs` on the same build, byte-identical output
(sha256 `c7313be079786f3caf9ef9af6fa8c01a69853a7361ac2996c8ddf7f6ed34f953` for all three). The guard
proves it again on a synthetic build (`scripts/deploy-budget.test.mjs`, "the payload table is
deterministic: three runs, byte-identical"), with `--no-corpus` so the proof cannot borrow stability
from a corpus file another suite rewrites.

## 4. The deploy's new verdict block

`GR_PREVIEW_PORT=5294 bash scripts/deploy.sh --dry-run` on the release build — full block in
`dry-run-verdict.txt`. The gate reads the payload, the probe is printed and judged only against
30,000,000 B, and the block says which is which.

## 5. The e2e ceiling moved with the deploy's

`e2e/asset-diet.spec.ts`'s `TOWN_TRANSFER_CEILING_BYTES` went 25,000,000 -> 30,000,000. The deploy
RUNS that test, so leaving it at the old number would make the probe fail its own spec while the
deploy called the same reading a pass — the exact drift this task exists to end. It also retires a
documented straddle: the A/B arm at that site measured 24,604,025 / 26,115,186 / 23,259,297 on three
occasions (F-1627-2), a flake caused by gating a raced quantity at a tight number.
`scripts/deploy-budget.test.mjs` now asserts the spec's constant equals deploy.sh's
`TRIPWIRE_CEILING`.

`asset-diet` on the release build through `playwright.preview.config.ts` (port 5294, both projects):
**17 passed / 1 failed**. The red is `dieted output keeps two terrain census views and town within
screenshot tolerance` (desktop), `town.png` at ratio **0.16** against a 0.15 `maxDiffPixelRatio` —
the byte-for-byte fingerprint of F-CELL-1 / F-HCS-2, documented as environmental on this host by the
sprite-cell, audio-deferral and hero-clip-split drains, each with its own control run. Nothing in
this slice can reach a census screenshot: it changes two scripts, one guard, a declaration file, and
one regex in `AdvanceStream` built from the same two names it used to hard-code.

## 6. What the runtime now reads

`src/assets/AdvanceStream.ts` builds its Save Data filter from `saveDataTrim` in
`assets/first-town-payload.json` instead of a `/stamp-mill|dynamo-hall/` literal, so the metered arm
of the game and the metered arm of the budget are one row. Cost measured, not assumed: the `code`
group went 2,301,833 -> 2,301,823 B across the change (the declaration is tree-shaken out of the
bundle; only the two names survive). `dynamo-hall.glb` is not emitted by the e1 release at all; the
name stays in the trim because later eras raise that hall.
