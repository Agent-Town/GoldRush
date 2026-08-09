# f1612-1 — the GZ-01 sweep learns the difference between "reported" and "dismissed"

- **Slice:** `f1612-1-gazette-sweep-purpose-split` (fire-authored s1612, drained s1613)
- **Branch / tip:** `lane/b` @ `a89c87a6a` — base `3d778bfeca52ed987b67a433e6e5903a5bf2df2e`
- **Merge:** `5624e6a7ff9633a61ac49c299da116f61f5759f0`
- **Gated in:** detached worktree `worktrees/gate-s1613` (§3.0b — undecided content never entered main's working tree or index)
- **VERDICT: MERGED.** All gates green, both controls re-run drain-side rather than inherited, and the one thing that looked like a defect turned out to be load-bearing — see F-1613-1.

## What it does

`scripts/gazette-backfill-sweep.mjs` used to ask one question of every player-path merge: *does this hash appear anywhere under `marketing/outbox/`?* That test is **presence-keyed**, so a hash written to explain why a merge does **not** count cleared the sweep exactly as news does (F-1610-1). The slice adds a declared marker — the literal `NOT PLAYER-VISIBLE` — and classifies a citation as **dismissed** only when the marker appears in the **same paragraph** as the hash. It reports three numbers instead of two and prints the dismissed merges as their own list, so they stay re-judgeable instead of vanishing into a cited total.

The load-bearing design decision is the **default**: present-but-unmarked classifies **reported**, never **candidate**. Had it gone the other way, the four existing dismissals would have flipped back into the candidate queue and every future fire would re-pay the judgement cost on them forever — F-1600-1's disease exactly (*"a check that reports a discharged duty as owed reports it forever"*). The marker-removal control below is the proof that the default holds.

## Evidence (merged tree, `--workers=1` n/a — this slice adds no e2e)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, **1.18 s** |
| `node scripts/gazette-backfill-sweep.mjs` | **71** player-path merges → **reported 67 / dismissed 4 / candidates 0**, **exit 0** |
| Marker-removal control (revert `gazette-queue.md` to main, same tree) | **71 / 0 / 0** — the four fall back to **REPORTED**, never to candidates |
| Control restored | **67 / 4 / 0** — worktree byte-clean after |
| `node --test scripts/gazette-backfill-sweep.test.mjs` | **1 test, 4 assertions, pass 1 / fail 0** |
| Manufactured red (classifier line-scope instead of paragraph-scope) | **fail 1** — wrapped continuation returns `'reported'`, expected `'dismissed'`; probe reverted, re-green 1/1 |
| `node scripts/gate-caller-audit.mjs` | **PASS** — 91 roots / 142 reached; the new test is rooted, no new orphan |
| `npm run test:node-guards` (run ALONE, F-1537-1) | **rc=0 · 424 tests / 419 pass / 0 fail / 5 skipped · 280.9 s** |
| Boot probe / screenshots / perf | **not owed and not run** — the diff is one factory script, its test, one `package.json` line and one line of marketing prose. It renders nothing and touches no player path. |

**Both controls were re-run drain-side rather than inherited from the runner's report** (the s1612 precedent). The manufactured red is the one that matters: `undefined`-style vacuity is the standing risk with a new classifier test, and a green alone would not have distinguished a live assertion from a decorative one. Installed by **file edit**, never a shell-quoted probe.

## Merge classification

Base `3d778bfec`. `git log 3d778bfec..main --name-only -- <the four paths>` returns **nothing** — main never moved any of them, so every path is **LANE-TOUCHED** and the `ort` merge is trivially correct rather than merely conflict-free. `main..lane/b` empty after merge.

| File | Class |
|---|---|
| `scripts/gazette-backfill-sweep.mjs` | LANE-TOUCHED (+124/−54 net rewrite of the classifier + header) |
| `scripts/gazette-backfill-sweep.test.mjs` | LANE-TOUCHED (new, 12 lines) |
| `package.json` | LANE-TOUCHED (the `test:node-guards` line only, new leaf prepended) |
| `marketing/outbox/gazette-queue.md` | LANE-TOUCHED (+2 lines: one blank, one marker) |

Firewall honoured exactly: no `src/**`, no `e2e/**`, no other script, no other part of the gazette, no ledger surface.

## Findings

### F-1613-1 (NEW, non-blocking, no code owed) — the retro-mark's correctness rests on an invisible blank line, and the obvious editorial repair silently mis-classifies five merges

The marker landed at `marketing/outbox/gazette-queue.md:1266`, inserted with a **blank line above it**, which severs a sentence mid-clause. The published note now reads as two paragraphs — *"…the same pass turned up six"* / *"NOT PLAYER-VISIBLE uncited merges and four were judged NOT player-visible…"*. On sight this is a typo in owner-facing prose, and the master had explicitly said **do not re-flow that note**, so my first reading was that the runner had broken its own firewall.

**That reading is wrong, and I only know because I tested the repair instead of applying it.** The roundup's own two *reported* merge hashes (`ba78dad5e`, `88530e3ef`) sit in the same contiguous run of prose as the four dismissed ones. Paragraph scope cannot tell them apart — so the blank line is the **only** thing scoping the marker to the four. I applied the tidy repair (un-split the sentence, marker appended at the end of the paragraph) in the gate worktree and re-ran the sweep:

> **reported 62 / dismissed 9 / candidates 0** — five extra merges swept into `dismissed`, including **`88530e3ef`**, which *that very roundup publishes as news*, plus `c742cd596`, `ba78dad5e` and two more.

So the runner's placement is correct and deliberate, the severed sentence is the price paragraph scope charges over prose that mixes reported and dismissed hashes in one block, and **the defect is that nothing says so.** The trap is well-shaped for this factory: the damage looks like a typo, the repair looks like tidying, the sweep is advisory and **exits 0 in every state** (F-1600-1 forbids a red guard here), and `classifyCitation`'s fixture test cannot see the live board by design. A future fire fixing the prose would corrupt the numbers with no red anywhere on the board.

**Cure applied this drain (drain-side review fix, comment-only):** the warning is written into the **sweep's own header comment**, not into the gazette. That is the correct home — fires read the script, the owner reads the prose, and an explanatory line in owner-facing published copy would be its own small vandalism. The header already carries the F-1600-1 lesson and the master required it be kept true.

**GATE: none owed.** No code change, no owner word. The row closes if a later slice replaces paragraph-derived scope with an explicitly delimited one; until then the header comment is the whole mitigation.

### Non-findings, stated so they are not re-derived

- **`test:node-guards` skip count differs from the runner's** (5 skipped here vs 2 in the lane report; **0 fail both sides**, 424 vs 422 collected). Environment-dependent skips, not a regression — the lane runs on a pinned Node (F-1507-1, both shells on one node version, still open on the owner's desk).
- **No GZ-01 news item is owed for this merge.** The diff touches no player path — the sweep's own `PLAYER` regex (`src/|assets/|public/|functions/|index.html`) does not match a single file in it, so the sweep will never see this merge, and my review names no player-visible change. Stated rather than skipped silently, per the standing duty.
- **`test:ledger-guards` is not in this table on purpose.** It runs as the fire's last act, after the bookkeeping commit this review is part of (F-1300-4) — a battery taken now would be structurally blind to the rows I am about to write.
