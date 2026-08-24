# f2279-1 — the codex shim survives a rider hanging up mid-stream

**Slice:** `f2279-1-codex-shim-epipe-survival`
**Branch:** `lane/b` · **Tip:** `cf1c43885` · **Merged at:** `12c7d245b6881ec4999cfaa27bbc935be5867e64`
**Drained by:** s2283 fire, 2026-08-25
**Gate tree:** detached worktree `worktrees/gate-s2283` at `main + lane/b` (§3.0b)

## VERDICT: MERGE — green on every gate, cure proven load-bearing by a re-taken manufactured-defect control.

## What it does

The subscription shim died on an **unhandled socket `EPIPE`**. This is not hypothesis: the crash is
OBSERVED, its stack preserved at `artifacts/gauntlet-heat4-20260824/shim-crash.txt`, and it cost the heat-4
gauntlet roughly half its program (OpenClaw 8 of 9 riders never ran). One rider hanging up was taking the
whole shared service with it.

The cure attaches error handlers where the process could previously die:

- `handleStreamError` on **request**, **response**, and — the actually load-bearing one — the **raw socket**
  via `server.on('connection', …)`. The pre-existing `if (response.destroyed) return` at the old `:209` is a
  *check, not a handler*, and cannot help a write already in flight when the peer's RST lands in
  `onWriteComplete` — the exact frame the preserved stack names.
- `child.stdin.on('error', …)` — rejects explicitly instead of letting a dead child become a **false 200**.
  (This was found by the runner's own independent review pass, not by the master.)

**The handler declares rather than swallows**, which is the detail worth approving: only
`EPIPE`, `ECONNRESET` and `ERR_STREAM_DESTROYED` are absorbed silently; **every other stream error is still
logged**. That is the correct polarity — the same one the s2212–s2227 finding streak spent fifteen fires
teaching this repo, and it is here by construction rather than by luck. The log line carries a static label
and an error code only — never prompts, headers or tokens.

## Evidence

All gates on the **merged tree** in the detached gate worktree.

| Gate | Result |
|---|---|
| `npm run test:codex-shim` (`--test-concurrency=1`) | **8 pass / 0 fail / 0 skipped**, 24.24 s — **with live subscription auth**, so no arm was skipped |
| The new arm specifically | `client disconnect mid-stream leaves the shim available` — **pass**, `abort_bytes=65536 followup_status=200` |
| `npx tsc --noEmit` | **rc=0** |
| `npm run build` | **green**, built in 1.39 s |
| Playwright / `test:node-guards` / screenshots | **correctly not run** — no `src/`, `e2e/`, `functions/` or asset path touched; F-1460-1's `src/sim`–`src/systems`–`src/entities` trigger does not fire |

### The drain's own manufactured-defect control (F-2215-1 — a green is not evidence about a red)

I re-took the runner's proof rather than inheriting it. Removing **only** the socket handler line on a
scratch copy, then running the new arm **by name** (so the control costs zero subscription quota):

| Arm | rc | Output |
|---|---|---|
| **LIVE** | **0** | `tests 1 / pass 1 / fail 0`, `abort_bytes=65536 followup_status=200` |
| **NEUTERED** (socket handler removed) | **1** | `Error: write EPIPE` |

**VERDICT: the arm MOVES — it is a live pin, not decoration.** This reproduces the runner's reported proof
exactly. `serve.mjs` was restored via `git checkout` and verified byte-identical (`no diff`) afterwards.

**The arm asserts the right thing.** The master demanded that a *subsequent* request succeed, because
*"did not throw" is not survival* — and it does: after the client resets the connection mid-stream, the test
issues a fresh request against the same server and asserts HTTP 200 with `still-alive`.

⚠️ **One honest note on my own instrument.** My control's F-2215-1 validity probe (*did the arm RUN?*)
printed `ran=false` for both arms — because I wrote the assertion against TAP-style `# tests N` while node
prints `ℹ tests N`. **The arm ran fine; my check for whether it ran was broken.** I caught it by refusing to
accept `ran=false` alongside a confident verdict and re-reading the raw output. That is the F-2215-1 trap one
level out: *a validity assertion is itself an instrument, and it can fail in the direction that makes you
distrust a good result.* Recorded because the streak's running note is that these probes keep repricing what
their author was surest of.

## Findings

### F-2283-5 — the full `test:codex-shim` file costs measurably MORE than the figure on the owner's desk (non-blocking; **sharpens an OPEN owner question**)

**F-2272-1** is a live desk item asking whether `test:codex-shim` should be rooted in `test:ledger-guards`,
priced at *"~16.7k prompt tokens of your Codex allowance on every drain"*, with s2282 recommending **(a) split
the file, rooting only the 2 pure arms.**

Running the full file this drain **measured the price directly**, from the suite's own `ℹ` usage lines:

| Arm | Measured prompt tokens |
|---|---|
| `subscription-backed chat completion returns OpenAI-compatible content and usage` | **16,741** |
| `subscription-backed streaming round trip reports content and usage` | **16,741** |
| `three requests complete concurrently without sharing sessions` | **3 real round trips, usage not printed** |

**Measured FLOOR: 33,482 prompt tokens — already 2× the desk figure — across 5 real subscription round trips
in one run.** If the three concurrent requests cost comparably, the full-file price is **~84k**, i.e. **~5×**
what the desk item states. **I am publishing the measured floor and the estimate separately rather than
asserting the total** (F-2182-1: publish the band, not a plausible story) — the concurrent arm does not print
its usage, so its cost is inferred, not measured.

➡️ **This does not change the recommendation, it strengthens it.** s2282 recommended option (a) at a price of
16.7k; the true recurring price is at least twice that and probably five times. **The owner's decision is
unchanged in direction and more urgent in magnitude.** Recorded on the desk item, not acted on — rooting this
suite is explicitly out of scope for this slice (the master says so) and is the owner's call.

ⓘ **Why the full file was run at all, stated so the spend is accountable:** this slice changes `serve.mjs`
itself — production code in a shared service — so its own suite is the proportionate gate, and the auth arms
are the only thing that exercises a real completion path against the `child.stdin` change. The desk question
is about paying this on **every** drain; paying it **once**, on the drain of a change to that very file, is a
different question. The manufactured-defect control was deliberately run auth-free.

## Merge classification

| File | Class | Resolution |
|---|---|---|
| `server/codex-shim/serve.mjs` | **LANE-TOUCHED** (+13 / −1) | Clean 3-way, no conflict — main has not moved this file since the lane branched |
| `server/codex-shim/serve.test.mjs` | **LANE-TOUCHED** (+51 / −0) | Clean, additive only |

No MAIN-MOVED files, no conflicts. `git merge --no-ff` reported a two-file `ort` merge with no manual
resolution.

## Not done, and deliberately

- **Rooting `test:codex-shim` in any battery** — out of scope by the master's own firewall; it is **F-2272-1**
  on the owner's desk, now better priced by F-2283-5 above.
- **No GZ-01 gazette item.** This is developer infrastructure. The heat-4 program it protects is real, but
  nothing here is player-visible, and the GZ-01 filter law is *"the review names a player-visible change."*
