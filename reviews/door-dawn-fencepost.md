# door-dawn-fencepost — the door envelope learns the inclusive terminal endpoint

**Slice:** `door-dawn-fencepost` (lane-d)
**Branch / tip:** `lane/d` @ `b1884fe5f` (runner commit `runner(lane-d): door-dawn-fencepost.md`)
**Merged to main:** `b80253bffeb9e8a52a0b3f841299b56d28c3a39f` (drained s2411, 2026-09-01)
**Gate base:** `568575151`; re-verified against `5b85f8583` before merging (see Concurrency below)

## VERDICT: MERGE — cured at the derivation, verified on both trees, no stale pins anywhere.

## What it does

Every honest dawn secure was being refused by exactly one tick.

`scripts/gr-sim.mjs:259` mints `durationTicks = Math.max(elapsedTicks, lastEntryTick + 1)`. A rider that
answers **at** the final wave boundary — a `SECURE_CHOICE` accepted at the instant the run ends — records
its last entry at `elapsedTicks`, so the tape's duration is `elapsedTicks + 1`. The contract ceiling in
`runTapeEnvelopeForContract` was derived as the wave boundary in steps plus one, which is one short of
that lawful endpoint. A survival contract's honest full ride therefore lands exactly one past the ceiling
**by construction**, and the door answered `bad_payload`.

The mechanism was **already documented in this repo** — `scripts/gr-sim.mjs:248` carries a nine-line
comment under finding F-ASSAY-E2E-2 stating it precisely: *"the browser recorder samples BEFORE each step,
so its last entry always lands at `durationTicks - 1`… gr-sim's rider, though, may answer AT the boundary…
The recorded tick is the truth… the elapsed count is the side that was wrong."* The door's envelope had
simply never learned a law the simulator had already written down.

The cure is at the **derivation**, not per contract: `+1` → `+2`, with the inclusive-endpoint law stated in
a comment so it cannot regress. Every contract-derived ceiling moves consistently by one.
`functions/api/standings.ts` additionally refuses an over-long reel as `reel_duration_exceeded` with a
named reason, rather than folding it into the generic `bad_payload` (scope item 3b).

## Evidence

All figures measured by the drain on its own merged tree in a detached gate worktree (§3.0b), not
inherited from the runner's report.

| Arm | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green (built in 1.79s) |
| `test:stats` | **green** — 87 stats + 181 standings KV + 181 SQLite + 19 ledger-worker checks |
| `scripts/agent-reels.test.mjs` | **1/1 pass** — *"agent reel validation reuses the door bounds"*, the suite that breaks on an inconsistent envelope |
| `scripts/assay-replay.test.mjs` | **5/5 pass** — incl. *"a securing door tape carries its start, its boundary answer, and replays to its own hash"* |
| Boot probe (`_s2080-f1742-1`) | **6/6 pass**, desktop + 390px mobile, zero console/page errors, `--workers=1` per §3.1 |
| Stale-pin sweep | **zero** occurrences of `22_501 / 20_349 / 23_144 / 21_601 / 18_001` anywhere in `scripts/ src/ functions/ e2e/ public/ assets/` |
| `engine-era-guard` | RED — **pre-existing on main**, see below |

### The cure, measured on both trees

The decisive control. Same call, same contract, the only variable is the tree:

| | `e1-night-shift` maxTicks | admits the banked 22,502? | maxEntries | maxTapeBytes |
|---|---|---|---|---|
| **main** (`5b85f8583`) | 22,501 | **false** — the defect, reproduced | 4,501 | 736,544 |
| **merged** | 22,502 | **true** — the cure, verified | 4,501 | 736,544 |

`maxEntries` and `maxTapeBytes` are **byte-identical across both trees**, which settles scope item 2 (does
the +1 ripple?) by measurement rather than assertion: it does not, because the extra tick does not cross
the entry/byte rounding boundary.

### The gate fixture

`artifacts/claude-debut-20260901/claude-fable-nightshift/attempt2.tape.json` — Claude Fable 5's genuine
Night Shift dawn secure: `contract e1-night-shift`, `durationTicks 22502`, `secured true`, `481 gold`,
stamped `era 5` / `c0a015ae…` (the *declared* era-5 pin, because it rode the deployed build). This is the
exact tape the live door turned away, and the merged envelope admits it.

## Merge classification

Base `fa7d32798`. Three files, `+24/−14`, every one **LANE-TOUCHED ONLY** — `git diff --stat base..main`
over all three paths is empty, so main never moved them and no graft was required. Merge was clean under
`ort` with no conflicts, and `main..lane/d` is empty after landing (absorbed).

- `src/playbook/PlaybookFormat.ts` — the derivation (`+1` → `+2`) + the inclusive-endpoint comment
- `functions/api/standings.ts` — the named `reel_duration_exceeded` refusal
- `scripts/test-standings.mjs` — every pinned ceiling moved by one; new arm asserts the refusal *reason*

Exactly the firewall the master allowed. No sim mechanics, no ranking, no worker logic, no era registry.

## Concurrency (§3.0b)

Gated in a detached worktree; main was never used as scratch. **Main moved during the gate** — the attended
session landed `5b85f8583` ("Opus opens epoch 2 for era 5") while the battery was running. Re-classified
before merging rather than blind-merging: that commit is **evidence-only** (26 files under `artifacts/`,
1 under `tasks/`, **zero** run-surface and zero engine-corpus paths), and the engine hash on the new main
recomputes to `386f971d…` — unchanged. The gate therefore holds exactly against the tree that was merged.
Merge and commit were one act (F-1589-5); nothing was left staged.

## Findings

### F-2411-1 — NON-BLOCKING, and it is a REASON NOT TO PIN rather than a defect in this slice

The runner correctly reported that the engine identity hash rotates, and the master told the drain to
re-pin it. **I did not re-pin, and the restraint is measured rather than timid.**

Three distinct values, all computed by this drain:

- **declared** (era 5, its single pin): `c0a015ae…`
- **main before this merge**: `386f971d…` — already divergent since 21:41 on 2026-08-31 (F-2408-1)
- **merged tree**: `e83c32a5…`

`ENGINE_SOURCE_INPUTS` (`scripts/assay-replay-agent.mjs:36–48`) contains both `src` — which my change
legitimately touches — **and** `package.json`, which is F-2408-1's measured false positive, where the
factory's own F-1300-4 law *requires* every ledger-writing fire to append a guard filename.

So `e83c32a5…` differs from the declared pin for **two causes at once: one legitimate and one that two
consecutive fires (s2408, s2409) deliberately escalated to the owner.** Pinning it would bless both in a
single row — laundering the false positive into era 5's lineage, and making the red disappear *without*
the ruling that F-2408-1 exists to obtain. That is precisely the F-1460-1 decay mechanism.

⚖️ **The board is no worse for this merge.** Main was already unassayable — s2409 verified end to end that
a tape generated from main is stamped `386f971d…`, is in no pin, and is judged `unassayable`. It was
unassayable before this drain and it is unassayable after; only the value moved.

🔺 **What the owner should know: F-2408-1's remedy value has changed.** s2409 recommended appending
`386f971d…` as a second era-5 pin. That value is now stale — main carries `e83c32a5…`. The *question* is
unchanged and still owner-owed (append-a-pin vs bump-the-era, and the deeper one: should `package.json` be
in the identity corpus at all, when our own law mandates editing it?). Only the subject hex has moved, and
whichever way it is ruled the pin must be re-derived against main at that time, not copied from a handoff.

### F-2411-2 — NON-BLOCKING, recorded so it is not mistaken for a gap

The master's stated premise for the +1 was *"the recorded log covers the initial state PLUS every fixed
step"*. That premise is **wrong**, and the master's own honesty guard told the runner to stop and name the
true mechanism if so. The runner named it correctly with file:line (`gr-sim.mjs:248`, `RunTape.ts:128`) and
proceeded, because the *conclusion* (+1) survived the corrected mechanism. I verified both citations at
source and they hold. The browser recorder does **not** add the terminal slot — it samples before each
step — so this change widens the envelope by one for a slot the browser will never use. Widening is the
safe direction, and human tapes are unaffected.

## Ledger

Goal leaf `door-dawn-fencepost` → `merged` @ `b80253bffeb9e8a52a0b3f841299b56d28c3a39f`, in the commit
following the merge (F-1384-1: a commit cannot contain its own hash). BACKLOG row appended. Done-move
renamed `drained-s2411-b80253bf-…`. GZ-01 item filed — every dawn ride being refused, and now accepted, is
player-visible by any reading.
