# Review — E2 pressure line on the last two railcars (the ruling executed; the maps still win)

**Slice/branch/tip:** `worktree-agent-a383c2ed5dd452ebd`, built on `b253af85c`, **re-derived on the
merged tree after `main` advanced to `fb7a1abcc` mid-build** (merge `687876393`). Headless Opus-5 agent.
**Verdict: PROPOSED — GREEN on what it claims, and what it claims is that the owner's ruling is now
DATA, that the ruling's gift is real and measured, and that NEITHER map earns admission by it.**

**The ruling.** Owner, 2026-08-21, verbatim: **"E2's pressure ... - lets do that"** — executing the
standing desk recommendation **F-E2PA-6, "give both the pressure line"**. `e2-incline` and `e2-trestle`
were the last two E2 contracts outside `SUPPORTED_CONTRACTS`, and
`reviews/e2-pressure-arsenal-headless.md` had narrowed their refusal to one authored fact: neither
declared `twist.pressureEnabled`, so no boiler was buildable, no coal was burnable, and the E2
arsenal had nothing to spend against an `hpScale: 30` railcar. The ruling answers that.

## What the slice authors, and what it deliberately does not

`assets/contracts/epoch-2-steamworks/contracts.json` gains **two lines** — `"pressureEnabled": true`
in each of the two twists, placed first, exactly as `e2-hill-mine` and `e2-pressure-garden` declare
it. Nothing else in either contract moved: the railcar stays at `hpScale` 30, the rosters, the
spawn gates, the build zones and the secure wave are untouched. **The ruling gives the player the
ARSENAL, not a nerf**, and this diff is the whole of it.

**REJECT-DON'T-STRETCH, stated plainly, because the task asked for more than the contract can say.**
The instruction was to author *"`twist.pressureEnabled: true` + the boiler/coal/site fields the
siblings declare, placed sanely for each tile"*. **There are no such fields.** Verified by reading
the code, not by grepping for absence:

- `src/systems/PressureSystem.ts:23-27` fixes the three coal seams at three literal world positions
  — `(-12,39)`, `(-5,43)`, `(3,39)` — as a module constant. They are the same three coordinates on
  every contract in the game. No contract supplies them and none can.
- `src/meta/ContractFamilies.ts:1542` (`AUTHORED_TWIST_KEYS`) is a hard allowlist, enforced at
  `:1654` through `addUnknownFieldReasons`, and `validateContractsBundle` **throws** on any key
  outside it. `pressureEnabled` is the only pressure key in the vocabulary. There is no `coalSeams`,
  no `boilerSites`, and no comment field — the bundle is strict JSON, so the ruling is quoted
  verbatim in the two places a reader will actually meet it: the exemption table in
  `src/sim/HeadlessContractSim.ts` and the census spec that pins it.
- Both tiles already name their boiler ground in `stakeMarkers` (`south-boiler-site` /
  `north-boiler-site` on the trestle; `lower-engine-house` / `upper-winch-house` on the incline), so
  the "site fields" the instruction asked for were authored long ago and needed no edit.

Making seams contract-authored is a real slice — see **F-E2PL-1** below — but it would change
`PressureSystem` for the Hill Mine and the Pressure Garden too and move their pinned hashes, which
is exactly the balance edit this task forbade.

## Evidence

Node 26.4.0. Prover, battery, probes and **every one of the 158 run logs** preserved at
`artifacts/e2-pressure-line/`: **154 prover runs** — 130 in the best-play search and its controls
(7 ladders × 2 upgrade orders × up to 4 coal schedules × 4 bench seeds, plus the 6 pre-ruling
controls), 24 in the ×2 battery — plus **4 coal-reach probes**. Per map: 94 runs on the trestle,
60 on the incline.

### 1. The line is REAL on both maps — the coal is reachable and the boilers burn it

`artifacts/e2-pressure-line/coal-reach.mjs` takes survival out of the question (the census spec's own
`applyStats`/`heal`/`sparkRig` rig) and asks only whether a body can walk to three fixed coordinates
that were placed for a different map.

| seed | seams cut | arrivals (turn/wave) | coal in bunker | pressure stored | vents | boilers placed |
|---|---|---|---|---|---|---|
| `e2-incline-01` | **3 / 3** | t1 w1 · t3 w3 · t5 w4 | 1 | 64 | **12** | 2 / 2 |
| `e2-incline-02` | **3 / 3** | t1 w1 · t3 w3 · t5 w4 | 1 | 64 | **12** | 2 / 2 |
| `e2-trestle-01` | **3 / 3** | t1 w1 · t3 w3 · t5 w4 | 1 | 64 | **12** | 2 / 2 |
| `e2-trestle-02` | **3 / 3** | t1 w1 · t3 w3 · t5 w4 | 1 | 64 | **12** | 2 / 2 |

Twelve of the sixteen coal are burned to pressure the boilers vent away, because this probe has no
research declared and therefore no arsenal to spend it on — which is the point: the fuel arrives.

### 2. The arsenal FIRES on both maps under declared E1 progression — and still nothing secures

The prover is the one that re-admitted the Hill Mine (`artifacts/e2-railcar-arsenal/prover.mjs`),
unchanged in policy, with the same declared profile written through the real modules. `line` = the
best-of-search play that uses the new pressure line; `dry` = the same rider ignoring it; `idle` = no
orders at all. **Every row run twice; both passes identical in all 24.**

| run | outcome | hash ×2 | fires (lance/mortar/rocket) | pressure granted → spent |
|---|---|---|---|---|
| `line-e2-trestle-01` | unsecured **w12** | `fnv1a32:7ee055ee` | 40 / 10 / 6 | 192 → **192** |
| `line-e2-trestle-02` | unsecured **w13** | `fnv1a32:ca23df0e` | 37 / 14 / 14 | 352 → **317** |
| `line-e2-incline-01` | unsecured **w6** | `fnv1a32:dc7cf546` | 0 / 0 / 0 | 0 |
| `line-e2-incline-02` | unsecured **w9** | `fnv1a32:66a4df57` | **164** / 2 / 1 | 192 → **192** |
| `dry-e2-trestle-01` | unsecured **w12** | `fnv1a32:8c28f1ff` | 0 / 0 / 0 | 0 |
| `dry-e2-trestle-02` | **SECURED w18** | `fnv1a32:bc515b13` | 0 / 0 / 0 | 0 |
| `dry-e2-incline-01` | unsecured **w6** | `fnv1a32:83b0a873` | 0 / 0 / 0 | 0 |
| `dry-e2-incline-02` | unsecured **w8** | `fnv1a32:dac0c325` | 0 / 0 / 0 | 0 |
| `idle-e2-trestle-01` | unsecured **w2** | `fnv1a32:05c59970` | 0 / 0 / 0 | 0 |
| `idle-e2-trestle-02` | unsecured **w1** | `fnv1a32:a438e2ff` | 0 / 0 / 0 | 0 |
| `idle-e2-incline-01` | unsecured **w2** | `fnv1a32:13911bf5` | 0 / 0 / 0 | 0 |
| `idle-e2-incline-02` | unsecured **w2** | `fnv1a32:7f25d30c` | 0 / 0 / 0 | 0 |

**Across all 130 search runs and all 24 battery runs, exactly one row secured — and it is the one
that ignores the pressure line.**

### 3. THE ATTRIBUTION ROW: the edit is provably inert until a boiler burns coal

Those four `dry` hashes are not new numbers. They are **the pre-ruling review's own hashes**,
`8c28f1ff` / `bc515b13` / `83b0a873` / `dac0c325`, reproduced bit for bit on the new contract data,
twice each. A rider that does not buy the boiler and does not walk to the coal plays a run the sim
cannot distinguish from the one it played before the ruling. **No balance moved; the ruling added an
option, not a force.**

### 4. Law 2 (null floors) and the pins

- `assets/contracts/null-floors.json`: **this slice's diff is EMPTY, and that is the measured
  result rather than an omission.** A `--check` on the untouched pre-merge tree reported exactly
  `1 null-floor difference` and named it: `eraStamp` (`adf327caf` vs derived `b253af85c`), already
  stale on `main` before this branch existed (F-E2PL-4). A full regen then wrote **67 pairs, 0
  `secured:true`**, and that one field was the only byte that moved — **not one floor changed**,
  including the Hill Mine's and the Pressure Garden's, and the two newly-pressured contracts add no
  rows because they are still exempt. When `main` advanced mid-build with the fairground admission
  (which legitimately adds floor rows), main's file was taken whole rather than re-churned, so the
  slice leaves the artifact exactly as `main` wrote it. Idle with pressure declared still builds
  nothing: the four idle rows above terminate at waves 1–2 on the same hashes the previous review
  published (`artifacts/e2-pressure-line/floors-regen.txt` preserves the regen).
- **The Hill Mine's pin re-measured, not inherited:** `--contract e2-hill-mine --seed e2-hill-mine-01`
  through the (flag-extended) prover still returns **SECURED w15 `fnv1a32:c40556c0`** — the shipped
  value, exactly.
- `docs/bench/same-game-audit.md` regenerated **on the merged tree** (F-2084-1's own law — the
  audit test's comment block records five earlier slices that pinned a pre-merge number and were
  wrong). **The summary does not move** — the merged tree measures `0 agent-exceeds / 485
  agent-lacks / 1035 equal / 4 not-offered` over 1524 rows with **7** exemptions, which is exactly
  what `main`'s own twelfth-stack pin already says after the fairground admission. So
  `scripts/same-game-audit.test.mjs` keeps main's numbers verbatim and gains only a note; nothing
  was edited into agreement. (Pre-merge, on `b253af85c`, the same regen measured 504/1016/4 with 8
  exemptions and likewise did not move that base's numbers — the pressure line is summary-neutral on
  both bases.) Two rows per contract flip in place
  (`contract manifest does not advertise boiler_house` → `advertises BUILD boiler_house`, and the
  browser-menu twin), and both land `equal` because the door predicate always accepted the buildable.
  The remaining churn is coordinate rot: this slice's comment block moved
  `src/sim/HeadlessContractSim.ts` citations by 21 lines, so every audit row citing that file
  re-derived its `file:line`.

### 5. Where the PLAYER sees it, on a plain boot (Mistake #10)

`artifacts/e2-pressure-line/boot-probe.spec.ts` — **4/4 green, both contracts × desktop 1280×800 and
mobile 390×844**, zero console/page errors.

It does **not** boot `?contract=e2-trestle`, and that is the point: `ContractFamilies.ts:1329`
refuses a requested contract with `fallbackReason: 'debug-disabled'` unless it was launched from the
board, so a no-debug URL boot silently runs the DEFAULT claim. The probe walks the real path — seed
the predecessor win, enter the town, cross to the tavern, open the board, click the card — and then
asserts on the resolved contract that `contract.activeId` is the one clicked, `fallbackReason` is
null, `pressure.enabled` is **true**, three seams exist, and **zero** boilers are built. The line is
offered, never granted.

## Why the maps still win, measured rather than inferred

The Hill Mine's stake sits **29wu** from the fixed seams. The trestle's only hero stake
(`south-boiler-site`, 12,-12) is **55wu** from them; the incline's (`lower-engine-house`, -24,-18) is
**58wu**. The Prospector is the same single body that earns every coin, so on these two maps the
pressure line is bought with the economy that buys the guns:

- **`e2-trestle` — the ruling changes nothing about admission, because seed 01 never secures.** Best
  measured play is unchanged from the pre-ruling review: secure on seed 02 at wave 18, unsecured at
  wave 12/13 on seed 01. Every configuration that actually fuels the arsenal finishes *earlier*
  (w12/w13) than the one that ignores it (w18) — 317 pressure and 65 shots do not repay two waves of
  building and a 110wu round trip.
- **`e2-incline` — not close, and the pressure line is not why.** It terminates at wave 6/9 against
  `secureWave` 12 in **all 14 ladder × upgrade combinations on each bench seed**, with only **two**
  turrets standing when the hero falls. Coal timing is irrelevant there: on seed 01 the schedules `9,10,11`, `11,12,13`
  and `99,99,99` return the *identical* hash, because the run is over before the first of them
  fires. What refuses is the lower yard — four spawn edges onto a stake the hero cannot leave.

Both rows therefore stay in `CONTRACT_ADMISSION_EXEMPTIONS`, **reworded from the dead reason to the
measured one**, in the shape `e6-showroom` and `e3-fairground` established: the reason died, the
refusal survived.

## Merge classification

Built on `b253af85c` (branch fast-forwarded onto `main` before any edit; 0 commits of its own
beforehand), then **merged with `main` at `fb7a1abcc`** when the attended window landed the
`e3-fairground` admission mid-build (merge `687876393`). Five files conflicted and each was resolved
by its own rule, none by hand-splitting a derived number:

- **MAIN-MOVED, taken whole:** `assets/contracts/null-floors.json` (the fairground admission adds
  real floor rows; this slice adds none — see Law 2 above).
- **RE-DERIVED, never hand-merged:** `docs/bench/same-game-audit.md` — regenerated from the merged
  tree, and `scripts/same-game-audit.test.mjs` keeps `main`'s pins **verbatim** because the merged
  regen measured them unchanged (485/1035/4, 7 exemptions).
- **UNION, both sides kept:** `tasks/BACKLOG.md` (main's four-rulings row first — it is the row that
  dispatched this slice — then this slice's shipped row and F-E2PL-1), and `public/skill.md` (main's
  new fairground-admission paragraph plus this slice's two-railcar paragraph, with my opener reworded
  because main removed the sentence it referred back to).
- **AUTO-MERGED AND VERIFIED BY READING:** `src/sim/HeadlessContractSim.ts` — `e3-fairground`'s row
  is gone (main's) and both reworded railcar reasons are intact (mine); exemptions 8 → **7**.

| file | change |
|---|---|
| `assets/contracts/epoch-2-steamworks/contracts.json` | +2 lines: `"pressureEnabled": true` on both twists |
| `src/sim/HeadlessContractSim.ts` | two exemption reasons reworded + the ruling recorded verbatim |
| `e2e/er01-e2-census.spec.ts` | the exempt pair now asserts `twist.pressureEnabled === true` |
| `assets/contracts/null-floors.json` | **no diff** — regen measured `eraStamp` alone, and main's file stands |
| `docs/bench/same-game-audit.md` | regen on the merged tree; two row flips per contract + citation re-derivation |
| `scripts/same-game-audit.test.mjs` | note only — main's pins kept verbatim, re-measured unchanged |
| `public/skill.md` | prose: the two held railcars now carry a declared pressure line |
| `tasks/BACKLOG.md` | the shipped row, F-E2PL-1's declaring row, F-E2PA-6 discharged, F-1608-2 re-priced |
| `reviews/e2-pressure-line-railcars.md` | this file |
| `artifacts/e2-pressure-line/*` | prover sweep, coal probe, battery, boot probe, all logs |
| `artifacts/e2-railcar-arsenal/prover.mjs` | two opt-in play flags, default-identical (see F-E2PL-2) |
| `playwright.e2pl*.config.ts` | scratch dev-server configs on port 5278 |

## Gates

The census, admission, audit, report, skill.md, citation and door-ratchet guards were **re-run after
the merge** and are green there (5 playwright + 30 node assertions). The browser suites below ran on
`b253af85c` + this slice and carry over unmodified, proven rather than assumed:
`git diff --name-only b253af85c..fb7a1abcc` matches **nothing** under `e2e/e2-*`, `src/systems/Pressure*`,
`src/game/Game.ts`, `assets/contracts/epoch-2-*`, `e2e/m1-01*`, `e2e/m2-01*` or `e2e/task-025*`.

| gate | result |
|---|---|
| `tsc --noEmit` | clean (pre-merge and post-merge) |
| `vite build` + asset diet | green |
| `e2e/er01-e2-census.spec.ts` (+ `ap16-4-contract-admission`) | 4/4 green pre-merge; **5/5 green re-run on the merged tree** |
| E2 adjacent set (hill-mine, pressure-garden, trestle, incline, arsenal, pressure-economy, pressure-in-run, clarity-and-wreckers, ap16-4) × desktop + mobile | **40 passed · 2 skipped (deliberate) · 2 failed = ONE REGISTERED KNOWN RED × both projects** — see below |
| `task-025` · `m1-01` · `m2-01` × desktop + mobile | green |
| plain-boot probe × 2 contracts × 2 viewports | 4/4 green, 0 console/page errors |
| `null-floor-anchors --check` | 67 pairs measured; only `eraStamp` differed (pre-existing, F-E2PL-4) |
| `same-game-audit` · `same-game-report-guard` · `door-admission-ratchet` · `skillmd-guard` · `citation-title-guard` on the merged tree | **30/30 green** |
| `test:node-guards`, run TWICE (contended, then alone on the merged tree) | **472 green assertions · 5 reds, all ONE worktree-environment cause, none this slice's** — see below |

**THE NODE-GUARDS BATTERY, ROW BY ROW, WITH NOTHING WAVED THROUGH.** The first run (pre-merge) had
six reds; the second — merged tree, board verified clear first — has five, and the difference itself
is evidence.

- ⑴ **ONE WAS MINE, AND IT IS CURED.** `same-game-report-guard.test.mjs:61` reddened with its own fix
  in the message — *"stale exemption reason for 'e2-incline' — regenerate with `node
  scripts/same-game-audit.mjs --write-report`"* — because I corrected a run count inside an exemption
  string after the first regen. Regenerated; `same-game-audit` + `same-game-report-guard` +
  `door-admission-ratchet` + `skillmd-guard` + `citation-title-guard` now run **30/30 green** on the
  merged tree, with `exemptions.length === 7` and `485/1035/4` unmoved.
- ⑵ **CONCURRENCY — AND THE SECOND RUN PROVES THE ATTRIBUTION.** `contention is advisory, correctly
  counted, and absent when alone` failed on the first run because we were **not alone**: a second
  battery was live in `worktrees/lane-d` (pid 93798, cwd confirmed by `lsof -a -p <pid> -d cwd`).
  Re-run alone, **it passes**. The guard did its job and the diagnosis holds. (Checked and excluded:
  a poll loop whose own command line contains the string `run-node-guards` is found by
  `contentionStamp`'s `pgrep` but **filtered out** by `runsNodeGuardsBattery`, whose regex at
  `scripts/node-guards-concurrency.mjs:21` demands an actual `node …/run-node-guards.mjs` invocation —
  so watching the battery does not corrupt it.)
- ⑶ **THE REMAINING FIVE ARE ONE CAUSE — see F-E2PL-5.** Four `suite-red-inventory` reducer arms and
  `worker-type-coverage`'s *"every functions/**/*.ts is type-checked"* die on `Cannot find package
  'typescript'`, and `fixture-teardown` reddens **downstream of them**: its assertion text names the
  culprit outright — *"scripts/suite-red-inventory.test.mjs child failed"* — because it re-runs every
  `scripts/*.test.mjs` and asserts `run.status === 0`. **An agent worktree has no installed packages**
  (its `node_modules/` holds only `.vite`/`.vite-temp`); ordinary code survives because Node walks UP
  to the parent repo, and these two guards defeat that walk by construction —
  `worker-type-coverage.test.mjs:10` hard-codes `join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc')`
  and `suite-red-inventory.test.mjs:65` symlinks `ROOT/node_modules` into a temp tree. Proven at the
  source and confirmed by the cascade's own message, not inferred from a run.

**THE TWO REDS ARE ATTRIBUTED THREE WAYS, NOT EXPLAINED AWAY.** Both are the same test —
`e2e/e2-hill-mine.spec.ts:166`, *"Hill Mine render descriptor auto-activates mesh relief and leaves
the flat claim fallback alone"* — once per project. ⑴ **Fingerprint match:** `logs/suite-red-inventory.md`
lines **152–153** already record this exact file, test, line and assertion (`toBeCloseTo`) failing on
**both** `desktop-chrome` and `mobile-chrome`. ⑵ **Revert-and-reproduce:** with
`assets/contracts/epoch-2-steamworks/contracts.json` checked back out to `HEAD` — the only file in
this slice that could reach browser terrain — the solo re-run fails **identically**, `Expected: -0.5
Received: -0.45728564262390137`, to the digit. ⑶ **Reach:** the test asserts visual-vs-sim terrain
height on the **Hill Mine**, a contract this slice does not touch. The specs that DO exercise the two
changed contracts (`e2-trestle`, `e2-incline`, `e2-pressure-in-run`'s *"boilers remain Hill Mine-only"*
guard, which boots the default claim) are green on both projects.

## Findings

- **F-E2PL-1 — the coal seams are a module constant, and that is what actually holds these two maps
  out.** `PressureSystem.ts:23` hard-codes `(-12,39)`, `(-5,43)`, `(3,39)`; `AUTHORED_TWIST_KEYS`
  cannot express a per-tile alternative. Those coordinates were chosen for the Hill Mine's minehead
  and land in the Incline's `upper-ore-yard` and outside every one of the Trestle's build zones — 55
  and 58wu from the only stakes those heroes hold. **A contract-authored `coalSeams` list (defaulting
  to today's three when absent) would let the Trestle put its seams on the north approach and the
  Incline put its seams in the upper yard, and would cost nothing to the two contracts that ship
  today.** It is a real slice, it changes `PressureSystem` for all four E2 maps, and it is a design
  question — the seams are also *where the coal is* in the fiction. **OWNER/ATTENDED.** This is the
  smallest change that could plausibly turn either of these maps into an admission.
- **F-E2PL-2 — the prover gained two opt-in play flags, proven default-identical.** `--coal-waves`
  (default `5,8,11`) and a `turrets-dry` ladder (the `turrets` rungs with the boiler struck out) were
  needed to measure the ruling's COST as well as its gift — without them, every ladder buys a boiler
  because the map now sells one, and no run can express "declared but declined". Neutrality is not
  asserted, it is measured: the Hill Mine's shipped pin `fnv1a32:c40556c0` reproduces exactly, and
  all four `dry` controls reproduce the previous review's pre-ruling hashes.
- **F-E2PL-3 — the predecessor's boot probe measured the wrong tile, and this is how to tell.**
  `artifacts/e2-railcar-arsenal/boot-probe.spec.ts:9` boots `/?contract=e2-hill-mine` with no
  `?debug` and asserts a clean console. `ContractFamilies.ts:1329` discards that parameter outside
  debug/launched/replayed, so the probe ran the DEFAULT claim while reporting on the Hill Mine. The
  assertion it makes (console clean) is too weak for the error to show. Non-blocking — the Hill
  Mine's admission rests on the sim, not on that probe — but any future plain-boot probe must assert
  `contract.activeId` (this slice's does) or it is not probing what it says.
- **F-E2PL-5 — the standing node-guards battery CANNOT go fully green in an agent worktree, and
  nothing says so.** Five of its assertions resolve `typescript` through the worktree's own
  `node_modules` — `scripts/worker-type-coverage.test.mjs:10` (`join(ROOT, 'node_modules',
  'typescript', 'bin', 'tsc')`) and `scripts/suite-red-inventory.test.mjs:65` (symlinking
  `ROOT/node_modules` into a temp root). An agent worktree has no installed packages; ordinary code
  survives because Node walks UP to the parent repo, and these two defeat that walk. So every
  worktree-built slice inherits the same reds — four reducer arms, `worker-type-coverage`, and the
  `fixture-teardown` cascade they cause — and each drain must re-derive that from scratch. **Fire-authorable**, two candidate cures: resolve
  the compiler with `require.resolve('typescript')` instead of a path join, or have the guards skip
  with a stated reason when `ROOT/node_modules` is empty. Filed so the next worktree agent does not
  spend a gate cycle proving it again.
- **F-E2PL-4 — `null-floors.json`'s `eraStamp` was already stale on `main`.** Pinned `adf327caf`
  against a derived `b253af85c`; a `--check` on the untouched tree fails on that one field and
  nothing else. Regenerated here as ordinary drain bookkeeping, and named so a drain does not
  mis-attribute the byte to this slice. Expect it to go stale again the moment `main` advances: the
  stamp is `git merge-base HEAD main`, which no mechanism refreshes.
