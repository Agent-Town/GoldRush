# reviews/er01-e7-census.md — ER-01 E7 Signal readiness census

- **Slice:** `lane-er01-e7-census.md` (ER-01 ladder, E7 Signal)
- **Branch / tip:** `lane/a` @ `566d37358` (single runner commit, `runner(lane-a): lane-er01-e7-census.md`)
- **Merged to main:** `41f40c61e94b386a0480794126c3ceda3e6a85d5`
- **Drained by:** s1480 fire, 2026-08-06
- **Verdict:** ✅ **MERGE** — census is honest, additive, and refuses rather than stretches.

## What it does

Measures all four `epoch-7-signal` board contracts against `HeadlessContractSim` under the
AP-11 / ERA-SOCKET LAW and publishes `docs/bench/e7-readiness-census.md`. Verdict:
**0 AGENT-READY / 4 DATA-GAP / 0 BROKEN**. Every Signal contract is explicitly REJECTED,
for a stated reason per contract:

- `e7-relay-valley` — the browser composes `E7SignalSystem`, drone playbook record/replay and
  `EchoBossSystem`; `HeadlessContractSim` sockets none of them, and the contract declares **no**
  `engineDependencies` entry for the absence (the census names that undeclared gap itself).
- `e7-echo-canyon` / `e7-dead-band` / `e7-relay-rush` — each declares its defining consumer
  `missing` (`broadcast-mirror-consumer`, `signal-suppression-consumer`,
  `interference-front-consumer`) and each has `harvestAnchors: []`, so active selection falls
  back to `the-claim` rather than booting a false contract.

Four attended fix-master stubs (F-ER01-E7-1..4) are written into the census doc.

## Evidence

| Gate | Result |
|---|---|
| Custody | Gated in detached worktree `gate-s1480` @ `7d3ba6aa7` per `fire.md` §3.0b — undecided content never entered main's working tree |
| §3.0 block check | `drain-block-check.mjs` → **UNKNOWN** (no leaf), not a block. Registered by this drain — see Findings |
| `npx tsc --noEmit` | **rc=0**, no output |
| `npm run build` | **green, 1.02s**; asset-diet ceilings respected (Herald 1,158,214 / 1,500,000 bytes) |
| Own spec, desktop + mobile | **8/8 passed, 10.1s**, `--workers=1` per §3.1 |
| Console/page errors | zero captured — the spec asserts it per contract per seed (narrow F-1458-1 localStorage filter only) |
| Diff shape | **108 insertions, 0 deletions** across exactly 3 files |

## Merge classification

Base: `main` @ `2ed76b05b`. Per-file:

| File | Class | Resolution |
|---|---|---|
| `docs/bench/e7-readiness-census.md` | LANE-TOUCHED (pure add, 24/24 lines absent from main) | taken as-is |
| `e2e/er01-e7-census.spec.ts` | LANE-TOUCHED (pure add, 64/64 lines absent from main) | taken as-is |
| `tasks/BACKLOG.md` | BOTH-MOVED (add/add at the same position) | **union**, with the lane line **retired** — see below |

**Ledger resolution is load-bearing (F-1461-4).** The lane's line landed reading
`GOAL LEAF … READY-FOR-GATES on lane/a`, which this merge makes *false*. It was rewritten to
`✅ MERGED s1480` in the merge commit rather than allowed to auto-merge cleanly — a clean merge
is not evidence the ledger is honest. Main's concurrent THE FINAL MILK line was kept intact.

## Why the gate battery is complete without `test:node-guards`

`fire.md` §3 requires `test:node-guards` when the diff touches `src/sim/`, `src/systems/` or
`src/entities/` (F-1460-1: cross-cutting sim changes move pins a slice-local spec cannot see).
**This slice moves zero `src/` bytes** and, unlike the E3/E6 censuses, appends **nothing** to
`assets/contracts/bench-seeds.json` — correctly, because ER-01 pins seeds only for *admitted*
contracts and this census admits none. There is therefore no surface for a cross-cutting pin to
move. The battery was still run once on the final main tree this fire as a control; see the
s1480 handoff.

## Instrument note — the gate ran on a scratch port, and had to

Port **5188** (hardcoded in `playwright.config.ts` under `strictPort`) was **held by another
session's process**: `node …/gr-milk-deepwater-surgery/node_modules/.bin/vite --host 127.0.0.1`,
pid 54836, started 07:59:52. That is an owner-side milk shift, not this fire's — it was **not
killed**. The gate ran against an external dev server on **5234** via
`GR_CAPTURE_BASE_URL` + `GR_CAPTURE_EXTERNAL_SERVER=1` (`PORT` sets nothing).
`scripts/external-server-guard.mjs` was therefore live and did **not** refuse, which is the
positive evidence that the server was a `vite dev` and not a production preview (F-1457-1 —
gating against a preview manufactures reds that read as tree reds).

ⓘ Worth recording for the next drainer: this spec spins up its **own** vite in
`middlewareMode` and never navigates a page, so the external server was not actually exercised
by these 8 tests. The scratch port was still required, because the config's `webServer` block
tries to bind 5188 **before** any test runs and fails the whole run on `EADDRINUSE`.

## Findings

### F-1480-1 — the E7–E10 census masters were dispatched with no goal leaf (Goal Registration Law)

`drain-block-check.mjs` returned **UNKNOWN** for all four censuses in this wave: `tasks/goals.json`
carries `er-01-e2-census` … `er-01-e6-census` but **no** `er-01-e7-census`, `-e8-`, `-e9-`, `-e10-`.
The masters were authored and dispatched mid-fire by an attended session (s1479 records the
07:42:33 four-lane launch) without registering their leaves, so the Goal Registration Law's
author-side half was skipped for the whole wave.

**Severity: bookkeeping, not blocking.** Per §3.0, UNKNOWN is *not* a clearance — but it is also
not an owner fork, and the default exit code is `0`, so a fire branching on rc alone would have
read it as permission. **Cured by this drain**: each of the four leaves is registered with
`status: "merged"` and its real merge hash in the drain's bookkeeping commit, under
`agent-play ▸ e7-readiness` and siblings, matching the e2–e6 shape.

**No corrective task owed** — the debt was retro-registerable and has been retired. What is *not*
cured is the author-side gap: nothing refuses a dispatch whose master has no leaf. That is a
standing class (526 of 762 masters have no leaf, s1276) and is deliberately left to F-1398-1's
predicate work rather than widened here.

### F-1480-2 (non-blocking, owner-visible) — Relay Valley is the only contract in the wave that hides its own gap

Three of the four E7 contracts declare their missing consumer in `engineDependencies`;
`e7-relay-valley` declares **none**, while being the one contract whose Signal stack actually
exists in the browser. A reader of the contract data alone would conclude Relay Valley is the
*most* ready of the four when it is the one with the largest unsocketed surface. This mirrors the
asymmetry the E5 census found in the Deepwater Claim (s1461) — i.e. it is now a **two-instance
pattern**, not a one-off. Recorded here so the attended socket master (F-ER01-E7-1) fixes the
declaration as well as the socket.
