# charter-press-locked-lands-1: the Charter Press Lever offers only unlocked lands

Task `tasks/charter-press-locked-lands-1.md` (F-1179-4, owner ruling "a", 2026-09-26). Implementer: Claude Opus 5.5 at maximum effort, spawned by the attended session. Scratch worktree `/Users/robin/Claude/Projects/wt-cpl1`, branch `feat/charter-press-locked-lands-1`, base `6cf158c4a` (main when cut), tip: the commit that adds this report (the three code commits are listed in section 9).

**Verdict: READY-FOR-GATES.** The Lever renders only the lands this profile has unlocked (a locked land is not rendered at all), preselects the first land it offers, and every land it offers opens when pressed, with the briefing naming it. One source file changed, `src/charter/PressPanel.ts`. The engine hash moves `642edcf6` to `f8b1c19a` on that file alone (the pin is the drain's), and the existing agent tape replays to its recorded score, byte-identical before and after.

## 1. What the Lever offers, before and after (measured, both projects)

`lever-probe.mjs` against a dev server of each arm: **before** = a detached worktree of the base `6cf158c4a`, **after** = this branch. desktop-chrome 1280x800 and mobile-chrome (Pixel 5 at 390x844), as in `playwright.config.ts`. Run 2 started 12:13Z (before) and 12:20Z (after), load 7 to 8, is in `before/` and `after/`; run 1 (started 11:28Z and 11:29Z, `run1/`) read the same offers and the same outcomes.

| save | before: land cards | before: what the press opened | after: land cards | after: what the press opened |
|---|---|---|---|---|
| fresh profile | 5 (The Claim preselected) | pressed Twin Banks: URL `contract=e1-twin-banks`, briefing **"The Claim"**, `activeId the-claim`, `fallbackReason debug-disabled`, `stagedLaunchClear {staged-contract-locked, charterDocumentPresent: true}` | **1: The Claim, preselected** | pressed The Claim: `contract=the-claim`, briefing "The Claim: Defend the Camp", `stagedLaunchClear null` |
| secured Claim (the rig fixture) | 5 | pressed Twin Banks: `contract=e1-twin-banks`, "Twin Banks: Defend the Camp", clear null | **3: The Claim, The Dry Gulch, Twin Banks** | pressed Twin Banks: `contract=e1-twin-banks`, "Twin Banks: Defend the Camp", clear null |
| preview seam open | 5 | pressed The Baron's Claim: `contract=e1-baron`, "The Baron's Claim: Defend the Camp", clear null | 5 | the same |

Every row is identical in both projects, with 0 console and 0 page errors in all 24 rows (12 per arm).

Also measured (`before/probe.json`, `after/probe.json`):
- land cards in the DOM before the player opens the Lever: 5 before, **0** after;
- land plates requested by an `?editor` boot before the Lever is opened: 5 before, **0** after; on opening, after: only the offered plates (1, 3 and 5 of them);
- localStorage keys written by opening the Lever: 0 in all 12 rows of both arms (the run boot had already saved its research registry);
- plain boots, both projects, both arms: the town (`/` with the default profile seeded the way `e2e/044-start-screen.spec.ts:20-33` does, then Enter Town, town frame > 10) and the press (`/?editor`, the Lever opened): 0 console / 0 page errors; the plain press offered all five before and `[the-claim]` after.

Screenshots: `<project>-<save>-lever.png` is the Lever face (the inspector's overlapping sections hidden with the rules `e2e/cp04-lever.spec.ts:92-102` (`:81-91` on main) uses for its own shots); `<project>-<save>-press-<land>-briefing.png` is the briefing card that press opened. The F-1179-4 symptom is `before/desktop-chrome-fresh-press-e1-twin-banks-briefing.png` (Twin Banks pressed, The Claim briefed); the cure is `after/*-fresh-lever.png` (one card) and `after/*-secured-claim-press-e1-twin-banks-briefing.png` (Twin Banks: Defend the Camp).

## 2. What changed

`src/charter/PressPanel.ts`, +33 / -11, commit `3ed71bbce`:
- The land cards are no longer part of the panel's HTML when it is built. `renderLeverLands()` builds them when the player opens the Lever (the `press-mode-lever` click), every time it is opened, so the unlock read happens on the player's opening and never while the panel is built at an `?editor` boot.
- A land is offered only when its contract is on the board (`listBoardContracts()`) and `contractUnlockStatus(contract).unlocked`: exactly the two checks the boot applies before it honours a staged launch (`reverifyStagedContractLaunch`, `src/meta/ContractUnlock.ts:161-174`). So the land pressed is the land that opens.
- Preview seam preserved: the "Open every claim" override lives inside `contractUnlockStatus` (`ContractUnlock.ts:99-100`), so a preview build still offers all five, and the boot honours them for the same reason. The `RELEASE_E1` early return (`:96`) is untouched, and the Press is not reachable in a release build at all (the E1 dist carries no `charter-lever` string; `static-gates.txt`).
- The selection defaults to the first offered land and keeps the player's choice across re-openings while it is still offered. `selectedLand` is null until the Lever has rendered, and the press refuses with the existing line "The Press needs a grown-up to check its paper." if it is ever null (unreachable in play: The Claim is `default` in the first era and is always offered).
- Copy unchanged: the "Pick a land" legend and the intro stay as they were. One card renders in the existing two-column grid at half width, the way the fifth card always did (`after/desktop-chrome-fresh-lever.png`).
- Side effect, measured: an `?editor` boot no longer fetches the five land plates (3.2 to 3.9 MB each in the dev tree) before the Lever is opened; the offered plates load when it opens.
- Not changed: `src/charter/templates/LeverTemplates.ts` (the land-to-contract map exists, section 3), `src/meta/ContractUnlock.ts`, any unlock rule or threshold, `src/game/**`, `assets/**`, `package.json`, the ledgers.

## 3. The mapping and the gate

The mapping is sound, so `LeverTemplates.ts` stayed untouched: the lever land ids are the E1 contract ids verbatim (`LeverTemplates.ts:99` keys `landsById` by contract id and `createLeverCharter` clones that manifest), and `launchStampedCharter` writes `charterLineageRootId(charter)`, which is the land id by construction, into `contract=` (base `PressPanel.ts:280-284`). The failure was the unlock gate at boot, as F-1179-3 found: `src/main.ts:198` runs `reverifyStagedContractLaunch()` before `activeContract()`; for a locked land it records `staged-contract-locked` and `clearPlayerContractLaunch()` (`ContractFamilies.ts:1289`) removes both launch keys; the press-through URL carries no `debug`, so `activeContractSelection` falls back with `fallbackReason 'debug-disabled'` (`ContractFamilies.ts:1358`) and The Claim opens. The probe measured exactly that on the base (section 1, first row). The cure keeps the gate and stops offering what it will refuse; the predicate is untouched.

## 4. Specs

**F-CPL1-1, a premise the master got wrong, and the lift that answered it.** Measured: `grep -n "lever-land|press-mode-lever|lever-press" e2e/*.ts` hits only `e2e/cp04-lever.spec.ts` and `e2e/wd04-postscripts.spec.ts:115-116`. None of the three specs the master names renders the Lever: `ap16-7-epoch-levers.spec.ts` is the E5 and E6 sim levers through `HeadlessContractSim`, `charter-press-totality.spec.ts` the mutation-arm totality, `cp01-charter-roundtrip.spec.ts` the CP-01 round trip, all node-side. The five-card assertion the master expected to update was `e2e/cp04-lever.spec.ts:73` (`toHaveCount(5)` on a fresh profile), outside TOUCH-ONLY; it asserted the defect. The attended session granted a one-file lift on 2026-09-26, recorded here as the named lift F-CPL1-1, committed alone as `5dc23a6b6`: cp04 now asserts the fresh truth (one card, The Claim, preselected), then flips the preview seam by its own function and re-opens the Lever to reach the five cards the rest of that test uses (every plate loads, the land-cards shot, the Twin Banks press), after a poll that waits for the five plates because the cards now render when the Lever opens. The preview seam and not the secured-Claim fixture, because the downstream checks all five plates and the five-card shot, which only five offered cards reach. Nothing else in that file changed. On the branch the lifted test reaches its press-through for the first time since the unlock gate landed: `treatment/cp04-lifted-lever-test-stamped-launch-desktop-chrome.png` is its own `:119` shot, briefing "Twin Banks: Build Something Big".

**New rows** (commit `9fb7cd9b6`), in `e2e/charter-press-totality.spec.ts` (a named spec, and already the rig's importer), `test.describe('the Lever offers only unlocked lands')`, both projects. Each row asserts the whole offer and a press-through (URL `contract=`, `activeId`, the briefing, `stagedLaunchClear` null) with zero console and page errors:
- a fresh profile is offered `['the-claim']`, preselected, with no Twin Banks card; pressing opens The Claim ("The Claim: Defend the Camp");
- a secured Claim (the rig's new `seedSecuredClaimProfile`: the save one secured Claim leaves, its secureWave being 10, seeded once per tab so the Press's own launch keys survive the press-through) is offered `['the-claim', 'e1-dry-gulch', 'e1-twin-banks']`, and Twin Banks opens Twin Banks ("Twin Banks: Defend the Camp");
- the preview seam, flipped by `setPreviewUnlockAll` (the function the board's control calls; no key written by hand): one card, then five, then one when closed again, then five, and The Baron's Claim presses through ("The Baron's Claim: Defend the Camp").
No debug flag was added.

**Mutation controls on the base** (the control worktree with the new spec and rig copied in): the three new rows are red in both projects, each at its offer assertion (fresh: 4 unexpected cards; secured: 2; preview: 4), and the lifted cp04 Lever test is red in both projects at the fresh count (expected 1, received 5). On the branch all of them are green.

## 5. Evidence

All e2e with `--workers=1`, `GR_CAPTURE_EXTERNAL_SERVER=1`, scratch ports 5742 (control) and 5741 (treatment), a warm boot first, every server started and stopped by pid inside its batch's one drain-lock call (`runs/batch-*.out`).

| gate | measured |
|---|---|
| tsc | rc 0 on the branch and at the tip (tsconfig includes `e2e/`) |
| build, E1 build, `assert-release-build` | rc 0, rc 0, rc 0 (`static-gates.txt`) |
| the three named specs with the new rows | ap16-7 2/2, charter-press-totality 10/10, cp01 20/20, both projects |
| the master's adjacents | task-025 10/10, m2-01 14/14, both projects |
| the Lever's other specs | cp04 12/26: the lifted Lever test 2/2 green, the 14 reds are the seeded boots and match the control row for row; wd04 4/6: the Lever-pull test 2/2 green, `:33` x2 match the control |
| the rig's importers and the press panel's specs | cp02-charter-stamp 28/28, cp02-charter-boot 18/18, cp06-share 4/4; cp03 4/6, press-edit-visibility 4/6, ed-01 6/8 (reds attributed in section 7) |
| treatment, all 13 files | 136 passed, 22 failed of 158, 9.8 min, 12:21Z (`treatment/e2e-treatment.log`) |
| control | 18 passed, 24 failed of 42, 6.0 min; lift mutation 0/2; adjacents D-PENDING (`control/`) |
| node-guards, `GR_GUARD_NO_ARTIFACT=1 npm run test:node-guards` | tests 1037, pass 1026, fail 6, skipped 5, rc 1, 17.3 min at load 6 to 9 (`treatment/node-guards-battery.log`); every red attributed in section 7 |
| zero errors | plain town and plain press 0/0 in both projects on both arms; every new row asserts 0/0 |
| engine hash | `642edcf65fca...` before (the pin, #66) to `f8b1c19ab586...` after; 1 of 662 inputs differs: `src/charter/PressPanel.ts` (`engine-hash-attribution.txt`) |
| assay replay of an existing tape | identical on both arms (`assay-replay.txt`) |

## 6. The engine hash and the tape

- Before: `642edcf65fcab2089164c6f33cfabf4a1a9805735a3b6df6f33dfa947cb6a32a`, equal to `assets/engine-era.json` (pin #66). After: `f8b1c19ab5864e48f695ed5885cc9eb627d9ed890a846c90aa6c112b1929f049`. Computed with `computeEngineHash` on both trees file by file: 662 input files each, exactly one differs, `src/charter/PressPanel.ts`; the store was the same checkout (`5793a96`, clean) for both.
- **Cause line for the pin: the press panel's bytes; no sim, contract, floor or table changed.** `PressPanel.ts` is imported only by `src/editor/DescriptorInspector.ts` (the `?editor` chunk), never by the sim.
- Tape: `artifacts/gauntlet-heat15-cd24d12d/probe/tape.json` (the-claim, seed `e1-the-claim-01`, recorded `fnv1a32:b131e18e`, secured, 10 waves, 335 gold, 300 s, 9001 ticks). `node scripts/assay-replay-agent.mjs` on the base and on the branch: rc 0 both, stdout byte-identical, `fnv1a32:b131e18e`, secured, 10 waves, 335 gold, 300 s, 9001 ticks: its recorded score, unchanged.

## 7. Reds, attributed

Control = a detached worktree of `6cf158c4a` in the same environment (no `.env.local` in either tree), removed afterwards.

e2e (22 on the branch):
- cp04 seeded boots, 7 x 2 (14): the same 14 rows red on the control with the same values (for example "The Dry Gulch: Build Something Big" expected, "The Dry Gulch" received). F-1179-3: these specs hand-stage a locked land's charter and the boot's re-check clears it; not the Lever's path (F-CPL1-3).
- wd04 `:33` x 2: red on the control identically (`matches: false` at `:63`, the E5 ceremony postscript registration); unrelated to the press.
- cp03 `:64` x 2 and press-edit-visibility `:75` x 2: a Full Press shelf Launch of a locked contract (Twin Banks, The Dry Gulch) on a fresh profile briefs "The Claim". D-PENDING-SHELF. The same mechanism is measured directly on both arms by the shelf probe (F-CPL1-2); that code path is byte-identical between the arms.
- ed-01 `:52` x 2: terrain depth 0.68 where 0 is expected after a descriptor edit. D-PENDING-ED01.

node-guards (6 on the branch):
- `bench-seeds` "rotation registry stays outside the engine identity corpus" and `engine-era-guard` "the landed registry names the live engine and stays outside its hash corpus": this branch's hash move; both pass on the control (base hash = the pin). The drain's same-era pin cures them.
- `ledger-backup-pull` x 2 ("dry run prints a bounded plan without contacting the droplet", "today's local backup makes the pull an offline no-op"): "GR_DROPLET_HOST missing from the environment and .env.local", identical on the control. A scratch worktree carries no `.env.local`, and must not.
- `desk-declaration-guard` "the live board is green under this guard": "REFUSING, this is a linked worktree and its STATUS.md line-1 is NOT the one main carries", identical on the control.
- the fixture-teardown sweep ("all 162 scripts/*.test.mjs fixture owners remove their temp directories"): its one survivor is `ledger-mirror-freshness-guard.test.mjs` (one `s2672-dest-*` directory; its test 23 fails). Reproduced alone in both arms with a private TMPDIR: control 24/25 and 1 survivor, branch 24/25 and 1 survivor, the same failing test (`control/ledger-mirror-sweep-child-control.log`, `treatment/ledger-mirror-sweep-child-branch.log`). The sweep's reported failing children are the ones above plus `ledger-backup-fill-gaps-guard` and `ledger-pull-supply-window-guard`, which fail on the control too (`control/node-guards-control.log`: 53 tests, 38 pass, 15 fail across the six files, bench-seeds and engine-era-guard all green).

## 8. Findings

- **F-CPL1-1 (premise, answered by a named lift):** section 4.
- **F-CPL1-2 (MEASURED, not fixed, outside the slice): the Full Press shelf's Launch honours a locked charter only in name, the shape F-1179-4 had.** The editor opens any board contract under `?editor`, the stamp checks the charter and not the unlock, and Launch stages the launch the boot then refuses. `finding-shelf-launch-probe.mjs`, fresh profile, Twin Banks stamped and launched: URL `contract=e1-twin-banks`, `activeId the-claim`, `fallbackReason debug-disabled`, `stagedLaunchClear {staged-contract-locked, charterDocumentPresent: true}`, briefing "The Claim", identical on both arms (`before/finding-shelf-launch.json`, `after/finding-shelf-launch.json`). The same mechanism is why cp03 `:64` and press-edit-visibility `:75` are red on main. Ruling (a) covered the Lever; what a shelf Launch should do with a locked charter (refuse it, show it locked, or unlock on launch) is the same fork on another surface and an owner call. Recommendation: refuse that Launch with an honest line and keep the charter on the shelf, where it stays shareable; then realign cp03 and press-edit-visibility to launch an unlocked land or seed the rig fixture.
- **F-CPL1-3 (MEASURED): cp04's seven locked-land seeded boots (`:160-180` on main, `:171-191` here) assert a path the game refuses.** They hand-stage a locked land's charter in sessionStorage and expect its composed name; under ruling (a) the Lever cannot produce that launch and the boot correctly clears a forged one. This is F-1179-3's successor, unblocked by the answer to F-1180-3: seed the unlock per row (the rig fixture opens The Dry Gulch and Twin Banks; Night Shift and the Baron need the preview seam or a science fixture), and keep `a locked staged contract clear is observable` (`:133` on main, `:144` here) on a virgin profile, because it depends on the lock. Outside this lift, which said nothing else in cp04 changes.
- **F-CPL1-4 (INFERRED from reading, not exercised): in a debug `epoch=` editor URL the offer and the boot's check can read different eras.** `loadResearchState` defaults `epochId = activeEpochId()` (`src/meta/ResearchTree.ts:141-146`), and `activeEpochId` honours a debug `epoch=` param (`src/meta/ContractFamilies.ts:1117-1127`). An editor opened as `?editor&debug&epoch=epoch-10-deepsky` (wd04 does) would evaluate the Baron's `science-complete` against another era than the press-through boot (`?contract=e1-baron`, the first era). Debug-only, and inside the unlock predicate, outside this firewall.
- Observation, not investigated: on a virgin profile (no profile state at all) the probe's Enter Town click timed out after 30 s on both arms in run 1; with the default profile seeded the way e2e/044 does, both arms enter the town with 0 errors. Identical on the base, so not this slice; noted for whoever owns the first-boot flow.

## 9. Firewall and commits

`git diff --stat 6cf158c4a..HEAD`: `src/charter/PressPanel.ts` (TOUCH-ONLY), `e2e/charter-press-totality.spec.ts` (TOUCH-ONLY, named), `e2e/charter-press.rig.ts` (TOUCH-ONLY), `e2e/cp04-lever.spec.ts` (the named lift F-CPL1-1, granted by the attended session), `artifacts/charter-press-locked-lands-1/**` (TOUCH-ONLY). Not touched: `src/meta/ContractUnlock.ts`, `src/charter/templates/LeverTemplates.ts`, `src/game/**`, `assets/**`, `package.json`, `STATUS.md`, `tasks/**`, `specs/**`, the ledgers.

| commit | concern |
|---|---|
| `3ed71bbce` | the Lever offers only unlocked lands (`src/charter/PressPanel.ts`) |
| `9fb7cd9b6` | the three new rows and the rig's profile fixture |
| `5dc23a6b6` | the F-CPL1-1 lift in `e2e/cp04-lever.spec.ts` |
| this commit | this report and its evidence (14.1 MB in 52 files including this report, under the 40 MB per-landing budget) |

Not committed, and not work (the F-1407-1 factory-churn classes): the spec runs rewrote the tracked shots `reviews/shots-cp04/{land-cards,lever-mode}.png`, `reviews/shots-press-cp01-03/press-panel-{desktop,mobile}-chrome.png` and `reviews/shots-press-visibility/{dirty-hint,pond-preview,raise-before-after}.png`, and left the untracked `artifacts/056/`, `artifacts/ed-01/*.png` and `reviews/shots-cp04/stamped-launch.png` (copied into `treatment/` above). They stay in the worktree for the drain to keep or revert.

## 10. For the drain, in order

1. Pin `f8b1c19ab5864e48f695ed5885cc9eb627d9ed890a846c90aa6c112b1929f049` (same era) with the cause "the press panel's bytes; no sim, contract, floor or table changed"; `bench-seeds` and `engine-era-guard` go green with it.
2. Allowed e2e reds for the landing, each matching the control: cp04 seeded boots (14), wd04 `:33` (2), cp03 `:64` (2), press-edit-visibility `:75` (2), ed-01 `:52` (2). Allowed battery rows: `ledger-backup-pull` (2), `desk-declaration-guard` (1), the fixture-teardown sweep (its survivor is `ledger-mirror-freshness-guard`, identical on the control).
3. Desk: F-CPL1-2 (the shelf Launch fork, recommendation above). Ledger: F-CPL1-3 as F-1179-3's successor task. F-CPL1-4 for whoever next touches the unlock predicate.
