# ap15-overtime-mode — the Homesteader's door (gr-sim plays past the secure)

**Slice:** `tasks/lane-ap15-overtime-mode.md` (AP-15 axis 8, THE HOMESTEAD)
**Branch/tip:** `lane/d` @ `820ef9490` — `runner(lane-d): lane-ap15-overtime-mode.md`
**Merged to main:** `21695d101500b47c5c289e0d44df79d9333026b3` (2026-08-08T13:22+07, **attended-side**)
**Reviewer:** s1555 fire

## VERDICT: PASS — evidence independently re-measured on the merged content, post-merge

⚠️ **THIS IS NOT A DRAIN REVIEW AND MUST NOT BE READ AS ONE.** I did not perform this merge.
I gated this slice in a detached worktree (`gate-s1555`, §3.0b) starting 13:17; an attended session
merged the identical content to main at **13:22**, mid-battery. My battery therefore ran to completion
on a tree byte-identical to what landed, but the *merge decision* was not mine and I make no claim
about the evidence the attended session gathered — I cannot see it. This file exists because the
merge landed with **no review file and a `planned` goal leaf**, and the Goal Registration Law's
bookkeeping was owed either way. Everything below is measured, this fire, by me.

## What it does

`gr-sim` gains `--overtime`: the headless twin of the browser's own `secure_choice`. At the moment a
run would secure, the secure is **banked** (recorded, not forfeited) and the sim keeps playing until
the hero or claim dies — so an agent can finally be measured on the thing the owner called the game's
soul ("a good base and a good player can go many more waves after the claim is secured ... The
longevity of the setup?", owner 2026-08-08, AP-15 axis 8). Without it the Homesteader's Crown could
not be scored for agents at all, because every headless run stopped at the secure.

Two suppression sites, both read and confirmed on merged main:
- `src/sim/HeadlessContractSim.ts:610` — `return this.dead || (this.secured && !this.boot.overtime)`
- `src/sim/HeadlessContractSim.ts:712` — `if (this.runManager.diagnostics.secured && !this.boot.overtime) return false;`

A new bound applies to overtime **only**: `scripts/gr-sim.mjs:80` `OVERTIME_CEILING_WAVES = 50`, applied
at `:90–:91` as `bankedSecureWave + 50`, ending with `endReason: 'overtime-ceiling'` (`:95`) — the
f-e2s-1 pattern. It carries the comment the master asked for (`:79`, "this is only an anti-hang bound"),
which matters: it is not a target and must not be read as one. The default-mode `waveCeiling` at `:76–:78`
is reached only when `!options.overtime` (`:92`), so it is untouched.

The outcome gains `securedWave`, `overtimeWaves` and a `homestead` block, **conditionally** —
`:495` `const overtime = this.boot.overtime && this.securedWave !== null` — so a default-mode outcome
line is structurally unchanged rather than merely observed to be unchanged. The riding mind is warned:
`:687` `if (this.boot.overtime && this.secured) view.now.overtime = true;`.

## Evidence (measured by me, this fire, in `gate-s1555` on the merged tree)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **rc=0**, 5.9 s |
| `npm run build` | **rc=0**, 30.1 s — `✓ built in 2.19s`, asset-diet ceilings respected (Herald 1,158,214 / 1,500,000 bytes) |
| `node scripts/gr-sim.test.mjs` | **rc=0 — 16 tests, 16 pass, 0 fail, 0 skipped**, 316.5 s |
| Merge classification | **pure LANE-TOUCHED across all 4 files, ZERO MAIN-MOVED** (merge-base `8bdf270af`); clean `ort`, no graft, no conflicts |
| Diff size | 4 files, +144 / −16 |

**THE CONTROL THAT MATTERS — the default-mode pins did not move, and the slice did not re-pin them.**
Scope item 1 required default mode to stay byte-identical, and F-1441-3 forbids curing a moved pin by
re-pinning it. Measured directly against `main` rather than taken from the runner's word:

- all **9** `fnv1a32:` pins in `scripts/gr-sim.test.mjs` are **identical between `main` and `lane/d`**
  (`07fd38b9`, `fa8a49e7`, `bd7fa297`, `9548ee84`, `7a7c1e7b`, `61d8cfd9`, `a3b2c95e`, `94275d9a`, `3362e2f0`)
- pins removed: **0** · pins added: **0**
- **deleted lines in the test file: 0** — the slice is purely additive to the suite, so no assertion was
  weakened or dropped to make a red go away.

Runner-reported overtime outcome (its number, not mine — I did not re-run the overtime arm):
`securedWave:10`, `overtimeWaves:9`, `homestead {goldPanned:750, goldSpent:672, peakWorks:10, worksByTier:{"1":10}, worksLost:0}`.

## Env exceptions / declared gaps

⚠️ **`npm run test:node-guards` was NOT run by me, and I will not inherit a green for it.** F-1460-1
requires it for any slice touching `src/sim/`, and this slice does. I did not run it because an attended
session held a concurrent battery for the whole of my window (F-1554-1: the battery cannot be run alone
on a busy board, and s1554 was starved past 35 minutes attempting exactly this). What exists instead:
the **runner** reports `388/388` on the lane, and the attended session's own bookkeeping commit
`378c8b3d5` cites `391/391` — but that figure is for **mp-07c-3**, a different slice, and I have not
verified either number. Treat node-guards for ap15 as **UNVERIFIED fire-side**.

`gr-sim.test.mjs` took 316.5 s against the ~80 s F-1537-1 baseline — the fire-shell CPU ceiling
(F-1269-1) plus the concurrent attended battery. Per F-1554-1 contention manufactures **reds, never
greens**, so a 16/16 green under contention is valid evidence; only a red would have been unattributable.

## Findings

- **F-1555-2 (non-blocking, bookkeeping, CLOSED by this file):** the merge landed with no review file and
  the `ap-15-overtime-mode` leaf still `planned`. This is the **third instance today** of the same class
  (F-1552-2: `mp-07c-2` merged with a `planned` leaf; `mp-07c-3` merged 13:10 and was completed
  attended-side at 13:21). The pattern is not carelessness — it is that drain bookkeeping is the *last*
  step of a drain and an attended session is often still working when the next fire arrives. Leaf flipped
  to `merged` with the full 40-hex in this fire's bookkeeping commit.
- **No corrective owed by the code.** Every numbered scope item was verified by reading merged main
  (flag, both suppression sites, the named ceiling constant with its comment, the conditional outcome
  fields, the `now.overtime` view flag, the skill.md documentation).
- ⓘ **Worth knowing, not a defect:** the runner reports that the seed-02 front-door fixture "now dies at
  wave 5 after F-DOOR-5, so the seed-02 test uses an adaptive public-order policy." That is a fixture
  adapting to a *deliberate* era shift (harvest walks) and corroborates F-BAL-1's measured difficulty
  move — but it means one more test now depends on an adaptive policy rather than a fixed one. Recorded
  so a future red there is read as fixture drift, not as a new regression.

## GZ-01

**No news item.** `--overtime` is an agent-facing measurement flag documented in `public/skill.md` — the
door doc an *agent* reads, not the game a *person* plays. No player-facing surface moves; a plain boot is
unchanged. Sourcing an item from it would be the player-visibility filter failing open (the mp-07c-1
precedent, s1550).
