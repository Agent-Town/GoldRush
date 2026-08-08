# mp-07c-1 — the embodied order channel (`agent_orders` ride the wire into the browser's world)

**Slice:** MP-07c-1, first rung of `specs/multiplayer/mp-07c-agent-rides-the-browsers-world.md`
**Branch:** `lane/b` · **lane tip:** `1d5a95594` · **merge base:** `9089bb61d254128f49fd87d27c736c22b7d6c066`
**Merged to main:** `ddd3d55efa7e493f8e841fc51ba0d993258ea26b` (2026-08-08T10:46+07)
**Drained by:** s1550 fire · **block-check:** `✅ CLEAR — lane-mp07c1-order-channel.md [mp-07c-1-order-channel] status="planned"`

## VERDICT: MERGED — all gates green; three node-guard reds fingerprint-matched to main by control, pre-existing and unrelated.

## What it does

MP-07c makes the browser the engine of record in mixed rooms. This first rung builds the **order channel**: a lockstep act `{ type: 'agent_orders', version: 1, orders, submissionId }` that carries a standing-orders array over the existing input wire, applied identically by every browser to an embodied agent hero.

Browser-side, a `client: 'headless'` rider in the roster (mp-07a's field) gets an `AgentRiderBody` — one `StandingOrdersExecutor` fed only by that rider's `agent_orders` acts, resolving through the same tool surface a local agent uses, with replace-semantics per submission exactly like the door. The agent hero is an ordinary roster `Hero` constructed at `Game.syncMultiplayerActors()`, so it is covered by the multiplayer state hash through `mpActors` on the same path as any other actor; the rider's outstanding orders + submissionId are additionally carried in the run-suspend future state for reconnect restoration.

Execution is confined to the deterministic tick path — no wall-clock, no randomness, no per-client branching. Solo and browser-only rooms take today's code path unchanged behind an explicit guard clause (`if (this.agentRiderBodies.size === 0 || !this.mpActorIntents) return`).

The unhonourable class (restart / death_action / secure_choice / set_pause) cannot enter `agent_orders` by construction: the act validates through `validateStandingOrders`, whose vocabulary is the standing-order verbs only.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0** (4.3 s) |
| `npm run build` | **green**, ✓ built in 1.16 s (15.5 s wall) |
| `node scripts/agent-seat.test.mjs` | **5 / 5 pass, 0 fail** (2.8 s) — incl. new row `agent_orders validates the standing-order grammar and wire bounds` |
| `node scripts/agent-seat-room.mjs` | **86 / 86 checks passed** (124.7 s) |
| agent-rider arm | **302 ticks** post-submission · **0 desyncs in both browsers** · 1 palisade placed per browser · both browsers agree at hash tick **570** |
| e2e adjacent, both projects, `--workers=1` | **33 passed / 1 skipped / 0 failed** (159.6 s) — `agent-seat`, `task-025-bandits-dont-swim`, `m1-01-claim-jumpers-death`, `m2-01-build-menu` |
| boot probe | `consoleErrors: []`, `pageErrors: []`, `desyncs: 0`, `exitCode: 0`, 150 ticks |
| screenshots | `reviews/shots-mp-07c-1/seat-desktop.png` (1280×800), `seat-390px.png` (390×844) |
| `npm run test:node-guards` | **383 tests / 377 pass / 3 fail / 3 skipped** (224 s) — the 3 reds are **pre-existing**, see F-1550-1 |

Gated in a detached worktree (`worktrees/gate-s1550`, §3.0b) on the merged tree, never in main's working tree.

### The harness numbers are mine, not the runner's

The runner reported 86 checks / 302 ticks / 0 desyncs — **all three reproduced exactly**. Its cited shared hash `fnv1a32:784b390b` did **not** reproduce; my run agreed internally at `fnv1a32:996f19a3`. This is not a discrepancy: the room code is per-run (`96-bit claim word`), so the hash is run-specific and the harness asserts *cross-browser agreement*, never a pinned value. **Worth naming because a cited hash reads like a pin and is not one** — the same shape as F-1547-1's overwritten artifact citation.

### The runner's lone red did not reproduce

The runner reported `31/32 initially, with the lone timed-out desktop 390px case passing immediately in isolation`. Under `--workers=1` it did not appear at all: 0 failures across 34 collected. That is §3.1 (F-1270-1) behaving exactly as documented — a fire-shell red manufactured by worker contention, not by the slice.

## Merge classification

Merge base `9089bb61d`. `git diff 9089bb61d main` over all five lane paths is **empty** — main moved **none** of them.

| File | Class | Δ |
|---|---|---|
| `src/mp/AgentRiderBody.ts` | LANE-TOUCHED (new file) | +64 |
| `src/mp/LockstepClient.ts` | LANE-TOUCHED | +40 / −1 |
| `src/game/Game.ts` | LANE-TOUCHED | +223 / −53 |
| `scripts/agent-seat-room.mjs` | LANE-TOUCHED | +129 |
| `scripts/agent-seat.test.mjs` | LANE-TOUCHED | +16 |

**Zero MAIN-MOVED, zero conflicts** — clean `ort` merge, no graft needed. Firewall held: exactly the permitted files, `public/skill.md` correctly left to 07c-2, the relay (`functions/api/**`) untouched, `HeadlessContractSim.ts` untouched.

## Findings

### F-1550-1 — `npm test` COLLECTS ZERO TESTS AGAIN: F-1094-1 HAS REGRESSED ON MAIN (pre-existing, not this slice)

`npm run test:node-guards` is **rc=1** on the merged tree with 3 failures, all cascading from one root:

```
TypeError: Module ".../assets/layer-contracts/m1-core.layer-contract.v1.json?raw"
           needs an import attribute of "type: json"
```

failing `whole suite collects without loading Vite-only modules`, and through it `whole-suite collection guard is cwd-invariant` and `all 23 scripts/*.test.mjs fixture owners remove their temp directories` (both run it as a child).

**CONTROL RUN, and it is what makes this attributable:** the same single test file on **main at `bc9629bfb`, with this slice absent**, fails identically — same module, same TypeError, same assertion. And `npx playwright test --list` reads **`Total: 0 tests in 0 files`** on **both** main and the merged tree. The slice neither caused nor worsened it.

This is the F-1094-1 family recurring. The construct is unchanged — the `?raw` JSON import at `src/world/Terrain.ts:2` that Node cannot parse during Playwright's Node-side collection. rf-33 (`e3db39ae`, s1095) cured it by cutting the one edge that dragged `Terrain` into a spec's static import graph, taking the suite `0 → 2378 tests`. **Some later commit has re-introduced such an edge**, and `package.json`'s `"test": "playwright test"` is once again dead — which, exactly as in 2026-07-18, goes unnoticed because *every gate in this repo runs NAMED specs*.

⚠️ **Not fixed here, deliberately.** Finding the new edge is a bisection over the spec corpus (s1094 did it in 8 chunks), and it is outside this slice's firewall by a wide margin. **NOT owner-gated — fire-authorable**, and the method is already written down and proven twice: point the instrument at the unfiltered suite, bisect to the specs that fail individually, walk the `spec → … → Terrain` chain, and cut the single value-import edge (never the glob, never `e2e/`).

⚠️ **Do NOT read the 3 reds as an excused class.** They are attributed by a control run taken this fire, not by a label — that distinction is what F-1460-1 was about. They must go red until the edge is cut.

### F-1550-2 — s1549's board read reported `tasks/done/` as markers-only while this done-move was already sitting in it (bookkeeping, no code impact)

`tasks/done/20260808-093804-lane-mp07c1-order-channel.md` has mtime **09:37**. s1549 locked at **10:14** and its handoff states *"`tasks/done/` holds only `drained-*`/`stopped-*` markers"* and *"**NO DRAIN EXISTED** — arithmetic, not contention."* The arithmetic was wrong by one, and the cost was one fire cycle of latency on a merge-ready slice.

The likely mechanism is benign and worth naming so the next fire avoids it: s1549 correctly observed **lane-b BUSY** and, having formed that belief, read the done-move list through it. `lane-b BUSY` and `lane-b has finished output waiting` are not mutually exclusive — the runner had committed `1d5a95594` and moved the task file at 09:37/09:38, and a *subsequent* dispatch (or a lingering child) can hold the slot afterwards. **A lane's BUSY flag says nothing about whether its previous output is drained.** The check that settles it costs one command and does not consult liveness at all: list `tasks/done/` and filter out `drained-*`/`stopped-*`.

No corrective task — this is a reading discipline, and it is recorded here plus in the handoff.

## Where does the PLAYER see this, in a plain boot? (Mistake #10)

**They do not, yet — and that is correct for this rung.** The order channel is driven by a wire act that only a headless rider sends; there is no UI surface and `public/skill.md` was deliberately left untouched because no door rider can use it until 07c-2. The player-visible consequence — an agent hero that acts in *their* world — is proven only in the harness (two browsers, one agent hero, a palisade landing identically in both). The plain-boot solo path is byte-identical behind the guard clause, and the harness asserts that with a solo control run.

The correct GZ-01 treatment is therefore **no gazette item** for this merge: it is infrastructure whose player-facing half arrives with 07c-2.

## Slice-2 handoff (from scope 5, verbatim from the runner and verified against the diff)

Join creates the body from authoritative roster membership; roster removal deletes it. **The 60-second reconnect grace intentionally retains the seat and body** — a timed-leave arm is deferred to MP-07c-2. The harness injects through a **real third headless `LockstepClient`** rather than a synthetic roster entry, because the relay owns roster truth; that is the honest path the architecture allows and it required no relay change.
