# Review — gauntlet-heat5-best-effort

**Slice:** `gauntlet-heat5-best-effort` (lane-c)
**Branch/tip:** `lane/c` @ `72b01774f` — `runner(lane-c): gauntlet-heat5-best-effort.md`
**Merge base:** `5c14f6e17`
**Merged to main:** `b3f34cce94642ef40992b29fceadd42c2d453064` (fire s2276, 2026-08-24)

## VERDICT: MERGED — evidence-complete, firewall-clean, and it produced two door findings worth more than the standings

## What it does

The owner repealed heat-1's invented austerity (owner ruling 2026-08-24, verbatim: *"I really don't mind if the AI is doing more effort to beat it or has more decisions… I want it to genuinely try its best to beat it"*). This heat rode all six E1/E2 contracts at genuine full effort — no attempt caps, lawful open-book study, disclosed in every stack — through the **public door only**, at live build `22365118a`.

It secured **five of six**, put **four accepted and ranked** standings on the live board, and hit exactly one capability wall (the Baron) and one **door** wall. The door wall is the finding: an honest Night Shift win is structurally un-submittable, and that sits directly in front of an imminent launch.

The slice lands **artifacts and one BACKLOG row only** — zero game code.

## Evidence

All numbers below were **re-derived from the committed artifacts by this drain**, not copied from the runner's note (the note is the subject, not the evidence).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` (merged tree) | **rc=0**, clean |
| `npm run build` (merged tree) | **green, built in 1.56s**; asset-diet ceilings respected (Herald 1,158,214 B of 1,500,000 B) |
| Firewall | **0 violations** across **155** staged paths (allowed: `artifacts/gauntlet-heat5-*`, `tasks/BACKLOG.md`) |
| Run-surface drift vs main | **0 paths.** `src/ e2e/ functions/ scripts/` + configs byte-identical — tree hashes equal on both sides (`src` `2ddbd70590d5`, `scripts` `d76d0c3ee425`, `e2e` `a3aba8a49e17`, `functions` `8096995a6e7b`) |
| BACKLOG merge (1 conflict, both sides added a top row) | **union verified by row sets**: 3,284 main rows kept + 1 lane row = 3,285; **0 dropped from either side** |
| Merged-tree gate location | detached `gate-s2276/` per §3.0b; the merge onto main was made and committed as one act (F-1589-5) |

**Why tsc/build are honest here rather than theatre:** the run surface is byte-identical to main, so these two gates are structurally incapable of differing from main's. They are recorded as the standard, and the *load-bearing* evidence is the run-surface identity row above.

### The ride, as the artifacts record it

| Contract | Launches (preserved) | Outcome | Ticks | Door | Assay |
|---|---:|---|---:|---|---|
| `the-claim` | 1 (0) | SECURED w10 190g | — | accepted | pending, ranked |
| `e1-dry-gulch` | 1 (1) | SECURED w20 145g | 18000 | accepted | pending, ranked |
| `e1-night-shift` | 6 (5) | SECURED w25 115g | **22501** | **REFUSED `bad_payload`** | — |
| `e1-twin-banks` | 6 (5) | SECURED w20 127g | 18000 | accepted (2nd POST) | pending, ranked |
| `e1-baron` | 9 (8) | **unsecured**, best w21 | 16462 | not submitted | — |
| `e2-hill-mine` | 14 (13) | SECURED w15 40g | 13824 | accepted | pending, ranked |

- **Night Shift, verified on four independent attempts** (`attempt-3` … `attempt-6`): `secured=true`, `waves=25`, `timeMs=750033` → **22,501 ticks**. The refusal is real and recorded: `e1-night-shift/post-response.json` = `{"ok":false,"error":"bad_payload","message":"Standing not accepted."}`. The only sub-cap Night Shift run (`attempt-2`, 13,084 ticks) is `secured=false` at wave 14.
- **Baron wall substantiated**: 8 preserved attempts, none secured, best `waves=21`. `attempt-4-diagnosis.json` records the boss at `hp:49025` and `attempt-7-diagnosis.json` at `hp:53174` — i.e. the cold public solo door leaves ~92% of boss HP standing. The note's "49,025 of roughly 53.3k" is exact.
- **Twin Banks door finding confirmed by the file pair**: `submission.json` (32,161 B) → `post-response.json` `{"ok":false,"error":"bad_payload"}`; `submission-accepted.json` (32,053 B) → `post-accepted-response.json` `{"ok":true}` → `verdict-slip.json` `{"assay":"pending","ranked":true}`.

## Findings

### 🔺 F-2276-1 — THE DOOR STRUCTURALLY REFUSES AN HONEST NIGHT SHIFT WIN, AND LAUNCH IS IN FRONT OF IT (BLOCKING FOR THAT CONTRACT — OWNER'S DESK)

`e1-night-shift`'s secure condition requires reaching **wave 25**. The earliest such win the rider could produce, on four independent attempts, is **22,501 ticks**. The standings door accepts at most **18,000** (both accepted E1 reels land at exactly 18000). So **every honest Night Shift wave-25 secure is rejected by the validator**, and the contract cannot be won through the public door by anyone — this is not a rider skill wall.

- ✓ VERIFIED from artifacts: the four `secured=true / waves=25 / timeMs=750033` outcomes and the `bad_payload` POST response.
- ✓ VERIFIED as distinct from the already-known boundary bug: the Twin Banks case (F-ASSAY-E2E-2, `specs/agent-play/tape-contract.md:26`) is an **off-by-one at 18,001** that silent default banking avoids. Night Shift misses by **4,501 ticks**. Silent banking cannot fix it; nothing the rider does can.
- ✗ UNVERIFIED — stated as a limit, not a claim: **the enforcement site is not in this repo.** Targeted greps of `functions/`, `src/` and `scripts/` for `18000` return only an unrelated `backfill-agent-tapes.mjs:40` timer. The cap lives server-side in the deployed standings endpoint (the droplet), which this drain cannot read. **Whether the correct cure is raising the ceiling, making it per-contract, or changing Night Shift's wave-25 secure condition is a design fork — the contract's own difficulty is at stake — so it is the owner's call, not a fire's.**

**Why this is desk-worthy rather than a fire-authored corrective:** the live BACKLOG row records the owner's standing launch focus (*"I want to first secure and publish + announce the first version now"*). Launching a six-contract county in which **one contract is unwinnable at the door** is exactly the kind of thing a launch announcement should not be the first to discover. Recommendation: **raise or per-contract the tick ceiling before announce** — it is the smallest of the three cures and it invalidates no existing standing. Flagged, not acted on.

### 🟡 F-2276-2 — THE FIRST RIDE OF EVERY ITERATED CONTRACT LEFT NO RECORD (non-blocking, retention)

The note reports **37 launches**; the artifacts preserve **32** attempt records. The gap is not random — it is **systematic and exactly one per contract**: attempt files begin at `attempt-2` in `e1-baron`, `e1-night-shift`, `e1-twin-banks` and `e2-hill-mine`, and `the-claim` (whose single launch was the build-skew probe) has none. Only `e1-dry-gulch` preserved its `attempt-1`.

The aggregate in the note is **honest** — 37 is the true launch count and the missing five are explicable — but under the RETENTION LAW the *first* diagnosis of each map, i.e. the ride that set every subsequent hypothesis, is the one ride nobody can now read. No corrective authored: this is a harness-side habit in the heat task template, and the right place to fix it is the next heat's master (`artifacts/<heat>/<contract>/attempt-1-*` written before the first launch, not after the first death).

### ⓘ Non-findings, recorded so they are not re-investigated
- The note's *"accepted semantic reel is 31,318 bytes"* vs the on-disk `submission-accepted.json` at **32,053 B** — a POST-body-vs-file-on-disk difference, not a discrepancy.
- Assay `pending` on all four accepted rows at handoff is **not** a defect: the note records `assay-replay-agent.mjs` reproducing all four locally with exact outcome and event-log hashes (`local-assay.json` per contract).

## Merge classification

Base `5c14f6e17`. **154 of 155 paths are LANE-ADDED files under `artifacts/gauntlet-heat5-20260824/`** — new paths, no main-side counterpart, nothing to graft. **One path, `tasks/BACKLOG.md`, is BOTH-MOVED**: main gained 7 rows (s2275's heat4 re-queue, heat3c/3b drains, F-2274-1/2, the heat-5 dispatch row) while the lane added its completion row, both at the top of the file. Resolved as a **union with the newest event first** — the heat-5 completion row (lane-c commit 18:20) above s2275's rows — and verified by row-set comparison against both parents rather than by reading the diff: 0 rows lost from either side. The resolution committed to main is **byte-identical to the one that passed the gate**.
