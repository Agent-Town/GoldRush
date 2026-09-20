# hygiene-battery-lossless-triangles — implementer report

**Branch** `fix/hygiene-battery-lossless-triangles`, cut from the phase-B merge `4a6caaa63`.
**Worktree** a linked worktree under the session scratchpad (`node_modules` symlinked to the primary checkout).
**Node** 26.4.0 (`/opt/homebrew/bin` first on PATH) for every command below.
**Owner directive** 2026-09-17, verbatim: "Lets do them all." · "All on the Anthropic subscription".
**Order** items 1, 4, 5, 6, 7, 8 first, then 2 (the sprite land had freed `assets/processed`), then 3 last on a quiet board.

Nothing was pushed, merged or deployed. `STATUS.md`, `tasks/BACKLOG.md`, `tasks/goals.json`, `assets/engine-era.json` and the primary checkout were never written.

| # | item | result |
|---|---|---|
| 1 | F-DRB-11 + F-MAPL-4 — the battery runs its swallowed twenty | **DONE** — the stage exists and reads 124 tests / 121 pass / 0 fail / 3 skipped (was 116 pass / 5 fail) |
| 2 | F-RECUT-7 — repo-wide lossless re-encode | **DONE** — 51,449,271 B saved, zero pixels moved |
| 3 | F-SAR-7 — the +1,922 cold triangles | **DONE** — hunk named, LEGITIMATE, both artifacts re-recorded with provenance |
| 4 | F-PFW-3 — the moving `eraStamp` | **DONE** — the report half was already cured (F-2589-1); the comment was the debt |
| 5 | F-RECUT-5 — `assets/master-divergent.json` stale | **PARTIAL** — all 26 rows re-measured and re-recorded; the control cannot be green inside this firewall (F-HYG-10) |
| 6 | F-MAPDR-2 — `build:release` red on main | **DONE** — rc=0 and 27.36 MB smaller |
| 7 | F-HYG-7 — the census guard's eleven temp trees | **DONE** — 0 survivors across all 147 subjects |
| 8 | F-HYG-8 / F-TCRL-2 — `cast-motion-wiring` red by two pins | **DONE** — 2 passed desktop, 2 passed mobile |

---

## Item 1 — the battery runs its swallowed twenty (`6fedbc6b5`)

**Changed.** `package.json:21` — `npm run test:desk-declaration <twenty files>` became
`npm run test:desk-declaration && node scripts/run-node-guards.mjs <twenty files>`. The twenty were
arguments to `scripts/desk-declaration-guard.mjs`, which ignores its argv, so none had ever run.

*Reading note.* The master's gate says "inside the first stage"; its own scope line, F-DRB-11's
corrective (1) and the BACKLOG row ("with all twenty inside it") all prescribe inserting
`&& node scripts/run-node-guards.mjs` before the list, which makes them their own `node --test`
stage. I followed the three that agree. Appending them to stage 1's argument list instead is a
one-line change.

**Before the fix** (the twenty run by hand): 124 tests, 116 pass, **5 fail** across 4 files.

| file:test | why it was red | cure |
|---|---|---|
| `e10-squall-scheduler.test.mjs:196` "no other board contract grows a squall" | the Archive World declares the SAME scheduler family by design (`specs/agent-play/e10-archive-world-restoration.md:20`; `src/meta/ContractFamilies.ts:2984` refuses an archive twist without the clock; data landed `7c2744e5a`) one slice after E10S-2 wrote the clause | re-pointed to "only the two contracts that declare a squall grow one" — an undeclared third still reds |
| `relay-rush-reel.test.mjs:151` "heat 12 still replays…" | ADR-005 stage 3 removed `HOLD`; heat 12's plans carry it, so `validateRunTape` reads the reel as malformed. Its row is in `artifacts/rider-parity-grammar/retirement-ledger.json` (`e7-relay-rush`/`attempt-1-tape.json`, `orders[30].verb "HOLD" is unknown.`) | pins the REFUSAL plus the ledger row, with the heat-11 reel as the control that the validator does not refuse everything |
| `relay-rush-reel.test.mjs:172` "the retired reel reaches wave 20…" | measured: the tape declares `runStart.research.epochId "epoch-1-frontier"`, the door reconstructs `epoch-7-signal` both virgin and after installing the tape's own meta, so `bootDeclaredRun` (`src/replay/AgentTapeReplay.ts:224-237`) refuses | pins the refusal and its measured cause; ADR-005 clause 6, "retired rows are never repaired" |
| `run-tape-envelope-budget.test.mjs:88` "both blocker fixtures are admitted" | the Dome Basin w16 heat-12 reel is on the same retirement ledger (`orders[18].verb "HOLD" is unknown.`) | the byte/entry/tick measurement (what the test is FOR) untouched; each reel's door verdict asserted WITH its reason |
| `rider-parity-retirement.test.mjs` (file-level) | **not an assertion** — both tests pass, then the process dies with SIGBUS/SIGSEGV in `rolldown-binding.darwin-arm64.node` (napi ThreadSafeFunction at teardown, decoded from the macOS crash report). Load-dependent: `hero-move-verb.test.mjs` crashed 4/4 loaded, 0/4 quiet | ATTRIBUTED, not cured — F-HYG-9 |

`board-tape-gold.test.mjs` needed nothing (it already skips retired fixtures). The relay-rush file
costs ~4.5 s now instead of 72.1 s: the two replays it paid for are refused at construction.

**After.** The twenty's stage, invoked exactly as the chain invokes it:
**124 tests, 121 pass, 0 fail, 3 skipped, 28.9 s** (`battery-twenty-stage.log`), then the two stages
after it — `nul-audit: CLEAN` and `test:review-fixes` 24/24 — rc=0 for the whole tail.

---

## Item 2 — the repo-wide lossless re-encode (`7af33ed89`)

Tool and verification are the re-cut's own
(`artifacts/town-cast-walk8-hard-alpha-recut/lossless-reencode.mjs`): zopflipng, every output
re-read with pngjs and compared to its input on **all four channels** before it is kept, kept only
when smaller. Driver: `probes/lossless-pass.mjs` (6 workers); rows in `lossless-pass-rows.json`,
families in `lossless-by-family.json`.

| | files | bytes |
|---|---:|---:|
| `assets/processed/**` corpus | 2,059 | 225,201,984 |
| excluded by rule (master-derived, byte-identical) | 243 | 14,052,220 |
| encoded | 1,816 | 211,149,764 -> **159,700,493** |
| …shrank | 1,505 | |
| …already optimal (held) | 311 | |
| **saved** | | **51,449,271 B (24.4%)** |
| corpus after | 2,059 | 173,752,713 |

Top families, before -> after:

| family | files | before | after | saved |
|---|---:|---:|---:|---:|
| char-tavernkeeper-sheet-walk8 | 32 | 4,778,815 | 2,639,215 | 2,139,600 (44.8%) |
| char-youngster-m-sheet-walk8 | 32 | 4,418,482 | 2,409,907 | 2,008,575 (45.5%) |
| char-storekeeper-sheet-walk8 | 32 | 4,374,551 | 2,412,843 | 1,961,708 (44.8%) |
| char-bandit-base-sheet-walk8 | 32 | 4,618,935 | 2,665,963 | 1,952,972 (42.3%) |
| char-youngster-f-sheet-walk8 | 32 | 4,381,720 | 2,432,801 | 1,948,919 (44.5%) |
| char-elder-sheet-walk8 | 32 | 4,391,203 | 2,541,387 | 1,849,816 (42.1%) |
| char-bandit-thief-sheet-walk8 | 32 | 3,783,022 | 2,008,785 | 1,774,237 (46.9%) |
| char-newsie-mei-sheet-walk8 | 32 | 3,765,969 | 2,100,135 | 1,665,834 (44.2%) |
| char-bandit-thief-sheet-walkdiag8 | 32 | 3,701,767 | 2,047,077 | 1,654,690 (44.7%) |
| char-bandit-base-sheet-walkdiag8 | 32 | 4,124,410 | 2,503,367 | 1,621,043 (39.3%) |
| char-railtough-sheet-walkdiag4-a | 16 | 2,412,117 | 1,365,258 | 1,046,859 (43.4%) |
| char-e6-glowjack-sheet-walk8 | 8 | 2,158,659 | 1,176,469 | 982,190 (45.5%) |

(321 families in all; the full table is `lossless-by-family.json`.)

**The exclusion, and why.** 243 shipped cells reproduce BYTE-IDENTICALLY today from their
`assets/processed-full` master; re-encoding them would collapse
`anim-pass-reextract --verify-downscale`'s byte-identical count to zero. That is the F-1464-1 rule
("master-derived shipped cells retain their exact repository encoding so the downscale byte gate
stays green"), and it held exactly: the control reads **243 byte-identical / 227 unexplained /
9 master-divergent by design of 479 masters** both before and after. ~3.4 MB more is available if the
factory would rather re-encode them and re-base that gate.

**Gates.** `rgba-resample.test.mjs` 1 pass / 0 fail · `halo-reextraction-check.mjs` "PASS: 395 cured,
0 held, 680 regenerated-and-cured, 2059 scanned; alpha and opaque RGB unchanged" ·
`GR_RELEASE=e1 npm run build && node scripts/first-town-payload.mjs` rc=0.

**first-town payload: 34,509,068 B** of the 52,000,000 B budget (`scripts/deploy.sh:38`), headroom
17,490,932 B; 88 families / 448 files; demand-paged 0; Save-Data arm 34,325,908 B. Derived from the
declared families' own savings, the payload before this pass was **48,968,099 B**: −14,459,031 B,
−29.5%, back under even the old 35,000,000 B budget the town-cast restore had to raise.

---

## Item 3 — the +1,922 cold triangles (`d2c6cad3e (archive: pruned by the A3 rewrite)`)

Measured on a quiet board. (Caveat: `pgrep -f 'playwright test'` also matches a headless FIRE's
prompt text, which contains the words "real playwright" — `claude -p` PID 61415 matched it while
running no suite. Read the process command, not the match.)

**Reproduction, 3 runs per project, zero console errors** (`probes/crawler-cold-census.mjs`, which
boots exactly as `e2e/wire-crawler-3d.spec.ts` does and reads `renderer.info` AND the test-only
`drawCallCensus()`):

| tree | desktop cold triangles | mobile cold triangles | calls | geometries | textures |
|---|---:|---:|---:|---:|---:|
| `src` at `db6dd1782` (pre-runtime) | 147,706 x3 | 144,122 / 144,120 / 144,120 | 73 / 55-56 | 81 / 69 | 32 / 30 |
| this tree | 149,626 x3 | 146,040 x3 | 74 / 56 | 81 / 69 | 32 / 30 |
| delta | **+1,920** | **+1,920** | **+1** | 0 | 0 |

**The bisect table.** `git log --oneline db6dd1782..2e7f014b7 -- src` holds only TWO commits
(`033f69c61`, `d500bed70`), so a commit-level bisect cannot name a hunk. The draw-call census does:

| census row | pre-runtime | this tree | verdict |
|---|---|---|---|
| EnemyPool (instanced, MeshBasicMaterial, transparent) | 10 calls / 31,680 tri, renderOrder 2 | **11 calls / 33,600 tri, renderOrder 0.5** | the whole delta |
| EnemyPool (instanced, MeshStandardMaterial) | 3 / 7,680 | 3 / 7,680 | unchanged |
| CanyonWorksTerrain, SparkRigBoltPool, RailPath.*, DetailScatter.*, PowerWireView.*, MothSwarmPool, GoldPickupPool, CombatVfx, DecoyShedPool, CapacitorBankPool, XpMotePool, PylonSite.*, GeneratedSpriteBlobShadows.*, sprites | — | — | all unchanged |

**The hunk.** `src/entities/pools.ts`, `setProceduralVisible()`, changed by the sprite-animator
runtime land (`033f69c61`, merged `d500bed70`):

```
-  for (const part of this.renderParts) part.visible = visible;
+  this.renderParts.forEach((part, index) => { part.visible = index === 0 || visible; });
```

`renderParts[0]` is the enemy pool's ground-shadow instanced mesh — `assets.shadowGeometry` x
`Balance.enemy.poolSize` (96) = 96 x 20 triangles = **1,920** — and
`renderParts[0].renderOrder = RenderLayers.groundShadows` = 0.5 (`src/core/RenderLayers.ts:5`),
exactly the renderOrder the changed census row reports.

**LEGITIMATE, not a leak.** Nothing is constructed twice and nothing is left undisposed: one
existing instanced mesh now survives the hide that drops the procedural bodies when the generated
sprites load — deliberately, so a sprite-drawn enemy still has ground contact. No `src/` cure.
(Culling the shadow's instance count to the living enemies would be hand-setting a count in the
render path, which the master forbids: recorded as F-HYG-11.)

**Re-recorded**, both artifacts, with a full `provenance.rerecorded` block (cause, method,
confirming runs, known flake) and the previous block moved into `rerecordedHistory`:

| phase | desktop | mobile |
|---|---|---|
| coldBaseline.triangles | measured 147,706-147,708 -> **149,626-149,628** (tol 147,704-147,710 -> 149,624-149,630) | 144,120-144,122 -> **146,040-146,042** (tol -> 146,038-146,044) |
| mounted | calls 64 -> **65**, triangles 157,592 -> **159,512** | 57 -> **58**, 154,126 -> **156,046** |
| loadedBeforeKill | calls 64 -> **65**, triangles 159,468 -> **161,388** | 55 -> **56**, 154,102 -> **156,022** |
| disposed | calls 72 -> **73**, triangles 148,672 -> **150,592** | 63 -> **64**, 143,306 -> **145,226** |
| geometries / textures / every delta | unchanged | unchanged |

No value was hand-set: each was confirmed by the spec through `e2e/renderer-count-artifact.ts:37`,
and the first run after the shift passed all six tests on both projects at once.
**Confirming runs: desktop 4/4 green, mobile 3/4 green** (isolated project runs), plus green
post-provenance runs on both. Across all 16 runs there was **never** a renderer-count mismatch
(`rendererCountErrors=0` every time); the reds are one flake, F-HYG-12. The ten tracked screenshots
the runs rewrote were restored with `git checkout --`.

---

## Item 4 — the moving `eraStamp` (`c1f440338`)

The stamp still moves and must — it is a WHEN, and on main `merge-base HEAD main` IS HEAD, so no
commit can carry the hash of the pin it lands (the F-1384-1 shape). The REPORT half was already
cured by F-2589-1: `scripts/null-floor-compare.mjs` classifies it as `PROVENANCE_FIELDS`, printed on
every verdict and counted in none. Only the comment was owed; it now names F-PFW-3 at the site where
the stamp is minted, including why NOT to derive it from the pin's own recorded base.

**Gate.** `node scripts/null-floor-anchors.mjs --check` ->
`eraStamp: pin taken at "09c997489", this tree is "92eed7ae0" — PROVENANCE ONLY, not a floor
difference.` then `83 of 83 null floors match assets/contracts/null-floors.json (287.3s)`
(`null-floor-check.log`). Exit codes proven through the cheap `--compare` seam instead of a second
287 s sim: stamp-only difference **exits 0**, one moved floor **exits 1**.

---

## Item 5 — `assets/master-divergent.json` (`7e25f212c`) — PARTIAL

Re-measured with the file's own method (`anim-pass-reextract --verify-downscale`, 479 masters):
**226 byte-identical, 227 unexplained, 9 master-divergent by design, 17 STALE**
(`verify-downscale-before.log`). Both halves of the 26-row ledger were wrong, in opposite directions:

- **the 9 `char-hero-sheet-walk8` rows still diverge, but not for the recorded reason.** Their cause
  was `ad64b1754` (2026-07-13 cutout-pocket mend); the shipped cells were re-sourced twice since —
  `d7670202a` (2026-09-14 hard-alpha re-cut) and `e7418ac3d` (2026-09-15, Astra's original walk cells
  restored) — while the 512 px master is still the 2026-07-10 extraction `0bd73e539`. Re-recorded
  against `e7418ac3d`, each row keeping its superseded cause under `supersedes`.
- **the 17 `char-baron-sheet-walk8` rows are STALE.** `fb352552e` (2026-09-14, sprites-split-land
  item 4) rewrote the shipped cell AND its master together. Moved to a `retired` array with the dated
  cause rather than deleted (CLAUDE.md 4.10b); the tool reads `.cells` only.
  `--verify-downscale char-baron-sheet-walk8` is now **32 byte-identical, 0 unexplained, 0 stale**.

The file gained `method` and `remeasured` lines so the next reader re-measures before editing.

**Held, with reason.** 227 shipped cells across 19 families (`char-baron-sheet-walkdiag8` 32,
`char-hero-sheet-walk8` 23, prospector hover4 32, jumper 64, `ter-rail-elements` 4, …) do not
reproduce from their masters at all. That is the F-1464-1 class, not this item's nine rows, and
recording 227 "by design" exclusions would be a claim per cell this item never measured. F-HYG-10.

---

## Item 6 — the release door (`63a692b91`)

Reproduced: `GR_RELEASE=e1 npm run build:release` -> `Error: [release-build] later era assets
emitted: …` (the message slices its list at 8). Measured over the failing `dist`, the leak is
**86 files, 27,355,070 B**: 85 `townsfolk-*-e2..e10.png` portraits plus `terrain-e5-open-sea-tile.png`.

**Cause.** `src/story/speakers.ts` names every later-era portrait with a static
`new URL(..., import.meta.url)`, so the bundler emits it whatever the release flag says, and the
release plugin's redirect list never carried that family. Those speakers are `*-e2`..`*-e10`, whose
beats cannot fire in an E1 build.

**Cure**, in the plugin's own pattern (`vite.config.ts`, beside the `char-e2..e10` redirect):
`townsfolk-<name>-e2..e10.png` -> `townsfolk-elder.png`; `terrain-e5-open-sea-tile.png` ->
`terrain-river-tile.png` (it reaches the closure through `assetSlots.terrainOpenSea`).
`townsfolk-newsie-e1.png` is E1 content and is deliberately not matched.

**Gate.** rc=0 -> `[release-build] E1-only: 1109 files, 124020394 bytes, zero later manifest ids or
plate/GLB assets (checked against 268 later-asset stems)`. Payload SMALLER, not merely unchanged:
1,195 -> 1,109 files, −27.36 MB. An independent re-scan of the new `dist` finds 0 later-era modules.

---

## Item 7 — the census guard's temp trees (`14b3b0e31`)

Eleven tests called `fixture()`/`attendedOnlyFixture()` and none removed the `mtec-*` tree, so the
sweep was red on main from `1cd8dbbd3` on; arm 8 removed its own tree on the happy path only.
**Cure**, in the sweep's own form: a `withFixture(make, run)` wrapper that removes `made.root` in a
`finally`, and arm 8's `rmSync` moved into a `finally`. The wrapper, rather than eleven typed-out try
blocks, keeps every test body byte-identical — the fires iterate on this file today.

**Gate.** `TMPDIR=<scratch> node --test scripts/modified-tracked-evidence-census-guard.test.mjs` ->
**16 pass, 0 fail, 0 survivors** (was 16 pass, 11 survivors). Whole-corpus, from a census that
reproduces the sweep's measurement without its fail-fast (`probes/survivor-census.mjs`, 147
subjects): **LEAKING FILES: 0 — none.** The sweep's own run stops earlier, at its first non-zero
child; the three children that do not exit 0 here are `bench-seeds` and `engine-era-guard` (the
inherited engine-hash pin) and `desk-declaration-guard` (refuses a linked worktree by design).

---

## Item 8 — `cast-motion-wiring` (`068ce40f1`)

Both reds are stale pins, read back to the evidence that moved them; neither is relaxed.

- **`:64`** pinned the assay clerk at (7, 3.4) — the Assay Office anchor plus her `portraitPost`
  offset from `ac87d1714` (owner playtest 2026-08-03, "move the Elder and Assay Clerk posts clear of
  their buildings visual footprints"). That offset was tuned for a PORTRAIT sprite; with a full body
  `townActorPlazaPlacement` ignores portrait-only offsets and she stands at (8.35, 6.8). That is
  **F-SPR-13 repaired**: `reviews/sol-findings-sprite-roster-fixes-20260908.md:233` records the move
  as clearing the Assay Office roof, **:241 measures the OLD post at ~4 % of her silhouette visible
  in lite mobile**, :258 names (8.35, 6.8) as her final post, :268 measures 24 standing-post captures
  at >=99.862 % visible. The owner's intent is served by the NEW post, so the pin moved to it and
  stayed an exact `toEqual`.
- **`:112`** (the master's ":99") asked the preacher, schoolteacher and assay clerk for a
  `-sheet-walk8-a-rNcM` cell WHILE STANDING — the defect F-SPR-32/F-SPR-45 cured ("an extended boot
  held indefinitely", same review :879 and :948). Each has a separate planted idle clip wired through
  the town loader (`TownScene.ts` `townCastWalkFrames`, `idle:` per actor; art in `d2a7fda05`). None
  of the three carries a patrol cycle, so the pin was made **exact rather than widened**: each must
  show its own `char-<id>-idle-r0c0.png`. Their walking cells stay pinned by the moving-actor poll
  below it and by `e2e/town-t5-townsfolk.spec.ts`.

**Gate.** 2 passed desktop-chrome (40.8 s), 2 passed mobile-chrome (42.8 s), own dev server on 5430,
trace off. The six tracked screenshots the runs rewrote were restored before the commit.

---

## The closing battery

`GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards`, Node 26, on the final tree
(`battery-final.log`).

**Stage 1** (`node scripts/run-node-guards.mjs <the ~130 files>`):
**797 tests · 791 pass · 4 fail · 2 skipped · 390.2 s.** All four reds are attributed, none is mine:

| red | cause |
|---|---|
| `bench-seeds.test.mjs` — "rotation registry stays outside the engine identity corpus" | the INHERITED engine-hash pin: the tree computes `c550564ff54d…`, `assets/engine-era.json` on this branch declares `72f1e2f45a85…` |
| `engine-era-guard.test.mjs` — "the landed registry names the live engine and stays outside its hash corpus" | the same pin |
| `desk-declaration-guard.test.mjs` — "the live board is green under this guard (baseline is honest)" | REFUSES a linked worktree by design (F-2232-1 / F-2241-1 / F-2242-1); the master says to attribute this one |
| `fixture-teardown.test.mjs` — "all 147 … remove their temp directories" | fail-fast on its first non-zero child, which is `bench-seeds` above. The survivor count itself is **0** (`survivor-census.log`) |

Because stage 1 exits non-zero, npm's `&&` chain stops there. Run separately, in chain order:

- **stage 6** `npm run test:desk-declaration` REFUSES in a linked worktree by design and prints the
  refusal (`battery-tail.log`) — so from a linked worktree the chain can never reach the twenty, on
  any tree. Orthogonal to item 1.
- **the twenty's new stage, invoked exactly as the chain invokes it: 124 tests · 121 pass · 0 fail ·
  3 skipped · 28.9 s**, then `nul-audit: CLEAN` and `test:review-fixes` 24/24 — rc=0 for the whole
  tail (`battery-twenty-stage.log`).

The predecessor's numbers for comparison: the merged-tree run in `reviews/drain-review-boss-fidelity.md` §8
read 742 tests / 740 pass / 0 fail / 2 skipped in 814 s, and `reviews/town-cast-walk8-hard-alpha-recut.md`
recorded 796 / 792 / 2 fail / 2 skipped with the same two linked-worktree reds.

---

## Engine hash

```
computeEngineHash() = c550564ff54d6eca57f45b9bfdf275f2ce724151443b79eb69c71a406d5b2ff9
```

**Item 2 does not move it**: `assets/processed` is not in `ENGINE_SOURCE_INPUTS`
(`scripts/assay-replay-agent.mjs:36` — `scripts/assay-replay-agent.mjs`, `assets/contracts`,
`assets/crafting-queue/contract.v1.json`, `assets/crafting-queue/approved`,
`assets/layer-contracts`, `assets/pilots/map-rebuild-spike`, `src`). Neither does any other item:
`git diff 4a6caaa63..HEAD` over those paths is **empty**, so this is the same value the base commit
computes.

It differs from this branch's declared `72f1e2f45a85…` because the branch is cut from the phase-B
merge `4a6caaa63` and main pinned the era afterwards in `a57f0934e` ("era 6, pin #8: the phase-B
land"); main declares `540b49aff0…` today. That inherited mismatch is what reds `bench-seeds` and
`engine-era-guard` here, and it disappears once this branch sits on a main that carries the pin.

---

## Findings raised

- **F-HYG-9 — a rolldown napi teardown crash kills guard processes intermittently.** Both tests in
  `scripts/rider-parity-retirement.test.mjs` PASS and the process then dies with SIGBUS/SIGSEGV; the
  macOS crash report decodes to `rolldown-binding.darwin-arm64.node` inside
  `v8impl::ThreadSafeFunction::AsyncCb` at `uv_run` — the bundler's native addon at process
  teardown, not the guard. Load-dependent (`hero-move-verb.test.mjs`: 4/4 crashes loaded, 0/4 quiet).
  Nothing in this repo can cure it; it will surface as a random red file in any battery run on a
  busy box.
- **F-HYG-10 — 227 shipped cells no longer reproduce from their masters.** Item 5's held half. The
  class is F-1464-1's; families are listed in `verify-downscale-before.log`. The decision needed is
  whether the masters get refreshed (an art act) or the ledger records each as divergent by design.
- **F-HYG-11 — the enemy pool's ground shadow draws its whole 96-instance pool at cold.** Item 3's
  subject, recorded as an optimization rather than a bug: 1,920 triangles and one draw call paid on a
  board with zero living enemies. Culling `renderParts[0].count` to the living set would recover
  them, but that is hand-setting a count in the render path and wants its own slice and gate.
- **F-HYG-12 — `e2e/wire-crawler-3d.spec.ts:144` flakes on a loaded box.** The
  `presentationBaseline.geometries` dispose poll is a 5 s `expect.poll`; under load the crawler GLB's
  last three geometries are not resident when `loadedBeforeKill` is sampled (expected 112, received
  115). 3 of 15 runs here, always that line, never a renderer count.

## Open questions for the attended session

1. **Item 1's stage placement** — the twenty run in their own `run-node-guards` stage. If the gate's
   "inside the first stage" was literal, move them into stage 1's argument list (one line) and re-run.
2. **Item 5** — F-HYG-10 needs a ruling, not a commit, before `--verify-downscale` can be green.
3. **Item 2's 243 excluded files** — ~3.4 MB more is available if the factory would rather re-encode
   the master-derived cells and re-base the downscale byte gate on the new encoding.
4. **A renamed test title** — `no other board contract grows a squall` became `only the two contracts
   that declare a squall grow one`. It is quoted in prose in `reviews/maps-campaign-land-era6.md:26`
   and `tasks/BACKLOG.md:173`, both outside my firewall; those rows want the new title when the
   BACKLOG row is retired.
5. **The engine-era pin** — this branch needs main's `a57f0934e` under it (or a re-pin after the
   merge) for `bench-seeds`, `engine-era-guard` and the fixture sweep to go green.
