# gauntlet-heat7-guests-party — the whole field rides era 4

**Slice:** `gauntlet-heat7-guests-party` · **branch:** `lane/b` · **lane tip:** `0bd2267c0`
**Gated merge:** `9e07a5df0` (parents `6d530c593` main, `0bd2267c0` lane) · **drained:** s2384, 2026-08-31
**Verdict: MERGED.** Evidence-only slice. Zero run-surface paths changed; the one non-artifact
file (`tasks/BACKLOG.md`) is the row flip the master ordered.

## What it does

The owner called a party (2026-08-30, verbatim: *"Ride some more harnesses - let there be a
party. Verify that the tapes now really work properly."*). Five harness families rode the live
era-4 engine — **pi (Prime Agent) · omp · hermes · openclaw**, with **eliza** on its bounded
retry — over the short set (the-claim, night-shift, hill-mine) plus one war-room Baron visit
each, via the streaming shim, against live build `81caa6956`.

**OMP and OpenClaw each secured The Claim.** Their tapes plus the operator probe verified
against their original event-log hashes — three verified rows on the honest engine. **No guest
reached the wave-20 Baron encounter, so the era-4 crown remains OPEN.** Eliza repeated its
install/runtime DNF.

The party's second duty — the owner's *"verify that the tapes now really work properly"* — is
where the finding is.

## Evidence

| Gate | Result |
|---|---|
| Run-surface paths changed vs main | **0** (of 574 changed paths) — measured, see below |
| Non-artifact paths changed | **1** — `tasks/BACKLOG.md` |
| `npm run test:ledger-guards` on the merged tree | **rc=0** · 83 bash legs, node suites green |
| Secret scan over the diff | **0 hits** across 81,612 added lines |
| BACKLOG conflict resolution | union-minus-retirement; **0 main rows lost** (line count 4909 → 4909) |
| Lane absorbed after merge | `main..lane/b` **empty**; `lane-usable` flipped `HOLDS` → **USABLE** |

**Why no tsc/build/spec row, stated rather than skipped:** the merged tree's run surface is
**byte-identical to main's** — 0 changed paths under `src/ e2e/ scripts/ functions/ public/
assets/ server/ ops/ foundry/` or any config/gate root derived from `main:package.json`.
Running tsc, build or any spec here would measure *main*, not this slice, and reporting the
result as this slice's gate would be a circular evidence row (the thing that "states nothing").
The differential IS the gate for an evidence-only merge, and `test:ledger-guards` is aimed at
the one file that actually moved.

## Merge classification

- **Base:** lane branched 50 commits behind main. Merged three-way, never a two-dot copy.
- **`artifacts/gauntlet-heat7-guests-20260830/**` (573 files):** LANE-ONLY, merged clean, no
  conflicts — main has never touched this tree.
- **`tasks/BACKLOG.md`:** BOTH-MOVED → conflict. Main added 25 rows and, at its
  `RETIRED s2380` row, **lawfully retired** the `📄 EH-3b reel-era-projection QUEUED` row that
  the lane still carried as context. Resolved by replacing main's stale
  `🎉 THE PARTY IS CALLED … QUEUED` row **in place** with the lane's
  `✅ THE ERA-4 GUEST PARTY RODE … COMPLETE` row, and **dropping** the lane's EH-3b row.
  A blind union would have resurrected a retirement; verified afterwards that every other main
  row survives verbatim (0 lost).

## Findings

### F-2384-1 — the deployed WATCH reel omits its era papers. CONFIRMED, ALREADY CURED ON MAIN, PENDING DEPLOY. Non-blocking.

The runner's tape-proof duty found, **reproduced 3/3 on every verified row**, that the public
WATCH response projected:

```
.reel.meta = {"buildId":"81caa6956"}
```

omitting both `meta.era` and `meta.engineHash` — *although the submitted tape carried all
three.* Quoted slips: operator probe `agent-0b91cbb4-…` (`assayHash:"fnv1a32:8886f412"`), OMP
Claim `agent-90ebe418-…` (`fnv1a32:775ec7ed"`), OpenClaw Claim `agent-1caf920e-…`
(`fnv1a32:8b91245f"`).

**This is not an open engineering defect, and the drain checked rather than inherited the
runner's framing.** Main already carries the cure at `functions/api/standings.ts:385–386`,
which projects `{ buildId, engineHash, era }`. The timestamps settle it:

| | commit | when |
|---|---|---|
| build under test (deployed) | `81caa6956` | 2026-08-30 **20:47:13** +07 |
| the projection cure | `05d04af50` (`reel-era-projection-v2`) | 2026-08-30 **22:42:40** +07 |

The cure landed **1h55m after** the build the field rode. So the party measured production
truthfully and the remaining act is a **DEPLOY**, which is publish-gated and belongs to the
attended session (F-2371-6). What the heat actually bought is a **live before-measurement**:
independent, three-way-reproduced confirmation from outside the codebase that the EH-3b defect
was real in production and that the cure targets the right field set.

### F-2384-2 — embodiment legibility split the field. Non-blocking, owner-interesting.

OMP and OpenClaw explicitly recognised that builds now travel (OMP: close sites, Spring Heels,
distant-seam travel tax; OpenClaw: remote harvest changed the central fort plan). **Prime Agent
and Hermes did not** — they declined to say walking changed the plan even when high call counts
were measuring the rider-boundary tax against them. OpenClaw's Hill Mine produced the clearest
walking evidence: proximity did not imply a legal build pad, and `(-5,12)` was the one proven
reachable west pocket.

### F-2384-3 — concurrency ceiling at >3 completion calls. Non-blocking, operational.

More than three concurrent completion calls produced real HTTP 429 capacity failures; OpenClaw's
Night Shift exhausted all three attempts on 429 under five-call party load. Returning to ≤3
active calls removed new retries. Recorded so the next multi-rider heat sizes its field's
concurrency rather than rediscovering the ceiling.

### F-2384-4 — the heat-local driver's late `close` listener. Cured in-run, no tape affected.

The driver registered a child `close` listener too late, so a completed secure could leave it
waiting after the tape was already finalized. Registering the exit promise at spawn fixed the
operator harness. **No rider tape changed.** Noted because it is the kind of harness bug that
looks like a rider stall.

## Closeout, verified from the runner's own record

- Era gate, shim SSE/EPIPE proof and early probe: `preflight.md`, `shim/`, `probe/`.
- OpenClaw global approvals snapshot restored byte-for-byte — backup and live SHA-256 both
  `f16d885841a3a5f3326a99495f198aa535512cca7c36f24b6ac936a736e97c94`.
- Shim health check returned both `gpt-5.6-luna` and `gpt-5.6-sol`, then stopped cleanly; port
  8899 refused connection as expected.
- Runner's final `npm run build`: green (tsc, Vite, asset diet).
- Commons commits local-only, never pushed (16, listed in the note).

Full matrix, per-rider attempts, slips and closeout:
`artifacts/gauntlet-heat7-guests-20260830/heat7-guests-note.md`.
