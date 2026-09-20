# era-true-lights — E1 town reads FLAME, never electric

- **Slice:** `lane-era-true-lights` (F-BW-3, owner playtest 2026-08-03)
- **Branch / tip:** `lane/perf` @ `9c7f1c79` (base `eb87b137`)
- **Merged to main:** `56b390ff4a05a4e619367a93c02a699a7a2a2302` (s1428 fire)
- **Drained:** 2026-08-03, s1428

## Verdict

**MERGED.** The owner's grammar is implemented and its central assertions are non-vacuous —
proved by manufactured red, not by the green. One assertion is **vacuous** and is filed as
**F-1428-2** (non-blocking): the `coolWhiteEmissiveFixtures` counter, which is the one that most
directly encodes *"never electric"*, cannot fire where it is asserted.

## What it does

Owner directive (F-BW-3, verbatim in the master): *"E1 town must read FLAME, never electric —
audit all glow elements, era light grammar via townEraAccents (flame E1-E2, arc earns E3+),
gentle flicker, day = unlit."*

`townEraAccents` (`src/town/TownScene.ts:3383`) keys the whole grammar by era order. E1/E2 inherit
**flame**: unlit brown paper (`#b97a3d`) by day, `#ffb45c` after dusk, gentle flicker at depth
0.055. E3+ earn the **arc** read (`#bfe8ff` / `#d5efff`, `flickerDepth: 0`) from authored Voltage
hardware. Lantern fixtures, string beads, window and door panes, and the six capped PointLights
all draw from the table instead of the previous hardcoded cream/white literals.

## Evidence

Gated in detached worktree `gate-s1428` (§3.0b), every playwright command `--workers=1` (§3.1).

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | ✓ built in 2.05s |
| `beauty-town.spec.ts` (own spec) | **6/6**, desktop + mobile |
| `town-era-switch.spec.ts` (adjacent) | **14/14**, desktop + mobile |
| Console / page errors | asserted `[]` in-spec, both tests, both viewports |
| Evidence | `artifacts/era-lights/{before,after,comparison}/` incl. contact sheets |

Both claimed suite results reproduced exactly. Merge classification: base `eb87b137`;
`src/town/TownScene.ts` and `e2e/beauty-town.spec.ts` both **LANE-TOUCHED only** — main moved
neither since the base. Clean `ort` merge, no conflicts.

### Non-vacuity: I broke the grammar rather than trusting the green

The whole slice rests on the `lightGrammar` diagnostics block. A green there is not evidence about
the red, so I gave E1 an electric cool-white lantern glass (`lanternGlass: '#b97a3d'` →
`'#f2f6ff'`) on the merged tree — the exact thing the owner forbids:

```
✘ beauty-town.spec.ts:14 › the day town boots … and no night dressing
    -   "fixtureColor": "#b97a3d",
    +   "fixtureColor": "#f2f6ff",
```

The day test caught it; dusk and Voltage stayed green, as they should. Probe reverted, source
byte-identical afterwards. **The era grammar is genuinely defended.**

## F-1428-2 — the "never electric" counter is vacuous where it is asserted (non-blocking)

The same probe surfaced the finding. When I made the fixture electric cool-white,
`fixtureColor` went red but **`coolWhiteEmissiveFixtures` stayed `0`** — and that counter is the
assertion carrying the owner's *"audit all glow elements / never electric"* clause. Two further
probes, because a zero has two very different explanations:

1. **Is the denominator empty?** No. Reporting `fixtures.length * 1000` returned **2000** — both
   `TownPropLanternGlow` and `TownLanternStringBeads` exist by day.
2. **Can the detector see them?** No. Reporting `basicMaterialCount * 1000` returned **0** — so
   of those 2 fixtures, **zero are `MeshBasicMaterial` by day**.

`TownScene.ts:2548` opens with `if (!material.isMeshBasicMaterial) return false;`, so every
fixture is filtered out **before its colour is ever examined**. `coolWhiteEmissiveFixtures: 0` in
the day test is therefore structurally guaranteed — true for any colour, including an electric
one. It is asserted **only** in the day test (dusk and the Voltage test do not reference it), so
it defends nothing anywhere.

This is the *"a passing oracle may stub the wrong failure"* shape: the strongest-looking
assertion, the one a reader maps straight onto the owner's words, is the one measuring an empty
set. The surrounding assertions (`family`, `fixtureColor`, `windowColor`, `flickerDepth`, and the
live flicker sample) **are** real — the manufactured red proves it — so the visual work is sound
and this is not a blocker.

**Cure (laddered):** make the counter examine the material the fixtures actually carry by day
rather than early-returning on type, and assert it at **dusk** as well, where fixtures are lit.
Acceptance must be a manufactured electric fixture that turns the counter non-zero — otherwise the
cure reproduces the same vacuity one layer down. ⚠️ **UNVERIFIED:** whether the fixtures are
`MeshBasicMaterial` at *dusk* was not measured; the cure should establish that rather than assume
it.

## Findings

- **F-1428-2** (new, non-blocking, laddered) — `coolWhiteEmissiveFixtures` is vacuous by day;
  measured, not inferred. Cure above.
- **F-BW-3** — satisfied for the flame/arc grammar, day-unlit and gentle-flicker clauses, each
  covered by a non-vacuous assertion.
- **Goal-leaf debt** — this master was queued with no leaf (`drain-block-check` → UNKNOWN, which
  §3.0 defines as a bookkeeping finding, not a clearance). Confirmed *never registered* rather
  than *registered-and-blocked* by grepping `tasks/goals.json` (0 matches); BACKLOG:2769 says
  "GOAL-LEAF DEBT next fire". Leaf registered in this drain.
