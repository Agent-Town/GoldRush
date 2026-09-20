# Review — `lane-c-agent-rung-honest-gate-v2`

**Slice:** enforce the two RULED agent verb rungs (`auto_pan` L2, `place_building` L3) at the tool surface
**Branch:** `lane/e2-arsenal` · **Tip:** `5bcbfa00 runner(lane-c): lane-c-agent-rung-honest-gate-v2.md`
**Base (merge-base with main):** `3e46cdbd`
**Reviewed:** s1294 fire, 2026-07-31 · **Run log:** `tasks/runs/20260731-155804-lane-c-lane-c-agent-rung-honest-gate-v2.md.log` (1.9 MB, 351,941 tokens)

## VERDICT: **HOLD — NOT MERGED.** Code accepted on its own evidence; blocked only on adjacent-battery attribution, which needs an idle box.

> ⚠️ **SUPERSEDED s1454 (F-1454-2) — STALE VERDICT LINE, AND THE MOST INSTRUCTIVE ONE ON THE BOARD.**
> The content was **already in main when this HOLD was written** — swept in at **`3058fca5cb`**
> (*"rehearsal round 2 launched (shipped pipeline, vein-hunter card)"*, 2026-07-31 16:59:12) by a
> concurrent attended session's broad `git add`, **thirteen minutes before** the handoff that said main
> was never modified. That is **F-1295-1**, now written into `scripts/fire.md` §3.0b as the custody law
> (*never check foreign content into MAIN's tree to gate it — gate in a detached worktree*).
> ✅ **The hold's own condition was then DISCHARGED, not waived:** s1295 ran the attribution the arms of
> which no longer existed by re-deriving them as **PRE-sweep (`00e4c074 (archive: pruned by the A3 rewrite)` blobs) vs POST-sweep (`HEAD`)**,
> arm identity asserted by blob hash before every run, detached worktree, `--workers=1`, port 5241,
> interleaved with round 2 order-reversed — **12 runs, all three suites EQUAL on both arms**
> (`ap-standing-orders` 0/2 vs 0/2 · `ss-01-beats` 2/2 vs 2/2 · `trail-guide-beat-priority` 0/2 vs 0/2).
> **F-1294-2 CLOSED; the slice is clean.** Leaf `agent-rung-honest-gate-v2` → `merged`,
> `mergeHash 3058fca5cb`, with the irregular provenance stated **on the leaf** rather than laundered
> into a normal-looking drain. Verified IN-MAIN by ancestry s1454.
> ⚖️ **Why this one matters most:** a HOLD verdict has no enforcement surface. This slice was
> exonerated *afterwards* — had the control gone the other way, a defect would have shipped past a
> verdict that said no, with the fire that wrote the verdict still believing it held.

The slice is sound and I found nothing wrong with it. I am not merging it **this fire** because the
adjacent battery produced **5 reds I cannot attribute with proof**, measured on a box carrying two
live Codex lane runs. The gate bar is *"adjacent suites unmodified-green, or failures
fingerprint-matched to known-reds **with proof**."* I have proof for 2 of the 5. Merging on the
other 3 would be Mistake #12 (gate contamination) dressed as throughput.

**Nothing is lost.** `lane/e2-arsenal` is 1 ahead of main, its worktree is clean, and main was
never modified — the four paths were checked out, gated, and reverted (`git status` clean at
handoff). The next fire re-runs one battery and merges.

> ## ⛔ s1295 CORRECTION — THE SENTENCE ABOVE IS FALSE, AND NOT THROUGH ANY FAULT OF ITS REASONING (F-1295-1)
>
> **The slice has been on `main` since `3058fca5`, 2026-07-31T16:59:12+07:00 — thirteen minutes
> before the handoff that says it was not.** All four paths are byte-identical to the lane on main
> *right now*; verified by blob hash, not by diff:
> `PermissionLadder.ts 9451c000` · `ToolSurface.ts eb31d683` · `m4-01 5b674014` · `m4-05 b1cca7d1`.
>
> **How.** s1294 checked the four paths out into main's working tree in order to gate them — correct
> procedure. At 16:59, *while they sat there*, a **concurrent attended session** committed
> `3058fca5 "rehearsal round 2 launched (shipped pipeline, vein-hunter card)"` with a broad `git add`
> that swept them up. Its stat is exactly the four slice paths plus one `BACKLOG.md` line; its
> message mentions none of them.
>
> **Why the revert did not catch it, which is the part worth keeping.** s1294 then reverted with
> `git checkout HEAD -- <paths>` and confirmed `git status` clean. Both steps were correct and both
> were blind: **`HEAD` had already absorbed the slice**, so the "revert" restored the slice content,
> and the clean status was *caused by* the contamination rather than disproving it. A revert
> verified against a HEAD that has itself moved is not a revert — and no amount of care at the
> `git status` layer can see this. The check that does see it is a **blob-hash comparison against
> the pre-sweep ref**, which is why this review now records blob hashes instead of "clean".
>
> **Scope: bounded.** Every `main` commit from s1294's lock to now was audited for `src/`+`e2e/`
> content (`logs/session-scratch/s1295/sweep-audit.mjs`); `3058fca5` is the **only** one carrying
> code. Nothing else was swept.
>
> **Status of the HOLD.** The verdict below stands as *unfinished business*, not as a description of
> the tree: the code is on main, but its gate is incomplete and no `mergeHash` was ever recorded.
> s1295 is running the F-1294-2 control the honest way — **PRE-sweep vs POST-sweep** (`00e4c074 (archive: pruned by the A3 rewrite)`
> blobs vs `HEAD` blobs), in a **detached worktree**, because a concurrent writer is still
> committing to main and dirtying main's tree is what caused this in the first place.
> See §"s1295 — the F-1294-2 control, and what actually shipped" at the end of this file.

## What it does

`decideToolPermission` previously hardcoded `requiredLevel: 1` for every side-effect tool
(`if (!sideEffect || level > 0)`). The two rungs the owner RULED — `auto_pan` = 2 (`21985788`) and
`place_building` = 3 (`e4336ba8`) — were declared in `AGENT_ABILITIES` but **no mechanism read
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

**Base `3e46cdbd`; main is 7 commits ahead of it. Verified per-path rather than accepted from the
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

## s1295 — the F-1294-2 control, and what actually shipped

**Run by:** s1295 fire · **Harness:** `logs/session-scratch/s1295/f1294-2-true-control.mjs`
**Raw per-run logs:** `logs/session-scratch/s1295/true-*.log` · **Machine-readable:** `f1294-2-true-results.json`

### The arms were not the ones s1294 specified, and could not have been

s1294's gate says *"both arms (clean `main` and the merged tree)"*. That pairing **no longer exists**:
the slice was swept onto main by `3058fca5` before this fire started (F-1295-1), so "clean main" and
"the merged tree" are now the **same tree**. My first harness discovered this the honest way — it
aborted with `ARM MISMATCH: wanted MERGED, tree is CONTROL`, because
`git checkout lane/e2-arsenal -- <4 paths>` produced **zero** change.

The arms that answer the same question today are **PRE-sweep vs POST-sweep**:

| Arm | `PermissionLadder.ts` blob | Meaning |
|---|---|---|
| `PRE` | `d6941842` (at `00e4c074 (archive: pruned by the A3 rewrite)`, `3058fca5^`) | the tree **without** the slice |
| `POST` | `9451c000` (at `main` HEAD) | the tree **with** the slice |

Arm identity is asserted by **blob hash before every single run**, not by dirtiness — the check that
would have caught F-1295-1 in the first place.

### Method

Run in a **detached worktree** (`gr-s1295-control`), never main's tree: a concurrent attended session
was still committing to main during this fire (17:20, 17:26), and dirtying main's tree is precisely
what produced F-1295-1. `--workers=1` on every run (§3.1). Own dev server on **scratch port 5241**.
**Interleaved per spec** — each PRE/POST pair runs back-to-back so load drift is shared-mode noise
rather than an arm confound — and **round 2 reverses the order** so any residual order effect
cancels. Load average is sampled around every run and recorded, so arm comparability is *checked*
rather than assumed. This is the answer to the objection that stopped s1294: the box was **not** idle
(load 41 → 18 across the run, two lane runs finishing mid-measurement), and interleaving is what
makes that survivable.

⭐ **The asymmetry that makes the result usable regardless of load: a red on the PRE arm cannot have
been caused by the slice.** Heavy load raises the chance of a decisive exoneration; it cannot
manufacture a false one.

### Results — 12 runs, all twelve recorded

| # | Spec | Arm | rc | pass/fail | wall | load (before→after) |
|---|---|---|---|---|---|---|
| 1 | `ap-standing-orders.spec.ts` | **PRE** | 0 | 6p / 0f | 83s | 41.33 → 36.95 |
| 2 | `ap-standing-orders.spec.ts` | **POST** | 0 | 6p / 0f | 52s | 36.95 → 29.97 |
| 3 | `ss-01-beats.spec.ts` | **PRE** | 1 | 3p / 1f | 86.5s | 29.97 → 18.05 |
| 4 | `ss-01-beats.spec.ts` | **POST** | 1 | 3p / 1f | 87.1s | 18.05 → 11.74 |
| 5 | `trail-guide-beat-priority.spec.ts` | **PRE** | 0 | 1p / 0f | 15.4s | 11.74 → 12.1 |
| 6 | `trail-guide-beat-priority.spec.ts` | **POST** | 0 | 1p / 0f | 16.1s | 12.1 → 10.86 |
| 7 | `ap-standing-orders.spec.ts` | **POST** | 0 | 6p / 0f | 42.9s | 10.86 → 14.72 |
| 8 | `ap-standing-orders.spec.ts` | **PRE** | 0 | 6p / 0f | 43.4s | 14.72 → 14.84 |
| 9 | `ss-01-beats.spec.ts` | **POST** | 1 | 3p / 1f | 91s | 14.84 → 15.16 |
| 10 | `ss-01-beats.spec.ts` | **PRE** | 1 | 3p / 1f | 91.8s | 15.16 → 17.82 |
| 11 | `trail-guide-beat-priority.spec.ts` | **POST** | 0 | 1p / 0f | 15.4s | 17.82 → 18.26 |
| 12 | `trail-guide-beat-priority.spec.ts` | **PRE** | 0 | 1p / 0f | 16s | 18.26 → 15.75 |

| Spec | PRE red | POST red | Verdict |
|---|---|---|---|
| `ap-standing-orders.spec.ts` | 0/2 | 0/2 | **EQUAL** |
| `ss-01-beats.spec.ts` | 2/2 | 2/2 | **EQUAL** |
| `trail-guide-beat-priority.spec.ts` | 0/2 | 0/2 | **EQUAL** |

Load range across the run: **10.86 → 41.33** (1-min average).
armDependent = **false**

### What this settles, and what it does not

**Settled — the three unattributed reds are not the slice.** Every spec behaves identically with the
slice present and absent, across two rounds with the pair order reversed and the box load falling
from ~41 to ~11 underneath. The F-1294-2 gate condition — *"all green or equally red ⇒ merge the
slice unchanged"* — is **met**.

`ss-01-beats` is the informative one: it is **red on both arms**, and it is red for a reason already
in the ledger. `logs/suite-red-inventory.md` row 24 records this exact test at **15/44 (34.1%) on
desktop-chrome and 15/44 (34.1%) on mobile-chrome**, under the coordinate `ss-01-beats.spec.ts:88`.
The control's raw output reads:

```
Error: expect(locator).toHaveAttribute(expected) failed
  - unexpected value "ledger-page:town_elder"
  at expectBeat (e2e/ss-01-beats.spec.ts:88:22)
```

The first line is the inventory's recorded reason **verbatim**; the second is s1294's observed value
**verbatim**. `:88` is the assertion inside the shared `expectBeat` helper; `:103` is the `test(`
declaration Playwright reports as the test location. **They were always the same red** — s1294
searched the inventory by the reporter's coordinate and correctly found nothing there (F-1295-2).

**Not settled, and deliberately left open.** This control covers the **three** specs F-1294-2 named,
on **desktop-chrome**, at `--workers=1`. It does **not** re-run the full 41-test adjacent battery,
and it says nothing about mobile. That is the scope F-1294-2 asked for and no more; claiming the
whole battery from six paired runs would be the same over-reach the hold existed to prevent.

### Disposition

The gate is satisfied, so the slice **stays on main** — but it must be recorded for what it is.
It did not arrive by a drain, and no amount of after-the-fact green makes `3058fca5` a drain commit.
The goal leaf therefore carries `mergeHash: 3058fca5` with the irregular provenance stated on it
rather than laundered into a normal-looking merge, and the done-move is retired against that hash.

⚠️ **The one thing a future fire must not conclude from this file: "the sweep turned out fine, so
the sweep is fine."** The slice was exonerated by measurement taken *afterwards*. Had the control
come back arm-dependent, the same accident would have shipped a defect into main under a commit
message about a rehearsal, past a verdict that explicitly said no — and the fire that wrote that
verdict would have gone on believing it held. **The custody defect (F-1295-1) is independent of this
slice's innocence, and is the finding worth carrying forward.**
