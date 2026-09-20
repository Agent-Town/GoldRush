# Task c5b-emdash-pin-and-determinism: land the two pins the em-dash sweep moved (lane-c, prefix "fix:")

**FIRE-AUTHORED s2235 (attended review welcome).** Corrective for `c5-emdash-sweep`, which is GATED, GOOD, and HELD on exactly two items — see `reviews/c5-emdash-sweep.md`, findings F-2235-4 and F-2235-5.

You are Codex, implementer for Gold Rush, running natively on Robin's Mac in worktrees/lane-c.

READ FIRST: `AGENTS.md`; the review — ⚠️ **it is NOT in your worktree. `reviews/c5-emdash-sweep.md` exists only on `main`, which your lane does not have (measured s2236: ABSENT from the `lane/c` tree, present on `main`). Read it with `git show main:reviews/c5-emdash-sweep.md`** — the whole VERDICT and BLOCKER sections, since they contain the measurement you are acting on and you do not have to re-derive it; `scripts/gr-sim-campaign.test.mjs` at the `e3-canyon-works` locked-contract pin (line 164 at time of writing); `scripts/gr-sim.test.mjs` at the Baron outcome block — **find it by CONTENT, `eventLogHash: 'fnv1a32:5b1d21f1'` (line 837 at time of writing, inside the `assert.deepEqual(first.outcome, {…})` that opens at 828); coordinates rot, the string does not**; `src/sim/HeadlessContractSim.ts:1198` (the `eventLogHash` construction); `src/meta/ContractUnlock.ts`.

## ⚠️ PRE-FLIGHT — BUILD-ON-PREDECESSOR, NOT SAFE-DUPE. READ THIS FIRST.

**`lane/c` is `ahead=1` of main and that commit is `eb62124c1`, the em-dash sweep. It is UNDRAINED and it is the thing you are building ON. DO NOT reset, DO NOT `checkout -B lane/c main`, DO NOT `clean -fd`.** The ordinary lane pre-flight would destroy it (Mistake #2: w1-03 and polish-02 were lost exactly this way).

Verify the predecessor is present before you touch anything, and STOP if it is not:

```
git -C worktrees/lane-c log --oneline -1        # expect: eb62124c1 runner(lane-c): c5-emdash-sweep.md
grep -c "The Rocket Cart, captured" assets/contracts/epoch-1-frontier/contracts.json   # expect: 1
```

If the first does not name `c5-emdash-sweep`, or the grep returns `0`, the lane has been reset and the predecessor is gone: **STOP and report** — do not re-derive the sweep.

### The runner's dispatch guard needs this declaration, not just the prose above (F-2089-1)

⚠️ **The pre-flight above is a message to YOU; it cannot reach the runner's F-1522-1 lane-safety guard, which refuses any dispatch into a lane that HOLDS undrained paths (a bespoke pre-flight cannot beat the dispatch guard).** The BUILD-ON-PREDECESSOR opt-in is the one declared escape, and its whole safety argument is that the author NAMED every held path — so it cannot be satisfied by accident. The list below was MEASURED against the live lane by s2236 (`node scripts/lane-usable.mjs lane-c` → `HOLDS`, rc=2, 84 HELD paths), not remembered. The guard's predicate is SUBSET (held ⊆ declared), so if main absorbs any of these before dispatch the declaration only becomes safer.

LANE-SAFETY-OPT-IN: BUILD-ON-PREDECESSOR

EXPECTED-HOLDS: assets/contracts/epoch-1-frontier/contracts.json
EXPECTED-HOLDS: assets/contracts/epoch-4-motor/contracts.json
EXPECTED-HOLDS: assets/contracts/epoch-9-redfields/contracts.json
EXPECTED-HOLDS: e2e/044-start-screen.spec.ts
EXPECTED-HOLDS: e2e/057-baron-rocket-cart.spec.ts
EXPECTED-HOLDS: e2e/agent-view.spec.ts
EXPECTED-HOLDS: e2e/assay-ledger-page.spec.ts
EXPECTED-HOLDS: e2e/ceremony-framework.spec.ts
EXPECTED-HOLDS: e2e/cp04-lever.spec.ts
EXPECTED-HOLDS: e2e/drill-yard.spec.ts
EXPECTED-HOLDS: e2e/e1-baron.spec.ts
EXPECTED-HOLDS: e2e/e10-research-tree.spec.ts
EXPECTED-HOLDS: e2e/e2-stamp-mill.spec.ts
EXPECTED-HOLDS: e2e/e3-research-tree.spec.ts
EXPECTED-HOLDS: e2e/e4-research-tree.spec.ts
EXPECTED-HOLDS: e2e/e5-research-tree.spec.ts
EXPECTED-HOLDS: e2e/e6-research-tree.spec.ts
EXPECTED-HOLDS: e2e/e7-research-tree.spec.ts
EXPECTED-HOLDS: e2e/e8-research-tree.spec.ts
EXPECTED-HOLDS: e2e/e9-research-tree.spec.ts
EXPECTED-HOLDS: e2e/e9-seed-run-caravan.spec.ts
EXPECTED-HOLDS: e2e/field-book.spec.ts
EXPECTED-HOLDS: e2e/fixtures/e1-mechanics-manifests.json
EXPECTED-HOLDS: e2e/fresh-build-toast.spec.ts
EXPECTED-HOLDS: e2e/lb-01-county-standings.spec.ts
EXPECTED-HOLDS: e2e/ledger-era-chapters.spec.ts
EXPECTED-HOLDS: e2e/m5-04-offline-queue.spec.ts
EXPECTED-HOLDS: e2e/milk-county-board.spec.ts
EXPECTED-HOLDS: e2e/pause-goal-progress.spec.ts
EXPECTED-HOLDS: e2e/press-edit-visibility.spec.ts
EXPECTED-HOLDS: e2e/research-inheritance.spec.ts
EXPECTED-HOLDS: e2e/run-suspend.spec.ts
EXPECTED-HOLDS: e2e/save-slots.spec.ts
EXPECTED-HOLDS: e2e/schoolhouse-era-truth.spec.ts
EXPECTED-HOLDS: e2e/sea-2-season-page.spec.ts
EXPECTED-HOLDS: e2e/tl-03b-ledger-stats-window.spec.ts
EXPECTED-HOLDS: e2e/town-t3-board.spec.ts
EXPECTED-HOLDS: package.json
EXPECTED-HOLDS: public/llms.txt
EXPECTED-HOLDS: public/robots.txt
EXPECTED-HOLDS: public/skill.md
EXPECTED-HOLDS: reviews/shots-c5/desktop-briefing.png
EXPECTED-HOLDS: reviews/shots-c5/desktop-toast.png
EXPECTED-HOLDS: reviews/shots-c5/mobile-390-briefing.png
EXPECTED-HOLDS: reviews/shots-c5/mobile-390-toast.png
EXPECTED-HOLDS: scripts/no-emdash-guard.test.mjs
EXPECTED-HOLDS: src/app/BuildFreshness.ts
EXPECTED-HOLDS: src/ceremony/scripts.ts
EXPECTED-HOLDS: src/charter/PressPanel.ts
EXPECTED-HOLDS: src/charter/templates/LeverTemplates.ts
EXPECTED-HOLDS: src/crafting/AssayBench.ts
EXPECTED-HOLDS: src/editor/DescriptorInspector.ts
EXPECTED-HOLDS: src/encyclopedia/liveStats.ts
EXPECTED-HOLDS: src/encyclopedia/reader.ts
EXPECTED-HOLDS: src/encyclopedia/registry.ts
EXPECTED-HOLDS: src/encyclopedia/worldOutside.ts
EXPECTED-HOLDS: src/game/Game.ts
EXPECTED-HOLDS: src/game/Medals.ts
EXPECTED-HOLDS: src/game/ProfileManager.ts
EXPECTED-HOLDS: src/game/SaveSlots.ts
EXPECTED-HOLDS: src/game/buildables.ts
EXPECTED-HOLDS: src/meta/ContractFamilies.ts
EXPECTED-HOLDS: src/meta/ContractUnlock.ts
EXPECTED-HOLDS: src/meta/ResearchTree.ts
EXPECTED-HOLDS: src/news/editionLadder.ts
EXPECTED-HOLDS: src/seasons/registry.ts
EXPECTED-HOLDS: src/spikes/playbook/PlaybookLab.ts
EXPECTED-HOLDS: src/systems/CanalChoiceSystem.ts
EXPECTED-HOLDS: src/systems/E10FinaleSystem.ts
EXPECTED-HOLDS: src/systems/E6ArsenalSystem.ts
EXPECTED-HOLDS: src/systems/E7SignalSystem.ts
EXPECTED-HOLDS: src/systems/E9ArsenalSystem.ts
EXPECTED-HOLDS: src/systems/LandYachtBossSystem.ts
EXPECTED-HOLDS: src/systems/SeedCaravanPresentation.ts
EXPECTED-HOLDS: src/systems/SeedCaravanSystem.ts
EXPECTED-HOLDS: src/town/TownScene.ts
EXPECTED-HOLDS: src/town/TownWelcome.ts
EXPECTED-HOLDS: src/ui/BuildingContextPrompt.ts
EXPECTED-HOLDS: src/ui/ComplaintDesk.ts
EXPECTED-HOLDS: src/ui/DeathOverlay.ts
EXPECTED-HOLDS: src/ui/Hud.ts
EXPECTED-HOLDS: src/ui/ResearchChart.ts
EXPECTED-HOLDS: src/ui/WorldInfoNotes.ts
EXPECTED-HOLDS: src/ui/menu/StartMenu.ts

Then a cleanliness line, `git -C worktrees/lane-c status --short` → must be clean, with the **FACTORY-CHURN EXCEPTION — always expected, never a STOP; list them and proceed (F-1407-1):** (a) `logs/**`; (b) `artifacts/**`, `reviews/shots-*` and any `.png`. **What still STOPs:** modified tracked `src/**`, `scripts/**`, `e2e/**`, `tasks/**`, `specs/**`, `reviews/*.md` — i.e. anything a live drain or a concurrent task could actually own. ⓘ Note the c5 predecessor's own gate wrote `reviews/shots-c5/*.png`; those are regenerated evidence and are covered by the exception.

Then `npm install --no-audit --no-fund` and `npm run build` green before editing.

## Why (measured s2235 at the drain gate, not inherited)

`npm run test:node-guards` on the merged tree is **rc=1, 4 failures**. Two are inherited (F-2234-3, s2234's known main reds). Two are the sweep's, and they were attributed by reverting one variable at a time in the same root:

| Arm | `src/` | `assets/` | Baron determinism |
|---|---|---|---|
| full slice | swept | swept | **FAIL** `fnv1a32:9a7d4dfd` |
| `src/` reverted | main | swept | **FAIL** `fnv1a32:9a7d4dfd` |
| `assets/` reverted | swept | main | **PASS** |
| full control | main | main | **PASS** |

## Scope — exactly two items, both small

1. **F-2235-4 — the missed pin (one line).** `scripts/gr-sim-campaign.test.mjs:164` still pins the pre-sweep text:
   `'Contract "e3-canyon-works" is locked: The Voltage Age awaits — raise the Dynamo Hall.'`
   The runtime string now comes from `src/meta/ContractUnlock.ts` reading `: raise`. Update the pin to the new copy. **Preserve the assertion's INTENT** — it proves a locked contract refuses loudly and names its condition; only the text moves. Do not weaken the regex to a substring or a wildcard to make it pass.
   ⓘ The old string exists **only** in this test file in the whole repo, which is why the runner's `e2e/`-scoped pin sweep missed it. While you are here, grep `scripts/*.test.mjs` for any other pre-sweep copy and report what you find (fix any you find; they are the same class).

2. **F-2235-5 — the determinism re-pin, WITH ITS CAUSE WRITTEN AT THE SITE.** `scripts/gr-sim.test.mjs` pins the Baron `eventLogHash` at `fnv1a32:5b1d21f1` (find it by that string, `:837` at time of writing); the merged tree produces `fnv1a32:9a7d4dfd`. Re-pin to the new value **and add a comment at the pin naming the cause**. ⓘ **The house shape is already at this exact site: the `NAMED-CAUSE RE-PIN (F-1460-1 … landed s1462)` block immediately above the `assert.deepEqual(first.outcome, {` opener. Match its form — cause, commit, mechanism, what was measured, and the F-1441-3 prohibition — and leave it in place; you are ADDING a second named cause, not replacing the first.** Write it in this shape:

   > re-pinned s<NN> (F-2235-5): `assets/contracts/*` prose is inside `eventLogHash` via `canonicalReplayEvents` — the wave-20 medal event carries `medalBlurb`, which the c5 em-dash sweep rewrote. Gameplay outcome UNCHANGED and verified: kills 862, waves 20, timeMs 528400, gold 0, secured true, defaultedPicks 21, defaultedSecure 1 — only the log hash moved. A copy edit to contract prose is therefore expected to move this pin.

   **You must verify that outcome-unchanged claim yourself before re-pinning — do not copy it from this master.** Run the Baron test and read the assertion diff: if ANY field other than `eventLogHash` differs, this is a real sim regression, **STOP and report** — the re-pin is then wrong and the whole premise of this task is dead.

## Firewall
Touch ONLY: `scripts/gr-sim-campaign.test.mjs` (the one pin), `scripts/gr-sim.test.mjs` (the one pin + its comment), and a BACKLOG row. **NO** changes to: `src/**` (the sweep's src half is gated and innocent — do not "improve" it), `assets/contracts/**` (do not un-sweep the prose to make a hash pass — that reverses the owner's ruling), `src/sim/HeadlessContractSim.ts` (do NOT change what `eventLogHash` covers; that is the design question this task deliberately does not decide), `public/**`, `e2e/**`, `package.json`.

## Self-check (evidence, not vibes)
`npx tsc --noEmit` + `npm run build` green. `npm run test:node-guards` run **ALONE** (it is ~9 minutes and contends badly): expect **rc=1 with exactly the 2 INHERITED failures** — `blocker-panel-closed-guard` (*"reds on the pre-strike ledger…"*) and the `fixture-teardown` cascade it causes. **Those two are NOT yours and must NOT be cured here** (F-2234-3 is deliberately open and wants an owner of the guard's intent). If you see a third failure, report it — do not chase it.

⚠️ **YOUR LANE IS 23 COMMITS BEHIND MAIN AND THAT CHANGES HOW TO READ THE BATTERY (measured s2236, so you do not have to discover it in a red).** The two failure counts above were measured by s2235 on the MERGED tree; you are running on `lane/c`, which lacks main's last 23 commits — including **four that moved `package.json`** (`d21ac01af`, `61f5d93f3`, `ca09d084e`, `b0e430ebc`). Your `test:node-guards` leg roster is therefore a strict SUBSET of main's, and the two inherited failures are ledger-state-dependent, so **your list may legitimately differ from the master's expectation in either direction.** That is staleness, not your work. ✅ **What is NOT stale, and is the reason this dispatch is safe: all four files you touch or read are BYTE-UNCHANGED on main since your lane branched — `scripts/gr-sim.test.mjs`, `scripts/gr-sim-campaign.test.mjs`, `src/meta/ContractUnlock.ts`, `src/sim/HeadlessContractSim.ts` (verified s2236 by `git log lane/c..main -- <each>`, all empty).** So the fix itself cannot be made wrong by the staleness; only the battery's ambient noise can. **Report what you see and do not chase it.** The one signal that is entirely yours and must be clean: the two pins you moved, and the Baron outcome fields.

Report the before/after failure count and name every failure you see.

## No-op / honesty guard
If the Baron re-pin's outcome fields are not identical, **STOP** — do not re-pin, report the diff. Never re-pin to make a red go away; the cause must be named and true (F-1441-3).

End: **READY-FOR-GATES** + report: the two pins moved (old → new verbatim), any other `scripts/*.test.mjs` pre-sweep copy found, the `test:node-guards` failure list before and after, and confirmation that the Baron outcome fields were byte-identical.
