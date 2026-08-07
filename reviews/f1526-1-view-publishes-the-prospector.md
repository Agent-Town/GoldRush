# f1526-1 — THE VIEW publishes the Prospector

**Slice:** `f1526-1-view-publishes-the-prospector` (F-ER02-11 P0, with F-ER02-10 as its premise)
**Branch / tip:** `lane/b` @ `f7038e187a7939b2b676e011b3bf26868e7cacd9`
**Base:** `2a3bfe3983179ab9a37ba6c29a472f96b5cb2e72`
**Merged to main:** `fa9fbda1d57e3ed2e39da6e4e0c505cb8bc71c7b`
**Gated by:** s1528 fire, 2026-08-07, in detached worktree `gate-s1528` (§3.0b custody — the undecided content never entered main's working tree until the verdict was PASS)
**Node:** 26.4.0 (the `.nvmrc` pin) for every gate arm below.

## Verdict

**PASS — MERGED.** Three findings filed, none blocking (F-1528-1, F-1528-2, F-1528-3).

## What it does

`src/agent/View.ts` grows one field on `AgentView['now']`: `prospector: { x: number; z: number } | null`.
It is filled in `buildNow()` from the embodiment snapshot **both doors already publish** — the browser
(`src/game/Game.ts`) and the headless contract sim (`src/sim/HeadlessContractSim.ts`) each hand
`agent.embodiment` to the same view builder — so one cure serves both and no adapter changed. The
coordinates use THE VIEW's own `round()` (2 dp, `View.ts:594`), the same precision `hero` already
publishes, so the two bodies are directly comparable. A missing or non-finite coordinate publishes
`null` rather than throwing, because `View.ts` serves more than one adapter and a crash in the view
builder would take down every consumer.

Why it matters: `BuildSystem` is constructed in the headless sim with `this.prospector.position` as
its placement origin and gates placement on `distanceSq <= placeRadius²` against **that** origin
(F-ER02-10). Before this merge, a rider was told to place works within a radius of a point THE VIEW
never gave it. The data existed, was computed every tick, and was thrown away.

## Evidence (re-derived on the merged tree, not read off the runner's report)

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | **0 errors** |
| `npm run build` | **green, 1.08 s**, asset-diet ran clean |
| `e2e/agent-view.spec.ts`, both projects, `--workers=1` | **10 passed** = **5 desktop + 5 mobile** (the derived 4 existing + 1 new, per project) |
| Adjacent `agent-seat` + `m4-10-agent-actions-integrity` + `er01-e2-census`, both projects, `--workers=1` | **13 passed / 1 skipped** (the skip is `agent-seat` mobile, intentional and pre-existing) |
| `npm run test:node-guards` | **rc=0 · 354 tests · 351 pass · 0 fail · 3 skipped** |
| Pinned E2 Baron test (`scripts/gr-sim.test.mjs`) | ✔ *"the E2 Baron fights keep their pinned outcomes"* — **UNMOVED, not re-pinned** (F-1441-3) |
| Plain-boot probe, **no `?debug`**, desktop 1280×800 + mobile 390×844 | **0 console errors, 0 page errors** on both. Screenshots: `reviews/shots-f1526-1/boot-desktop.png`, `boot-mobile-390.png`. Driver archived at `logs/runs-archive/s1528-gate-driver-boot-probe.mjs` (RETENTION LAW). Ran on scratch port **5234**, never 5188, so a live lane could not contaminate it (Mistake #12). |

### The measurement the runner did NOT take — the headless door

The runner proved the **browser** door and said so honestly. But F-ER02-11 is a finding about
**GR-SIM riders**, so the browser arm is the wrong door for the claim that matters. Re-derived
directly from the shipped CLI on the merged tree:

```
node scripts/gr-sim.mjs --contract=e2-incline --seed=e2-incline-01 --policy=idle
```

| turn | `now.prospector` | `now.hero` |
|---|---|---|
| 0 | `{ x: -25.8,  z: -19.07 }` | `{ x: -24, z: -18 }` |
| 1 | `{ x: -25.98, z: -19.42 }` | `{ x: -24, z: -18 }` |
| 2 | `{ x: -25.68, z: -19.08 }` | `{ x: -24, z: -18 }` |
| 3 | `{ x: -25.6,  z: -19.21 }` | `{ x: -24, z: -18 }` |

The field is **non-null headlessly**, it **moves turn to turn**, and it is **a different body from the
hero** — which is three separate things a constant or a `hero` alias could not do. This is the
proof the finding actually asked for.

### Control arm — the read-only claim, tested rather than asserted

Same contract/seed/policy, main **before** the merge vs the merged tree, final outcome line:

```
main   {"secured":false,"waves":2,"timeMs":82633,"gold":0,"kills":19,"calls":0,"eventLogHash":"fnv1a32:7e6c3132"}
merged {"secured":false,"waves":2,"timeMs":82633,"gold":0,"kills":19,"calls":0,"eventLogHash":"fnv1a32:7e6c3132"}
```

**Byte-identical, including `eventLogHash`** — and `7e6c3132` is the same value s1527 recorded for
this arm, so the sim did not drift between the two drains either. Adding a read-only field to THE
VIEW perturbed nothing. No census hash moved.

## Merge classification

| File | Class | Resolution |
|---|---|---|
| `src/agent/View.ts` | **LANE-TOUCHED only** | direct application |
| `e2e/agent-view.spec.ts` | **LANE-TOUCHED only** | direct application |

`git log 2a3bfe39..main -- src/agent/View.ts e2e/agent-view.spec.ts` is **EMPTY** — main never moved
either file after the lane's base, so there is no MAIN-MOVED bucket and no graft. Verified rather
than assumed: a real `git merge --no-ff lane/b` was performed in the detached gate worktree, and
both merged blobs are **byte-identical to `lane/b`'s** (`ab970be9`, `b73ac06d`) — i.e. the
path-scoped application that landed on main is provably the same tree the gate battery ran against.

## Findings

**F-1528-1 (non-blocking, recorded not corrected) — the wave-3 snapshot masks the new field instead
of pinning it.** The byte-stable `WAVE_THREE_SNAPSHOT` change-detector gained `"prospector":
"<point>"`, and the test substitutes the live value for that literal before comparing — the same
treatment `runSeconds` gets. So the strongest test in the file asserts the field's **presence and
position in the JSON**, never its value. The value is covered by the new dedicated test, so coverage
is not lost; but a masked field in a change-detector is a field that detector can no longer detect
changing. Worth revisiting **if** the Prospector's position turns out to be deterministic under
that seed — the headless table above shows it moving, so masking may well be correct here, and that
is precisely the question nobody has measured.

**F-1528-2 (non-blocking, judged and accepted) — the runner edited an existing test, which the
firewall's NO list forbids in letter.** The master said "any EXISTING assertion in
`e2e/agent-view.spec.ts` — you add a test; you do not edit the four that are there", and the diff
carries `-3` lines in that file: the snapshot fixture and the TypeScript cast around it. **This was
unavoidable and is the right call**: growing `AgentView['now']` necessarily breaks a byte-stable
snapshot of `AgentView['now']`, so the alternatives were "edit the fixture" or "STOP and ship
nothing". The runner chose the former and disclosed the diff in full. Recording it because the next
master of this shape should say so up front — *a firewall that forbids the edit its own scope
requires will either be violated or will stop the work*, and both outcomes are worse than an
explicit carve-out.

**F-1528-3 (informational, and it touches an OPEN owner fork) — the headless Prospector MOVES while
the headless hero does not.** The table above is a body walking (four distinct positions in four
turns) beside a hero pinned at `{-24, -18}` for the whole run. F-1499-2 asks the owner *"does a
headless rider get a body?"* — this merge does not answer it and must not be read as answering it,
but it does narrow it: the **Prospector already has a moving body headlessly**, so the open question
is really about the **hero/rider**, not about embodiment in general. Worth putting in front of
whoever rules on F-1499-2.

## Where does the PLAYER see this, in a plain boot?

**Nowhere, deliberately.** This is factory/rider instrumentation: a field on the agent-facing VIEW.
Mistake #10 asks the question of every merge and the honest answer here is that there is no player
surface, so the plain-boot probe's job was the other half — proving the new `buildNow()` branch
neither throws nor logs on a boot with no `?debug` at either viewport. It does not (screenshots
above; the desktop shot is the ordinary claim-ledger title screen, i.e. the probe reached a real
game, not a blank stub).

## GZ-01

**Skipped, deliberately.** The filter law wants a **player-visible** change. A rider-facing view
field is not one. Recorded here rather than omitted.
