# c5b-emdash-pin-and-determinism — the two pins the em-dash sweep moved, and the re-drain of both commits together

**Slice:** `c5b-emdash-pin-and-determinism` + its predecessor `c5-emdash-sweep` (lane-c) · **branch:** `lane/c` · **tip:** `85268ce32` · **base:** `c9f3019ee`
**Gated:** s2237, 2026-08-23 · **Merge:** `a51e1a279ff446914e051b441dcc8b8a95e11265`
**Gated in:** detached worktree `worktrees/gate-s2237`, checked out at the **real merge commit** (§3.0b custody). The commit that was gated is the commit that was merged — main was fast-forwarded onto `a51e1a279` itself, not onto a fresh re-resolution.

## VERDICT: MERGED — both commits, together, as `reviews/c5-emdash-sweep.md` prescribed

`c5` was HELD at s2235 on two measured items and nothing else; `c5b` cures exactly those two and touches nothing else. Both are landed in one merge, and the `gate-side` block on the `c5-emdash-sweep` leaf is lifted in the drain-bookkeeping commit that follows this file — not by a green battery, but by satisfying the condition the hold itself named (*"Lift by draining both commits together"*).

## What it does

**c5** executes the owner's ruling of 2026-08-23, verbatim: *"can you also remove the emdashes from the page, game and everything? They scream 'this was made by AI' and that is not necessary."* The site half shipped attended the same day; this is the **game half** — `public/skill.md` + `llms.txt` + `robots.txt`, the human-text fields of three `assets/contracts/*/contracts.json`, and rendered string literals across `src/ui/**`, `src/news/**`, `src/encyclopedia/**`, `src/town/**`, `src/systems/**`, plus playbook/buildable/medal copy. Rewrites are editorial, never transliteration. 34 e2e specs that pin changed copy move in the same commit, and `scripts/no-emdash-guard.test.mjs` lands rooted in `test:node-guards`.

**c5b** lands the two pins that sweep moved:

| Finding | Change |
|---|---|
| **F-2235-4** | `scripts/gr-sim-campaign.test.mjs:164` — `'…locked: The Voltage Age awaits — raise the Dynamo Hall.'` → `'…locked: The Voltage Age awaits: raise the Dynamo Hall.'` The assertion's intent is preserved: it still proves a locked contract refuses loudly and names its condition; only the text moved. No regex was weakened. |
| **F-2235-5** | `scripts/gr-sim.test.mjs` Baron `eventLogHash` — `fnv1a32:5b1d21f1` → `fnv1a32:9a7d4dfd`, with a **NAMED-CAUSE RE-PIN** comment block added at the pin site *beside* the existing s1462 one, not replacing it. |

The runner also grepped `scripts/*.test.mjs` for other pre-sweep copy and found none — that was the root cause of F-2235-4 (the c5 runner scoped its pin sweep to `e2e/`, and that string existed only in a `scripts/` test).

## Evidence — merged tree, fire shell, node v26.4.0

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **clean**, 0 errors |
| `npm run build` | **green**, vite 1.28 s |
| `npm run test:node-guards`, run alone | **rc=1**, 4 counted failures — all four attributed below, **none of them the slice's**; log archived at `artifacts/s2237-c5-c5b-drain/node-guards-merged-tree.log` |
| F-2235-4's test: `--contract refuses unknown, unseeded, and locked contracts loudly` | **PASS** (8,779 ms) |
| F-2235-5's test: `the Baron driver runs the declared fight and keeps medal writes off headless` | **PASS** (25,691 ms) |
| The slice's own new guard: `visitor copy and contract text fields contain no em dashes` | **PASS** (7.1 ms) |
| Boot probe `e2e/_s2080-f1742-1-boot-probe.spec.ts`, `--workers=1`, desktop **and** mobile-390 | **6/6 passed**, 25.1 s, zero console/page errors |
| Three swept-pin specs (`fresh-build-toast`, `pause-goal-progress`, `save-slots`), both projects, `--workers=1` | **21 passed / 1 failed** — the one red proven inherited by a control, below |

### The four `test:node-guards` failures, attributed one at a time

| # | Failure | Verdict |
|---|---|---|
| 1 | `blocker-panel-closed-guard` — *"reds on the pre-strike ledger that manufactured the owner directive…"* | **INHERITED** — F-2234-3, open on main since before s2234, deliberately not cured |
| 2 | `fixture-teardown` — *"all 59 scripts/\*.test.mjs fixture owners remove their temp directories"* | **INHERITED** — the cascade of #1 (it leaves its temp dir behind); F-2234-3 names both |
| 3 | `runtime rush and --overtime use the same CLI ceiling and terminal stream` — timed out at 90,000 ms | **LOAD, NOT THE SLICE** — proven by re-run, below |
| 4 | `law-pointer-guard` — *"THE REAL TREE: every law-surface pointer in this repo currently holds"* | **THE SLICE'S, AND SELF-CURING** — see below |

**#3, proven rather than argued.** The battery ran while lane-b's runner held its own slot, and it took **785.6 s** against the **529.8 s** figure F-2166-2 measured for this battery alone — 48% slower, i.e. real contention. Re-run **alone** on the same merged tree, that single test **PASSES at 82,180 ms** against its 90,000 ms budget (91.3%). That is exactly the case F-2076-1 named as budget-endangered and F-2166-2 re-measured passing with headroom when run alone. `scripts/gr-sim.test.mjs` is touched by this slice at **two hunks only** (`@@ -823,6 +823,13 @@` and `@@ -834,7 +841,7 @@`, both inside the Baron block); the `runtime rush` test at `:410` is byte-unchanged.

**#4 is the drain's own bookkeeping, and it is the interesting one.** The rotted pointer is `tasks/goals.json[c5-emdash-sweep] -> scripts/gr-sim-campaign.test.mjs:164` — i.e. the **`blockedReason` of the very leaf this drain is lifting**, which quotes the pre-sweep line verbatim as its evidence. `c5b` changed that line, so the citation drifted the instant the fix landed. The block's own justification cannot survive the fix that discharges it. Flipping the leaf out of `blocked` removes the `blockedReason` and therefore the pointer; `law-pointer-guard` is re-run after the bookkeeping commit and its result is recorded there. **This is F-1300-4's shape exactly** — the battery ran on the merged tree, which by construction precedes the drain's own ledger commit, so it was structurally incapable of seeing the state it was about to create.

### The one e2e red is inherited — proven by control, not by membership

`e2e/save-slots.spec.ts:142` *"manual save creates a curated slot, preserves auto, and loads through the suspend restore path"* failed on **mobile-chrome**. `red-inventory-lookup` reports the file KNOWN-RED at the 2026-08-11 snapshot with **that exact title in both projects** — but it flags the snapshot 12 days stale across 138 commits and refuses to exonerate on membership alone (F-1444-2), so membership was treated as corroboration only.

Converted to proof by a control in the same worktree, against the same dev server, with the same command: **all 78 tracked `e2e/`/`src/`/`public/`/`assets/` slice paths reverted to main's blobs — verified `0` paths still differing from main — and the test fails there too.** Same title, same project, on content that contains none of this slice. The slice paths were then restored and the worktree re-verified.

ⓘ Reported honestly rather than smoothed: the control's failure message is `expect(locator).toContainText(expected) failed`, where the 2026-08-11 inventory recorded a `TimeoutError`. The title-level identity across the two arms is what the attribution rests on; the error text differing from a 12-day-old snapshot is consistent with that snapshot being stale, which is what the tool itself says.

## Merge classification

Base `c9f3019ee`. Main gained **33** commits since the lane branched (the c5 review recorded 18; it has moved). Lane touched **87** paths.

| Bucket | Count | Handling |
|---|---|---|
| LANE-ONLY | **85** | taken as-is; main moved none of them |
| BOTH-MOVED | **2** | `package.json`, `tasks/BACKLOG.md` |

- **`package.json`** — auto-merged by `ort`, then **verified rather than trusted**: the merged value differs from main's by exactly one inserted token, `scripts/no-emdash-guard.test.mjs`, at the head of the `test:node-guards` roster. No main-side roster entry was lost, including the four `package.json` movements main made while the lane was out.
- **`tasks/BACKLOG.md`** — the only conflict. Resolved three-way from the index stages, not by eye: the lane's change vs the merge base is **exactly one line and it is a pure append** (a 274-char `CORRECTIVE c5b READY-FOR-GATES` sentence on the em-dash ruling row); main had rewritten that same row's body and added 18 lines above it. Resolution = **main's row body + the lane's appended sentence**, with main's added rows kept. Verified: 0 conflict markers remain.

## Findings

**F-2237-1 (method, live, no mechanism proposed).** A `gate-side` hold whose `blockedReason` cites a line **by quoting it** is self-rotting: the corrective that discharges the hold changes the quoted line, so `law-pointer-guard` reds on the fix. That is not a defect in the guard — the pointer really did drift, and the guard said so accurately. It is a property of citing a *defect* by its content: **the citation's ground truth is the thing you are about to destroy.** The cure is free and is what this drain did — lift the leaf in the same fire, which removes the pointer with the reason. No guard is proposed: a red here is correct behaviour, and suppressing it would silence the general case (a `blockedReason` pointer that rots while the block is *still live* is a real finding, which is exactly what F-1310-1's coordinate law is for). What is worth carrying forward is the **reading habit**: when a drain's battery reds on `law-pointer-guard` naming a leaf the drain is about to close, that is the drain's own bookkeeping arriving early, not a slice defect — re-run after the ledger commit before treating it as either.

**F-2235-5 — the design question is DEFERRED, not answered, and it should be named rather than buried.** The re-pin lands with its cause written at the site, which is the c5 review's own recommendation and the lawful form (F-1441-3). But the underlying question it exposed is untouched: **player-facing contract prose is inside `eventLogHash` via `canonicalReplayEvents`, so every future copy edit to `assets/contracts/*` is a determinism event.** The corrective was firewalled out of `src/sim/HeadlessContractSim.ts` on purpose so a drain would not launder that judgement into a green. It is *not* an owner-desk item — no owner word is needed, it is an engineering call about what a replay-identity hash should cover — so it is recorded here and in BACKLOG rather than parked on the desk. Cost of leaving it: one named re-pin per contract-copy edit, which is cheap and honest. Cost of getting it wrong in the other direction: a determinism guard weakened to protect a copy edit.

**F-2235-1, F-2235-2, F-2235-3** — carried unchanged from `reviews/c5-emdash-sweep.md`, all non-blocking and all still accurate. F-2235-1 (the `no-emdash-guard`'s hardcoded `HUMAN_TEXT_KEYS` list is blind to an unlisted text key) remains LATENT with 0 live misses; its cure when anyone wants it is to invert the test to a small id/key denylist so a new text key is covered by default.

## What the next fire should do

1. **lane-d `c6-tape-build-id`** is `ahead=1`, 9 paths, undrained — the next drain.
2. **lane-b `c7-standing-order-replay-rescoped`** was still RUNNING at this fire's exit; drain when it lands.
3. **F-2234-3** remains the open `test:node-guards` red and still wants an owner of the guard's intent rather than a quick silence.
