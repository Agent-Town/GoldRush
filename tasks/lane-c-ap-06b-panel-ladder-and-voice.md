CODEX: model=gpt-5.6-sol effort=xhigh
# ap-06b-panel-ladder-and-voice — land AP-06b's wiring WITH the panel truth it changes (F-1217-1)
ROLE: lane implementer. WORKDIR: this lane worktree. One task, firewalled.
**FIRE-AUTHORED (attended review welcome)** — corrective spawned by the s1217 drain of AP-06b.

WHY: `reviews/ap-06b-adapter-wiring.md` F-1217-1. AP-06b's wiring is CORRECT and its own plain-boot spec is good — it was blocked only because it silently changes a **player-facing surface**. Verified at source, `src/agent/ToolSurface.ts:375`:
```ts
if (typeof game.panAt === 'function') {
  capabilities.push({ id: 'auto_pan', level: 3, label: 'Let the Prospector work claim pans', tools: ['et.goldrush.pan_at'] });
}
```
The capability list is **derived from adapter membership**, so supplying `panAt` does not merely make HARVEST work — it makes a **level-3 ability row appear in the Prospector panel**. A matched control (treatment = AP-06b grafted onto main; control = `src/game/Game.ts` reverted to main; same scratch server, same `--workers=1`) proved three subjects flip green→red on **BOTH** projects because of it:
  - `e2e/m4-10-agent-actions-integrity.spec.ts:112` — capabilities are `['auto_collect','auto_repair','auto_pan']`, spec asserts `['auto_collect','auto_repair']`.
  - `e2e/m4-09-agent-rung-clarity.spec.ts:107` — `getByTestId('prospector-ability-auto_pan')` resolves to **1**, spec asserts **0** (13 consecutive resolutions).
  - `e2e/m4-06-embodiment.spec.ts:384` — ledger voice `mid.lastLine` expected `'pan...'`, **got `'shine'`**.
⚠️ **THE THIRD IS NOT THE SAME DEFECT AS THE FIRST TWO, AND THE DRAIN DID NOT ROOT-CAUSE IT.** Do not assume one fix covers all three. Two are capability-registration; the voice line is a behaviour change whose mechanism is **unknown** and is yours to find.

MEASURED PREMISE (re-derive it before you build — do not inherit it):
⚠️ **TAKE THE WORK FROM THE SALVAGE REF `save/ap-06b-adapter-wiring` (= `2f216af0`), NOT from `lane/e2-arsenal`.** Your own pre-flight `reset --hard`s this lane's branch, and `lane/e2-arsenal` was still 1 ahead of main holding exactly this undrained work when s1217 pinned it (Mistake #2, the Reset Massacre). The salvage ref is reset-proof; the lane branch is not.
`save/ap-06b-adapter-wiring @ 2f216af0` holds AP-06b's work: **2 files, +192/−0** off base `57ddd8dd` (`src/game/Game.ts` adapter literal at ~`:2055` + `e2e/ap-standing-orders.spec.ts`). Main has since moved `Game.ts` only at `~:5506` (the `36e6c1b7` seed/`seedMode` hunk) — **disjoint**, and a 3-way graft was verified clean (`git merge-file`, 0 conflicts). If either premise has changed, STOP and report rather than building on a stale one.

READ-FIRST: `reviews/ap-06b-adapter-wiring.md` (the finding, the control table, the evidence) · `tasks/done/blocked-s1217-F1217-1-20260729-165229-ap-orders-adapter-wiring.md` (the original master — its scope and firewall still bind) · `src/agent/ToolSurface.ts:340-385` (the capability derivation — THE SUBJECT) · `src/agent/AgentConsent.ts:1-110` (`auto_pan` is **level 3**; the ladder/consent semantics) · `e2e/m4-09-agent-rung-clarity.spec.ts:89-110` · `e2e/m4-10-agent-actions-integrity.spec.ts:103-115` · `e2e/m4-06-embodiment.spec.ts:364-390`.

PRE-FLIGHT (LANE-SAFETY invariant): any dirty tracked blob must be reachable in git, else STOP.

SCOPE:
1. **Re-land AP-06b's two-file delta from `save/ap-06b-adapter-wiring @ 2f216af0` onto fresh main**, grafting `Game.ts` (the 3-way is clean; do not re-derive the wiring from scratch — Mistake #8). The wiring is not under review here: **do not redesign `placeBuilding`/`panAt`**.
2. **Prove the ladder, do not just repaint the specs.** `auto_pan` is **level 3**. Before touching any assertion, establish by test which of these is true, and say which:
   (a) the row is DISPLAYED-BUT-UNGRANTED at low rungs (like `auto_collect`/`auto_repair`, which `m4-09:105-106` shows rendering `needs approval-required (rung 1)`) — in which case the three specs encode the pre-wiring world and updating them is lawful **supersession**; or
   (b) the ability is actually **reachable/executable** below rung 3 — in which case this is a **ladder breach** and the fix is in the gating, NOT in the specs.
   ⛔ **If (b), STOP and report. Do not weaken the ladder to make a test pass.** Reporting (b) is a SUCCESS, not a failure.
3. If and only if (a): update `m4-09:107` and `m4-10:112` to the post-wiring truth, and **add an assertion that the new row is correctly gated** — i.e. it renders its own `needs …` rung-3 state at rung 0 and is not invocable there. A spec that merely counts three rows instead of two has recorded the change without testing it.
4. **Root-cause `m4-06:384` separately** (`'pan...'` → `'shine'`). Find why wiring `panAt` changes the ledger voice line. If the new line is CORRECT, update the assertion and say why in your report. If the voice is now wrong, fix the voice — not the assertion. **Name the mechanism either way; "stale expectation" is not a mechanism.**
5. Preserve the honest-failure property and the plain-boot proof: AP-06b's two new tests in `e2e/ap-standing-orders.spec.ts` must still pass unchanged.

TOUCH-ONLY: `src/game/Game.ts` (the agent-stub install site ONLY, re-landing AP-06b) · `src/agent/ToolSurface.ts` (only if item 2 proves gating work is needed) · `e2e/m4-06-embodiment.spec.ts` · `e2e/m4-09-agent-rung-clarity.spec.ts` · `e2e/m4-10-agent-actions-integrity.spec.ts` · `e2e/ap-standing-orders.spec.ts` (re-land only, no new edits).
NO: the permission-ladder LEVELS themselves (`auto_pan` stays level 3) · Economy (sole gold writer) · CombatSystem · the sim/Balance · BuildSystem's own placement rules · `View.ts` · any other `Game.ts` concern · **widening/deleting any assertion to get green**.

SELF-CHECK: `npm run test:node-guards` **FIRST** (74/74 — the only instrument that sees a suite-uncollectable regression) · `npx tsc --noEmit` clean · `npm run build` green · `npx playwright test --list` reports **2464 tests / 344 files** (AP-06b's two added tests × two projects; the file count must NOT move — you add no spec file) · the full adjacent battery `e2e/m4-01 m4-05 m4-06 m4-07 m4-08 m4-09 m4-10 task-026` at `--workers=1` · `e2e/ap-standing-orders.spec.ts` both projects · zero console/page errors · plain boot desktop + 390px, **with a screenshot of the rung-0 panel showing the new row and its gate label**.

🔴 KNOWN REDS — these are NOT yours, do not "fix" them (automatic reject):
  - ✅ `ap-standing-orders.spec.ts` (the `wave_early` surprise poll, listed here as `:115`→`:156`) — **CURED s1222 (`855f4d74`, test-only). NO LONGER A KNOWN RED: a failure here is a real regression, report it.** F-1215-1's diagnosis was right that it was pre-existing and wrong that it was a concurrency victim: the spec let the wave countdown EXPIRE before forcing wave 1, so the assertion was correctly rejecting the transition. Load only set how often the sequencing lost the race (F-1222-3 / F-1223-1).
  - `m4-06-embodiment.spec.ts:395` — known **~45% flake** (F-1212-2). Re-measure it as a rate before blaming yourself.
  - `m4-06-embodiment.spec.ts:196` and `m4-07-prospector-panel.spec.ts:113` — both showed timeout-shaped failures under load in s1217's runs, on **opposite** arms. Treat as load, report the count you see.

⚠️ **`--workers=N` DOES NOT DO WHAT YOU THINK ON A SINGLE FILE (F-1217-2, measured s1217).** `playwright.config.ts` sets **no `fullyParallel`** and **no `workers`**; Playwright's default parallelises across **files**, serially within one file. A one-spec run across two projects therefore tops out at **2 workers** no matter what you pass. **Always report the literal `Running X tests using M workers` line**, and never describe an arm by the flag you passed instead of the `M` you got.

READY-FOR-GATES + report: which of (a)/(b) item 2 proved and the test that proved it; the mechanism behind the `'pan...'` → `'shine'` voice change; the rung-0 panel screenshot; and the literal worker counts of every battery you ran.
