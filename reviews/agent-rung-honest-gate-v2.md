# Review — `lane-c-agent-rung-honest-gate-v2`

**Slice:** enforce the two RULED agent verb rungs (`auto_pan` L2, `place_building` L3) at the tool surface
**Branch:** `lane/e2-arsenal` · **Tip:** `5bcbfa00 runner(lane-c): lane-c-agent-rung-honest-gate-v2.md`
**Base (merge-base with main):** `01be00d7`
**Reviewed:** s1294 fire, 2026-07-31 · **Run log:** `tasks/runs/20260731-155804-lane-c-lane-c-agent-rung-honest-gate-v2.md.log` (1.9 MB, 351,941 tokens)

## VERDICT: **HOLD — NOT MERGED.** Code accepted on its own evidence; blocked only on adjacent-battery attribution, which needs an idle box.

The slice is sound and I found nothing wrong with it. I am not merging it **this fire** because the
adjacent battery produced **5 reds I cannot attribute with proof**, measured on a box carrying two
live Codex lane runs. The gate bar is *"adjacent suites unmodified-green, or failures
fingerprint-matched to known-reds **with proof**."* I have proof for 2 of the 5. Merging on the
other 3 would be Mistake #12 (gate contamination) dressed as throughput.

**Nothing is lost.** `lane/e2-arsenal` is 1 ahead of main, its worktree is clean, and main was
never modified — the four paths were checked out, gated, and reverted (`git status` clean at
handoff). The next fire re-runs one battery and merges.

## What it does

`decideToolPermission` previously hardcoded `requiredLevel: 1` for every side-effect tool
(`if (!sideEffect || level > 0)`). The two rungs the owner RULED — `auto_pan` = 2 (`85bb1938`) and
`place_building` = 3 (`12b0011e`) — were declared in `AGENT_ABILITIES` but **no mechanism read
them**, so the ladder advertised rungs it did not enforce. This slice makes the gate rung-aware:

- `PermissionLadder.ts` — `decideToolPermission(level, sideEffect, requiredLevel)`; the gate becomes
  `level >= requiredLevel` and the receipt reports the real `requiredLevel` instead of a constant 1.
- `ToolSurface.ts` — a `TOOL_ABILITIES` map from tool name → ability id, resolved against
  `AGENT_ABILITIES` at call time, defaulting to 1 when a tool has no declared ability.

Both **unruled** rows are firewalled exactly as the master required: `auto_repair` stays at **1**
(F-1279-2 is the owner's open question) and `chase_mark` gets **no invented capability** — it takes
the default of 1, which is how canon's silence survives contact with the cure.

| Ability / tool | Declared rung | Enforced after this slice |
|---|---:|---:|
| `auto_pan` / `pan_at` | 2 | 2 |
| `place_building` | 3 | 3 |
| `auto_collect` / XP + gold | 1 | 1 |
| `auto_repair` / `repair` | 1 (unruled — untouched) | 1 |
| `chase_mark` | none declared | default 1 |

## Merge classification

**Base `01be00d7`; main is 7 commits ahead of it. Verified per-path rather than accepted from the
runner's report** (which claimed "no diff on the four task paths" — true, but a claim to check):

| Path | main moved since base | lane moved | class |
|---|---|---|---|
| `src/agent/PermissionLadder.ts` | **no** | yes | LANE-TOUCHED |
| `src/agent/ToolSurface.ts` | **no** | yes | LANE-TOUCHED |
| `e2e/m4-01-tool-surface.spec.ts` | **no** | yes | LANE-TOUCHED |
| `e2e/m4-05-agent-closeout.spec.ts` | **no** | yes | LANE-TOUCHED |

**No 3-way graft needed; no conflicts.** The two-dot diff `main..lane/e2-arsenal` additionally shows
~14 files as deletions — **all phantom**, files main gained after the lane branched (s1293/s1294
scratch, my own `f-1294-1.txt`, BACKLOG/goals edits). The lane's own commit touches 6 files, of
which `logs/factory-usage.json` and `logs/usage-history.jsonl` are background factory churn the
runner swept in; **those two were deliberately NOT taken** (F-1124-2 add-discipline: main's copies
are newer).

## The item-4 firewall held — checked site by site, not accepted as a summary

The master pre-authorized exactly five expectation sites and declared a STOP for any assertion
outside them. The diff edits **exactly five** and **adds one new test**:

| Site | Change | Authorized |
|---|---|---|
| `m4-01` build test | `installAgentTools(page, 1)` → `3` | ✓ |
| `m4-01` L0 matrix | `requiredLevel` `toBe(1)` → `toEqual([2,1,1,3])` | ✓ (this is F-1292-1's corrected row) |
| `m4-01` unbacked tools | reason array + `requiredLevel` 2 for pan | ✓ |
| `m4-05:255` | `requiredLevel: 1` → `3` | ✓ |
| `m4-05:266` | `updateStoredAgentLevel(page, 1)` → `3` | ✓ |
| `m4-01` (new) | `place_building enforces its declared rung before delegating` | addition, not an edit |

**No declared rung value was changed** — the slice moves enforcement to meet the declarations, which
is the whole point of the master. No item-4 fork was reached.

## Evidence — measured this fire unless marked

| Gate | Result | Note |
|---|---|---|
| `npx tsc --noEmit` | **clean, rc=0** | merged tree |
| `npm run build` | **rc=0, 1.72 s** | merged tree |
| `test:node-guards` | **196/196, rc=0** | all 5 chain steps; secondary guards PASS |
| `m4-01` + `m4-05` **desktop** | **8/8 passed**, rc=0, 62.9 s | `--workers=1`, scratch port 5234 |
| `m4-01` + `m4-05` **mobile 390px** | **8/8 passed**, rc=0, 52.3 s | `--workers=1`, scratch port 5234 |
| Adjacent battery (10 specs, desktop) | **rc=1 — 35 passed / 5 failed / 1 skipped**, 18.3 min | ⚠️ see below |
| Boot probe zero-console | **not run by me** | runner reports desktop + 390px clean; unverified here |

Instrument hygiene: external dev server on **scratch port 5234** (`GR_CAPTURE_EXTERNAL_SERVER=1`),
because port 5188 was held by a foreign long-lived server (pid 269) and `reuseExistingServer:false`
would have fought it — Mistake #12. Every playwright command carried **`--workers=1`** per §3.1.

## The 5 adjacent reds — what is proven and what is not

Adjacent set derived **by grep** (`installAgentTools|__GR_AGENT__|panAt|place_building|requiredLevel|decideToolPermission|AGENT_ABILITIES`), not from the runner's list.

⭐ **The single most important fact: not one of the five is a rung, permission, or `requiredLevel`
assertion.** They are two bare timeouts, one stale asset-name string, one beat-ordering race, and
one truncated trace archive. The slice's semantics are untouched by all of them.

| # | Red | Failure reason | Attribution |
|---|---|---|---|
| 1 | `066-walk8-engine:208` | `toContain("char-jumper-sheet-walk8-")` got `"char-bandit-base-sheet-walk8-r2c0.png"` | ✅ **PROVEN pre-existing** — a stale asset-name assertion; the runner reproduced it identically with the gate reverted |
| 2 | `ap-standing-orders:342` | `locator.click` timeout on `contract-briefing-dismiss`, *"element is not visible"*, at the opening briefing | ✅ **PROVEN known** — the verbatim F-1173-5 fingerprint, which fires before any rung logic runs |
| 3 | `ap-standing-orders:123` | bare `Test timeout of 45000ms exceeded`, no assertion reached | ❌ **UNATTRIBUTED** — and it is the one whose title names *"the live rung"*, so it is in the blast radius by name |
| 4 | `ss-01-beats:103` | expected beat `first-contract`, received `ledger-page:town_elder` | ❌ **UNATTRIBUTED** — beat ordering, no permission surface |
| 5 | `trail-guide-beat-priority:59` | `page.waitForFunction: Test ended` + *"End of central directory record signature not found… or file is truncated"* | ❌ **UNATTRIBUTED** — a corrupted trace zip is an infrastructure failure, not an assertion failure |

⚠️ **The load context, stated because it is most of the story.** The battery ran **41 tests in
18.3 minutes**, with `066-walk8:208` alone taking **9.3 minutes**, while **lane-b** ran a Codex job
throughout and **lane-d** picked up `lane-run-tape` at 17:02. F-1269-1 establishes the fire shell's
per-job CPU ceiling; F-1285-2 establishes that `--workers=1` is *"a floor, not a cure"*. Three bare
timeouts and a truncated archive under that load is the expected shape of a starved instrument.

⚠️ **But a strong hypothesis is not a control arm, and I did not run one.** I started to, then
stopped: by then **two** lane runs were live, so a clean-main control would have been measured under
*heavier* load than the merged arm — producing exactly the unmatched-arms confound F-1285-2 warns
about, and an answer worth less than no answer. Per *"measure the flake rate on both arms before
blaming the merge"*, the honest verdict is **unattributed**, not **exonerated**.

The counter-evidence worth weighing next fire: the runner's own 72-test owner battery, run in the
**lane** shell (which F-1267-1 measures ~3.5× faster with no ceiling), returned **69 passed /
1 skipped / 2 failed — both of them the 066-walk8 pair**. Reds 3, 4 and 5 did not appear there.

## Findings

- **F-1294-2 (raised, non-blocking, needs one idle-box run).** Three adjacent specs
  (`ap-standing-orders:123`, `ss-01-beats:103`, `trail-guide-beat-priority:59`) went red in the fire
  shell under two concurrent lane runs, with no assertion semantics implicated and one failing on a
  truncated trace archive. They are absent from the runner's lane-shell battery of the same tree.
  **GATE:** re-run these three on an idle box, both arms (clean `main` and the merged tree),
  `--workers=1`, same hour. All green or equally red ⇒ merge the slice unchanged. Any arm-dependent
  difference ⇒ a real finding against this slice, which would be the first sign of one.

- ⓘ **`066-walk8-engine:208` is a stale assertion that should be repaired, not carried.** It expects
  `char-jumper-sheet-walk8-` and receives `char-bandit-base-sheet-walk8-r2c0.png` — a half-done
  rename decaying into a standing known-red (the shape my own notes call *half-rename → n known
  reds*). It has now cost two separate batteries an explanation. Fire-authorable as a scoped test
  repair; **not** in this slice's firewall.

## Next fire

1. Run the F-1294-2 control (three specs, two arms, idle box). Cheap — far smaller than re-running
   the 41-test battery.
2. If clean: `git checkout lane/e2-arsenal -- src/agent/PermissionLadder.ts src/agent/ToolSurface.ts
   e2e/m4-01-tool-surface.spec.ts e2e/m4-05-agent-closeout.spec.ts` (those four paths **only** — not
   the lane's `logs/` churn), re-run tsc + build + the two slice specs, commit path-scoped, flip the
   `agent-rung-honest-gate-v2` leaf to `merged` with the hash **in the drain commit**.
3. The slice is a real player-facing change (the agent can no longer place buildings or pan at rungs
   it has not earned) ⇒ it owes a **GZ-01 gazette item** on merge.
