# c7-standing-order-replay-rescoped — the browser replays a standing order

**Slice**: `c7-standing-order-replay-rescoped` · **branch**: `lane/b` · **lane tip**: runner commit on `lane/b`
**merge**: `2de0ab94dc3f54c60dcbb7922a32f6ab20dea8c8` (main) · **Drained by**: s2238 (fire)
**Gated**: detached worktree `gate2-s2238` off `f10ae7b76` (§3.0b)

## VERDICT: MERGE

## What it does

The c2 STOP measured the defect exactly (`bbb9ff57c`): `installAgentDoor` never called
`bindStandingUpgradePicker`, so an accepted `PICK_UPGRADE` order reached a null handler. This slice closes
that and the two clocks around it — three seams, `src/game/Game.ts` +30/-6 plus a new 150-line spec:

1. **The binding** — `bindStandingUpgradePicker` now wired at `Game.ts:2499`, applying the upgrade and
   clearing `upgradeOfferClockKey` so the overlay resyncs.
2. **The deadline clock** — `offerTick = multiplayerState?.tick ?? replayTick` (`:9217`). MP keeps its
   authoritative wall-paced ticks; agent-tape replay now uses `simTick` with `PLAYBOOK_STEP_SECONDS`;
   **ordinary solo is untouched and still falls to the wall clock**, because `offerTick` is `null` there.
   Traced all three branches by hand — the `??` correctly passes a literal tick 0 through rather than
   falling through, and the changed `?? PLAYBOOK_STEP_SECONDS` default only affects a `deadlineTick` that
   the solo path never reads.
3. **The frozen-draft executor** — during the `levelup` freeze the prospector still ticks when a
   pending/active `PICK_UPGRADE` order exists, so a standing order can execute inside the pause.

## Evidence (merged tree, fire shell, `--workers=1` per §3.1)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, 1.04s |
| `e2e/c7-standing-order-replay.spec.ts` | **2 passed** — desktop + 390px mobile (1.2m) |
| Boot probe `_s2080-f1742-1` | **6 passed** desktop + 390px, zero console/page errors (17.0s) |
| `e2e/ap16-upgrade-door.spec.ts` + `e2e/ui-upgrade-icons.spec.ts` | green |
| `e2e/ap-standing-orders.spec.ts` | **RED — attributed to load, not to this slice; see below** |

**Two slices in one file, verified rather than assumed.** c6 merged into `Game.ts` minutes earlier this same
fire. The ort auto-merge was clean, and both slices' hunks were confirmed present in the merged tree before
gating: c6's `meta: { buildId: __APP_BUILD__ }` at `:7131`, c7's binding at `:2499` and `offerTick` at `:9217`.

**The runner's own three-minus-one mutation evidence** (not re-derived here, cited): removing replay-tick
expiry moves the roundtrip hash to `fnv1a32:a45ba9ac`; removing the frozen-draft executor leaves
`runState:"levelup"`; the c2 STOP already measured the binding absent with the other two seams present. Each
seam is load-bearing and was shown so by breaking it.

## F-2238-3 — `ap-standing-orders.spec.ts` is red under whole-file load in the fire shell, on BOTH arms. NON-BLOCKING, attributed by control.

This is the slice's most adjacent suite, so the red got a same-root reverted-content control rather than a
judgement. **Four runs, one root, one command shape:**

| Arm | Result |
|---|---|
| c7 present, combined with 2 other specs | 2 failed — `:123` desktop, `:270` mobile |
| c7 present, file alone | 3 failed — `:123` + `:298` desktop, `:342` mobile |
| **CONTROL — c7's `Game.ts` reverted to main, file alone** | **1 failed — `:251` desktop** |
| `:123` desktop alone, control vs c7 present | **passed both** — 6.7s / 6.1s |

The control carries **zero c7 code and still fails**, and the failing set is different in every run — including
a test (`:251`) that passed in both c7 arms. The one test that failed twice under c7 (`:123`) passes in
isolation on both arms in ~6s. That is a load signature, not a line.

**Machine state at gate time: load average 6.49** (`uptime`), with the lane runner live (pid 14785) and the
owner's own apps resident — 8 users. This is F-1270-1's mechanism surviving past its cure: `--workers=1` fixes
the fire shell's *self-inflicted* concurrency, but it cannot buy back CPU another process is holding. The
runner independently hit the same class on a different pair (`m2-01:111`, `run-suspend:282`), both green on
isolated rerun — consistent, and worth noting that three separate agents have now seen this suite flake.

⚠️ **Deliberately NOT re-pinned, quarantined, or "fixed".** Per the standing prohibition a red is a finding,
never a re-pin reflex, and the honest statement is that this suite needs a load-independent form or a
documented ceiling — not a silenced assertion. Recorded for whoever takes it.

## Owed / not done, stated plainly

**`scripts/gr-sim.test.mjs` was NOT re-run for this slice.** It is not mandated by §3's path rule (`Game.ts`
is `src/game/`, not `src/sim|systems|entities`), and it was green twice on this code — the runner's own run on
the lane (**18 pass / 0 fail / 2 skipped**) and mine on the c6 tree earlier this fire (18/0/2, 312.5s). I chose
not to take a third ~5-minute run because this fire was inside the wall-clock window that SIGKILLed s2237 at
~39 minutes, and being killed mid-drain would have stranded a lock. **The drain's own re-run is normally the
free control on the runner's headline; here it was skipped on purpose, and the next fire may want it** —
`Game.ts`'s levelup path is exercised by agent-tape runs, so it is the one adjacent suite this drain did not
independently confirm.

**Inherited, not introduced**: `null-floor-anchors --check` reports only the pre-existing era-stamp drift
(`pinned 016ede509` vs `derived 5de9984d7`); no floor row or headless outcome moved. The c6 runner reported
the identical drift, and the c7 firewall forbade touching that pin.
