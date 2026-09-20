# LB-02 — the bench's internal memory (stack self-identification)

- **Slice:** LB-02, `specs/agent-play/README.md` §THE BENCH (owner directive 2026-07-29)
- **Branch / tip:** `lane/m4` @ `6c6ecd57` (runner commit `runner(lane-b): lane-bench-fields.md`)
- **Base for the delta:** `d7edcd3b` (the LB-01 lane commit already on main as `ab801307`)
- **Merged to main as:** `36e6c1b7`
- **Drained:** s1216, 2026-07-29
- **Task master:** `tasks/lane-bench-fields.md` (done-move `20260729-164041-lane-bench-fields.md`)

## Verdict

**ACCEPT — merged.** The slice does exactly its four scope items, adds no file, and the
one thing it could have got dangerously wrong (leaking a self-declared stack onto the
public board) it gets right *by construction* and then asserts. The adjacent ceremony
battery came back red — and a matched control plus a second treatment sample prove the
red is the box, not the slice (F-1216-1 below).

## What it does

The county board becomes a **benchmark substrate** without becoming a leaderboard for
stacks. A submission may now declare, optionally, *what ran it*:
`stack: {model?, harness?, harnessVersion?, config?}` — each field a string capped at
256 chars, each stored **verbatim** in the KV row and stamped `declaredBy: 'self'` so a
later reader can never mistake a self-report for a measurement. Absent is fine: a human
submits nothing and validates identically.

Separately, every submission now carries `seed` (≤256 chars) and
`seedMode: 'live' | 'bench'`, so a pinned-seed run **declares itself as one**. `Game.ts`
derives both from the existing `getDebugSeed()` — `null` → `('gold-rush', 'live')`,
pinned → `(seed, 'bench')` — and the seed it hashes is now the same variable it reports,
so `seed` and `seedHash` cannot drift apart.

Item 2's blindness is the load-bearing one. It is not enforced by a filter that could
rot; the public GET has always projected the board through an explicit destructure of
six fields (`profileName, secured, waves, timeAlive, gold, baseValue`), so a new stored
field is invisible unless someone adds it to that list on purpose. The slice's
contribution is to **pin that property down in a test** — every returned row is asserted
free of `stack`, `seed`, `seedMode`, `model`, `harness`, `harnessVersion`, `config` and
`declaredBy`, alongside the `anonId`/`seedHash`/`inputLogHash` assertions LB-01 left.

No aggregate/report path is built. Storage only, per scope — reports stay owner-gated.

## Evidence

| Gate | Result |
|---|---|
| `test:node-guards` (**run first**) | **74/74 pass**, 0 fail, exit 0 — incl. `whole suite collects without loading Vite-only modules` |
| `playwright --list` | **2460 tests / 344 files** — unchanged, as expected: LB-02 extends an existing spec and adds no file |
| `tsc --noEmit` | clean, exit 0 |
| `vite build` | green, **1.50 s** |
| Own spec `e2e/lb-01-county-standings.spec.ts` | **12/12 passed**, both projects, 22.5 s |
| Plain-boot console probe, 1280×800 | **0 errors · 0 warnings · 0 pageErrors** |
| Plain-boot console probe, 390×844 | **0 errors · 0 warnings · 0 pageErrors** |
| Adjacent ceremony battery | RED in both arms — see F-1216-1 |

Server used for every playwright/probe run: a scratch vite on **port 5281**, never 5188,
because **lane-c was live on AP-06b from 16:52** and 5188 is the shared lane port.
Verified released at exit.

One honest note on the worker count: I invoked the own-spec run with `--workers=4` per
F-1215-1's standing instruction; Playwright allocated **2**. The count reported here is
what ran, not what I asked for.

## Merge classification

Pure **LANE-TOUCHED**. Three files, and `git diff --stat d7edcd3b main` over all three is
**empty** — main had moved none of them since the lane's base, so there was no
MAIN-MOVED component and no 3-way graft.

| File | Class | Note |
|---|---|---|
| `functions/api/standings.ts` | LANE-TOUCHED | +57/−2; schema, validation, `validateStack` |
| `e2e/lb-01-county-standings.spec.ts` | LANE-TOUCHED | +56/−2; extends the LB-01 spec |
| `src/game/Game.ts` | LANE-TOUCHED | +6/−1, entirely inside the standings submit block |

The `lane/m4` two-dot diff against main is large and mostly phantom (stale base); the real
delta is the tip commit alone, its two predecessors having already merged as `ab801307`
and `81bf94ac`.

## Findings

### F-1216-1 — the concurrency class reaches the secure-ceremony battery, and `locked-win:65` is a stable member missing from the inventory (NON-BLOCKING for this merge; owed as a rate)

The adjacent battery (`locked-win`, `task-023-victory-palisade`, `tl-01-run-telemetry`,
`e1-baron` — 58 tests, `--workers=4`) failed. Because my `Game.ts` hunk sits *inside the
secure ceremony these specs exercise*, the merge had a genuinely plausible story for
breaking them. It isn't the cause, and what settled that was measurement, not the story.

Three samples, same command, same external server, same box:

| Arm | Tree | Result |
|---|---|---|
| **T1** treatment | merged | **11 failed / 47 passed** |
| **C1** control | `src`/`e2e`/`functions` reverted to clean main | **8 failed / 50 passed** |
| **T2** treatment | merged (restored) | **4 failed / 54 passed** |

**The treatment arm produced both the worst and the best result of the three.** The
within-arm spread (4 → 11) is larger than the treatment-vs-control gap (11 vs 8), so the
merge is not the variable. Clean main fails this battery on its own — C1's 8 failures
include every member of T2's 4. No test failed under treatment and passed under control
across both treatment samples.

Load during all three arms was heavy and comparable (`loadavg` 15.89 / 29.59 1-and-5-min),
lane-c being live on Codex plus its own gates. This is the **third** fire in a row landing
on one theme (F-1214-1 concurrency, F-1215-1 `ap-standing-orders:80`, now this), and it
sharpens F-1215-2's ask rather than answering it.

What is new and worth recording:

- `e2e/tl-01-run-telemetry.spec.ts:229` (`:236`, both projects) is **already in**
  `logs/suite-red-inventory.md` at a 58.3% rate — it failed in all three arms, exactly as
  a 58% flake should.
- `e2e/locked-win.spec.ts:65` (both projects) failed in **all three arms** and is **absent
  from the inventory**. It is a stable red on main at `--workers=4`, not a flake of mine.
  Its assertion is `expect.poll(() => posts.length).toBe(2)` — a *count of network posts*
  polled with a 5 s budget, which is precisely the sampling-window shape F-1214-1
  identified: a state property asserted through a timing window.
- `e1-baron` and `locked-win:122` members shuffled between arms — present in C1, absent in
  T2, and vice versa. Stochastic.

**Owed (unchanged in kind, now with a third data point):** the F-1215-2 rate instrument —
N runs per worker count across the class members, not another single-shot arm. Adding
`locked-win:65` to `logs/suite-red-inventory.md` should fall out of that measurement
rather than being hand-entered at an unmeasured rate.

### F-1216-2 — `seed`/`seedMode` are REQUIRED on POST, which tightens a live public contract (NON-BLOCKING, owner-informational)

Scope item 3 says the submission "gains `seed` + `seedMode`… Validation only", and the
runner read that as **required**: `if (… || !seed || !seedMode || …) return 400`. Item 1's
`stack` is explicitly optional and is implemented optional; item 3 is silent, and the
stricter reading is defensible — a bench whose rows may lack a seed is a weaker bench.

The consequence to name: **a client that predates this merge now gets `400 bad_payload`.**
In-repo that is a non-issue — `Game.ts` is the only submitter (`grep` over `e2e/` and
`src/` finds no other), and client and server ship in the same commit. It matters only if
the standings endpoint is ever deployed ahead of the client bundle. Since DEPLOY is
owner-gated and both halves are in `36e6c1b7`, there is nothing to fix today; it is
recorded so a future split deploy doesn't rediscover it as a mystery 400.

Reads are *not* tightened: `validateStoredRow` treats the seed pair as all-or-nothing and
the spec seeds a legacy row without it, which survives and ranks 2nd. Backward compatible
where it counts.

## Firewall

TOUCH-ONLY honoured: exactly `functions/api/standings.ts`, the client submit hook in
`src/game/Game.ts`, and the spec. The NO list held — no county-standings UI, no
view/orders, no other endpoint's KV keys. The `Game.ts` delta is 6 lines, all inside the
standings submit block; it introduces no gold/economy/sim write.
