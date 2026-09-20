# Review — ap16-1: buildable parity (Same-Game law, slice 1 of 3)

- **Slice:** `tasks/done/20260810-181709-lane-a-ap16-1-buildable-parity.md`
- **Branch:** `lane/a` · **tip** `ff390bcf2` (`runner(lane-a): lane-a-ap16-1-buildable-parity.md`)
- **Base:** `82c8cb18f41cc9a8ee726e2f0aee12e015f95549`
- **Merged to main:** `760990fda5d91559202dbf5a3020de90f694aa7c` (s1636 fire, 2026-08-10T19:0xZ)
- **Gated in:** detached worktree `gate-s1636` (§3.0b custody), merged as ONE act (F-1589-5)

## VERDICT: MERGED — the code fix is real and correct. One finding raised (F-1636-1) against the slice's *measuring instrument*, not its behaviour; corrective queued in the same bookkeeping commit.

## What it does

Before this slice the browser and the headless door each decided *which buildables a contract offers* from their own hand-written predicate. They disagreed, and the disagreement was the single largest block of Same-Game debt on the board — 520 of the 840 buildable audit rows.

The slice introduces one manifest-derived set, `mechanicsBuildableIds(manifest)` in `src/agent/MechanicsManifest.ts`, and makes **both** engines ask it:

- browser — `Game.ts:5717` `isBuildableEnabled()` → `this.offeredBuildables.has(id)`, where `offeredBuildables = mechanicsBuildableIds(this.activeContract)`
- headless — `HeadlessContractSim.ts:~291` passes `(id) => offeredBuildables.has(id)` into `BuildSystem`, replacing the old inline `id === 'boiler_house' ? … : id !== 'capacitor_bank' || …` ternary

Manifest reconciliation additionally restored base/practice/night buildables the manifest had been under-reporting. This is the substance, and it is right: one rulebook, two readers.

## Evidence

| Gate | Result |
|---|---|
| `npx tsc --noEmit` | clean |
| `npm run build` | green, `✓ built in 1.82s` |
| `npm run test:node-guards` | **442 tests · 437 pass · 0 fail · 5 skipped · exit 0** (353.8 s) — required by F-1460-1 (diff touches `src/sim/`, `src/agent/`, `src/game/`) |
| adjacent e2e `task-025` + `m1-01` + `m2-01` | **32/32** desktop + mobile (2.5 m) |
| plain-boot probes `_s106-prospector-boot-probe` + `f1297-2-plain-boot-tape-button` | **4/4**, zero console/page errors |
| Playwright workers | `--workers=1` throughout (§3.1) |

All batteries run on the **merged** tree in `gate-s1636`, not on the lane.

### Substance verified independently (not inherited from the runner's report)

Per-surface row counts, main vs merged:

| surface | main | merged |
|---|---|---|
| **buildable** | equal 320 · agent-exceeds 340 · agent-lacks 180 | **equal 840 · 0 diverging** |
| ability | agent-lacks 114 · equal 12 | agent-lacks 114 · equal 12 (unchanged) |
| choice | agent-lacks 294 | agent-lacks 294 (unchanged) |
| economy | agent-lacks 72 · equal 12 | agent-lacks 72 · equal 12 (unchanged) |
| verb | equal 12 · agent-lacks 324 | equal 12 · agent-lacks 324 (unchanged) |

Headline divergences `1,324 → 804`; the 520-row delta is exactly the buildable flip. **The firewall held**: ap16-2's `choice` rows and ap16-3's `ability` rows are untouched, which is what the three-slice sequencing required.

`m2-01-build-menu`'s "build menu shows six ready icons and Balance-backed blurbs" passes on the merged tree — the player-facing menu (Mistake #10) still offers what it should after the predicate swap.

## Merge classification

7 paths, off base `82c8cb18`. `git diff --stat <base> main` for all 7 paths was **empty** — main moved none of them. All **LANE-TOUCHED / MAIN-UNTOUCHED**, clean `ort` merge, **no graft required**. Post-merge `main..lane/a` is **empty**.

| path | class |
|---|---|
| `src/agent/MechanicsManifest.ts` | LANE-ONLY |
| `src/game/Game.ts` | LANE-ONLY |
| `src/sim/HeadlessContractSim.ts` | LANE-ONLY |
| `scripts/same-game-audit.mjs` | LANE-ONLY (see F-1636-2) |
| `scripts/same-game-audit.test.mjs` | LANE-ONLY (see F-1636-1) |
| `docs/bench/same-game-audit.md` | LANE-ONLY (regenerated) |
| `e2e/fixtures/e1-mechanics-manifests.json` | LANE-ONLY (see F-1636-2) |

## Findings

### 🔴 F-1636-1 — the audit's `0 buildable divergences` is a TAUTOLOGY, and its new guard assertion cannot go red. PROVEN by manufacturing the defect.

`scripts/same-game-audit.mjs` previously derived the two sides of each buildable row from two *different* hand-written predicates. The slice replaced **both** with the same call:

```js
function doorAccepts(contract, id)    { return advertisedBuildables(contract).has(id); }
function browserAccepts(contract, id) { return advertisedBuildables(contract).has(id); }
```

and in `audit()`, `manifest`, `browser` and `predicate` all now resolve to `advertisedBuildables(contract).has(id)`. Every buildable row therefore compares a value **to itself** and is structurally guaranteed `equal`.

**Proof — I did not argue this, I manufactured it.** In `gate-s1636` I forced the real browser predicate to the most extreme divergence available (`isBuildableEnabled()` → `return false`; the browser offers *nothing*) and regenerated the audit:

```
BASELINE                              -> buildable rows 840, diverging 0
BROWSER OFFERS NOTHING (real code)    -> buildable rows 840, diverging 0
```

Reverted byte-identical afterwards. The generator never reads either engine's behaviour for its *verdicts* — the real files are consulted only by `line()` for evidence citations — so no change to `Game.ts` or `HeadlessContractSim.ts` can ever move this number.

Consequently `scripts/same-game-audit.test.mjs`'s new assertion —
`assert.equal(rows.filter(r => r.surface === 'buildable' && r.direction !== 'equal').length, 0)`
— **cannot fail**, and it replaced a real one (`'wide BUILD door must remain visible'`). A green that cannot go red is worse than no test (F-1460-1's lesson, inverted).

**Second, independent overstatement in the same rows:** `const agent = agentCanEnter && predicate` became `const agent = predicate`. Buildable rows now claim parity even for contracts the headless sim **cannot enter at all** — while the `verb` rows in the same document still report `agent-lacks: 324` for exactly that reachability gap. The document is now internally inconsistent.

**Why this did not block the merge:** the finding is against the *instrument*, not the *behaviour*. The behavioural unification (one `mechanicsBuildableIds` source, two readers) is genuinely correct, fully gated, and is the foundation ap16-2 and ap16-3 build on; holding it would strand two further lanes over a reporting artifact. **But the number must not be cited as evidence of parity until the corrective lands** — see the standing warning in BACKLOG and the handoff.

➡️ Corrective queued: `tasks/f1636-1-same-game-audit-independence.md`.

### 🟡 F-1636-2 — two paths were edited outside the Touch-ONLY list

The firewall named `scripts/same-game-audit.test.mjs` and `docs/bench/same-game-audit.md`, but **not** the generator `scripts/same-game-audit.mjs` (28 lines changed) and not `e2e/fixtures/e1-mechanics-manifests.json` (+344; the list permits "e2e specs ONLY for hash re-pins", and a fixture is not a spec).

Recorded, not punished: regenerating the audit is impossible without the generator, so the master's own scope item 5 was unsatisfiable inside its stated firewall — the same contradiction that legitimately **stopped lane-c's ap16-3** an hour earlier. The defect is in the three masters' shared firewall design, not in this runner's judgement. The corrective gives the generator a single named owner.

### 🟢 F-1636-3 — the runner declined an out-of-scope change, correctly

Its second-opinion review flagged "old E3 census expectations"; it left those assertions untouched and said so. That is the reject-don't-stretch convention working (Mistake #14).

## Sequencing note

The Season-2 era stamp is **not** minted here — it belongs to the last of ap16-1/2/3 to merge. Two remain unmerged (ap16-2 lane-d, ap16-3 lane-c), so nothing was stamped.
