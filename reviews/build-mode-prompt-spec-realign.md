# Review — lane-a-build-mode-prompt-spec-realign

- **Slice**: `tasks/lane-a-build-mode-prompt-spec-realign.md` (authored s1171, F-1170-2's cure)
- **Branch / tip**: `lane/m3` @ `715669bf` — one commit ahead
- **Merge base**: `e84043af`; main never moved `e2e/` since ⇒ no MAIN-MOVED file, no 3-way graft
- **Merge**: `e42ed4ef` · **Drained**: s1173 fire, 2026-07-28
- **§3.0 drain-block-check**: `✅ CLEAR — [factory-build-mode-prompt-realign] status="queued"` — run first, before classification.

## VERDICT: ACCEPT — a full realign. All 22 stale card failures cleared, 10 rows net recovered, 8 converted into later separately-owned faults.

## What it does

Four e2e specs encoded the **pre-2026-07-12** building-card contract. The owner replaced that
contract that day (`tasks/fix-building-prompt-flicker.md:8`, RULING: *"the card shows ONLY in build
mode … outside build mode, proximity to a building shows nothing (combat stays clean)"*), and
`50977ab6` shipped the runtime change plus its own new spec while updating none of the others. This
slice realigns the four stragglers: a dated comment citing the ruling, plus `setBuildMode(true)`
before each card assertion. **Zero `src/`** — the runtime is the ratified side, and a cure that
edited it would reverse an owner ruling.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean (merged tree) |
| `npm run build` | green — `✓ built in 1.18s` |
| Four specs, merged tree, default workers | **17 failed / 31 passed** |
| Baseline (runner, unchanged specs, `--workers=1`) | **27 failed / 21 passed** |
| Runner post-edit (`--workers=1`) | **35 passed / 13 failed** |
| Control `building-prompt-flicker.spec.ts` | 2/2 both projects — **absent from the diff** |
| Exclusion `e2-stamp-mill.spec.ts` | 4/4 both projects — **absent from the diff** |
| Adjacent `m2-01-build-menu.spec.ts` | 14/14 both projects (runner) |
| `git diff main...lane/m3 -- src/` | empty |

**27 → 17 is ten rows genuinely recovered**, and every one of the 22 original failure lines now
executes rather than dying at the card gate.

### The 17-vs-13 gap was my instrument, not the slice

I measured 17 reds where the runner measured 13. That gap is **a harness-config difference**: I ran
the default parallel worker count; the runner ran `--workers=1`. Re-running the two affected specs
on the runner's own instrument settles it:

| Extra red | default workers | `--workers=1` | Fingerprint |
|---|---|---|---|
| `night-light-doctrine` mobile | FAIL | **PASS** | 60 s timeout on `contract-briefing-dismiss` click, *element is not stable* |
| `world-info-notes:265` desktop | FAIL | **PASS** | 30 s timeout, same locator, same "not stable → not visible" |
| `world-info-notes:265` mobile | FAIL | **PASS** | same |
| `bt-00-demolish` sixth test, desktop | FAIL | out of scope | known-unstable; a *different* project pattern in each of three runs |

Both timeout fingerprints sit at the **opening contract briefing**, long before any build-mode
logic runs. At `--workers=1` the two specs return exactly the runner's set — `:195` moved, `:289`
and `:321` pre-existing out-of-scope — so **the runner's 13 reproduces exactly**. The fourth delta
is the sixth `bt-00` test, which the master explicitly firewalled and which has now failed on
desktop-only (baseline), mobile-only (runner) and both (me) across three runs.

## The deletion, audited

`bt-00-demolish` shows 13 deletions, against a master that authorised removing **exactly one**
assertion. That audits clean:

- The removed cluster (card `toBeVisible` + `toContainText` + the `intersects(...)` overlap check)
  is **one claim expressed three ways: that the assay prompt and the building card are co-visible.**
  `syncAssayOfficePrompt` (`Game.ts:5640-5642`) requires `!isBuildMode`; the card requires
  `isBuildMode`. **They can never be co-visible**, so the claim was unsatisfiable under the ratified
  contract.
- It was **replaced, not merely deleted** — by `await expect(...).toBeHidden()`, the positive
  statement of what the contract actually says — and the test was split into the two sequential
  phases the master prescribed (outside build mode: assay prompt + card hidden + Enter→bench; then
  inside: card visible → demolish). Every refund, HP, replacement and economy assertion survives.
- `type Rect` and `intersects()` became dead code and went with it.

🔑 **This is the trap s1171 found statically, and the runner confirmed it live.** The old
`intersects()` returned `false` whenever *either* bounding box was null — and a hidden element's box
**is** null — so the no-overlap assertion **passed vacuously on a hidden card**. A green-chasing fix
would have left that assertion in place, seen it pass, and called it fixed. The runner's own probe
proves the mechanism directly:

```json
{"outside":{"buildMode":false,"buildingCard":false,"assayPrompt":true},
 "inside": {"buildMode":true, "buildingCard":true, "assayPrompt":false}}
```

### Induced-red control

The runner reverted `night-light-doctrine`'s build-mode entry to `false` and re-ran desktop: **1
failed** at the card assertion, received hidden; then restored. The cure is load-bearing, not
coincidental.

## Merge classification

Pure **LANE-TOUCHED** — main never touched `e2e/` since base `e84043af`. Five files, path-scoped:

| File | Class |
|---|---|
| `e2e/bt-00-demolish.spec.ts` | LANE-TOUCHED (restructure + one replaced assertion) |
| `e2e/bt-01-tiers.spec.ts` | LANE-TOUCHED (one helper line realigns all four card consumers) |
| `e2e/night-light-doctrine.spec.ts` | LANE-TOUCHED (+comment, +1 line) |
| `e2e/world-info-notes.spec.ts` | LANE-TOUCHED (+comment, +1 line at `:215`) |
| `tasks/runs/20260728-155531-…md` | new (run report) |

**Firewalls verified at source, not assumed:** `building-prompt-flicker.spec.ts` and
`e2-stamp-mill.spec.ts` are **absent from the diff** — their absence is the evidence s1171 and
s1172 both named in advance — and `world-info-notes:286-338`, which carries the open
F-1141-3 + F-1164-1 owner fork, is untouched (the edit lands at `:215`).

Regenerated tracked screenshots (`artifacts/night-doctrine/`, `artifacts/world-info-notes/`) were
**deliberately not committed**, matching the runner's own choice to restore them: that churn is an
open owner keep-or-revert item and is not this slice's to settle.

## Findings

- **F-1173-4 (new).** **The default Playwright worker count manufactures reds in this spec set.**
  Three rows flipped red→green purely by moving to `--workers=1`, all with the same
  `contract-briefing-dismiss` "element is not stable" boot-timeout fingerprint. This is direct
  evidence for the parked **`calibrate-suite-workers-v2`** blocker and a concrete instance of
  F-1167-2's warning to discount the timeout bucket before repairing anything in it. ➡️ **Any
  future comparison against the suite-red inventory must state its worker count**, or it is
  comparing two different instruments — as this drain nearly did.
- **F-1173-5 (non-blocking, owner-visible).** `artifacts/night-doctrine/*-darkest-night-upgrade.png`
  now shows the build-mode HUD (`Build - Close` plus the building card), because the test must enter
  build mode to reach the card. The runner inspected it: the dark scene and the localized teal light
  pool remain unobstructed, so the shot still serves its upgrade-at-darkest-night purpose. Recorded
  because an evidence artifact's *content* changed meaning slightly, which is the kind of drift that
  is invisible until someone compares screenshots months later.
- **The BACKLOG's 6th-red attribution was wrong, and the task settled it** (as s1171 predicted it
  would). `BACKLOG:16` called `bt-00-demolish:296` *"a gold-refund poll downstream of the same
  blocked flow"*; the runner observed the real baseline red at `:282` — HP stayed 60 instead of
  reaching 45, a damage-delivery poll **before** the direct-API demolish, unrelated to any prompt.
  The inventory was right that this test is not card-blocked. Out of scope either way, and
  firewalled.

## Judgement

This is outcome (1) of the three s1171/s1172 declared lawful in advance — a full realign — with the
1(d) STOP correctly *not* taken, because scope 1 confirmed no row needed a `src/` change. Eight
rows moving to later failure lines is the **purchase**, not a shortfall: assertions that had been
dead behind the card gate since 2026-07-12 now execute and report their own separately-owned faults.
