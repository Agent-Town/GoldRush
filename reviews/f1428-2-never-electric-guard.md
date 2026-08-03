# f1428-2 — make the never-electric guard able to fire

**Slice:** `f1428-2-make-the-never-electric-guard-able-to-fire` (F-1428-2)
**Branch:** `lane/perf` · **Lane tip:** `0f7f45fd` · **Base:** `9b755fca`
**Merge:** `b09729e53ba5aa1b008807480c6e2eaaaa32b2e0`
**Drained:** s1429, 2026-08-03

## VERDICT: MERGED — the acceptance was a manufactured red, and I reproduced both arms myself rather than reading the runner's quote of them.

## What it does

`src/town/TownScene.ts` reports a `coolWhiteEmissiveFixtures` count in its `lightGrammar`
diagnostics. That count is the executable form of the owner's F-BW-3 clause, verbatim:
*"E1 town must read FLAME, never electric — audit all glow elements, era light grammar via
townEraAccents (flame E1-E2, arc earns E3+), gentle flicker, day = unlit."*

It could not fire. The filter opened with `if (!material.isMeshBasicMaterial) return false;`,
and neither day fixture is a `MeshBasicMaterial` by day, so both were discarded **before their
colour was ever examined**. The count was structurally `0` for *any* colour, including an
electric one — and it was asserted **only** in the day test.

The slice makes the detector read the colour of whatever material the fixtures actually carry,
throws rather than reporting `0` when a fixture has no inspectable colour, and adds the counter
to the **dusk** assertion so it is asserted where it can fire. E1 dusk fixtures are lit flame
(`#ffb45c`) — saturated and warm — so `0` is correct there for the right reason.

The shipped visuals are untouched: `townEraAccents` colours, opacities, intensities, flicker
depths and the era→family mapping are byte-identical to main.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | rc 0 |
| `npm run build` | green, built in 2.11s |
| `e2e/beauty-town.spec.ts` `--workers=1` | **6/6**, desktop-chrome + mobile-chrome |
| `e2e/town-era-switch.spec.ts` `--workers=1` | **14/14**, both projects |
| Adjacents (grep-derived, not the master's list): `en-02-e1-coverage` + `gz-h1-newsie` + `town-ts-03-prop-ring` | **16/16**, both projects |
| Firewall `git diff main -- playwright.config.ts scripts package.json src/town/ e2e/` | only the 2 intended files |
| E3/Voltage test carries the counter? | **No** — prohibition obeyed |
| Console/page errors | asserted `[]` in-spec, both tests, both viewports |

All playwright runs `--workers=1` per §3.1. Gated in detached worktree `gate-s1429` per §3.0b —
undecided content never entered main's working tree.

### The acceptance: manufactured reds, reproduced by the drain

The master pre-declared that a green-only report is a REJECT, because the whole finding is that
this guard **passes while blind**. Both arms were run here, not read.

**Pre-fix arm — on clean main**, `lanternGlass` `#b97a3d` → `#eef2f4` (electric cool white):

```
- "fixtureColor": "#b97a3d",
+ "fixtureColor": "#eef2f4",
  "coolWhiteEmissiveFixtures": 0,      <-- UNCHANGED. The defect, reproduced.
```

Only `fixtureColor` reddened. The counter stayed `0` against a fixture that was literally
electric — the exact blindness F-1428-2 describes.

**Post-fix arm — on the merged tree**, same probe applied at day *and* dusk:

```
day:   - "coolWhiteEmissiveFixtures": 0   →  + "coolWhiteEmissiveFixtures": 2   TEST RED
dusk:  - "coolWhiteEmissiveFixtures": 0   →  + "coolWhiteEmissiveFixtures": 2   TEST RED
```

Both sites fire. The dusk site is new in this diff, so that red is the slice's own contribution.

**Denominator (scope 4): 2 fixtures by day, 2 at dusk** — `TownPropLanternGlow` and
`TownLanternStringBeads`, matching s1428's measurement of 2 by day. It did not silently change.

Both probes reverted; `src/` and `e2e/` byte-identical afterwards.

## Findings

### 🟢 F-1429-1 (new, non-blocking, laddered) — the ordered cure is loud in the one place where loudness reaches a player, and I proved the blast radius rather than reasoning about it

The master ordered, correctly, that *"a guard that cannot see its subject must say so rather than
report zero"*, and forbade a silent `return false`. The runner obeyed literally: an uninspectable
fixture now `throw`s.

**But `townLightDiagnostics()` is not test-only.** It is reached from `publishDiagnostics()`
(`src/town/TownScene.ts:2472`), which has **no debug gate** and is called from ~20 sites including
the town boot path (`:554`, right after `dressScene()` / `createUi()`). So the throw executes in
every normal player session.

Today it cannot fire — both fixtures carry `.color`. The hazard is latent: a future material swap
to a colourless type (`ShaderMaterial`, `MeshDepthMaterial`, …) converts a *diagnostics* concern
into **player-facing town breakage**.

⚠️ **Measured, not inferred.** I forced the throw and booted the town:

```
[WebServer] [vite] (client) [Unhandled rejection] Error: PROBE-s1429 uninspectable fixture TownPropLanternGlow
Test timeout of 90000ms exceeded.
  page.waitForFunction(() => (window.__GR_TOWN_DIAGNOSTICS__?.actors ?? []).every(...))
```

The town **never finishes mounting** — not a graceful red, a hung boot. Probe reverted.

**This is not runner disobedience** — it is the ordered cure meeting a call graph the master did
not account for, because the master reasoned about the guard as a test instrument and it is also
on the player's path. It is CLAUDE.md Mistake #10 inverted: debug-only code reaching the player.

**Cure direction (do NOT revert to `return false` — that re-opens F-1428-2):** keep the loud
failure but make it *test*-visible rather than *player*-fatal — e.g. report a distinct
`uninspectableFixtures` count (or a `-1` sentinel) that the specs assert on. The guard still
cannot silently report `0`; the town still boots.

## Merge classification

Both files **LANE-TOUCHED only** — main moved neither since the lane's base. Clean `ort` merge,
no conflicts, no 3-way graft needed.

## Player-visibility (GZ-01 filter law)

**No gazette item.** This is a factory/test-instrument repair with zero player surface — the
master explicitly forbade changing any visual value, and the firewall check confirms none moved.
The player sees exactly the same town as before `b09729e5`.
