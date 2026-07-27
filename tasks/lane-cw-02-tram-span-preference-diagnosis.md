# Task lane-cw-02-tram-span-preference-diagnosis: THE ASSERTION IS NOT GEOMETRIC — FIND WHICH GUARD DROPS THE TRAM-SPAN PREFERENCE

**FIRE-AUTHORED (attended review welcome) — s1116, 2026-07-27.** DIAGNOSIS ONLY. This task changes
**no** behaviour and rewrites **no** assertion. Its entire deliverable is a measured answer to one
question, reported in prose.

You are Codex (worktrees/lane-a).

CODEX: model=gpt-5.6-sol effort=medium

> ⚠️ The `CODEX:` line above is at **column 0 on its own line** deliberately (F-1088-4).
> `scripts/lane-runner-v3.sh:65-66` greps `^CODEX:`, so an inline copy is silently ignored and the run
> falls back to `effort=medium` without telling anyone.

## ⚠️ READ THIS FIRST — THE INHERITED FRAMING IS WRONG, AND THAT IS THE POINT OF THIS TASK

Two prior fires chased `cw-02-escort.spec.ts:134` as a **geometry** problem. s1114 measured distances to
the spawn gate; s1115 re-measured them from a corrected, hero-relative spawn point and concluded the
assertion was **STALE** because a `lantern_post` sits 6.00 units away while the asserted
`sentry_beacon` index 2 sits 26.00 away. s1115 then handed forward an "engine question": *why does a
wrecker in `seekBuilding` leave a 6-unit structure and drift west?*

**✓ VERIFIED AT SOURCE by s1116: geometry was never the deciding rule, so the whole chain measured the
wrong thing.** `Enemy.ts:1045` calls `context.nearestBuilding(...)`, but that context callback is
**not** a nearest-building function. `src/game/Game.ts:1124-1125`:

```ts
nearestBuilding: (from: THREE.Vector3) =>
  this.waveSystem.preferredEscortTarget(from)
    ?? this.preferredTramEscortSpanTarget()
    ?? this.goldTargeting.nearestBuilding(from),
```

Geometry is the **third** and last fallback. And `preferredTramEscortSpanTarget()`
(`src/game/Game.ts:3634-3648`) takes **no `from` argument and applies no distance test at all** — in a
tram escort it returns the `sentry_beacon` sitting on the pylon site that **feeds the tram's power
consumer**, however far away it is.

That is precisely what `:134` asserts. `:100` pins `vehicle: 'tram'`, and `:105` pins
`tramFeed: { a: 'pylon-west-rim', b: 'tram-motor' }` — so the saboteur is *designed* to cut the tram's
feed, and the asserted beacon is the feed pylon's beacon. **`:134` is therefore very likely CORRECT and
NOT stale**, and s1115's proposed 2a fix — re-deriving the target as "the structure nearest the spawn
gate" — would have cargo-culted the assertion onto the *fallback* path and quietly deleted the actual
contract behaviour under test. **The prior task stopping lawfully instead of landing 2a was the right
outcome.**

The observed evidence fits this reading and not the geometric one: the one recorded hit landed on a
`lantern_post` (the geometric fallback's answer), and the final diagnostic wrecker sat at
`(-47.9977, 26.2151)` — moving **away** from `PYLONS[2] (-28, 8)`, i.e. it was **not** pursuing the
asserted beacon at all. So on those runs the preference returned `null` and control fell through.

## THE QUESTION (the only thing this task must answer)

`preferredTramEscortSpanTarget()` has **five** ways to return `null`. During the `:118-132` window of
`cw-02-escort.spec.ts`, **which one fires, and why?**

```ts
3636  if (this.activeEscortMode()?.vehicle !== 'tram' || !tram || tram.diagnostics.state === 'arrived') return null;   // (A) mode/tram/arrived
3637  const grid = this.activeContract.twist.powerGrid;
3638  const feed = grid?.wires.find((w) => w.a === tram.consumer.id || w.b === tram.consumer.id);
3639  const feederId = feed?.a === tram.consumer.id ? feed.b : feed?.a;
3640  const site = this.activeContract.tileParams.pylonSites?.find((e) => e.nodeId === feederId);
3641  if (!site) return null;                                                                                          // (B) no pylon site for the feeder
3642  const beacon = this.buildSystem.diagnostics.hp.find(
3643    (e) => e.id === 'sentry_beacon' && !e.wrecked && Math.hypot(e.position.x - site.x, e.position.z - site.z) <= site.radius);
3645  if (!beacon) return null;                                                                                        // (C) no un-wrecked beacon inside site.radius
3646  const target = this.buildSystem.buildingTarget('sentry_beacon', beacon.index);
3647  return target?.active && target.hp > 0 ? target : null;                                                          // (D) target inactive / dead
```

A plausible, **unproven** candidate worth reporting on explicitly: (C) — the test places its six beacons
itself at `:107-110`, so whether any of them lands within `site.radius` of the `pylon-west-rim` site is a
property of the *test's* coordinates, not of the map. If (C) is the answer, then the test is
self-inconsistent: it asserts a preference whose precondition its own fixture never satisfies. **Do not
assume this. Measure it.**

## SCOPE (numbered)

1. **INSTRUMENT AND REPORT.** By whatever read-only means you prefer (a scratch probe, a temporary
   `page.evaluate` in a **copy** of the spec, or temporary logging), determine for the `:118-132` window:
   - `activeEscortMode()?.vehicle`, whether `tram` exists, and `tram.diagnostics.state`;
   - `tram.consumer.id`, the matched `feed` wire, and the resulting `feederId`;
   - the `pylonSites` entry for that `feederId` — its `x`, `z`, `radius` — or that none matched;
   - every `sentry_beacon` in `buildSystem.diagnostics.hp` with its `position`, `wrecked`, `hp`, and its
     `Math.hypot` distance to the site centre, so the `<= site.radius` test can be checked by eye;
   - which of (A)/(B)/(C)/(D) actually fired, or that the function returned a real target.
   **Report all of it as a table in your closing report.** This is the deliverable.

2. **STATE WHETHER THE PREFERENCE IS EVER LIVE IN THIS WINDOW.** The failure is intermittent (s1115: 3 of
   4 runs left every structure pristine; 1 run hit a lantern). Run the probe **at least 3 times** at
   `--workers=1` and say whether the branch taken is **stable across runs** or varies. If it varies, name
   the varying input.

3. **RECOMMEND, DO NOT IMPLEMENT.** Close with a recommendation in one short paragraph — is `:134`
   correct-and-the-fixture-is-wrong, correct-and-the-engine-is-wrong, or genuinely stale? Cite your table.

## FIREWALL

**TOUCH-ONLY (and only transiently):** scratch/probe files you create and delete, or a temporary copy of
`e2e/cw-02-escort.spec.ts`. **The final diff must be EMPTY or contain only a new file under
`reviews/` or `artifacts/` holding your measurements.**

**NO — these are violations, not judgement calls:**
- ❌ **Do NOT edit `src/**` at all.** Not to "fix" `preferredTramEscortSpanTarget()`, not to reorder the
  `??` chain, not to add a distance check.
- ❌ **Do NOT rewrite, re-anchor, or delete any assertion** in `e2e/cw-02-escort.spec.ts` — especially not
  `:134` or `:135`. Re-pointing an assertion at whatever got hit is writing the guard from the answer
  sheet: green, and proving nothing.
- ❌ **Do NOT move the test's beacon coordinates at `:107-110`** to make (C) pass. If (C) is the answer,
  **report it** — changing the fixture is an owner-visible decision about what the contract means.
- ❌ **Do NOT raise `advanceSim(8)`.** s1114 killed the budget hypothesis by measurement: `advanceSim(40)`,
  5×, changed nothing.
- ❌ Do not touch `Balance.ts`, `WaveSystem.ts`, `tasks/`, `STATUS.md`, or any other spec.

## SELF-CHECK before you report

- [ ] `git status` in `worktrees/lane-a` shows **no modification to `src/**` or to any `.spec.ts`** —
      instrumentation reverted, verified by `git diff` being empty for those paths.
- [ ] `npx tsc --noEmit` clean and `npm run build` green (cheap, and proves you left nothing behind).
- [ ] The (A)/(B)/(C)/(D) verdict is stated in one sentence, backed by the table from scope 1.
- [ ] Scope 2's ≥3 runs are reported **with their individual outcomes**, not averaged into a claim.
- [ ] If you could not determine the branch, say so plainly and report what blocked you. **A clean
      "I could not measure X because Y" is a SUCCESS here; a confident guess is a failure.**

READY-FOR-GATES + report: the (A)/(B)/(C)/(D) verdict, the full measurement table, the ≥3-run stability
result, and your one-paragraph recommendation.
