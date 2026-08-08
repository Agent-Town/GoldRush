# f1567-2 — a refusal must not be overwritten by idle chatter

**Slice:** f1567-2-refusal-bark-hold · **Branch:** `lane/b` · **Tip:** `8ba0cf9d941c732e76623932eab396ecc9b98aec` · **Base:** `main` at `e673bd13d` · **Drained:** s1568, 2026-08-08

## VERDICT: MERGED — the cure is the accepted shape, the firewall held, and I re-manufactured the red rather than inheriting it.

## What it does

A player asks the agent for something it lacks permission for. The agent says *"held"* / *"ask me"* / *"no trust"* — and, with no further input, that denial could be silently replaced by idle chatter about the ledger. The player was never told they had been refused.

`ProspectorEmbodiment.say()` now takes the receipt's typed voice kind, and a `refusal` raises the existing absolute survey deadline to at least `simulationAt + Balance.agent.refusalHoldSeconds` (**8**). Eight sim-seconds clears the 7-second first-survey deadline with a second of reading margin and sits well below the 19-second idle cadence. The kind is threaded from `voiceKindForReceipt` — **the refusal vocabulary is not duplicated outside `Voice.ts`** (F-1261-1), which was the master's main design constraint.

The slice picked the second of the two shapes the master offered (push `nextSurveyAt` forward) rather than a new `lastRefusalAt` field, and stated why: it reuses one timer invariant instead of adding a second piece of state that the survey branch would have to consult.

## Evidence (all on the MERGED tree, in a detached worktree `gate-s1568` per §3.0b — never in main's tree until the verdict was MERGE)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | green — vite **1.03 s**, asset-diet **1,158,214 / 1,500,000 B** |
| `e2e/m4-06-embodiment.spec.ts` desktop-chrome `--workers=1` | **10 passed (43.0 s)** |
| `e2e/m4-06-embodiment.spec.ts` mobile-chrome 390px `--workers=1` | **10 passed (42.1 s)** |
| `npm run test:node-guards` | rc 0 — **393 tests / 390 pass / 0 fail / 3 skipped**, 292 s |
| chained leaves | findings-state PASS (401 declared / 253 closed / 148 open / 0 double-state) · blocker-panel PASS (30 rows / 25 with F-ID / 344 census closed / 0 closed-on-panel) · ruling-propagation PASS (3 ruled / 30 refusing / 0 stale) · ticker stats PASS · NUL audit CLEAN · desk-declaration lawfully SKIP on my ACTIVE lock |

`test:node-guards` was run because the master required it. F-1460-1's three trigger paths (`src/sim/`, `src/systems/`, `src/entities/`) do **not** literally cover `src/agent/` — but the slice edits `src/game/Balance.ts`, and the reason behind that law binds where its letter does not.

**Node version matters here and was checked:** this gate ran on **v26.4.0**, matching `.nvmrc`. The runner's own report records an earlier invocation under ambient Node 23.11.1 returning `393 / 390 / 3` with two failures diagnosed as Node ≤23 file-granularity `--test-timeout` semantics — **that is F-1507-1, a known red, and the runner correctly re-ran under the pinned Node instead of re-pinning a test.** No test was changed to make a red go away (F-1441-3).

### The RED, re-manufactured at the drain

A passing guard never executes its violation path, so its green is not evidence about the red (s1299/s1300 standard). On the merged tree I removed **only** the three-line hold in `say()` and re-ran the new test:

- **rc=1 — `1 failed`, and it is exactly `e2e/m4-06-embodiment.spec.ts:432 › permission-denied bark survives the first idle survey`.**
- Restored with `git checkout HEAD -- src/agent/Embodiment.ts`; `git status` and `git diff HEAD` both clean — **byte-identical**.

This matches the runner's claimed before-state (`2 failed`, desktop and mobile, `Expected value: "ledger"` against `['held', 'ask me', 'no trust']`).

### Firewall — held

- **Neither `0.4` drift constant moved.** Verified in the diff: no numeric `expect` argument changed. The gate observed `driftAbs=0.2834 / gapClosed=0.2823` (desktop) and `driftAbs=0.3722 / gapClosed=0.3714` (mobile), inside the unchanged bounds.
- Six paths, all inside TOUCH-ONLY: `src/agent/Embodiment.ts` (+14/−2), `src/game/Balance.ts` (+2), `e2e/m4-06-embodiment.spec.ts` (+31/−2), the report, two screenshots.
- The accepted refusal set was **not** widened to admit `ledger` — the master named that as the wrong cure, and it was not taken.

### Merge classification

Base `e673bd13d`; `git merge --no-ff lane/b` applied by the `ort` strategy with **no conflicts**. All six paths are **LANE-TOUCHED / MAIN-UNMOVED** — main moved on none of them, so there was no graft to perform.

## Findings

**F-1568-2 — none blocking.** One thing I checked and cleared rather than assumed, recorded because the diff makes it look like a behaviour change when it is not:

`handleReceipt` changed from `if (line) this.say(line)` to `if (line && kind) this.say(line, kind)`, which reads as a narrowing that could silently suppress barks. It cannot. ✓ **VERIFIED by reading `src/agent/Voice.ts:42-49`:** `barkForReceipt` computes `kind = voiceKindForReceipt(receipt)` and returns `null` whenever that kind is falsy — so `line` truthy **implies** `kind` truthy. The only `null` kind is `et.goldrush.get_state`, which `handleReceipt` already early-returns at `:115` before either call. The added conjunct is therefore inert, not narrowing.

**Noted, not filed:** the report reasons that a later explicit `speak` (e.g. the `Prospector ready` lifecycle line) *should* be allowed to replace a refusal, since fresh input is new information. I agree, and the hold deliberately covers only the idle-survey route. Worth knowing that this is a stated design choice rather than an oversight, in case a future playtest disagrees.

## Ledger

- goal leaf `f1567-2-refusal-bark-hold` → `merged`, with the main-side merge hash.
- BACKLOG **F-1565-1** closed with this evidence.
- done-move renamed `drained-<hash>-20260808-190308-lane-b-f1567-2-refusal-bark-hold.md`.
- GZ-01: player-visible, so a gazette item was appended naming the merge.
- `e2e/m4-06-embodiment.spec.ts:426-427`'s comment — which documented this defect and declined to assert `after.lastLine` because of it — **is now false, and the slice removed it.** The master named that as part of the deliverable.
