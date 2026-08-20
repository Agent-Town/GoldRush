# b4-picnic-three-stake-hold — the hold consumer works; the MAP cannot lose

**Slice:** `b4-picnic-three-stake-hold` · **branch:** `lane/b` · **tip:** `7a320da261acb0749df7fde5fd4d30f9a07cf624`
**Base:** lane/b's own base · **Evaluated in:** detached worktree `gate-s2085` (§3.0b), merge **aborted**, worktree removed
**Merged to main:** **NO — see verdict**

## VERDICT: HOLD — NOT MERGED. Law-2 STOP by the runner, upheld. Needs an owner design ruling.

The implementer stopped itself under the master's own honesty guard and said so plainly:

> STOPPED per Law 2: idle `e6-picnic-01` falsely secured at wave 20, hash `fnv1a32:04391e7c`;
> enemies never approached center/east stakes and exhausted into the pool.
> The hold consumer remains as tested WIP; admission anchors/baseline were reverted, so Picnic
> stays refused. TypeScript and focused desktop tests pass 6/6.
> **Not `READY-FOR-GATES`; enemy-to-stake routing needs an explicit design ruling.**

That verdict is correct and this drain upholds it. **The runner did the right thing** — it hit a
design fork, refused to invent routing to make its own acceptance test pass (Mistake #14,
reject-don't-stretch), reverted the admission half so the Picnic stays honestly refused, and
reported the measured gap instead of buffing past it.

## ⚠️ How this slice was nearly merged, and the reusable half

s2084's handoff named this drain priority **(A)**, "ALREADY FULLY TRIAGED FOR YOU", and every
probe it cited was **true and green**:

| Probe s2084 cited | Value | Honest? |
|---|---|---|
| `drain-block-check b4-…` | ✅ CLEAR | yes |
| `main..lane/b` | `ahead=1` | yes |
| goal leaf | `status:"planned"` | yes |
| merge classification | 6 paths, LANE-ONLY + BOTH-MOVED | yes |

**Not one of them can see a Law-2 STOP.** Every one asks *is this READY* — a property of the tree
— while the STOP is a property of the **runner's verdict**, which lives only in
`tasks/runs/*.log`. The done-move is unprefixed and the leaf says `planned`; both are exactly
what a *stopped* run leaves behind, and both are also what *ready* work leaves behind. The board
could not distinguish them.

➡️ **Therefore: READ THE RUN LOG'S TAIL BEFORE GATING ANYTHING.** It costs one `tail -c 6000` and
it is the only surface that carries the implementer's own verdict. This is §3.0's shape widened
one step: `drain-block-check` answers *am I ALLOWED to drain* and the git probes answer *is it
MERGEABLE*, but **nothing in the prescribed battery asks whether the implementer thinks it is
DONE.** A green gate battery on this branch would have been entirely real — tsc clean, build
green, 6/6 focused specs — and would have shipped a hold objective that cannot be lost.

## What it does (and what it does not)

`src/systems/PicnicHoldSystem.ts` (new, 74 lines) implements the ratified design: three stake
states from the contract's `stakeMarkers`, a 6 s uncontested-enemy claim timer inside radius 3,
hero/turret/beacon presence contests, all-three-claimed → `postHeroDeath()`. It is
picnic-gated by contract id (`this.contractId === 'e6-picnic'`), so it is **inert for every
other contract** — the WIP on the branch is not a hazard where it sits.

Constructed and ticked in both engines (`HeadlessContractSim`, `Game.ts`), surfaced in
diagnostics, with a `MechanicsManifest` rule derived from the consumer. Scope items 1–3 and the
*prover half* of 4 are built. **Scope 5 (admission completion) is deliberately absent.**

## Evidence

| Gate | Result | Source |
|---|---|---|
| Prover secures seed `e6-picnic-01` | wave 12, `fnv1a32:e66807f6` | run log |
| Prover secures seed `e6-picnic-02` | wave 10, `fnv1a32:da62f7b9` | run log |
| **Idle `e6-picnic-01` — must LOSE** | ❌ **SECURED wave 20, `fnv1a32:04391e7c`** | run log |
| Focused consumer + E6 census | 12/12 desktop + mobile | run log |
| tsc + focused desktop | pass 6/6 | run log |
| Admission surfaces reverted | confirmed **by the tree**, not the message | this drain |

**Independent corroboration of the "reverted" claim.** The report's own words are not evidence
about the tree, so I measured it: merging `lane/b` into main in the gate worktree yields exactly
**6 files, +170/−2** — `PicnicHoldSystem.ts`, `e6-picnic-hold.spec.ts`, `MechanicsManifest.ts`,
`Game.ts`, `HeadlessContractSim.ts`, `er01-e6-census.spec.ts`. **No** `contracts.json`, **no**
`null-floors.json`, **no** `same-game-audit.md`, **no** `door-admission-baseline.json`, **no**
`public/skill.md`. The admission half is genuinely absent, exactly as claimed.

## Merge classification (measured, then discarded)

Base main `afbf421cb`. Four conflicts, all one benign shape — **both sides added an independent
sibling member at a shared insertion point**: main's E7 signal-suppression consumer (via
`e7-dead-band`) vs the lane's picnic-hold consumer.

| File | Hunks | Shape |
|---|---|---|
| `src/agent/MechanicsManifest.ts` | 1 | import line, both needed |
| `src/sim/HeadlessContractSim.ts` | 3 | field decl · construction · diagnostics key |
| `src/game/Game.ts` | 0 | auto-merged clean |

All four resolve keep-both, main-side first; ledger files (`goals.json`, `BACKLOG.md`)
auto-merged to main's newer rows correctly. **The merge is mechanically easy — that is not the
problem, and the ease is precisely what makes this branch dangerous to the next reader.**

## Findings

**F-2085-1 — the Picnic cannot lose, because its enemies never leave the hero.** OPEN, owner
design fork. All three sandwich stakes are `heroStart:true`; the hero spawns at the first marker
(sandwich-west) and existing engine behaviour targets enemies at the *hero*. So enemies never
enter the center/east discs, the hero's own body permanently contests west, no stake can ever be
claimed, and the contract's default secure law false-greens an idle run at wave 20. **The hold
objective is unreachable by construction, not by a tuning error.** Fixing it means ruling how
Picnic enemies are assigned to defend points — routing design, owner territory. No fire may
author it (§2E hard limit: design fork). **REC:** rule enemy-to-stake assignment for
`heroStart:true` multi-stake maps; the sheet's B4 design assumed enemies would seek stakes and
the engine has never done that.

**F-2085-2 — the idle terminal is entangled with the pool question already on the desk.** OPEN,
observational. The run log's mechanism is *"eventually exhaust until the 96-body pool fills"* —
the same exhausted-machine/pool-recycle behaviour carried as **F-CAP-2** ("does the pool layer
recycle too?"). Picnic's false-green is downstream of it: exhausted bodies stop being a threat
but still occupy the cap, so the map runs out of pressure rather than losing. **These should be
ruled together.** b3-half-life-hollow-crossing's master already anticipates this exact disease
and instructs its runner to measure it early — so the ruling gates three maps, not one.

**F-2085-3 — a phantom done-move for work that has never run.** OPEN, board hygiene, **not this
slice's fault**. `tasks/done/20260820-150023-b3-half-life-hollow-crossing.md` is **byte-identical**
to the still-planned master `tasks/b3-half-life-hollow-crossing.md` (verified `diff -q`, no
output). b3 was authored 14:59 and this "done-move" is stamped 15:00:23 — 90 seconds later, and
b3 has never been dispatched (lane-d queue empty, no `tasks/running/` entry, leaf `planned`).
A next fire doing §2B triage would read it as runner output and gate a slice with **zero diff** —
an armed Silent No-Op (Mistake #1). Left in place rather than moved: it belongs to the live
attended session's in-flight thread. **Defused by naming it here and in the handoff.**

## Disposition

- **`lane/b` keeps the WIP** — it holds unmerged content, so **it must NOT be refilled or reset**
  (LANE-SAFETY: `reset --hard` in a pre-flight would destroy it, the w1-03 shape).
- b4's goal leaf → `blocked` / `blockClass: "owner-fork"`, so `drain-block-check` now **stops**
  the next fire where it waved this one through.
- Done-move renamed with a `stopped-s2085-` prefix — a hint, not the claim; the ledger is the claim.
