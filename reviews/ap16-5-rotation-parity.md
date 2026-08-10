# Review — AP-16-5: BUILD gains `rotationSteps` parity on the standing-orders door

**Slice:** `ap16-5-rotation-parity` (authored s1643, drained s1645)
**Branch:** `lane/a` · **tip:** `e734260f0` · **base:** `f4a4a2f79` (main at dispatch)
**Merge:** `144b3291f8b2e1d4f82eb29575f1a49bf339f284` (main, 2026-08-11)
**Gated by:** s1645 fire, detached worktree `gate2-s1645` (§3.0b), `--workers=1` (§3.1)

## Verdict

**PASS — MERGED**, with the runner's added integration recommendation **overruled on evidence** and
its underlying observation **kept and promoted to a ladder rung (F-1645-2)**.

## The STOP was the master's own design, not a failure

The runner ended `STOP — rotation parity has another execution path outside the task firewall, so
this is not READY-FOR-GATES`, and recommended against integration. That headline needs unpacking,
because taken at face value it reads as a failed run, and it was very nearly the opposite.

s1643's master carried an explicit clause:

> 🔓 **FIREWALL LIFT:** if item 4's execution site turns out to live in a file not listed above,
> **STOP and report the file:line** rather than reaching into it. Naming the right site is worth more
> than a guessed edit.

The runner did **exactly that**. It implemented every permitted scope item, then found a *second*
build-execution path — `src/sim/SeatOrders.ts` — and named it with line numbers instead of reaching
in. This is the designed success path of that clause firing for the first time. Treating it as a
failed run would punish precisely the behaviour the master asked for, and would have discarded six
paths of green work.

**Verified at source before accepting any of it** (Mistake #4 — verify, don't inherit):
`src/sim/SeatOrders.ts` `SeatBuildOrder` omits `rotationSteps`; execution hardcodes `rotationSteps: 0`;
and `parseSeatOrder` gates on `exactKeys(value, BUILD_KEYS)`, so the field is *rejected*, not ignored.
The report is accurate in every particular.

## Why I overruled "do not integrate"

The runner's own extrapolation was that the audit's "new equality claim is unsafe until
`SeatOrders.ts` is fixed." That is the one claim worth taking seriously, and it does not survive
measurement. Three checks, each of which could have stopped the merge:

1. **Is the seat a lagging mirror of the same door, or a deliberately narrower surface?**
   Deliberately narrower — and it is *asserted* so. `scripts/agent-seat.test.mjs` contains a test
   named **"the seat carries BUILD and refuses to stretch for the rest"** (5/5 green on the merged
   tree). The seat accepts `BUILD` and rejects every other verb with
   `UNSPEAKABLE_ON_THE_WIRE`. It does not lag the standing-orders door on rotation specifically; it
   lags it on *every verb*, on purpose. Rotation is not a new asymmetry class.
2. **Does `public/skill.md` now promise something the seat cannot do?** No. The +8 lines land inside
   the guarded `skillmd-guard:grammar` fence, in a block that already lists `REPAIR_UNDER`, `MOVE_TO`
   and `HOLD` — verbs the seat rejects outright. That block is therefore demonstrably *not* the seat's
   contract, independently of this change. `e2e/skillmd-door.spec.ts` green.
3. **Does `scripts/same-game-audit.mjs` overclaim?** No. Its changed row reads
   `BUILD order reaches placement with rotationSteps 0..3`, its evidence column cites
   `src/agent/StandingOrders.ts`, and its summary bullet says *"human `place_build` tapes **and
   standing-order** `BUILD` both carry `rotationSteps` 0..3"*. Every claim is scoped to the
   standing-orders door and is true as written after this merge.

So the seat gap is real, and it is a **finding and a ladder rung — not a blocker**. Recorded as
F-1645-2 below. Merging the standing-orders half does not publish a false promise, does not corrupt
the audit, and does not break a tested contract.

## What it does

`StandingOrder`'s `BUILD` arm gains `rotationSteps?: 0 | 1 | 2 | 3`; execution forwards it
(`StandingOrders.ts:220`, `place_building(order.what, order.where, order.rotationSteps ?? 0)`).

Two design points are worth naming because both were hazards the master called out in advance:

**VALIDATE, not NORMALIZE.** `rotationSteps: 7` and `rotationSteps: 'north'` produce a `schemaError`
rather than being clamped. The master ruled for rejection *with its reason* and invited disagreement;
the runner implemented it and explicitly agreed. This matches the house law that the human path
normalizes while the agent grammar validates — and Mistake #14's reject-don't-stretch.

**The identity collision is closed, and the legacy string is byte-preserved.**
`standingOrderIdentity()` appends rotation only when **truthy**:

```js
...(order.rotationSteps ? ['rotationSteps', order.rotationSteps] : [])
```

That is the correct semantics, not a shortcut: an omitted field and an explicit `0` *are the same
order*, so they must collapse to the same identity — and they collapse onto today's exact string
(`["BUILD","palisade",0,10,"goldGte",0]`), so no existing order's identity moves. Facings 1..3 are
truthy and stay distinct, which is what stops two differently-faced BUILD orders at one spot from
deduping into a single order. The master flagged that collision as "a silent bug no 'does it rotate?'
test catches"; it is handled, and `e2e/ap16-5-rotation-parity.spec.ts` asserts the facing-zero
identity directly.

Audit movement: `agent-exceeds / agent-lacks / equal` went **0 / 466 / 614 → 0 / 439 / 641**,
not-offered unchanged at 15.

## Evidence

| gate | result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green |
| own spec `ap16-5-rotation-parity`, desktop + 390px | **4/4 passed**, 10.1 s |
| `test:node-guards`, **run ALONE** per F-1460-1 | **446 tests · 441 pass · 0 fail · 5 skip**, 408 s |
| — `gr-sim` hash drift (the load-bearing number, scope 8) | **ZERO** — no pin moved |
| — `scripts/agent-seat.test.mjs` (the decisive adjacent) | **5/5 pass** |
| adjacent `ap-standing-orders` + `skillmd-door` + `ap16-4-contract-admission` + `front-door-parity`, both projects | **19 passed / 3 skipped / 0 failed**, 1.4 m |
| plain boot probe, desktop + 390px | **2/2 passed**, zero console/page errors |
| firewall compliance | **all 6 merged paths inside TOUCH-ONLY**; nothing outside — the runner's "no out-of-firewall edits" claim verified by diff |

ⓘ **Skip-count difference from the runner, stated rather than smoothed over:** the runner reported
446 tests / 444 pass / 2 skip; I measured 446 / 441 / 5. Same total, same **0 fail**. The three extra
skips are fire-shell environment gates (the fire shell and the lane shell are not the same
instrument), not new reds — read the counts, not the rc.

📌 **A stale note in the master, now retired:** its adjacent list warned that
`e2e/front-door-parity.spec.ts` is a KNOWN RED (0/4) and must not be counted against the runner. That
was true when s1643 wrote it and is false now — **drain 1 of this same fire merged its repair
(`dce549be`)**. I ran it here anyway as a free cross-check, and it is **green on the ap16-5 tree**, so
the two drains coexist. A review's adjacent-suite list is perishable; this one perished within the
hour.

## Merge classification

**6 paths, ALL LANE-ONLY** (`docs/bench/same-game-audit.md`, `e2e/ap16-5-rotation-parity.spec.ts`,
`public/skill.md`, `scripts/same-game-audit.mjs`, `scripts/skillmd-guard.test.mjs`,
`src/agent/StandingOrders.ts`). `lane-usable.mjs` reported `HOLDS` on all six with per-file
absent-line counts — real unmerged content, correctly refused for auto-reset. Main moved 9 disjoint
paths since base; **intersection EMPTY**, so no graft and no conflict resolution. `git merge --no-ff`
clean; `main..lane/a` now empty. Merged and committed as ONE act (F-1589-5).

## Findings

**F-1645-2 (REAL, NON-BLOCKING, ladder — not the owner's desk).** `src/sim/SeatOrders.ts`, the
multiplayer seat's build path (`specs/multiplayer/mp-07-one-engine-at-the-table.md`, consumed by
`SeatedLockstepSim.ts`), cannot express rotation: `SeatBuildOrder` omits `rotationSteps`,
`parseSeatOrder`'s `exactKeys(value, BUILD_KEYS)` **rejects** the field as a schema error, and
`buildActions()` hardcodes `rotationSteps: 0`. So an agent that learns `rotationSteps` from
`public/skill.md` and sends it through the *seat* gets its whole order refused as malformed.

⚖️ **Why this is a rung and not a blocker, stated so a later fire does not re-litigate it:** the seat
is deliberately narrow and *tested* to be so ("the seat carries BUILD and refuses to stretch for the
rest"), so it already refuses `MOVE_TO`, `HOLD`, `REPAIR_UNDER`, `BLAST_AT` and the rest. Rotation
joins an existing, intentional gap rather than opening a new one, and nothing published or audited
claims otherwise (see the three scoped checks above). **The genuinely sharp edge is the failure
MODE**, and it is worth fixing for that reason alone: because the parser uses `exactKeys`, an unknown
field does not degrade gracefully to "rotation ignored" — it rejects the **entire order**. An agent
following the published grammar therefore gets a hard `INVALID_ARGS` refusal from one of the two
doors, which is a worse experience than silently defaulting to facing 0.

**OWED:** a fire-authorable rung (AP-16-5b) extending rotation to the seat path — `SeatBuildOrder`,
`BUILD_KEYS`, `parseSeatOrder` validation (same VALIDATE-not-NORMALIZE ruling as here) and the
`buildActions` execution site, with `scripts/agent-seat.test.mjs` extended to cover accept-0..3 /
reject-7 / reject-'north' / omission-defaults-0. Its spec slice is
`specs/agent-play/ap-16-same-game-law.md` and its evidence chain is this review.

**No blocking findings.** Nothing was written to `tasks/queue/` from this drain.

## Duties

- **GZ-01: OWED and filed.** This is a player-visible change in the sense the filter means — the
  published agent grammar in `public/skill.md` gains four new order forms per condition, and any
  agent reading the door can now orient its buildings.
- **Deploy: RUNS** — gameplay-affecting code merged (`src/agent/StandingOrders.ts`).
